import React from "react";
import FeatureBox from "./FeatureBox";

const FormFeature = () => {
  return (
    <div className="w-[50%] max-sm:hidden h-screen flex flex-col items-center justify-center gap-10">
      <div className="flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Featured Features</h1>
      </div>

      {/* features boxes */}

      <div className="flex flex-col gap-6">
        <div className="relative flex gap-6">
          <FeatureBox
            text="AI-Powered Personalized Learning"
            para="Your personal AI learning agent creates adaptive study sessions tailored to your goals, strengths, and knowledge gaps—so you focus only on what truly matters."
            src="/images/image-box.svg"
          />

          <FeatureBox
            text="Real-Time Feedback & Skill Insights"
            para="Receive intelligent feedback on your understanding with actionable improvement suggestions and clear progress tracking to accelerate mastery."
            src="/images/chat-box.svg"
          />
          </div>

          <div className="flex gap-6">
            <FeatureBox
              text="Voice-Based Learning & Analysis"
              para="Explain concepts out loud using speech recognition and get AI-powered transcriptions, clarity analysis, and structured improvement guidance."
              src="/images/mic.svg"
          />

          <FeatureBox
            text="Adaptive Learning Paths"
            para="Select your goals, topics, or upload study material to generate a fully customized learning roadmap designed specifically for your growth."
            src="/images/psychology.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default FormFeature;
