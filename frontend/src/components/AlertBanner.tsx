import React from 'react';

export const AlertBanner: React.FC<{ message: string; severity?: 'low' | 'medium' | 'high' }> = ({ message, severity = 'medium' }) => {
  const colors = {
    low: 'bg-blue-50 text-blue-800 border-blue-200',
    medium: 'bg-orange-50 text-orange-800 border-orange-200',
    high: 'bg-red-50 text-red-800 border-red-200'
  };

  return (
    <div className={`p-4 rounded-2xl border-2 mb-4 flex items-center gap-4 ${colors[severity]}`}>
      <span className="text-2xl">ℹ️</span>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};
