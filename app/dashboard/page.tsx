"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InterviewList from "@/components/interview/InterviewList";
import Loader from "@/components/Loader";
import InterviewBtn from "@/components/interview/InterviewBtn";

interface Interview {
  _id: string;
  jobRole: string;
  techStack: string[];
  yearsOfExperience: number;
  status: string;
  overallScore: number;
  createdAt: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch interviews
        const response = await fetch("/api/interview/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedInterviews = data.interviews || [];
          setInterviews(fetchedInterviews);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // loader
  if (isLoading) {
    return <Loader />;
  }

  const handleCreateInterview = () => {
    router.push(`/interview/new`);
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const averageScore = interviews.length > 0
    ? Math.round(interviews.reduce((sum, interview) => sum + (interview.overallScore || 0), 0) / interviews.length)
    : 0;

  return (
    <div className="p-4 sm:p-6 md:p-10 mx-auto max-w-7xl safe-area-inset">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center justify-between w-full flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-1 sm:mb-2">
              Your Interviews
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">
              Practice your Interview Skills with AI Agents
            </p>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:block">
            <InterviewBtn
              onClick={handleCreateInterview}
              text="Create new Interview"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 animate-slide-up">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"></h2>
        <InterviewList />
      </div>
    </div>
  );
};

export default Dashboard;
