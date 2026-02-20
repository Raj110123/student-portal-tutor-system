'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PerformanceData {
  date: string;
  score: number;
  jobRole: string;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-80 sm:h-96 bg-[#0d0d1a] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl" />;
  }
  return (
    <div className="w-full h-80 sm:h-96 bg-[#0d0d1a] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Session Performance Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
          <XAxis
            dataKey="date"
            stroke="#c084fc"
            tick={{ fill: '#e2e8f0' }}
          />
          <YAxis
            stroke="#c084fc"
            tick={{ fill: '#e2e8f0' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 10, 40, 0.9)',
              borderColor: '#8b5cf6',
              borderRadius: '0.5rem',
              color: 'white'
            }}
            itemStyle={{ color: 'white' }}
            labelStyle={{ color: '#c084fc', fontWeight: 'bold' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#ffffff"
            strokeWidth={2}
            activeDot={{ r: 8, fill: '#ffffff' }}
            name="Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;