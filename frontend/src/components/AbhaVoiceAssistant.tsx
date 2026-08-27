import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Clock,
  Zap,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { speechService } from '../services/speechService';
import { AIActionService, ActionExecutionResult } from '../services/aiActionService';
import { Abha3DOrb, OrbState } from './Abha3DOrb';
import { useVoiceSettingsStore } from '../stores/voiceSettingsStore';

interface AbhaVoiceAssistantProps {
  onTriggerSos?: () => void;
  onOpenDemo?: () => void;
}

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionBadge?: string;
  success?: boolean;
}

export const AbhaVoiceAssistant: React.FC<AbhaVoiceAssistantProps> = ({ onTriggerSos, onOpenDemo }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const voiceStore = useVoiceSettingsStore();

  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<OrbState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'hi' | 'mr' | 'en'>(voiceStore.language || 'hi');
  const [conversationHistory, setConversationHistory] = useState<ChatItem[]>([]);
  const [pendingContext, setPendingContext] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync language with store
  useEffect(() => {
    setLanguage(voiceStore.language || 'hi');
  }, [voiceStore.language]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, reply, actionStatus]);

  // Listen to external demo mode start events
  useEffect(() => {
    const handleDemoEvent = () => {
      setIsOpen(false);
      if (onOpenDemo) onOpenDemo();
    };
    window.addEventListener('aabha-start-demo-mode', handleDemoEvent);
    return () => window.removeEventListener('aabha-start-demo-mode', handleDemoEvent);
  }, [onOpenDemo]);

  // Start Speech Recognition
  const startListening = () => {
    speechService.stopSpeaking();
    setState('LISTENING');
    setTranscript('');
    setActionStatus('');

    speechService.startListening(
      (text: string) => {
        setTranscript(text);
        if (text.trim()) {
          handleExecuteAction(text.trim());
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

    speechService.speak(text, language, () => {
      setState('IDLE');
    });
  };

  // Execute Action via Unified AI Action Engine
  const handleExecuteAction = async (customMessage?: string) => {
    const query = (customMessage || inputText || transcript).trim();
    if (!query) return;

    speechService.stopListening();

    // 1. Append user message
    const userMsgId = 'msg-' + Date.now();
    setConversationHistory(prev => [...prev, { id: userMsgId, role: 'user', text: query }]);
    setInputText('');
    setTranscript('');
    setState('THINKING');

    const cleanLang = language === 'mr' ? 'mr' : language === 'en' ? 'en' : 'hi';

    // 2. Visual Execution Status Step 1: Understanding
    setActionStatus(
      cleanLang === 'mr' ? 'कमांड समजून घेत आहे...' : cleanLang === 'hi' ? 'कमांड समझी जा रही है...' : 'Understanding command...'
    );

    await new Promise(r => setTimeout(r, 350));

    // 3. Visual Execution Status Step 2: Executing
    setActionStatus(
      cleanLang === 'mr' ? 'अ‍ॅक्शन एक्झिक्युट करत आहे...' : cleanLang === 'hi' ? 'एक्शन पूरा किया जा रहा है...' : 'Executing real action...'
    );

    try {
      // 4. Call Unified AI Action Service
      const result: ActionExecutionResult = await AIActionService.executeCommand(
        query,
        cleanLang,
        pendingContext
      );

      // Handle multi-turn clarification
      if (result.needsClarification) {
        setPendingContext(result.pendingContext);
      } else {
        setPendingContext(null);
      }

      setActionStatus('');

      // 5. Append Assistant response
      const assistantMsgId = 'asst-' + Date.now();
      setConversationHistory(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          text: result.spokenReply,
          actionBadge: result.displayReply,
          success: result.success
        }
      ]);

      setReply(result.spokenReply);

      // 6. Speak aloud
      speakText(result.spokenReply);

      // Handle navigation/SOS if requested
      if (result.actionType === 'TRIGGER_SOS' && onTriggerSos) {
        setTimeout(() => onTriggerSos(), 1200);
      } else if (result.actionType === 'START_DEMO' && onOpenDemo) {
        setTimeout(() => {
          setIsOpen(false);
          onOpenDemo();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Action execution error:', err);
      setActionStatus('');
      setState('ERROR');

      const errMsg =
        cleanLang === 'mr'
          ? 'माफ करा, क्रिया पूर्ण करता आली नाही. कृपया पुन्हा प्रयत्न करा.'
          : cleanLang === 'hi'
          ? 'माफ़ कीजिए, यह एक्शन पूरा नहीं हो सका। कृपया पुनः प्रयास करें।'
          : "I couldn't execute that action right now. Please try again.";

      setConversationHistory(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          text: errMsg,
          actionBadge: '⚠️ Action Failed',
          success: false
        }
      ]);

      speakText(errMsg);
    }
  };

  // Quick Command Chips
  const quickCommands = [
    { label: '💊 Add Medicine Reminder', text: 'Kal subah 8 baje medicine yaad dilana' },
    { label: '⏰ Next Reminder', text: 'Mera next reminder kya hai?' },
    { label: '📅 Today\'s Routine', text: 'Aaj ka routine dikhao' },
    { label: '📋 Pending Tasks', text: 'Aaj kitne tasks baki hain?' },
    { label: '📊 Weekly Insights', text: 'Mera weekly progress kaisa hai?' },
    { label: '🎬 Demo Mode', text: 'Demo mode start karo' }
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
            title="Talk with ABHA AI Action Assistant"
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

      {/* ─── 2. EXPANDED ACTION ASSISTANT MODAL (CENTERED & PORTALED) ───────── */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
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
                      AABHA AI Action Assistant
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium truncate">
                      Powered by Google Gemini & Action Engine
                    </p>
                  </div>
                </div>

                {/* Header Right Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Language Selector */}
                  <select
                    value={language}
                    onChange={e => {
                      const newLang = e.target.value as 'hi' | 'mr' | 'en';
                      setLanguage(newLang);
                      AIActionService.setLanguageAction(newLang, newLang);
                    }}
                    className="px-2 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[11px] font-black text-[var(--text-primary)] cursor-pointer outline-none"
                    aria-label="Select AI Voice Language"
                  >
                    <option value="hi">🇮🇳 HI (हिन्दी)</option>
                    <option value="mr">🇮🇳 MR (मराठी)</option>
                    <option value="en">🌐 EN (English)</option>
                  </select>

                  {/* Mute Button */}
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

                  {/* Close Modal Button */}
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

              {/* Action Orb Header Strip */}
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
                      <span>
                        {state === 'LISTENING'
                          ? '🔴 Listening...'
                          : state === 'THINKING'
                          ? '✨ Processing Action...'
                          : state === 'SPEAKING'
                          ? '🔊 Speaking...'
                          : '🎙️ Tap to Speak'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      {state === 'LISTENING'
                        ? 'Speak your reminder or command'
                        : 'Say "Kal 8 baje medicine yaad dilana"'}
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
                    state === 'LISTENING' ? 'bg-rose-500 text-white animate-pulse' : 'btn-glow text-white'
                  }`}
                >
                  {state === 'LISTENING' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{state === 'LISTENING' ? 'Stop' : 'Mic'}</span>
                </button>
              </div>

              {/* Transcript Banner */}
              {transcript && (
                <div className="px-4 py-1.5 bg-emerald-500/15 text-emerald-300 text-xs font-bold italic border-b border-emerald-500/30 truncate shrink-0">
                  "{transcript}"
                </div>
              )}

              {/* Real-Time Action Status Feedback Pill */}
              {actionStatus && (
                <div className="px-4 py-2 bg-purple-500/20 text-purple-300 border-b border-purple-400/30 text-xs font-black flex items-center gap-2 animate-pulse shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>{actionStatus}</span>
                </div>
              )}

              {/* Scrollable Conversation Log */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {conversationHistory.length === 0 && (
                  <div className="text-center py-8 text-xs font-medium text-[var(--text-secondary)] space-y-2">
                    <p className="text-sm font-black text-[var(--text-primary)]">👋 How can I help you today?</p>
                    <p className="max-w-xs mx-auto">
                      Try saying:
                      <br />
                      <span className="text-emerald-400 font-bold">"Kal 8 baje medicine yaad dilana"</span>
                      <br />
                      <span className="text-teal-400 font-bold">"Mera next reminder kya hai?"</span>
                      <br />
                      <span className="text-indigo-400 font-bold">"Demo mode start karo"</span>
                    </p>
                  </div>
                )}

                {conversationHistory.map(item => (
                  <div
                    key={item.id}
                    className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                        item.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                          : 'bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
                      }`}
                    >
                      {item.role === 'assistant' && (
                        <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AABHA:
                        </div>
                      )}
                      <div>{item.text}</div>

                      {/* Executed Action Badge */}
                      {item.actionBadge && (
                        <div
                          className={`mt-2 pt-2 border-t border-[var(--border)] text-[11px] font-black flex items-center gap-1.5 ${
                            item.success ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span>{item.actionBadge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Command Chips */}
              <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 bg-[var(--bg-surface-secondary)]/30">
                {quickCommands.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExecuteAction(chip.text)}
                    className="whitespace-nowrap px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-emerald-500/20 border border-[var(--border)] hover:border-emerald-400/40 rounded-full text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Row Footer */}
              <div className="p-3 sm:p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg-surface)]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type an action command or question..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleExecuteAction();
                    }}
                    className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-emerald-400"
                  />

                  <button
                    type="button"
                    onClick={() => handleExecuteAction()}
                    className="btn-glow p-2.5 rounded-xl text-white cursor-pointer shrink-0 shadow-md"
                    title="Send Action Command"
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
