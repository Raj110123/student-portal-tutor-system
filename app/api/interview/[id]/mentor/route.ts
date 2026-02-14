import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import { getUserIdFromToken } from "@/lib/auth";
import { sendToN8nMentor } from "@/lib/n8nmentoragent";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // get token from authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // get user id from token
    const userId = await getUserIdFromToken(token);

    // get interview id from params
    const interviewId = (await params).id;
    console.log(`Triggering mentor review for interview: ${interviewId}`);

    //find the interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    // verify that the interview belongs to the user
    if (interview.user.toString() !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check 1: already used
    if (interview.mentorReviewUsed) {
      return NextResponse.json(
        {
          message: "Mentor review already used for this interview",
          success: false,
          reason: "already_used",
        },
        { status: 400 }
      );
    }

    // Rate limit check 2: must be the user's latest completed interview
    const latestCompleted = await Interview.findOne({
      user: userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    if (
      !latestCompleted ||
      latestCompleted._id.toString() !== interviewId
    ) {
      return NextResponse.json(
        {
          message: "Mentor review is only available for your latest completed interview",
          success: false,
          reason: "not_latest",
        },
        { status: 400 }
      );
    }

    // Send to n8n mentor webhook
    try {
      console.log("Interview data:", JSON.stringify(interview, null, 2));
      const mentorResult = await sendToN8nMentor(interview.toObject(), token);
      if (mentorResult.sent) {
        console.log("Successfully sent interview to n8n mentor webhook");

        // Mark as used — use native MongoDB to bypass Mongoose strict mode / model caching
        await mongoose.connection.collection('interviews').updateOne(
          { _id: new mongoose.Types.ObjectId(String(interview._id)) },
          { $set: { mentorReviewUsed: true } }
        );

        return NextResponse.json(
          {
            message: "Mentor review triggered successfully",
            success: true,
            interviewId: interview._id,
            mentorResponse: mentorResult.response,
          },
          { status: 200 }
        );
      } else {
        console.log("Did not send to n8n mentor:", mentorResult.reason);

        // If the issue is no_result, set a result based on score and retry
        if (mentorResult.reason === 'no_result' && interview.overallScore) {
          console.log("Setting result based on overall score and retrying");
          interview.result = interview.overallScore >= 70 ? "passed" : interview.overallScore >= 50 ? "passed-with-notes" : "failed";
          await interview.save();

          const retryResult = await sendToN8nMentor(interview.toObject(), token);
          if (retryResult.sent) {
            // Mark as used after successful retry — native MongoDB
            await mongoose.connection.collection('interviews').updateOne(
              { _id: new mongoose.Types.ObjectId(String(interview._id)) },
              { $set: { mentorReviewUsed: true } }
            );

            return NextResponse.json(
              {
                message: "Mentor review triggered successfully after setting result",
                success: true,
                interviewId: interview._id,
                mentorResponse: retryResult.response,
              },
              { status: 200 }
            );
          }
        }

        return NextResponse.json(
          {
            message: "Mentor review could not be triggered",
            success: false,
            reason: mentorResult.reason,
            error: mentorResult.error || mentorResult.responseText,
          },
          { status: 400 }
        );
      }
    } catch (mentorError) {
      console.error("Error sending to n8n mentor webhook:", mentorError);
      return NextResponse.json(
        {
          message: "Error triggering mentor review",
          success: false,
          error: String(mentorError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error triggering mentor review:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
