import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAlarm } from '../context/AlarmContext';
import { RINGTONE_OPTIONS, RingtoneId, alarmAudioService } from '../services/alarmAudioService';
import { Plus, CheckCircle2, Pill, Droplet, Utensils, Stethoscope, Brain, Phone, List, Bell, Clock, Calendar, AlertCircle, Volume2, Music, Play, Square, Trash2 } from 'lucide-react';

export default function RemindersView() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { triggerTestAlarm } = useAlarm();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<RingtoneId | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'MEDICINE',
    description: '',
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    recurrence: 'DAILY',
    ringtone: 'temple_bell' as RingtoneId,
  });

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reminders');
      setReminders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: string) => {
    try {
      await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      fetchReminders();
    } catch (err) {
      console.error(err);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      setReminders(prev => prev.filter(r => r.id !== id));
      await api.delete(`/reminders/${id}`);
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reminders', {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        recurrence: formData.recurrence,
        ringtone: formData.ringtone,
      });
      setShowModal(false);
      setFormData({
        title: '',
        type: 'MEDICINE',
        description: '',
        scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        recurrence: 'DAILY',
        ringtone: 'temple_bell',
      });
      fetchReminders();
    } catch (err) {
      console.error('Failed to save reminder:', err);
      // Local optimistic addition
      const optimistic = {
        id: `local-${Date.now()}`,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        status: 'ACTIVE',
        recurrence: formData.recurrence,
        metadata: { ringtone: formData.ringtone }
      };
      setReminders(prev => [optimistic, ...prev]);
      setShowModal(false);
    }
  };

  const handlePreviewSound = (ringtoneId: RingtoneId) => {
    if (playingPreview === ringtoneId) {
      alarmAudioService.stop();
      setPlayingPreview(null);
    } else {
      setPlayingPreview(ringtoneId);
      alarmAudioService.playMelody(ringtoneId);
      setTimeout(() => {
        setPlayingPreview(null);
      }, 3500);
    }
  };

  const getEmojiAndColor = (type: string) => {
    switch (type) {
      case 'MEDICINE': return { emoji: '💊', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' };
      case 'WATER': return { emoji: '💧', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' };
      case 'MEAL': return { emoji: '🍽️', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' };
      case 'APPOINTMENT': return { emoji: '🏥', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' };
      case 'ACTIVITY': return { emoji: '🧠', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' };
      case 'FAMILY_CALL': return { emoji: '📞', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' };
      default: return { emoji: '☕', color: 'border-slate-500/40 bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]' };
    }
  };

  const now = new Date();
  const upcoming = reminders.filter(r => r.status === 'ACTIVE' && (!r.scheduledAt || new Date(r.scheduledAt) >= now));
  const overdue = reminders.filter(r => r.status === 'ACTIVE' && r.scheduledAt && new Date(r.scheduledAt) < now);
  const completed = reminders.filter(r => r.status === 'COMPLETED');

  const renderList = (list: any[], emptyMsg: string) => {
    if (list.length === 0) {
      return (
        <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-8 rounded-[24px] text-center border border-[var(--card-border-inline)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="space-y-3.5">
        {list.map(r => {
          const style = getEmojiAndColor(r.type);
          const isDone = r.status === 'COMPLETED';
          const timeStr = r.scheduledAt ? new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
          const dateStr = r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
          const ringtoneName = RINGTONE_OPTIONS.find(ro => ro.id === r.metadata?.ringtone)?.name || 'Temple Bell';

          return (
            <div
              key={r.id}
              className={`card-3d p-5 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all bg-[var(--card-bg-inline)] backdrop-blur-xl border ${
                isDone
                  ? 'border-[var(--border)] opacity-60'
                  : 'border-[var(--card-border-inline)] hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  {style.emoji}
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-black ${isDone ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {timeStr} {dateStr && `(${dateStr})`}
                    </span>
                    {r.recurrence && r.recurrence !== 'NONE' && (
                      <span className="text-[11px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] px-2.5 py-0.5 rounded-full font-bold uppercase">
                        🔁 {r.recurrence}
                      </span>
                    )}
                    <span className="text-[11px] bg-blue-500/15 border border-blue-400/30 text-blue-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Music className="w-3 h-3" /> {ringtoneName}
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-[var(--text-secondary)] font-medium mt-1.5">{r.description}</p>}
                </div>
              </div>

              {/* Action Buttons: Tune, Done, Delete */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {!isDone && (
                  <button
                    type="button"
                    onClick={() => handlePreviewSound(r.metadata?.ringtone || 'temple_bell')}
                    className="btn-glass p-2.5 rounded-xl font-bold transition flex items-center gap-1 text-xs"
                    title="Test Ringtone"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Tune</span>
                  </button>
                )}

                {!isDone ? (
                  <button
                    onClick={() => markComplete(r.id)}
                    className="btn-glow flex items-center gap-1.5 px-4 py-2.5 text-xs font-black"
                  >
                    <CheckCircle2 size={16} /> <span>{t('Done')}</span>
                  </button>
                ) : (
                  <span className="text-emerald-300 font-bold text-xs flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl">
                    ✓ Completed
                  </span>
                )}

                {/* 1-Click Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteReminder(r.id)}
                  className="p-2.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-[var(--text-primary)]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg text-[var(--text-primary)] font-bold">{t('Loading reminders...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="card-3d flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] border border-[var(--card-border-inline)]">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span>📅</span> {t('Daily Routine & Alarms')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Automatic audible alarms with customizable peaceful ringtones & vibration
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => triggerTestAlarm(formData.ringtone)}
            className="btn-glass flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold"
          >
            <Volume2 size={16} className="text-emerald-400 animate-bounce" /> Test Live Alarm
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn-glow flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-black"
          >
            <Plus size={18} /> {t('Add Reminder')}
          </button>
        </div>
      </div>

      {/* Ringtones Feature Banner */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl rounded-[24px] p-6 border border-[var(--card-border-inline)] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl shrink-0">
            🎶
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--text-primary)]">Peaceful Indian & Nature Alarms</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Temple Bell, Morning Flute, Bird Chirps, Zen Chimes & Classic Tones</p>
          </div>
        </div>
        <button
          onClick={() => triggerTestAlarm('gentle_flute')}
          className="btn-glass px-4 py-2 text-xs font-bold hover:text-emerald-400 whitespace-nowrap"
        >
          🔊 Hear Flute Ringtone
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {overdue.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-rose-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {t('⚠️ Action Needed (Overdue)')}
            </h2>
            {renderList(overdue, '')}
          </section>
        )}
        
        <section>
          <h2 className="text-lg font-black text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" /> {t('Upcoming Today & Tomorrow')}
          </h2>
          {renderList(upcoming, t('No pending reminders. Great job staying on track! 🎉'))}
        </section>

        {completed.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t('Completed Activities')}
            </h2>
            {renderList(completed, '')}
          </section>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span>⏰</span> {t('Create New Reminder & Alarm')}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Reminder Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Take Blood Pressure Medicine"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3.5 border border-[var(--input-border)] rounded-2xl text-sm font-bold bg-[var(--input-bg)] text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3.5 border border-[var(--input-border)] rounded-2xl text-xs font-bold bg-[var(--bg-surface)] text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  >
                    <option value="MEDICINE">💊 Medicine</option>
                    <option value="WATER">💧 Water / Hydration</option>
                    <option value="MEAL">🍽️ Meal</option>
                    <option value="ACTIVITY">🧠 Cognitive Game</option>
                    <option value="APPOINTMENT">🏥 Doctor Visit</option>
                    <option value="FAMILY_CALL">📞 Family Call</option>
                    <option value="ROUTINE">☕ Daily Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Recurrence</label>
                  <select
                    value={formData.recurrence}
                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full p-3.5 border border-[var(--input-border)] rounded-2xl text-xs font-bold bg-[var(--bg-surface)] text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  >
                    <option value="DAILY">Daily (हर रोज़)</option>
                    <option value="WEEKLY">Weekly (हफ़्ते में एक बार)</option>
                    <option value="NONE">One-time (सिर्फ़ एक बार)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full p-3.5 border border-[var(--input-border)] rounded-2xl text-sm font-bold bg-[var(--input-bg)] text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              {/* Ringtone selector */}
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Alarm Chime Ringtone</label>
                <div className="grid grid-cols-2 gap-2">
                  {RINGTONE_OPTIONS.map(rt => (
                    <div
                      key={rt.id}
                      onClick={() => setFormData({ ...formData, ringtone: rt.id })}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        formData.ringtone === rt.id
                          ? 'border-emerald-400 bg-emerald-500/20 text-[var(--text-primary)] font-black'
                          : 'border-[var(--border)] bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{rt.emoji}</span>
                        <span className="text-xs">{rt.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewSound(rt.id);
                        }}
                        className="p-1 rounded-lg hover:bg-[var(--btn-glass-bg-hover)]"
                      >
                        {playingPreview === rt.id ? <Square size={14} className="text-rose-400" /> : <Play size={14} className="text-emerald-400" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">Optional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Take 1 tablet with warm water after dinner"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 border border-[var(--input-border)] rounded-2xl text-sm font-bold bg-[var(--input-bg)] text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-glass flex-1 py-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow flex-1 py-3 text-xs font-black"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
