import React from 'react';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onComplete }) => {
  const reminderTime = reminder.scheduledAt 
    ? new Date(reminder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const isCompleted = reminder.status === 'COMPLETED';
  const isOverdue = reminder.scheduledAt 
    ? new Date(reminder.scheduledAt) < new Date() && !isCompleted
    : false;

  const getEmoji = (type: string) => {
    switch (type.toUpperCase()) {
      case 'MEDICINE': return '💊';
      case 'WATER': return '💧';
      case 'MEAL': return '🍽️';
      case 'ACTIVITY': return '🧠';
      case 'APPOINTMENT': return '🏥';
      case 'FAMILY_CALL': return '📞';
      default: return '⏰';
    }
  };

  return (
    <div className={`p-6 rounded-3xl shadow-sm border-2 flex items-center justify-between gap-4 transition-colors ${
      isCompleted ? 'bg-gray-50 border-gray-200' :
      isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{getEmoji(reminder.type)}</div>
        <div>
          <h3 className={`text-2xl font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-slate-800'}`}>{reminder.title}</h3>
          <p className={`text-xl ${isOverdue && !isCompleted ? 'text-red-600 font-bold' : 'text-blue-600'}`}>{reminderTime}</p>
        </div>
      </div>
      {!isCompleted && (
        <button
          onClick={() => onComplete(reminder.id)}
          className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center hover:bg-green-50 text-green-500 transition"
          aria-label="Mark complete"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </button>
      )}
      {isCompleted && (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
      )}
    </div>
  );
};
