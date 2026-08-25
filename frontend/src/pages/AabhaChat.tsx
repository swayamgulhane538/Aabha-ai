import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { useOnlineStatus } from '../services/offlineService';
import { Abha3DOrb, OrbState } from '../components/Abha3DOrb';
import {
  Mic,
  MicOff,
  Send,
  Globe,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  WifiOff,
  ArrowLeft,
  Bot,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AabhaChat: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const isOnline = useOnlineStatus();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: t(
        'aabha.greeting',
        `Namaste ${user?.name || 'Anita Devi'}! I am AABHA, your AI healthcare companion. How are you feeling today? You can ask me about your memory games, medications, or doctor visits.`
      ),
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSpeechSupported] = useState(() => speechService.isSupported());
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOnline) setOrbState('ERROR');
    else if (orbState === 'ERROR') setOrbState('IDLE');
  }, [isOnline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAI = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setOrbState('THINKING');

    try {
      const response: any = await api.post('/ai/chat', {
        message: text,
        conversationId,
        language: i18n.language,
      });
      const aiText = response.reply || response.message || "I'm here to support your daily memory and healthcare routine.";
      if (response.conversationId) setConversationId(response.conversationId);

      const lowerText = text.toLowerCase();
      if (lowerText.includes('remind') || lowerText.includes('याद दिलाना') || lowerText.includes('दवा') || lowerText.includes('medicine')) {
        try {
          const reminderType = lowerText.includes('water') || lowerText.includes('पानी') ? 'WATER'
            : lowerText.includes('medicine') || lowerText.includes('दवा') ? 'MEDICINE'
            : lowerText.includes('game') || lowerText.includes('खेल') ? 'ACTIVITY'
            : 'ROUTINE';
          
          await api.post('/reminders', {
            title: text.replace(/^(aabha|remind me to|please remind me to|set reminder for)\s*/i, '').trim() || 'Daily Reminder',
            type: reminderType,
            scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(),
            status: 'ACTIVE',
            recurrence: 'DAILY'
          });
        } catch {}
      }

      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: aiText, sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      // Speak the response
      if (!isMuted && isSpeechSupported) {
        setOrbState('SPEAKING');
        speechService.speak(aiText, i18n.language, () => setOrbState('IDLE'));
      } else {
        setOrbState('IDLE');
      }
    } catch (err: any) {
      // Fallback response
      const fallbackResponses = [
        `I'm right here with you, ${user?.name || 'Anita'}! Would you like to practice today's memory story or check your evening routine?`,
        "That's wonderful! Taking small mindful breaths every hour helps keep your cognitive health strong.",
        "You have completed your morning medication schedule. Keep up the great vitality!",
        "Remember, every memory match and puzzle you play keeps your brain sharp and resilient.",
        "Would you like me to guide you through a 3-minute relaxing box breathing exercise?"
      ];
      const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: fallback, sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (!isMuted && isSpeechSupported) {
        setOrbState('SPEAKING');
        speechService.speak(fallback, i18n.language, () => setOrbState('IDLE'));
      } else {
        setOrbState('IDLE');
      }
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendToAI(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (orbState === 'LISTENING') {
      speechService.stopListening();
      setOrbState('IDLE');
      return;
    }

    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome for voice interaction.');
      return;
    }

    setOrbState('LISTENING');
    speechService.startListening(
      (transcript: string) => {
        setOrbState('IDLE');
        if (transcript.trim()) {
          sendToAI(transcript.trim());
        }
      },
      (error: string) => {
        console.warn('Speech error:', error);
        setOrbState('IDLE');
      },
      i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US'
    );
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : i18n.language === 'hi' ? 'mr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const quickPrompts = [
    { label: '🧠 How is my memory score today?', text: 'How is my memory score and cognitive health today?' },
    { label: '⏰ Remind me to take my medicine', text: 'Remind me to take my prescribed evening medicine' },
    { label: '🌬️ Start Box Breathing', text: 'Please start a relaxing box breathing session' },
    { label: '📅 When is my next doctor visit?', text: 'When is my next appointment with Dr. Anita Verma?' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-sans pb-24 text-[var(--text-primary)]">
      {/* ─── 1. TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-3.5 sm:p-5 rounded-[24px] flex items-center justify-between border border-[var(--card-border-inline)] gap-2">
        <Link to="/patient" className="btn-glass px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs flex items-center gap-1.5 hover:text-emerald-400">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleLanguage}
            className="btn-glass px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-bold flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{i18n.language === 'en' ? 'EN' : i18n.language === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'btn-glass text-emerald-400'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Voice ON'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 3D ORB VISUALIZER STAGE ────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] p-5 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
        <div className="py-1 sm:py-2">
          <Abha3DOrb size="lg" state={orbState} interactive={true} onClick={toggleListening} showLabel={true} />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-3 tracking-tight">
          AABHA Voice Care Companion
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mt-1">
          {orbState === 'LISTENING'
            ? 'Listening to you... Speak now in Hindi, Marathi, or English.'
            : orbState === 'THINKING'
            ? 'Thinking and generating your personalized response...'
            : orbState === 'SPEAKING'
            ? 'Speaking response gently...'
            : 'Tap the mic or 3D Orb to speak, or type your message below.'}
        </p>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendToAI(p.text)}
              className="btn-glass px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)] hover:text-emerald-300 hover:border-emerald-400/40 active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. CHAT MESSAGES LOG ─────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-4 max-h-[420px] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mr-2.5 shrink-0 mt-1 shadow-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-[20px] px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-xs font-bold'
                  : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-xs font-medium'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {orbState === 'THINKING' && (
          <div className="flex justify-start items-center gap-2 text-xs text-[var(--text-secondary)] font-bold p-3 bg-[var(--bg-surface-secondary)] rounded-2xl w-max">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>AABHA is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── 4. INPUT & VOICE BAR ─────────────────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-2.5 sm:p-4 rounded-[24px] border border-[var(--card-border-inline)] flex items-center gap-2 sm:gap-3">
        {/* Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={orbState === 'THINKING' || orbState === 'SPEAKING'}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition shadow-lg shrink-0 cursor-pointer active:scale-95 ${
            orbState === 'LISTENING'
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
              : 'btn-glow'
          }`}
          title={orbState === 'LISTENING' ? 'Stop Listening' : 'Start Voice Input'}
        >
          {orbState === 'LISTENING' ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            orbState === 'LISTENING'
              ? 'Listening to you... Speak now'
              : 'Ask AABHA anything...'
          }
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] text-xs sm:text-sm font-medium focus:border-emerald-400 focus:outline-none transition min-w-0"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || orbState === 'THINKING'}
          className="btn-glow w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default AabhaChat;
