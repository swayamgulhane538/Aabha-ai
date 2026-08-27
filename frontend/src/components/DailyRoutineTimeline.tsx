import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle2, Circle, Volume2, Plus, Sparkles, Sun, Sunset, Moon, Sunrise, Trash2 } from 'lucide-react';
import { speechService } from '../services/speechService';

export interface RoutineTask {
  id: string;
  time: string; // "08:00 AM" or "13:00"
  timeMinutes: number; // minutes from midnight (e.g. 480 for 8:00 AM)
  title: string;
  category: 'MEDICINE' | 'MEAL' | 'ACTIVITY' | 'HYDRATION' | 'REST' | 'FAMILY';
  completed: boolean;
  voiceMessage?: string;
  voiceLanguage?: 'en' | 'hi' | 'mr';
}

interface DailyRoutineTimelineProps {
  tasks: RoutineTask[];
  onToggleTask: (id: string) => void;
  onAddTask?: () => void;
  onDeleteTask?: (id: string) => void;
}

export const DailyRoutineTimeline: React.FC<DailyRoutineTimelineProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) => {
  const { t, i18n } = useTranslation();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Segment tasks by time of day
  const morningTasks = tasks.filter(t => t.timeMinutes >= 360 && t.timeMinutes < 720); // 06:00 - 12:00
  const afternoonTasks = tasks.filter(t => t.timeMinutes >= 720 && t.timeMinutes < 1020); // 12:00 - 17:00
  const eveningTasks = tasks.filter(t => t.timeMinutes >= 1020 && t.timeMinutes < 1260); // 17:00 - 21:00
  const nightTasks = tasks.filter(t => t.timeMinutes >= 1260 || t.timeMinutes < 360); // 21:00 - 05:59

  const handlePlayVoice = (task: RoutineTask) => {
    const text = task.voiceMessage || `${task.title} lene ka time ho gaya hai`;
    setPlayingVoiceId(task.id);
    speechService.speak(text, task.voiceLanguage || lang, () => {
      setPlayingVoiceId(null);
    });
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'MEDICINE': return '💊';
      case 'HYDRATION': return '💧';
      case 'MEAL': return '🍽️';
      case 'ACTIVITY': return '🏃';
      case 'REST': return '🛌';
      case 'FAMILY': return '📞';
      default: return '⏰';
    }
  };

  const renderSection = (title: string, subtitle: string, icon: React.ReactNode, sectionTasks: RoutineTask[], badgeColor: string) => {
    if (sectionTasks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className={`p-2 rounded-xl border ${badgeColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]">
                {sectionTasks.filter(t => t.completed).length}/{sectionTasks.length}
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sectionTasks.map(task => {
            const isDone = task.completed;
            const isSpeaking = playingVoiceId === task.id;

            return (
              <div
                key={task.id}
                className={`card-3d p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 transition-all border ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                    : 'bg-[var(--card-bg-inline)] backdrop-blur-xl border-[var(--card-border-inline)] hover:border-emerald-500/40 shadow-sm'
                }`}
              >
                {/* Left: Time, Emoji, Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {getCategoryEmoji(task.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-400 shrink-0">
                        {task.time}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                        {task.title}
                      </h4>
                    </div>
                    {task.voiceMessage && (
                      <p className="text-[11px] text-[var(--text-secondary)] italic truncate mt-0.5 max-w-sm sm:max-w-md">
                        "{task.voiceMessage}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Test Voice, Complete Checkbox & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(task)}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isSpeaking
                        ? 'bg-emerald-400 text-slate-950 shadow-md animate-pulse'
                        : 'btn-glass text-emerald-300 hover:text-emerald-200'
                    }`}
                    title="Hear Spoken Voice Reminder"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isSpeaking ? 'Playing...' : 'Voice'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'btn-glow text-white'
                    }`}
                    title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isDone ? 'Completed' : 'Complete'}</span>
                  </button>

                  {onDeleteTask && (
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/15 border border-rose-500/20 transition cursor-pointer"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Progress Overview */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {lang === 'mr' ? 'दैनिक दिनचर्या आणि वेळापत्रक' : lang === 'hi' ? 'दैनिक दिनचर्या और टाइमलाइन' : 'Daily Routine Timeline'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              {lang === 'mr'
                ? 'सकाळपासून रात्रीपर्यंतची सर्व कामे आणि बोलणारे स्मरणपत्र'
                : lang === 'hi'
                ? 'सुबह से रात तक के सभी कार्य एवं बोलकर याद दिलाने वाले अलार्म'
                : 'Complete daily timeline with spoken voice reminders from morning to night'}
            </p>
          </div>

          {onAddTask && (
            <button
              type="button"
              onClick={onAddTask}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'mr' ? 'नवीन कार्य जोडा' : lang === 'hi' ? 'नया टास्क जोड़ें' : 'Add Task'}</span>
            </button>
          )}
        </div>

        {/* Progress Bar with Percentage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-secondary)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'mr' ? 'आजची प्रगती' : lang === 'hi' ? 'आज की प्रगति' : "Today's Progress"}
            </span>
            <span className="text-emerald-400 font-black text-sm">
              {progressPct}% ({completedCount}/{totalCount} {lang === 'mr' ? 'पूर्ण' : lang === 'hi' ? 'पूर्ण' : 'done'})
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border)] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Segmented Timeline Sections */}
      <div className="space-y-6">
        {renderSection(
          lang === 'mr' ? '🌅 सकाळ (Morning)' : lang === 'hi' ? '🌅 सुबह (Morning)' : '🌅 Morning',
          '06:00 AM – 12:00 PM',
          <Sunrise className="w-4 h-4 text-amber-400" />,
          morningTasks,
          'border-amber-400/30 bg-amber-500/10 text-amber-300'
        )}

        {renderSection(
          lang === 'mr' ? '☀️ दुपार (Afternoon)' : lang === 'hi' ? '☀️ दोपहर (Afternoon)' : '☀️ Afternoon',
          '12:00 PM – 05:00 PM',
          <Sun className="w-4 h-4 text-yellow-400" />,
          afternoonTasks,
          'border-yellow-400/30 bg-yellow-500/10 text-yellow-300'
        )}

        {renderSection(
          lang === 'mr' ? '🌇 संध्याकाळ (Evening)' : lang === 'hi' ? '🌇 शाम (Evening)' : '🌇 Evening',
          '05:00 PM – 09:00 PM',
          <Sunset className="w-4 h-4 text-orange-400" />,
          eveningTasks,
          'border-orange-400/30 bg-orange-500/10 text-orange-300'
        )}

        {renderSection(
          lang === 'mr' ? '🌙 रात्र (Night)' : lang === 'hi' ? '🌙 रात (Night)' : '🌙 Night',
          '09:00 PM – 05:59 AM',
          <Moon className="w-4 h-4 text-indigo-400" />,
          nightTasks,
          'border-indigo-400/30 bg-indigo-500/10 text-indigo-300'
        )}
      </div>
    </div>
  );
};
