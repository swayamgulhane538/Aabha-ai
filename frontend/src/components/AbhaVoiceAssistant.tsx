import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, X, AlertTriangle, Play, RefreshCw, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { speechService } from '../services/speechService';
import { AIRoutineCommander } from '../services/aiRoutineCommander';
import { Abha3DOrb, OrbState } from './Abha3DOrb';

interface AbhaVoiceAssistantProps {
  onTriggerSos?: () => void;
}

export const AbhaVoiceAssistant: React.FC<AbhaVoiceAssistantProps> = ({ onTriggerSos }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<OrbState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<string>('hi');
  const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [pendingVoiceCommand, setPendingVoiceCommand] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, reply]);

  // Start Speech Recognition
  const startListening = () => {
    speechService.stopSpeaking();
    setState('LISTENING');
    setTranscript('');

    speechService.startListening(
      (text: string) => {
        setTranscript(text);
        if (text.trim()) {
          handleSendMessage(text.trim());
        }
      },
      (error: any) => {
        if (error === 'no-speech') {
          setState('IDLE');
        } else {
          setState('ERROR');
        }
      },
      language
    );
  };

  // Stop Speech Recognition
  const stopListening = () => {
    speechService.stopListening();
    setState('IDLE');
  };

  // Speak AI reply out loud
  const speakText = (text: string) => {
    if (isMuted) return;
    setState('SPEAKING');

    speechService.speak(
      text,
      language,
      () => {
        setState('IDLE');
      }
    );
  };

  // Send message to AI Backend Router or AIRoutineCommander
  const handleSendMessage = async (customMessage?: string) => {
    const query = (customMessage || inputText || transcript).trim();
    if (!query) return;

    speechService.stopListening();

    // Append to local history
    setConversationHistory(prev => [...prev, { role: 'user', text: query }]);
    setInputText('');
    setTranscript('');
    setState('THINKING');

    const cleanLang = (language || 'hi').startsWith('mr') ? 'mr' : (language || 'hi').startsWith('hi') ? 'hi' : 'en';

    // 1. Check AI Routine Commander for Voice Commands & Grounded Queries
    try {
      const parsed = AIRoutineCommander.parseCommand(query, cleanLang as any, pendingVoiceCommand || undefined);

      if (parsed.intent === 'CLARIFY') {
        setPendingVoiceCommand(parsed);
        const clarMsg = parsed.clarificationQuestion || 'Sure. What time should I remind you?';
        setReply(clarMsg);
        setConversationHistory(prev => [...prev, { role: 'assistant', text: clarMsg }]);
        speakText(clarMsg);
        return;
      }

      if (parsed.intent === 'CREATE_REMINDER') {
        setPendingVoiceCommand(null);

        // Schedule Reminder via API
        const [hours, mins] = (parsed.time || '10:00').split(':');
        const schedDate = new Date();
        if (parsed.date) {
          const [y, m, d] = parsed.date.split('-');
          schedDate.setFullYear(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        }
        schedDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

        const payload = {
          title: parsed.title || 'Medicine',
          type: parsed.type || 'MEDICINE',
          description: `Voice reminder created via AI: ${parsed.voiceMessage}`,
          scheduledAt: schedDate.toISOString(),
          recurrence: parsed.recurrence || 'DAILY',
          metadata: {
            isVoiceAlarm: true,
            voiceMessage: parsed.voiceMessage,
            voiceLanguage: parsed.voiceLanguage || cleanLang,
            voiceVolume: 1.0,
            vibration: true,
            ringtone: 'temple_bell',
            customDays: parsed.customDays,
            enabled: true
          }
        };

        try {
          await api.post('/reminders', payload);
        } catch {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aabha-reminders-updated'));
        }

        const time12h = schedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let confirmText = `Done! I have set a voice reminder for ${parsed.title} at ${time12h}.`;
        if (cleanLang === 'hi') {
          confirmText = `ठीक है! मैंने ${time12h} बजे "${parsed.title}" का वॉयस रिमाइंडर सेट कर दिया है।`;
        } else if (cleanLang === 'mr') {
          confirmText = `नक्कीच! मी ${time12h} वाजता "${parsed.title}" चे स्मरणपत्र सेट केले आहे.`;
        }

        setReply(confirmText);
        setConversationHistory(prev => [...prev, { role: 'assistant', text: confirmText }]);
        speakText(confirmText);
        return;
      }

      if (parsed.intent.startsWith('QUERY_')) {
        let storedReminders: any[] = [];
        try {
          storedReminders = await api.get('/reminders');
        } catch {}

        const groundedAnswer = AIRoutineCommander.answerRoutineQuery(
          parsed.intent,
          Array.isArray(storedReminders) ? storedReminders : [],
          [],
          cleanLang as any
        );

        setReply(groundedAnswer);
        setConversationHistory(prev => [...prev, { role: 'assistant', text: groundedAnswer }]);
        speakText(groundedAnswer);
        return;
      }
    } catch (commanderErr) {
      console.warn('Routine Commander Error:', commanderErr);
    }

    // 2. Fallback to Gemini AI conversational endpoint
    try {
      const res: any = await api.post('/ai/chat', {
        message: query,
        language
      });

      const aiReply = res.reply || 'मैं आपकी कैसे सहायता कर सकती हूँ? (How may I assist you?)';
      setReply(aiReply);
      setConversationHistory(prev => [...prev, { role: 'assistant', text: aiReply }]);

      speakText(aiReply);

      if (res.action) {
        if (res.action.type === 'START_GAME' && res.action.gameType) {
          setTimeout(() => {
            setIsOpen(false);
            navigate(`/patient/games/${res.action.gameType}`);
          }, 1800);
        } else if (res.action.type === 'NAVIGATE' && res.action.path) {
          setTimeout(() => {
            setIsOpen(false);
            navigate(res.action.path);
          }, 1800);
        } else if (res.action.type === 'TRIGGER_SOS') {
          if (onTriggerSos) {
            setTimeout(() => {
              onTriggerSos();
            }, 1000);
          }
        }
      }
    } catch (err: any) {
      console.warn('AI Assistant error:', err);
      const fallbackReply = cleanLang === 'mr'
        ? 'माफ करा, मी सध्या माहिती लोड करू शकत नाही. कृपया पुन्हा प्रयत्न करा.'
        : cleanLang === 'hi'
        ? 'माफ़ कीजिए, मुझे उत्तर देने में समस्या आ रही है। कृपया पुनः प्रयास करें।'
        : 'I am here with you. How can I help you today?';
      setReply(fallbackReply);
      setConversationHistory(prev => [...prev, { role: 'assistant', text: fallbackReply }]);
      speakText(fallbackReply);
      setState('ERROR');
    }
  };

  const quickPrompts = [
    { label: '💊 मेरी दवा कब है?', text: 'Abha, meri next medicine kab hai?' },
    { label: '📅 अगली डॉक्टर मुलाकात?', text: 'Abha, mera next doctor appointment kab hai?' },
    { label: '🧠 मेमोरी गेम खेलें', text: 'Abha, memory game start karo' },
    { label: '📋 आज का रूटीन', text: 'Abha, aaj mera schedule kya hai?' }
  ];

  return (
    <>
      {/* ─── 1. FLOATING 3D GLASS BUTTON (Elevated above mobile bottom nav) ── */}
      {!isOpen && (
        <div className="fixed bottom-[84px] sm:bottom-[92px] md:bottom-8 right-4 md:right-8 z-40 pointer-events-auto select-none">
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => startListening(), 400);
            }}
            className="relative group p-2 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 pr-4 shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-xl"
            title="Talk with ABHA AI Assistant"
          >
            <Abha3DOrb state="IDLE" size="md" interactive={false} />

            <div className="text-left">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
                <span className="font-black text-xs text-[var(--text-primary)] uppercase tracking-wider">
                  ABHA AI
                </span>
              </div>
              <span className="text-[11px] font-black text-[var(--text-secondary)] flex items-center gap-1">
                <span>🎙️</span>
                <span>Tap to Speak</span>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ─── 2. EXPANDED MOBILE-FRIENDLY VOICE COMPANION MODAL (CENTERED & PORTALED) ─ */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 font-sans animate-fade-in select-none">
          <div className="bg-[var(--bg-surface)] border-2 border-[var(--border)] rounded-[28px] sm:rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] max-h-[92vh] overflow-hidden animate-modal-in">
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--bg-surface-secondary)]/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-lg shrink-0">
                  ✨
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)] truncate">
                    AABHA AI Voice Assistant
                  </h3>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium truncate">
                    Powered by Google Gemini
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Compact Language Selector */}
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="px-2 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[11px] font-black text-[var(--text-primary)] cursor-pointer outline-none"
                  aria-label="Select AI Voice Language"
                >
                  <option value="hi">🇮🇳 HI (हिन्दी)</option>
                  <option value="mr">🇮🇳 MR (मराठी)</option>
                  <option value="en">🌐 EN (English)</option>
                  <option value="bn">🇮🇳 BN (বাংলা)</option>
                  <option value="gu">🇮🇳 GU (ગુજરાતી)</option>
                  <option value="ta">🇮🇳 TA (தமிழ்)</option>
                  <option value="te">🇮🇳 TE (తెలుగు)</option>
                </select>

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isMuted) speechService.stopSpeaking();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    speechService.stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-rose-500/20 text-[var(--text-secondary)] hover:text-rose-400 border border-[var(--border)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compact Animated 3D Orb Header Strip */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 via-[var(--bg-surface-secondary)] to-teal-500/10 border-b border-[var(--border)] flex items-center justify-between gap-3 shrink-0">
              <div
                onClick={() => {
                  if (state === 'LISTENING') stopListening();
                  else startListening();
                }}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <Abha3DOrb state={state} size="sm" interactive={false} />
                <div>
                  <div className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>{state === 'LISTENING' ? '🔴 Listening...' : state === 'THINKING' ? '✨ Thinking...' : state === 'SPEAKING' ? '🔊 Speaking...' : '🎙️ Tap to Speak'}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {state === 'LISTENING' ? 'Speak clearly now' : 'Ask questions or set reminders'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (state === 'LISTENING') stopListening();
                  else startListening();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition ${
                  state === 'LISTENING'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'btn-glow text-white'
                }`}
              >
                {state === 'LISTENING' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{state === 'LISTENING' ? 'Stop' : 'Mic'}</span>
              </button>
            </div>

            {/* Transcript Banner (if speaking) */}
            {transcript && (
              <div className="px-4 py-1.5 bg-emerald-500/15 text-emerald-300 text-xs font-bold italic border-b border-emerald-500/30 truncate shrink-0">
                "{transcript}"
              </div>
            )}

            {/* Scrollable Conversation Log (Expanded Vertical Space) */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {conversationHistory.length === 0 && (
                <div className="text-center py-8 text-xs font-medium text-[var(--text-secondary)] space-y-1">
                  <p className="text-sm font-black text-[var(--text-primary)]">👋 How can I help you today?</p>
                  <p>Ask about your medicine time, schedule, memory games, or say "Kal 8 baje medicine yaad dilana".</p>
                </div>
              )}

              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                      item.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                        : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
                    }`}
                  >
                    {item.role === 'assistant' && (
                      <div className="text-[10px] font-black uppercase text-emerald-400 mb-0.5">AABHA:</div>
                    )}
                    {item.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (Horizontal Scroll) */}
            <div className="px-4 py-1.5 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 bg-[var(--bg-surface-secondary)]/30">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.text)}
                  className="whitespace-nowrap px-3 py-1 bg-[var(--bg-surface)] hover:bg-emerald-500/20 border border-[var(--border)] hover:border-emerald-400/40 rounded-full text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition shrink-0 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Row Footer */}
            <div className="p-3 sm:p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message or command..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-emerald-400"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="btn-glow p-2.5 rounded-xl text-white cursor-pointer shrink-0 shadow-md"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AbhaVoiceAssistant;
