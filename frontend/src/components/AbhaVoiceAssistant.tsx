import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, X, AlertTriangle, Play, RefreshCw, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
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
  const [language, setLanguage] = useState<'hi' | 'mr' | 'en'>('hi');
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis & Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setState('LISTENING');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('[ABHA AI Speech Error]', event.error);
          if (event.error !== 'no-speech') {
            setState('ERROR');
          } else {
            setState('IDLE');
          }
        };

        recognition.onend = () => {
          if (transcript.trim()) {
            handleSendMessage(transcript);
          } else {
            setState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language, transcript]);

  // Text-To-Speech Function
  const speakText = (text: string) => {
    if (isMuted || !synthRef.current) {
      setState('IDLE');
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // Slightly slower for elderly comprehension
    utterance.pitch = 1.05; // Warm, friendly tone

    utterance.onstart = () => {
      setState('SPEAKING');
    };

    utterance.onend = () => {
      setState('IDLE');
    };

    utterance.onerror = () => {
      setState('IDLE');
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (synthRef.current) synthRef.current.cancel();
    setTranscript('');
    setState('LISTENING');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start caught error:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setState('IDLE');
  };

  // Send message to AI Backend Router
  const handleSendMessage = async (customMessage?: string) => {
    const query = (customMessage || inputText || transcript).trim();
    if (!query) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Append to local history
    setConversationHistory(prev => [...prev, { role: 'user', text: query }]);
    setInputText('');
    setTranscript('');
    setState('THINKING');

    try {
      const res: any = await api.post('/ai/chat', {
        message: query,
        language
      });

      const aiReply = res.reply || 'मैं आपकी कैसे सहायता कर सकती हूँ? (How may I assist you?)';
      setReply(aiReply);
      setConversationHistory(prev => [...prev, { role: 'assistant', text: aiReply }]);

      // Speak response out loud
      speakText(aiReply);

      // Handle Assistant In-App Action
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
      const fallbackReply = language === 'mr'
        ? 'माफ करा, मी सध्या माहिती लोड करू शकत नाही. कृपया पुन्हा प्रयत्न करा.'
        : 'माफ़ कीजिए, मुझे उत्तर देने में समस्या आ रही है। कृपया पुनः प्रयास करें।';
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
    { label: '📋 आज का रूटीन', text: 'Abha, aaj mera schedule kya hai?' },
    { label: '🚨 आपातकालीन SOS', text: 'Abha, emergency SOS alert bhejo' }
  ];

  return (
    <>
      {/* ─── 1. FLOATING 3D GLASS BUTTON (Centerpiece Trigger) ─────────────── */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 pointer-events-auto select-none">
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => startListening(), 400);
          }}
          className="relative group p-2 rounded-full glass-3d hover:scale-105 active:scale-95 transition-transform duration-300 flex items-center gap-3 pr-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          title="Talk with ABHA AI Assistant"
        >
          {/* Subtle 3D Glass Orb */}
          <Abha3DOrb state="IDLE" size="md" interactive={false} />

          {/* Glowing Label Badge */}
          <div className="text-left">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span className="font-black text-xs text-black uppercase tracking-wider">
                ABHA AI
              </span>
            </div>
            <span className="text-[11px] font-black text-gray-700 flex items-center gap-1">
              <span>🎙️</span>
              <span>Tap to Speak</span>
            </span>
          </div>
        </button>
      </div>

      {/* ─── 2. EXPANDED 3D VOICE COMPANION MODAL ─────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full border-2 border-black shadow-2xl flex flex-col max-h-[92vh] space-y-4 relative overflow-hidden">
            {/* Top Modal Bar */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-black text-lg text-black">AABHA AI Voice Assistant</h3>
                  <p className="text-xs text-gray-600 font-bold">
                    Multilingual Voice Companion & Health Guide
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-300 text-xs font-black">
                  {(['hi', 'mr', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        language === lang
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:text-black'
                      }`}
                    >
                      {lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : 'EN'}
                    </button>
                  ))}
                </div>

                {/* Mute Toggle */}
                <button
                  onClick={() => {
                    if (!isMuted && synthRef.current) synthRef.current.cancel();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition text-black"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Modal */}
                <button
                  onClick={() => {
                    stopListening();
                    if (synthRef.current) synthRef.current.cancel();
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-xl border-2 border-black hover:bg-gray-100 transition text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── 3. CENTERPIECE 3D ANIMATED ORB WITH SOUNDWAVES ─────────── */}
            <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-gray-50 via-emerald-50/30 to-white rounded-3xl border-2 border-black relative overflow-hidden shrink-0">
              <Abha3DOrb
                state={state}
                size="hero"
                interactive={true}
                onClick={() => {
                  if (state === 'LISTENING') {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
              />

              {/* State Status Text */}
              <div className="mt-3 text-center">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-white border border-black rounded-full shadow-xs">
                  {state === 'LISTENING' && '🔴 Listening... Speak clearly'}
                  {state === 'THINKING' && '✨ Processing medical query...'}
                  {state === 'SPEAKING' && '🔊 Speaking response...'}
                  {state === 'IDLE' && '🎙️ Tap orb or microphone to speak'}
                  {state === 'ERROR' && '⚠️ Try again or type below'}
                </span>
              </div>

              {/* Live Speech Recognition Transcription */}
              {transcript && (
                <div className="mt-2 text-xs font-bold text-gray-800 italic bg-white/90 px-4 py-1.5 rounded-xl border border-gray-300 max-w-md text-center">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* ─── 4. CONVERSATION LOG (Scrollable) ────────────────────────── */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-[140px] max-h-[220px]">
              {conversationHistory.length === 0 && (
                <div className="text-center py-6 text-xs font-bold text-gray-500">
                  Ask ABHA about your scheduled medicines, appointments, daily routine, or play games!
                </div>
              )}

              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed shadow-2xs ${
                      item.role === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-bl-none'
                    }`}
                  >
                    {item.role === 'assistant' && (
                      <div className="text-[10px] font-black uppercase text-emerald-800 mb-1">ABHA:</div>
                    )}
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── 5. QUICK SUGGESTION PILLS ───────────────────────────────── */}
            <div className="shrink-0 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                Quick Prompts:
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-xs font-black text-black transition shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── 6. INPUT CONTROLS FOOTER ────────────────────────────────── */}
            <div className="shrink-0 space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {/* Large Microphone Action Button */}
                <button
                  onClick={() => {
                    if (state === 'LISTENING') {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition shadow-sm ${
                    state === 'LISTENING'
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-black text-white border-black hover:bg-gray-800'
                  }`}
                  title="Toggle Microphone"
                >
                  {state === 'LISTENING' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Or type a question for ABHA..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-gray-300 bg-white text-black font-bold text-xs sm:text-sm focus:border-black outline-none transition"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Safety Non-Diagnostic Disclaimer */}
              <div className="text-[10px] text-gray-500 font-bold text-center">
                🛡️ ABHA AI provides operational reminders & memory exercises. It does NOT make clinical medical diagnoses.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AbhaVoiceAssistant;
