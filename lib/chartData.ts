// Mock data generators for research charts in AI Powered Interview system

export interface PerformanceData {
  date: string;
  score: number;
  jobRole: string;
}

export interface JobRoleData {
  name: string;
  count: number;
}

export interface TechStackData {
  name: string;
  count: number;
}

export interface StatsChartData {
  jobRoles: JobRoleData[];
  techStacks: TechStackData[];
}

// Generate mock performance data
export const generatePerformanceData = (interviews: any[]): PerformanceData[] => {
  if (interviews.length === 0) {
    // Return sample data if no interviews provided
    return [
      { date: 'Jan 1', score: 65, jobRole: 'Frontend Developer' },
      { date: 'Jan 8', score: 72, jobRole: 'Backend Developer' },
      { date: 'Jan 15', score: 78, jobRole: 'Full Stack Developer' },
      { date: 'Jan 22', score: 84, jobRole: 'DevOps Engineer' },
      { date: 'Jan 29', score: 88, jobRole: 'Data Scientist' },
      { date: 'Feb 5', score: 92, jobRole: 'Machine Learning Engineer' },
    ];
  }

  // Generate data from actual interviews if available
  return interviews.map((interview, index) => ({
    date: new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: interview.overallScore || Math.floor(Math.random() * 40) + 60, // Random score between 60-100 if not available
    jobRole: interview.jobRole || 'Software Engineer'
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Generate mock job role data
export const generateJobRoleData = (interviews: any[]): JobRoleData[] => {
  if (interviews.length === 0) {
    return [
      { name: 'Frontend', count: 25 },
      { name: 'Backend', count: 30 },
      { name: 'Full Stack', count: 40 },
      { name: 'DevOps', count: 15 },
      { name: 'Data Science', count: 20 },
      { name: 'ML/AI', count: 18 },
    ];
  }

  // Count occurrences of job roles
  const roleCounts: Record<string, number> = {};
  interviews.forEach(interview => {
    const role = interview.jobRole || 'General';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  return Object.entries(roleCounts).map(([name, count]) => ({
    name,
    count
  }));
};

// Generate mock tech stack data
export const generateTechStackData = (interviews: any[]): TechStackData[] => {
  if (interviews.length === 0) {
    return [
      { name: 'React', count: 45 },
      { name: 'Node.js', count: 40 },
      { name: 'Python', count: 35 },
      { name: 'Java', count: 30 },
      { name: 'JavaScript', count: 50 },
      { name: 'TypeScript', count: 38 },
    ];
  }

  // Extract and count tech stacks from interviews
  const techCounts: Record<string, number> = {};
  interviews.forEach(interview => {
    const techs = Array.isArray(interview.techStack) ? interview.techStack : ['General'];
    techs.forEach((tech: string) => {
      techCounts[tech] = (techCounts[tech] || 0) + 1;
    });
  });

  return Object.entries(techCounts).map(([name, count]) => ({
    name,
    count
  }));
};

// Generate comprehensive stats data
export const generateStatsChartData = (interviews: any[]): StatsChartData => {
  return {
    jobRoles: generateJobRoleData(interviews),
    techStacks: generateTechStackData(interviews)
  };
};

// Generate comprehensive dashboard data
export const generateDashboardData = (interviews: any[]) => {
  return {
    performanceData: generatePerformanceData(interviews),
    statsData: generateStatsChartData(interviews)
  };
};