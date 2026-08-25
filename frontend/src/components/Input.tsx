import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={inputId} className="text-xl font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full p-4 border-2 rounded-xl text-xl min-h-[56px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-lg mt-1">{error}</span>}
    </div>
  );
};
