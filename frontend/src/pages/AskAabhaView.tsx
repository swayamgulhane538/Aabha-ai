import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send, Sparkles, Volume2, Bot, Clock, Calendar, CheckCircle2, RotateCcw } from 'lucide-react';
import { speechService } from '../services/speechService';
import { AIRoutineCommander } from '../services/aiRoutineCommander';
import { api } from '../services/api';
import { Abha3DOrb, OrbState } from '../components/Abha3DOrb';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AskAabhaView() {
  const { t, i18n } = useTranslation();
  const { language, vibration } = useVoiceSettingsStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: language === 'mr'
        ? 'नमस्कार! मी आभा आहे. तुमच्या दिनचर्या, औषधे आणि स्मरणपत्रांबद्दल मला काहीही विचारा.'
        : language === 'hi'
        ? 'नमस्ते! मैं आभा हूँ। आप मुझसे अपनी दिनचर्या, दवाइयों और स्मरणपत्रों के बारे में कुछ भी पूछ सकते हैं।'
        : 'Hello! I am AABHA. Ask me anything about your daily routine, medicines, or reminders.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/reminders');
      if (Array.isArray(res)) setReminders(res);
    } catch {}
  };

  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || inputQuery).trim();
    if (!query) return;

    speechService.stopListening();
    setIsListening(false);

    const userMsg: Message = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setOrbState('THINKING');

    // Parse Intent via Grounded AIRoutineCommander
    try {
      const parsed = AIRoutineCommander.parseCommand(query, language);

      let answer = '';

      if (parsed.intent.startsWith('QUERY_')) {
        answer = AIRoutineCommander.answerRoutineQuery(
          parsed.intent,
          reminders,
          [],
          language
        );
      } else if (parsed.intent === 'CREATE_REMINDER') {
        // Voice creation from Ask Aabha
        const time12h = parsed.time || '08:00';
        answer = language === 'hi'
          ? `मैंने ${time12h} बजे "${parsed.title}" का वॉयस रिमाइंडर सेट कर दिया है।`
          : language === 'mr'
          ? `मी ${time12h} वाजता "${parsed.title}" चे स्मरणपत्र सेट केले आहे.`
          : `I have scheduled a voice reminder for ${parsed.title} at ${time12h}.`;
      } else {
        // Fallback Gemini Chat endpoint
        const res: any = await api.post('/ai/chat', { message: query, language });
        answer = res.reply || 'I am here with you to assist with your daily health routine.';
      }

      const assistantMsg: Message = {
        role: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setOrbState('SPEAKING');

      speechService.speak(answer, language, () => {
        setOrbState('IDLE');
      });
    } catch (err) {
      const fallback = language === 'hi'
        ? 'मैं आपके रूटीन में सहायता कर सकती हूँ। कृपया पुनः पूछें।'
        : 'I am here to assist with your routine.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setOrbState('IDLE');
      speechService.speak(fallback, language);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    setOrbState('LISTENING');
    speechService.startListening(
      (text: string) => {
        setInputQuery(text);
        if (text.trim()) {
          handleSendMessage(text.trim());
        }
      },
      () => {
        setIsListening(false);
        setOrbState('IDLE');
      },
      language
    );
  };

  const stopVoiceInput = () => {
    speechService.stopListening();
    setIsListening(false);
    setOrbState('IDLE');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-28 font-sans text-[var(--text-primary)]">
      {/* Hero Header with 3D Orb */}
      <div className="card-3d bg-gradient-to-br from-purple-950/40 via-[var(--card-bg-inline)] to-indigo-950/30 backdrop-blur-xl p-5 sm:p-6 rounded-[28px] border-2 border-purple-400/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Abha3DOrb state={orbState} size="md" interactive={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Grounded Routine Intelligence
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
              Ask AABHA AI Assistant
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Ask natural questions about your reminders, tasks, and schedule
            </p>
          </div>
        </div>

        {/* Quick Voice Mic Trigger */}
        <button
          type="button"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'btn-glow text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? 'Listening...' : 'Tap & Speak'}</span>
        </button>
      </div>

      {/* Suggested Quick Question Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: '⏰ What is my next reminder?', query: 'What is my next reminder?' },
          { label: '📋 What tasks are pending today?', query: 'What tasks are pending today?' },
          { label: '✓ What have I completed today?', query: 'What have I completed today?' },
          { label: '📊 Today\'s routine progress?', query: 'How much of today\'s routine have I completed?' }
        ].map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(item.query)}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 border border-[var(--border)] hover:border-purple-400/40 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-4 sm:p-6 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl min-h-[380px] max-h-[500px] overflow-y-auto space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl space-y-1 shadow-md ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-80 border-b border-white/10 pb-1 mb-1">
                <span>{m.role === 'user' ? 'You' : 'AABHA AI'}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Message Bar */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-[var(--border)] shadow-xl flex items-center gap-2">
        <button
          type="button"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          className={`p-3 rounded-xl transition cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-white'
          }`}
          title="Voice Input"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            language === 'mr'
              ? 'येथे प्रश्न विचारा (उदा. माझे पुढचे औषध कधी आहे?)...'
              : language === 'hi'
              ? 'यहाँ प्रश्न पूछें (उदा. मेरी अगली दवा कब है?)...'
              : 'Ask AABHA (e.g. What is my next reminder?)...'
          }
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-[var(--text-primary)] px-2"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          className="btn-glow p-3 rounded-xl text-white cursor-pointer shadow-md"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
