import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Send,
  Sparkles,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Lock,
  PhoneCall,
  Activity,
  HandMetal,
  Eye,
  Info
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import {
  signRecognitionService,
  ISL_MEDICAL_DICTIONARY,
  RecognitionResult
} from '../services/signRecognitionService';
import { webrtcService, CallConnectionState } from '../services/webrtcService';

export const SignBridgePatientView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomId = 'aabha-signbridge-room';

  // Privacy Consent Modal
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(true);

  // Call & WebRTC State
  const [callActive, setCallActive] = useState(false);
  const [callState, setCallState] = useState<CallConnectionState>('IDLE');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // ISL Recognition State
  const [recognizedText, setRecognizedText] = useState('I have pain');
  const [recognizedHindi, setRecognizedHindi] = useState('मुझे दर्द हो रहा है');
  const [confidence, setConfidence] = useState(92);
  const [isLowConfidence, setIsLowConfidence] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // Doctor Subtitles & Messages
  const [doctorSubtitles, setDoctorSubtitles] = useState(
    'Doctor: "Hello Anita ji. I am watching your signs. Please tell me where you feel discomfort."'
  );
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; type?: string }>>([
    { sender: 'Dr. Anita Verma', text: 'Namaste! SignBridge is active. You can sign naturally.', time: '10:30 AM', type: 'DOCTOR' },
    { sender: 'You (ISL)', text: 'I have pain', time: '10:31 AM', type: 'PATIENT' }
  ]);

  // ─── 1. INITIALIZE WEBRTC & SIGN RECOGNITION ───────────────────────────────
  useEffect(() => {
    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          signRecognitionService.setVideoSource(videoRef.current);
        }
      },
      onStateChange: (state) => {
        setCallState(state);
        if (state === 'CONNECTED') {
          setCallActive(true);
          signRecognitionService.startAnalysis();
        } else if (state === 'DISCONNECTED' || state === 'PERMISSION_DENIED') {
          setCallActive(false);
          signRecognitionService.stopAnalysis();
        }
      },
      onError: (err) => {
        console.warn('[SignBridge] WebRTC notice:', err);
      }
    });

    signRecognitionService.onRecognition((res: RecognitionResult) => {
      setRecognizedText(res.text);
      setRecognizedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(res.isLowConfidence);

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      // Auto-send to doctor room buffer
      api.post('/signbridge/messages', {
        roomId,
        text: res.text,
        hindiText: res.hindiText,
        confidence: res.confidence,
        isEmergency: res.isEmergency,
        type: 'SIGN_TRANSLATION'
      }).catch(() => {});
    });

    return () => {
      webrtcService.endCall();
      signRecognitionService.stopAnalysis();
    };
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer: any = null;
    if (callActive) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callActive]);

  // Polling for incoming Doctor Subtitles from backend / signaling
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(async () => {
      try {
        const res: any = await api.get(`/signbridge/messages/${roomId}`);
        if (Array.isArray(res) && res.length > 0) {
          const docMsgs = res.filter((m: any) => m.senderRole === 'CAREGIVER' || m.senderRole === 'DOCTOR');
          if (docMsgs.length > 0) {
            const latest = docMsgs[docMsgs.length - 1];
            setDoctorSubtitles(`Doctor: "${latest.text}"`);
          }
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [callActive]);

  // ─── 2. HANDLERS ───────────────────────────────────────────────────────────
  const handleStartConsultation = async () => {
    setShowConsentModal(false);
    setConsentGiven(true);
    try {
      await api.post('/signbridge/consent', { consentGiven: true });
    } catch {}

    const stream = await webrtcService.startCall(roomId);
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
      signRecognitionService.setVideoSource(videoRef.current);
      signRecognitionService.startAnalysis();
    }
  };

  const handleEndConsultation = () => {
    webrtcService.endCall();
    signRecognitionService.stopAnalysis();
    setCallActive(false);
    navigate('/patient');
  };

  const handleToggleMic = () => {
    const active = webrtcService.toggleAudio();
    setIsMuted(!active);
  };

  const handleToggleVideo = () => {
    const active = webrtcService.toggleVideo();
    setIsVideoOff(!active);
  };

  // Text-To-Speech (TTS)
  const handleSpeakText = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  // 1-Tap Medical Shortcut Trigger
  const handleSelectShortcut = (signId: string) => {
    const res = signRecognitionService.triggerManualSign(signId);
    if (res) {
      setRecognizedText(res.text);
      setRecognizedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(false);

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'You (ISL)',
          text: res.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'PATIENT'
        }
      ]);

      // Speak TTS automatically for clear doctor feedback
      handleSpeakText(res.text);

      api.post('/signbridge/messages', {
        roomId,
        text: res.text,
        hindiText: res.hindiText,
        confidence: res.confidence,
        isEmergency: res.isEmergency,
        type: 'SIGN_TRANSLATION'
      }).catch(() => {});
    }
  };

  // Manual Text Send
  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = isEditing ? editText.trim() : recognizedText;
    if (!finalMsg) return;

    setRecognizedText(finalMsg);
    setIsEditing(false);

    setMessages(prev => [
      ...prev,
      {
        sender: 'You (ISL)',
        text: finalMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'PATIENT'
      }
    ]);

    handleSpeakText(finalMsg);

    api.post('/signbridge/messages', {
      roomId,
      text: finalMsg,
      confidence: 100,
      isEmergency: isEmergencyActive,
      type: 'SIGN_TRANSLATION'
    }).catch(() => {});
  };

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans p-3 sm:p-6 pb-24 text-[var(--text-primary)] select-none">
      {/* ─── 1. TOP HEADER & TELEHEALTH STATUS BAR ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 card-3d rounded-[24px] border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/patient"
            className="btn-glass p-2.5 rounded-full hover:scale-105 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase tracking-wider">
                🤟 SignBridge ISL
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                Sign Language Doctor Consultation
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Real-time Indian Sign Language (ISL) gesture translation with Dr. Anita Verma
            </p>
          </div>
        </div>

        {/* Call Timer & Status */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{callActive ? `LIVE CALL • ${formatCallTime(callDuration)}` : 'READY TO CONNECT'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-bold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Video</span>
          </div>
        </div>
      </div>

      {/* ─── 2. EMERGENCY SAFETY WARNING BANNER ───────────────────────────────── */}
      {isEmergencyActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-600/20 via-red-500/20 to-orange-500/20 border-2 border-rose-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl font-black shrink-0 animate-bounce">
              🚨
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-rose-300">
                High-Risk Medical Sign Detected (Urgent Alert)
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                You signaled a critical symptom. Please remain seated and calm. Dr. Anita Verma and emergency nursing staff have been notified immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href="tel:108"
              className="btn-glow w-full md:w-auto px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108 Emergency</span>
            </a>
            <button
              onClick={() => setIsEmergencyActive(false)}
              className="btn-glass px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. DOCTOR REAL-TIME SUBTITLES BAR ─────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border-2 border-indigo-500/40 shadow-xl space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
              Doctor Live Voice Subtitles (Speech-to-Text)
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-200">Real-time Audio Stream</span>
        </div>
        <p className="text-base sm:text-xl font-black text-white leading-relaxed tracking-wide">
          {doctorSubtitles}
        </p>
      </div>

      {/* ─── 4. MAIN VIDEO STREAM & SIGN RECOGNITION SPLIT ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: LARGE PATIENT CAMERA FEED WITH ISL OVERLAY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-[var(--border)] shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
            {/* Camera Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] min-h-[380px] sm:min-h-[460px] ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {isVideoOff && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-slate-400">
                <VideoOff className="w-16 h-16 text-slate-500" />
                <p className="text-sm font-bold">Camera is turned off</p>
              </div>
            )}

            {/* Video Header Overlay Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Patient Camera (Sign Detection ON)</span>
              </div>

              {/* Confidence Meter Badge */}
              <div className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-black flex items-center gap-1.5 shadow-md ${
                confidence >= 80
                  ? 'bg-emerald-500/80 border-emerald-400 text-white'
                  : confidence >= 60
                  ? 'bg-amber-500/80 border-amber-400 text-white'
                  : 'bg-rose-500/80 border-rose-400 text-white'
              }`}>
                <Activity className="w-3.5 h-3.5" />
                <span>{confidence}% Confidence</span>
              </div>
            </div>

            {/* Simulated Doctor Picture-in-Picture Feed */}
            <div className="absolute bottom-4 right-4 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 z-10 flex flex-col items-center justify-center text-center p-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-2xl flex items-center justify-center border-2 border-white shadow-md mb-1">
                👩‍⚕️
              </div>
              <div className="text-[11px] font-black text-white truncate max-w-full">
                Dr. Anita Verma
              </div>
              <div className="text-[9px] font-bold text-emerald-300">
                Cognitive Clinic
              </div>
            </div>

            {/* Live Gesture Tracking Frame Indicator */}
            <div className="absolute inset-x-12 inset-y-16 border-2 border-emerald-400/30 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/70">
                <span>ISL_FRAME_L</span>
                <span>ISL_FRAME_R</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/70">
                <span>GESTURE_ACTIVE</span>
                <span>TRACKING_STABLE</span>
              </div>
            </div>
          </div>

          {/* Video Control Action Bar */}
          <div className="p-3.5 card-3d rounded-2xl border border-[var(--border)] flex items-center justify-center gap-3 sm:gap-4 shadow-md" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button
              onClick={handleToggleMic}
              className={`p-3.5 rounded-full font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 shadow-xs ${
                isMuted ? 'bg-rose-500 text-white' : 'btn-glass text-[var(--text-primary)]'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 shadow-xs ${
                isVideoOff ? 'bg-rose-500 text-white' : 'btn-glass text-[var(--text-primary)]'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleSpeakText(recognizedText)}
              disabled={isSpeakingTts}
              className="btn-glow px-5 py-3 rounded-full text-xs font-black flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Volume2 className={`w-4 h-4 text-amber-300 ${isSpeakingTts ? 'animate-ping' : ''}`} />
              <span>{isSpeakingTts ? 'Speaking...' : 'Speak Sign (TTS)'}</span>
            </button>

            <button
              onClick={handleEndConsultation}
              className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 shadow-lg"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* RIGHT 5 COLS: RECOGNIZED ISL TEXT, CONFIDENCE, & CONTROLS */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main High-Contrast Recognized Sign Box */}
          <div className="card-3d p-5 sm:p-6 rounded-[28px] border-2 border-emerald-500/50 bg-[var(--bg-surface)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <HandMetal className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
                  Recognized ISL Gesture
                </span>
              </div>

              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setEditText(recognizedText);
                }}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Text'}</span>
              </button>
            </div>

            {/* High-Contrast Large Text */}
            {!isEditing ? (
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-1.5">
                <div className="text-xs font-bold text-[var(--text-secondary)]">You are saying:</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 leading-tight">
                  "{recognizedText}"
                </div>
                <div className="text-sm font-bold text-[var(--text-secondary)]">
                  ({recognizedHindi})
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendCustomText} className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-emerald-500 text-sm font-bold bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-hidden"
                  placeholder="Type or correct your message..."
                />
                <button
                  type="submit"
                  className="btn-glow w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Corrected Sign to Doctor</span>
                </button>
              </form>
            )}

            {/* Low Confidence Alert Notice */}
            {isLowConfidence && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Please repeat the sign or use the quick medical phrases below.</span>
              </div>
            )}

            {/* Send & Speak Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSpeakText(recognizedText)}
                className="btn-glass p-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:text-amber-300 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Read Aloud</span>
              </button>

              <button
                type="button"
                onClick={handleSendCustomText}
                className="btn-glow p-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Send to Doctor</span>
              </button>
            </div>
          </div>

          {/* Consultation Transcript History */}
          <div className="card-3d p-4 rounded-2xl border border-[var(--border)] max-h-56 overflow-y-auto space-y-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="text-[11px] font-black uppercase text-[var(--text-secondary)] tracking-wider">
              Consultation Transcript ({messages.length})
            </div>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  m.type === 'PATIENT'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 ml-4'
                    : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 mr-4'
                }`}
              >
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-0.5">
                  <span>{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 5. 1-TAP MEDICAL COMMUNICATION SHORTCUTS (ACCESSIBILITY FIRST) ────── */}
      <div className="card-3d p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              1-Tap Common Medical Signs & Phrases (ISL Shortcuts)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold">
            Tap any card to immediately sign and speak to doctor
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ISL_MEDICAL_DICTIONARY.map((sign) => {
            const isEmg = sign.isEmergency;
            return (
              <button
                key={sign.id}
                onClick={() => handleSelectShortcut(sign.id)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 shadow-sm min-h-[90px] ${
                  isEmg
                    ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-300'
                    : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-emerald-400/60 hover:bg-emerald-500/10 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">
                    {sign.id === 'pain' && '😣'}
                    {sign.id === 'headache' && '🤕'}
                    {sign.id === 'chest_pain' && '🫀'}
                    {sign.id === 'stomach_pain' && '🤢'}
                    {sign.id === 'fever' && '🌡️'}
                    {sign.id === 'help' && '🆘'}
                    {sign.id === 'water' && '💧'}
                    {sign.id === 'medicine' && '💊'}
                    {sign.id === 'yes' && '✅'}
                    {sign.id === 'no' && '❌'}
                    {sign.id === 'emergency' && '🚨'}
                    {sign.id === 'dont_understand' && '❓'}
                    {sign.id === 'dizziness' && '💫'}
                    {sign.id === 'thank_you' && '🙏'}
                  </span>
                  {isEmg && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase">
                      SOS
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 mt-2">
                  <div className="text-xs font-black leading-snug">
                    {sign.label}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold truncate">
                    {sign.hindiLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 6. PRIVACY & CAMERA CONSENT MODAL ───────────────────────────────── */}
      {showConsentModal && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-3d max-w-lg w-full p-6 sm:p-8 rounded-[28px] border-2 border-emerald-500/60 space-y-5 shadow-2xl text-left" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-black shrink-0">
                🤟
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  SignBridge Privacy & Camera Consent
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Indian Sign Language (ISL) Video Telehealth
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-surface-secondary)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>On-Device Sign Processing:</strong> Your camera frames are analyzed directly within your browser for sign recognition. Raw camera video is never permanently stored on servers.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Encrypted Telehealth Channel:</strong> Video consultation is peer-to-peer encrypted for medical privacy and clinical compliance.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Non-Diagnostic Communication:</strong> SignBridge provides assistive communication and does not replace emergency clinical diagnosis.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartConsultation}
                className="btn-glow flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Grant Camera Consent & Start Call</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient')}
                className="btn-glass px-5 py-3.5 rounded-2xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignBridgePatientView;
