import React from 'react';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'offline';

interface AabhaOrbProps {
  state: OrbState;
  className?: string;
}

export const AabhaOrb: React.FC<AabhaOrbProps> = ({ state, className = '' }) => {
  let orbClass = '';
  let text = '';

  switch (state) {
    case 'idle':
      orbClass = 'animate-pulse bg-gradient-to-tr from-blue-300 to-blue-100 shadow-[0_0_40px_rgba(147,197,253,0.6)]';
      text = 'AABHA';
      break;
    case 'listening':
      orbClass = 'animate-ping bg-gradient-to-tr from-blue-400 to-purple-300 shadow-[0_0_60px_rgba(167,139,250,0.8)]';
      text = 'Listening...';
      break;
    case 'thinking':
      orbClass = 'animate-spin bg-gradient-to-tr from-purple-400 to-blue-400 shadow-[0_0_50px_rgba(167,139,250,0.6)]';
      text = 'Thinking...';
      break;
    case 'speaking':
      orbClass = 'animate-bounce bg-gradient-to-tr from-blue-400 to-indigo-300 shadow-[0_0_50px_rgba(129,140,248,0.7)]';
      text = 'Speaking...';
      break;
    case 'offline':
      orbClass = 'bg-gray-300 shadow-none';
      text = 'Offline';
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full transition-all duration-500 ease-in-out ${orbClass}`} />
      <span className="text-2xl font-medium text-blue-900 tracking-wide">{text}</span>
    </div>
  );
};
