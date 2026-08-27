import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAlarm } from '../context/AlarmContext';
import { RINGTONE_OPTIONS, RingtoneId, alarmAudioService } from '../services/alarmAudioService';
import { speechService } from '../services/speechService';
import {
  Plus, CheckCircle2, Pill, Droplet, Utensils, Stethoscope, Brain, Phone,
  Clock, Calendar, AlertCircle, Volume2, Music, Play, Trash2, Edit3,
  Smartphone, Sparkles, Zap, ShieldCheck, Check, X, Bell
} from 'lucide-react';

interface VoiceReminder {
  id: string;
  title: string;
  type: string;
  description?: string;
  scheduledAt: string;
  recurrence: 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM';
  status: 'ACTIVE' | 'COMPLETED';
  metadata?: {
    isVoiceAlarm?: boolean;
    voiceMessage?: string;
    voiceLanguage?: 'en' | 'hi' | 'mr';
    voiceVolume?: number;
    vibration?: boolean;
    ringtone?: RingtoneId;
    customDays?: number[]; // 0=Sun, 1=Mon...
    enabled?: boolean;
  };
}

const QUICK_PRESETS: Record<string, { title: string; type: string; en: string; hi: string; mr: string }[]> = {
  all: [
    {
      title: 'Morning Medicine',
      type: 'MEDICINE',
      en: 'It is time to take your morning medicine with water.',
      hi: 'दवा लेने का समय हो गया है। कृपया पानी के साथ दवा ले लीजिए।',
      mr: 'औषध घेण्याची वेळ झाली आहे. कृपया पाण्यासोबत गोळी घ्या.'
    },
    {
      title: 'Drink Warm Water',
      type: 'WATER',
      en: 'Please drink a glass of warm water to stay hydrated.',
      hi: 'एक गिलास ताजा पानी पीने का समय हो गया है।',
      mr: 'एक ग्लास कोमट पाणी पिण्याची वेळ झाली आहे.'
    },
    {
      title: 'Lunch / Meal Time',
      type: 'MEAL',
      en: 'Time for your healthy afternoon meal.',
      hi: 'दोपहर के भोजन का समय हो गया है।',
      mr: 'दुपारच्या जेवणाची वेळ झाली आहे.'
    },
    {
      title: 'Memory Game Exercise',
      type: 'ACTIVITY',
      en: 'Time for your daily brain memory exercise with Aabha.',
      hi: 'आभा के साथ दिमागी कसरत और मेमोरी गेम खेलने का समय है।',
      mr: 'आभा सोबत मेमरी गेम आणि मेंदूचा सराव करण्याची वेळ झाली आहे.'
    },
    {
      title: 'Doctor Appointment',
      type: 'APPOINTMENT',
      en: 'Reminder: You have a doctor appointment today.',
      hi: 'याद दिलाना: आज डॉक्टर से परामर्श का समय है।',
      mr: 'स्मरणपत्र: आज डॉक्टरांशी सल्लामसलत करण्याची वेळ आहे.'
    },
    {
      title: 'Family Evening Call',
      type: 'FAMILY_CALL',
      en: 'Time for daily evening call with Priya and family.',
      hi: 'परिवार और बच्चों से बातचीत का समय हो गया है।',
      mr: 'कुटुंबातील सदस्यांशी फोनवर बोलण्याची वेळ झाली आहे.'
    }
  ]
};

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
  { id: 0, label: 'Sun', full: 'Sunday' },
];

