import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: { date: string; accuracy: number }[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" tick={{ fontSize: 16, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 16, fill: '#6B7280' }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#1E3A8A' }}
          />
          <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
