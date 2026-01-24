import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import ImageKit from "imagekit";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import { getUserIdFromToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WORKFLOW_ENDPOINT =
  process.env.N8N_WORKFLOW_URL ??
  "https://nikunjn8n.up.railway.app/webhook/generate-interview-question";

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const IMAGEKIT_FOLDER = process.env.IMAGEKIT_FOLDER;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY || "",
  privateKey: IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: IMAGEKIT_URL_ENDPOINT || "",
});

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .match(/[a-z0-9+#.]+/gi)
    ?.map((token) => token.toLowerCase()) ?? [];

const buildTechStack = (jobDescription: string, jobRole: string): string[] => {
  const descriptionTokens = tokenize(jobDescription);
  if (descriptionTokens.length) return descriptionTokens;

  const roleTokens = tokenize(jobRole);
  if (roleTokens.length) return roleTokens;

  return ["general"];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const extractQuestions = (payload: any): string[] => {
  const stack: any[] = [payload];
  const seen = new Set<any>();

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);

    const candidates = [
      current.Top15Questions,
      current.questions,
      current?.result?.questions,
      current?.data?.questions,
      current?.output?.questions,
      current?.json?.questions,
    ];

    for (const candidate of candidates) {
      if (isStringArray(candidate)) return candidate;
    }

    if (Array.isArray(current)) stack.push(...current);
    else stack.push(current.result, current.data, current.output, current.json);
  }

  return [];
};

const ensureDataUrl = (base64: string, mimeType?: string): string => {
  if (base64.startsWith("data:")) return base64;
  const clean = base64.replace(/^data:[^,]+,/, "");
  return `data:${mimeType || "application/pdf"};base64,${clean}`;
};

const fileToDataUrl = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "application/pdf"};base64,${buffer.toString("base64")}`;
};

const uploadResumeToImageKit = async (
  fileName: string,
  dataUrl: string
): Promise<string> => {
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit credentials not configured");
  }

  const base64File = dataUrl.replace(/^data:[^,]+,/, "");

  const response = await imagekit.upload({
    file: base64File,
    fileName,
    folder: IMAGEKIT_FOLDER || undefined,
  });

  if (!response?.url) throw new Error("ImageKit upload failed");
  return response.url;
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    const contentType = req.headers.get("content-type") || "";

    let requestPayload: any = {};

    if (contentType.includes("application/json")) {
      requestPayload = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((value, key) => (requestPayload[key] = value));
    } else {
      return NextResponse.json(
        { message: "Unsupported Content-Type" },
        { status: 415 }
      );
    }

    const jobDescription = requestPayload.JobDescription?.trim();
    const jobRole = requestPayload.JobRole?.trim();
    const yearsOfExperience = Number(requestPayload.yearsOfExperience);

    let resumeBase64 = requestPayload.resumeFileBase64 || "";
    let resumeFileName = requestPayload.resumeFileName || "resume.pdf";
    const resumeFile =
      requestPayload.resumeFile instanceof File
        ? requestPayload.resumeFile
        : null;

    if (!resumeBase64 && resumeFile) {
      resumeBase64 = await fileToDataUrl(resumeFile);
      resumeFileName = resumeFile.name || resumeFileName;
    }

    if (!resumeBase64 || !jobDescription || !jobRole || isNaN(yearsOfExperience)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const resumeUrl = await uploadResumeToImageKit(
      resumeFileName,
      ensureDataUrl(resumeBase64, requestPayload.resumeFileType)
    );

    const workflowBody = {
      resumeurl: resumeUrl,
      JobDescription: jobDescription,
      JobRole: jobRole,
      yearsOfExperience: yearsOfExperience.toString(),
      mentorFeedback: null,
    };

    const workflowResponse = await fetch(WORKFLOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflowBody),
    });

    const rawText = await workflowResponse.text();

    console.log("[Workflow status]", workflowResponse.status);
    console.log("[Workflow raw response]", rawText);

    if (!workflowResponse.ok || !rawText.trim()) {
      return NextResponse.json(
        { message: "Workflow failed or returned empty response" },
        { status: 502 }
      );
    }

    let workflowPayload: any;
    try {
      workflowPayload = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { message: "Workflow returned invalid JSON", rawText },
        { status: 502 }
      );
    }

    const workflowQuestions = extractQuestions(workflowPayload);

    if (!workflowQuestions.length) {
      return NextResponse.json(
        { message: "No questions returned from workflow" },
        { status: 502 }
      );
    }

    const topQuestions = workflowQuestions
      .filter((q) => typeof q === "string" && q.trim())
      .slice(0, 15);

    const newInterview = new Interview({
      user: userId,
      jobRole,
      techStack: buildTechStack(jobDescription, jobRole),
      yearsOfExperience,
      resumeUrl,
      questions: topQuestions.map((q) => ({
        text: q,
        answer: "",
        analysis: null,
      })),
      workflowQuestions: workflowPayload,
      status: "in-progress",
    });

    await newInterview.save();

    return NextResponse.json(
      {
        status: "success",
        questions: topQuestions,
        interview: newInterview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Interview API ERROR]", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