export default function RemindersView() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const { triggerVoiceAlarm, triggerDemoCountdown, demoCountdown } = useAlarm();

  const [reminders, setReminders] = useState<VoiceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<RingtoneId | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: 'Morning Medicine',
    type: 'MEDICINE',
    description: '',
    time: '10:00',
    date: new Date().toISOString().slice(0, 10),
    recurrence: 'DAILY' as 'ONCE' | 'DAILY' | 'WEEKDAYS' | 'CUSTOM',
    customDays: [1, 2, 3, 4, 5] as number[],
    voiceMessage: 'Medicine lene ka time ho gaya hai. Kripya apni dawa le lijiye.',
    voiceLanguage: 'hi' as 'en' | 'hi' | 'mr',
    voiceVolume: 1.0,
    vibration: true,
    ringtone: 'temple_bell' as RingtoneId,
    enabled: true
  });

  useEffect(() => {
    fetchReminders();

    const handleUpdated = () => {
      fetchReminders();
    };

    window.addEventListener('aabha-reminders-updated', handleUpdated);
    return () => {
      window.removeEventListener('aabha-reminders-updated', handleUpdated);
    };
  }, [user]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reminders');
      if (Array.isArray(res)) {
        setReminders(res);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';
    const defaultPreset = QUICK_PRESETS.all[0];
    const initialMsg = lang === 'mr' ? defaultPreset.mr : lang === 'hi' ? defaultPreset.hi : defaultPreset.en;

    const now = new Date();
    const hours = String((now.getHours() + 1) % 24).padStart(2, '0');
    const minutes = '00';

    setFormData({
      title: 'Morning Medicine',
      type: 'MEDICINE',
      description: 'Take 1 tablet with lukewarm water after breakfast.',
      time: `${hours}:${minutes}`,
      date: new Date().toISOString().slice(0, 10),
      recurrence: 'DAILY',
      customDays: [1, 2, 3, 4, 5],
      voiceMessage: initialMsg,
      voiceLanguage: lang,
      voiceVolume: 1.0,
      vibration: true,
      ringtone: 'temple_bell',
      enabled: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (r: VoiceReminder) => {
    setEditingId(r.id);
    let time = '10:00';
    let date = new Date().toISOString().slice(0, 10);
    if (r.scheduledAt) {
      const d = new Date(r.scheduledAt);
      time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      date = d.toISOString().slice(0, 10);
    }

    setFormData({
      title: r.title,
      type: r.type,
      description: r.description || '',
      time,
      date,
      recurrence: r.recurrence || 'DAILY',
      customDays: r.metadata?.customDays || [1, 2, 3, 4, 5],
      voiceMessage: r.metadata?.voiceMessage || r.title,
      voiceLanguage: r.metadata?.voiceLanguage || 'hi',
      voiceVolume: r.metadata?.voiceVolume ?? 1.0,
      vibration: r.metadata?.vibration !== false,
      ringtone: r.metadata?.ringtone || 'temple_bell',
      enabled: r.metadata?.enabled !== false
    });
    setShowModal(true);
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS.all[0]) => {
    const lang = formData.voiceLanguage;
    const msg = lang === 'mr' ? preset.mr : lang === 'hi' ? preset.hi : preset.en;
    setFormData(prev => ({
      ...prev,
      title: preset.title,
      type: preset.type,
      voiceMessage: msg
    }));
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    // If the message was matching a preset, switch the text translation too
    const match = QUICK_PRESETS.all.find(p =>
      p.en === formData.voiceMessage || p.hi === formData.voiceMessage || p.mr === formData.voiceMessage
    );

    let updatedMsg = formData.voiceMessage;
    if (match) {
      updatedMsg = lang === 'mr' ? match.mr : lang === 'hi' ? match.hi : match.en;
    }

    setFormData(prev => ({
      ...prev,
      voiceLanguage: lang,
      voiceMessage: updatedMsg
    }));
  };

  const toggleDay = (dayId: number) => {
    setFormData(prev => {
      const exists = prev.customDays.includes(dayId);
      const updated = exists ? prev.customDays.filter(d => d !== dayId) : [...prev.customDays, dayId];
      return { ...prev, customDays: updated };
    });
  };

  const handleTestVoice = (customMsg?: string, customLang?: string) => {
    const msg = customMsg || formData.voiceMessage || formData.title;
    const lang = customLang || formData.voiceLanguage;

    setIsTestingVoice(true);
    let spokenText = msg;
    if (lang === 'hi') {
      spokenText = `रिमाइंडर: ${msg}`;
    } else if (lang === 'mr') {
      spokenText = `स्मरणपत्र: ${msg}`;
    } else {
      spokenText = `Reminder: ${msg}`;
    }

    // Play soft pre-chime then speak
    alarmAudioService.playMelody(formData.ringtone, 0.3);
    setTimeout(() => {
      speechService.speak(spokenText, lang, () => {
        setIsTestingVoice(false);
      });
    }, 350);
  };

  const handleToggleReminder = async (r: VoiceReminder) => {
    const currentEnabled = r.metadata?.enabled !== false;
    const newEnabled = !currentEnabled;

    setReminders(prev =>
      prev.map(item => item.id === r.id ? { ...item, metadata: { ...item.metadata, enabled: newEnabled } } : item)
    );

    try {
      await api.put(`/reminders/${r.id}`, {
        metadata: {
          ...r.metadata,
          enabled: newEnabled
        }
      });
    } catch (err) {
      console.error('Failed to toggle reminder status:', err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    try {
      await api.delete(`/reminders/${id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
      }
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const markComplete = async (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
    try {
      await api.put(`/reminders/${id}`, { status: 'COMPLETED' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct scheduledAt ISO
    const [hours, minutes] = formData.time.split(':');
    const schedDate = new Date();
    schedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const payload = {
      title: formData.title,
      type: formData.type,
      description: formData.description,
      scheduledAt: schedDate.toISOString(),
      recurrence: formData.recurrence,
      metadata: {
        isVoiceAlarm: true,
        voiceMessage: formData.voiceMessage,
        voiceLanguage: formData.voiceLanguage,
        voiceVolume: formData.voiceVolume,
        vibration: formData.vibration,
        ringtone: formData.ringtone,
        customDays: formData.customDays,
        enabled: formData.enabled
      }
    };

    try {
      if (editingId) {
        await api.put(`/reminders/${editingId}`, payload);
        setReminders(prev => prev.map(r => r.id === editingId ? { ...r, ...payload, id: editingId } : r));
      } else {
        const res = await api.post('/reminders', payload);
        const newRem = res.id ? res : { id: `local-${Date.now()}`, ...payload, status: 'ACTIVE' };
        setReminders(prev => [newRem, ...prev]);
      }
      setShowModal(false);
      fetchReminders();
    } catch (err) {
      console.error('Failed to save reminder:', err);
      if (!editingId) {
        const optimistic: VoiceReminder = {
          id: `local-${Date.now()}`,
          title: formData.title,
          type: formData.type,
          description: formData.description,
          scheduledAt: schedDate.toISOString(),
          recurrence: formData.recurrence,
          status: 'ACTIVE',
          metadata: payload.metadata
        };
        setReminders(prev => [optimistic, ...prev]);
      }
      setShowModal(false);
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
      default: return { emoji: '⏰', color: 'border-slate-500/40 bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]' };
    }
  };

  const getLangBadgeLabel = (lang?: string) => {
    switch (lang?.toLowerCase().split('-')[0]) {
      case 'hi': return '🇮🇳 हिन्दी';
      case 'mr': return '🇮🇳 मराठी';
      default: return '🌐 English';
    }
  };

  const now = new Date();
  const activeReminders = reminders.filter(r => r.status === 'ACTIVE');
  const completedReminders = reminders.filter(r => r.status === 'COMPLETED');

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* ─── 1. HERO SPOTLIGHT & DEMO MODE BANNER ─────────────────────────── */}
      <div className="card-3d relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-[var(--card-bg-inline)] to-teal-950/30 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border-2 border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" /> Smart Voice Reminder Alarm
              </span>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                TTS Spoken Voice
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
              <span>🗣️</span> {t('Daily Routine & Voice Alarms')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
              Replaces conventional ringtones with <strong className="text-emerald-300">clear spoken voice reminders</strong> in Hindi, Marathi, and English with auto vibration & custom schedules.
            </p>
          </div>

          {/* Action Buttons: Demo Mode & Add Reminder */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => triggerDemoCountdown()}
              className="px-5 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              title="Test Voice Alarm with 10-Second Countdown"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>⚡ Demo Voice Alarm (10s)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-glow px-6 py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 rounded-2xl cursor-pointer shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>{t('Add Voice Reminder')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. ACTIVE VOICE REMINDERS LIST ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Scheduled Routine Alarms</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-black ml-1">
              {activeReminders.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[var(--text-primary)]">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">Loading Smart Voice Alarms...</p>
          </div>
        ) : activeReminders.length === 0 ? (
          <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-10 rounded-[28px] text-center border border-[var(--card-border-inline)] space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-3xl">
              ⏰
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">No Active Reminders</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Add your first spoken voice reminder for medicine, meals, or water in Hindi, Marathi, or English.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-glow px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 rounded-xl mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReminders.map(r => {
              const style = getEmojiAndColor(r.type);
              const isEnabled = r.metadata?.enabled !== false;
              const timeStr = r.scheduledAt
                ? new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '10:00 AM';
              const voiceMsg = r.metadata?.voiceMessage || r.description || r.title;
              const langCode = r.metadata?.voiceLanguage || 'hi';
              const vibrationOn = r.metadata?.vibration !== false;

              return (
                <div
                  key={r.id}
                  className={`card-3d p-5 sm:p-6 rounded-[24px] transition-all bg-[var(--card-bg-inline)] backdrop-blur-xl border ${
                    isEnabled
                      ? 'border-[var(--card-border-inline)] hover:border-emerald-500/50 shadow-lg'
                      : 'border-[var(--border)] opacity-60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Time, Emoji, Title, Voice Text */}
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Big Time / Type Badge */}
                      <div className="flex flex-col items-center justify-center w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-[var(--bg-surface-secondary)] border-2 border-emerald-400/30 shrink-0 shadow-inner">
                        <span className="text-2xl sm:text-3xl">{style.emoji}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-300 mt-1">
                          {timeStr}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-xl font-black text-[var(--text-primary)]">
                            {r.title}
                          </h3>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-black">
                            {getLangBadgeLabel(langCode)}
                          </span>
                        </div>

                        {/* Spoken Voice Quote */}
                        <div className="flex items-start gap-1.5 text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 max-w-xl">
                          <span className="text-emerald-400 shrink-0 mt-0.5">🔊</span>
                          <span className="italic leading-snug">"{voiceMsg}"</span>
                        </div>

                        {/* Badges: Recurrence & Vibration */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] font-bold text-[var(--text-secondary)]">
                          <span className="bg-[var(--bg-surface-secondary)] border border-[var(--border)] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            🔁 {r.recurrence || 'DAILY'}
                          </span>
                          {vibrationOn && (
                            <span className="bg-purple-500/15 border border-purple-400/30 text-purple-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              📳 Vibration ON
                            </span>
                          )}
                          {r.description && r.description !== voiceMsg && (
                            <span className="text-xs text-[var(--text-secondary)] hidden md:inline">
                              • {r.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions (Enable/Disable, Test Voice, Edit, Delete, Done) */}
                    <div className="flex items-center gap-2 self-end lg:self-center flex-wrap pt-2 lg:pt-0">
                      {/* Enable/Disable Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(r)}
                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : 'bg-slate-700/30 text-slate-400 border-slate-600/40'
                        }`}
                        title={isEnabled ? 'Click to Disable Alarm' : 'Click to Enable Alarm'}
                      >
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Test Voice Button */}
                      <button
                        type="button"
                        onClick={() => handleTestVoice(voiceMsg, langCode)}
                        className="btn-glass px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 cursor-pointer shadow-sm"
                        title="Hear this spoken voice message right now"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Voice</span>
                      </button>

                      {/* Done Button */}
                      <button
                        type="button"
                        onClick={() => markComplete(r.id)}
                        className="btn-glow px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer"
                        title="Mark as completed today"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('Done')}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(r)}
                        className="p-2 bg-[var(--bg-surface-secondary)] border border-[var(--border)] hover:border-emerald-400/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition cursor-pointer"
                        title="Edit Reminder"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(r.id)}
                        className="p-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 3. COMPLETED REMINDERS (COLLAPSED/ACCESSIBLE) ─────────────────── */}
      {completedReminders.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Today ({completedReminders.length})
          </h2>
          <div className="space-y-2">
            {completedReminders.map(r => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getEmojiAndColor(r.type).emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] line-through">{r.title}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">Completed successfully</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReminder(r.id)}
                  className="text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 4. ADD / EDIT SMART VOICE REMINDER MODAL ───────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-3d bg-[var(--card-bg-inline)] border-2 border-emerald-500/40 rounded-[28px] max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
                  🗣️
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    {editingId ? 'Edit Smart Voice Reminder' : 'Add Smart Voice Reminder'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">Spoken voice alarm with text-to-speech</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Quick Template Presets */}
              <div>
                <label className="text-xs font-black text-emerald-400 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Quick Templates
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_PRESETS.all.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 border border-[var(--border)] hover:border-emerald-400/50 text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap shrink-0 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Reminder Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Medicine, Drink Water, Doctor Visit"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold outline-none"
                  >
                    <option value="MEDICINE">💊 Medicine</option>
                    <option value="WATER">💧 Water</option>
                    <option value="MEAL">🍽️ Meal</option>
                    <option value="ACTIVITY">🧠 Activity</option>
                    <option value="APPOINTMENT">🏥 Doctor</option>
                    <option value="FAMILY_CALL">📞 Family Call</option>
                  </select>
                </div>
              </div>

              {/* Time Picker & Recurrence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3.5 py-2.5 text-sm font-black outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    Repeat Schedule
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={e => setFormData({ ...formData, recurrence: e.target.value as any })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold outline-none"
                  >
                    <option value="DAILY">🔁 Daily (Every day)</option>
                    <option value="WEEKDAYS">📅 Weekdays (Mon - Fri)</option>
                    <option value="CUSTOM">⚙️ Custom Days</option>
                    <option value="ONCE">⚡ Once (No Repeat)</option>
                  </select>
                </div>
              </div>

              {/* Custom Days Selector if recurrence is CUSTOM */}
              {formData.recurrence === 'CUSTOM' && (
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                    Select Days of Week
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DAYS_OF_WEEK.map(d => {
                      const selected = formData.customDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDay(d.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                            selected
                              ? 'bg-emerald-400 text-slate-950 shadow-md scale-105'
                              : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Language Selector for Voice */}
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
                  Voice Speech Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer ${
                      formData.voiceLanguage === 'hi'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                        : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageChange('mr')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer ${
                      formData.voiceLanguage === 'mr'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                        : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    🇮🇳 मराठी (Marathi)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer ${
                      formData.voiceLanguage === 'en'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-md'
                        : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    🌐 English
                  </button>
                </div>
              </div>

              {/* Voice Message Text Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" /> Spoken Voice Message (TTS)
                  </label>
                  <span className="text-[10px] text-[var(--text-secondary)]">App will speak this sentence aloud</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={formData.voiceMessage}
                  onChange={e => setFormData({ ...formData, voiceMessage: e.target.value })}
                  placeholder="e.g. Medicine lene ka time ho gaya hai..."
                  className="w-full bg-[var(--input-bg)] border-2 border-emerald-500/30 text-[var(--input-text)] rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:border-emerald-400"
                />
              </div>

              {/* Vibration & Voice Volume Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Vibration Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">Vibration Alert</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Device haptic buzz</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.vibration}
                    onChange={e => setFormData({ ...formData, vibration: e.target.checked })}
                    className="w-5 h-5 accent-emerald-400 rounded cursor-pointer"
                  />
                </div>

                {/* Soft Pre-chime Ringtone */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">Pre-Chime Sound</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Soft tone before speech</div>
                    </div>
                  </div>
                  <select
                    value={formData.ringtone}
                    onChange={e => setFormData({ ...formData, ringtone: e.target.value as any })}
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-lg px-2 py-1 text-xs font-bold"
                  >
                    <option value="temple_bell">🔔 Temple Bell</option>
                    <option value="gentle_flute">🎶 Flute</option>
                    <option value="nature_birds">🐦 Birds</option>
                    <option value="zen_chime">🌸 Zen</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons: Test Voice & Save */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleTestVoice()}
                  className="flex-1 btn-glass py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl text-emerald-300 hover:text-emerald-200 cursor-pointer shadow-md"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>{isTestingVoice ? 'Speaking...' : 'Test Voice 🔊'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 btn-glow py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-xl"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Update Reminder' : 'Save Voice Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
