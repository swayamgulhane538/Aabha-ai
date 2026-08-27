import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send, Sparkles, Volume2, Bot, Clock, Calendar, CheckCircle2, RotateCcw, Zap, AlertCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { AIActionService, ActionExecutionResult } from '../services/aiActionService';
import { api } from '../services/api';
import { Abha3DOrb, OrbState } from '../components/Abha3DOrb';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionBadge?: string;
  success?: boolean;
  timestamp: string;
}

export default function AskAabhaView() {
  const { t, i18n } = useTranslation();
  const { language, vibration } = useVoiceSettingsStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text:
        language === 'mr'
          ? 'नमस्कार! मी आभा आहे. तुमच्या दिनचर्या, औषधे, स्मरणपत्रे किंवा कोणत्याही आज्ञेसाठी मला काहीही सांगा.'
          : language === 'hi'
          ? 'नमस्ते! मैं आभा हूँ। आप मुझसे अपनी दिनचर्या, दवाइयों, अलार्म सेट करने या किसी भी एक्शन के लिए बोल सकते हैं।'
          : 'Hello! I am AABHA. Ask me to set reminders, check your routine, update tasks, or answer health questions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [pendingContext, setPendingContext] = useState<any | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, actionStatus]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || inputQuery).trim();
    if (!query) return;

    speechService.stopListening();
    setIsListening(false);

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setOrbState('THINKING');

    const cleanLang = language === 'mr' ? 'mr' : language === 'en' ? 'en' : 'hi';
    setActionStatus(cleanLang === 'mr' ? 'अ‍ॅक्शन एक्झिक्युट करत आहे...' : cleanLang === 'hi' ? 'एक्शन पूरा किया जा रहा है...' : 'Executing real action...');

    try {
      const result: ActionExecutionResult = await AIActionService.executeCommand(
        query,
        cleanLang,
        pendingContext
      );

      if (result.needsClarification) {
        setPendingContext(result.pendingContext);
      } else {
        setPendingContext(null);
      }

      setActionStatus('');
      setOrbState('SPEAKING');

      const assistantMsg: Message = {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        text: result.spokenReply,
        actionBadge: result.displayReply,
        success: result.success,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      speechService.speak(result.spokenReply, cleanLang, () => {
        setOrbState('IDLE');
      });
    } catch (err: any) {
      setActionStatus('');
      setOrbState('ERROR');

      const errMsg =
        cleanLang === 'mr'
          ? 'माफ करा, ही क्रिया पूर्ण करण्यात अडचण आली.'
          : cleanLang === 'hi'
          ? 'माफ़ कीजिए, यह एक्शन पूरा नहीं हो सका।'
          : "I couldn't perform that action right now.";

      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          text: errMsg,
          actionBadge: '⚠️ Action Failed',
          success: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      speechService.speak(errMsg, cleanLang, () => {
        setOrbState('IDLE');
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setOrbState('IDLE');
    } else {
      speechService.stopSpeaking();
      setIsListening(true);
      setOrbState('LISTENING');

      speechService.startListening(
        (text: string) => {
          setIsListening(false);
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
    }
  };

  const sampleQuestions = [
    'Kal 10 baje medicine yaad dilana',
    'Mera next reminder kya hai?',
    'Aaj kitne tasks baki hain?',
    'Aaj ka routine dikhao',
    '10 minute baad paani peene yaad dilana',
    'Demo mode start karo'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-gradient-to-r from-purple-950/40 via-[var(--bg-surface)] to-emerald-950/30 border border-[var(--border)] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center text-3xl shadow-inner">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                Ask AABHA AI Action Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-black uppercase">
                Action Agent
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-0.5">
              Zero hallucination. Directly creates, updates, and checks your real database routine.
            </p>
          </div>
        </div>

        {/* 3D Orb Indicator */}
        <div className="flex items-center gap-3 bg-[var(--bg-surface-secondary)] px-4 py-2 rounded-2xl border border-[var(--border)] self-start sm:self-auto">
          <Abha3DOrb state={orbState} size="sm" interactive={false} />
          <div className="text-xs font-bold text-[var(--text-primary)]">
            {orbState === 'LISTENING' && '🔴 Listening...'}
            {orbState === 'THINKING' && '✨ Processing Action...'}
            {orbState === 'SPEAKING' && '🔊 Speaking...'}
            {orbState === 'IDLE' && '🎙️ Ready for Command'}
            {orbState === 'ERROR' && '⚠️ Retry'}
          </div>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="card-3d rounded-[28px] border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Action Status Banner */}
        {actionStatus && (
          <div className="px-5 py-2.5 bg-purple-500/20 text-purple-300 border-b border-purple-400/30 text-xs font-black flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                    : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AABHA:
                  </div>
                )}
                <div>{msg.text}</div>

                {msg.actionBadge && (
                  <div
                    className={`mt-2 pt-2 border-t border-[var(--border)] text-[11px] font-black flex items-center gap-1.5 ${
                      msg.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {msg.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span>{msg.actionBadge}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono px-2 mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Sample Prompt Chips */}
        <div className="px-4 py-2 bg-[var(--bg-surface-secondary)]/40 border-t border-[var(--border)] flex gap-2 overflow-x-auto scrollbar-none">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-purple-500/20 border border-[var(--border)] hover:border-purple-400/40 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:bg-emerald-500/20 hover:text-emerald-400'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Say or type 'Kal 8 baje medicine yaad dilana'..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] text-xs sm:text-sm font-medium outline-none focus:border-purple-400 transition"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="btn-glow p-3 rounded-2xl text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              title="Send Command"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
