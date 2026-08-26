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
  Info,
  Layers,
  MessageSquare,
  VolumeX,
  Keyboard
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import {
  signRecognitionService,
  RecognitionResult
} from '../services/signRecognitionService';
import {
  PATIENT_ISL_DICTIONARY,
  signTranslationService,
  ISLSign
} from '../services/signTranslationService';
import {
  realTimeSignCommunicationService,
  CommunicationMode,
  SignBridgeLiveMessage
} from '../services/realTimeSignCommunicationService';
import { webrtcService, CallConnectionState } from '../services/webrtcService';

export const SignBridgePatientView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const patientVideoRef = useRef<HTMLVideoElement | null>(null);
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

  // Two-Way Modes: SIGN_LANGUAGE | VOICE | TEXT
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('SIGN_LANGUAGE');
  const [patientSignModeActive, setPatientSignModeActive] = useState(true);

  // Patient Local Detected Sign
  const [detectedPatientSign, setDetectedPatientSign] = useState<string>('I have pain');
  const [detectedHindi, setDetectedHindi] = useState<string>('मुझे दर्द हो रहा है');
  const [confidence, setConfidence] = useState<number>(94);
  const [isLowConfidence, setIsLowConfidence] = useState<boolean>(false);
  const [showVisualConfirmation, setShowVisualConfirmation] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  // Doctor Remote Detected Sign (TWO-WAY SIGN TRANSMISSION)
  const [doctorIncomingSign, setDoctorIncomingSign] = useState<{
    text: string;
    hindiText?: string;
    icon?: string;
    confidence: number;
    time: string;
  }>({
    text: 'Where is the pain?',
    hindiText: 'दर्द किस जगह पर हो रहा है?',
    icon: '📍',
    confidence: 95,
    time: 'Live'
  });

  // Doctor Voice Subtitles & Transcript
  const [doctorVoiceSubtitles, setDoctorVoiceSubtitles] = useState<string>(
    'Dr. Anita Verma: "Namaste! I am watching your signs. Please show me where you feel discomfort."'
  );

  const [transcript, setTranscript] = useState<Array<{
    sender: string;
    text: string;
    hindiText?: string;
    time: string;
    role: 'PATIENT' | 'DOCTOR';
    type?: string;
    icon?: string;
  }>>([
    { sender: 'Dr. Anita Verma (Doctor)', text: 'Namaste! Two-Way SignBridge is active.', time: '10:30 AM', role: 'DOCTOR' },
    { sender: 'You (Patient ISL)', text: 'I have pain', hindiText: 'मुझे दर्द हो रहा है', time: '10:31 AM', role: 'PATIENT', icon: '😣' }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // ─── 1. INITIALIZE TWO-WAY WEBRTC & REAL-TIME COMMUNICATION ───────────────
  useEffect(() => {
    signRecognitionService.setActiveRole('PATIENT');
    realTimeSignCommunicationService.setRoomId(roomId);
    realTimeSignCommunicationService.startPolling(2000);

    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (patientVideoRef.current) {
          patientVideoRef.current.srcObject = stream;
          patientVideoRef.current.play().catch(() => {});
          signRecognitionService.setVideoSource(patientVideoRef.current);
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
      }
    });

    // Local ISL recognition event callback (PATIENT SIDE)
    signRecognitionService.onRecognition((res: RecognitionResult) => {
      setDetectedPatientSign(res.text);
      setDetectedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(res.isLowConfidence);

      if (!res.isLowConfidence) {
        setShowVisualConfirmation(true);
        setTimeout(() => setShowVisualConfirmation(false), 3000);
      }

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      // Broadcast to doctor screen in real-time
      realTimeSignCommunicationService.sendPatientSign(res, user?.name || 'Patient');
    });

    // Subscribe to incoming messages from DOCTOR SCREEN (TWO-WAY RECEIVE)
    const unsubscribe = realTimeSignCommunicationService.subscribe((msg: SignBridgeLiveMessage) => {
      if (msg.senderRole === 'DOCTOR' || msg.senderRole === 'CAREGIVER') {
        if (msg.type === 'DOCTOR_SIGN') {
          setDoctorIncomingSign({
            text: msg.text,
            hindiText: msg.hindiText,
            icon: msg.icon || '🤟',
            confidence: msg.confidence || 95,
            time: 'Just now'
          });

          setTranscript(prev => [
            ...prev,
            {
              sender: msg.senderName || 'Dr. Anita Verma (Doctor ISL)',
              text: msg.text,
              hindiText: msg.hindiText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              role: 'DOCTOR',
              icon: msg.icon
            }
          ]);
        } else if (msg.type === 'DOCTOR_SPEECH_SUBTITLE') {
          setDoctorVoiceSubtitles(`${msg.senderName}: "${msg.text}"`);
        }
      }
    });

    return () => {
      unsubscribe();
      realTimeSignCommunicationService.stopPolling();
      webrtcService.endCall();
      signRecognitionService.stopAnalysis();
    };
  }, [user]);

  // Active call duration timer
  useEffect(() => {
    let timer: any = null;
    if (callActive) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callActive]);

  // ─── 2. HANDLERS ───────────────────────────────────────────────────────────
  const handleStartConsultation = async () => {
    setShowConsentModal(false);
    setConsentGiven(true);
    try {
      await api.post('/signbridge/consent', { consentGiven: true });
    } catch {}

    const stream = await webrtcService.startCall(roomId);
    if (stream && patientVideoRef.current) {
      patientVideoRef.current.srcObject = stream;
      patientVideoRef.current.play().catch(() => {});
      signRecognitionService.setVideoSource(patientVideoRef.current);
      signRecognitionService.startAnalysis();
    }
  };

  const handleEndConsultation = () => {
    webrtcService.endCall();
    signRecognitionService.stopAnalysis();
    setCallActive(false);
    navigate('/patient');
  };

  const handleTogglePatientSignMode = () => {
    const nextState = !patientSignModeActive;
    setPatientSignModeActive(nextState);
    signRecognitionService.setRecognitionActive(nextState);
  };

  const handleModeChange = (mode: CommunicationMode) => {
    setCommunicationMode(mode);
    realTimeSignCommunicationService.broadcastModeChange(mode, 'PATIENT');
  };

  // Text-To-Speech (TTS)
  const handleSpeakText = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  // 1-Tap Medical Shortcut Trigger (Patient)
  const handleSelectPatientShortcut = (signId: string) => {
    const res = signRecognitionService.triggerManualSign(signId, 'PATIENT');
    if (res) {
      setDetectedPatientSign(res.text);
      setDetectedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(false);
      setShowVisualConfirmation(true);
      setTimeout(() => setShowVisualConfirmation(false), 3000);

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      setTranscript(prev => [
        ...prev,
        {
          sender: 'You (Patient ISL)',
          text: res.text,
          hindiText: res.hindiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: 'PATIENT',
          icon: res.icon
        }
      ]);

      handleSpeakText(res.text);
      realTimeSignCommunicationService.sendPatientSign(res, user?.name || 'Patient');
    }
  };

  // Manual Text Send
  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = isEditing ? editText.trim() : detectedPatientSign;
    if (!finalMsg) return;

    setDetectedPatientSign(finalMsg);
    setIsEditing(false);

    const manualResult: RecognitionResult = {
      signId: 'p_custom',
      role: 'PATIENT',
      text: finalMsg,
      hindiText: detectedHindi,
      confidence: 100,
      isEmergency: isEmergencyActive,
      category: 'GENERAL',
      timestamp: Date.now(),
      isLowConfidence: false,
      motionIntensity: 100,
      icon: '💬'
    };

    setTranscript(prev => [
      ...prev,
      {
        sender: 'You (Patient)',
        text: finalMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'PATIENT',
        icon: '💬'
      }
    ]);

    handleSpeakText(finalMsg);
    realTimeSignCommunicationService.sendPatientSign(manualResult, user?.name || 'Patient');
  };

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans p-3 sm:p-6 pb-24 text-[var(--text-primary)] select-none">
      {/* ─── 1. TOP HEADER & MULTI-MODAL CONTROLS ───────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 card-3d rounded-[28px] border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/patient"
            className="btn-glass p-2.5 rounded-full hover:scale-105 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase tracking-wider">
                🤟 Two-Way SignBridge ISL
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                {callActive ? `LIVE CALL • ${formatCallTime(callDuration)}` : 'READY TO CONNECT'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">
              Two-Way Sign Language Consultation
            </h1>
          </div>
        </div>

        {/* Multi-Modal Mode Switcher: Sign ↔ Voice ↔ Text */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] self-stretch md:self-auto justify-center">
          <button
            type="button"
            onClick={() => handleModeChange('SIGN_LANGUAGE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              communicationMode === 'SIGN_LANGUAGE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HandMetal className="w-3.5 h-3.5" />
            <span>🤟 Sign Language</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('VOICE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              communicationMode === 'VOICE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>🎤 Voice</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('TEXT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              communicationMode === 'TEXT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>⌨ Text</span>
          </button>
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
                High-Risk Medical Sign Detected (Emergency Alert)
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                You signaled a critical symptom. Please remain calm. Dr. Anita Verma and emergency nursing staff have been notified immediately.
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

      {/* ─── 3. TWO-WAY REAL-TIME DUAL VIDEO CONSULTATION GRID ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN: PATIENT VIDEO & LOCAL SIGN RECOGNITION ─── */}
        <div className="space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-[var(--border)] shadow-2xl min-h-[340px] sm:min-h-[380px] flex items-center justify-center">
            <video
              ref={patientVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] min-h-[340px] sm:min-h-[380px] ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {isVideoOff && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-slate-400">
                <VideoOff className="w-14 h-14 text-slate-500" />
                <p className="text-sm font-bold">Your camera is off</p>
              </div>
            )}

            {/* Top Overlay Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>PATIENT (YOU)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-black border ${
                  patientSignModeActive ? 'bg-purple-500/80 border-purple-400 text-white' : 'bg-slate-700/80 border-slate-600 text-slate-300'
                }`}>
                  ISL: {patientSignModeActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Visual Sign Confirmation Toast */}
            {showVisualConfirmation && (
              <div className="absolute top-12 left-4 right-4 z-20 p-3 rounded-2xl bg-emerald-600/90 backdrop-blur-md border-2 border-emerald-400 text-white shadow-2xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200">✓ Sign Detected & Sent</div>
                    <div className="text-sm font-black">{detectedPatientSign}</div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold px-2 py-0.5 bg-black/30 rounded-lg">
                  {confidence}%
                </div>
              </div>
            )}

            {/* Gesture Tracking Reticle Frame */}
            {patientSignModeActive && (
              <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-emerald-400/40 rounded-3xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[9px] font-mono text-emerald-400/80">
                  <span>SHOW_SIGN_HERE</span>
                  <span>ISL_PATIENT_CAM</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-emerald-400/80">
                  <span>MOTION_VECTOR_ACTIVE</span>
                  <span>{confidence}%_CONF</span>
                </div>
              </div>
            )}
          </div>

          {/* Under Patient Video: Sign Language Toggle & Detected Sign */}
          <div className="p-4 rounded-[22px] card-3d border border-[var(--border)] space-y-2.5" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--text-secondary)]">
                <HandMetal className="w-4 h-4 text-purple-400" />
                <span>Your Sign Language (Patient)</span>
              </div>

              <button
                type="button"
                onClick={handleTogglePatientSignMode}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  patientSignModeActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                Sign Language: {patientSignModeActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Detected Sign Box */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-1">
              <div className="text-[11px] font-bold text-[var(--text-secondary)]">Detected Sign:</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                "{detectedPatientSign}"
              </div>
              <div className="text-xs font-bold text-[var(--text-secondary)]">
                ({detectedHindi})
              </div>
            </div>

            {/* Low Confidence Guidance */}
            {isLowConfidence && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Sign unclear. Please show the sign again or use 1-tap shortcuts below.</span>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSpeakText(detectedPatientSign)}
                className="btn-glass flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:text-amber-300"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Speak Sign (TTS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setEditText(detectedPatientSign);
                }}
                className="btn-glass px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleSendCustomText} className="space-y-2 pt-1">
                <input
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl border border-emerald-500 bg-[var(--input-bg)] text-[var(--input-text)]"
                  placeholder="Type message to doctor..."
                />
                <button type="submit" className="btn-glow w-full py-2 rounded-xl text-xs font-black">
                  Send Corrected Sign
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: DOCTOR VIDEO & INCOMING DOCTOR ISL SIGN ─── */}
        <div className="space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/40 shadow-2xl min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center p-6 text-center">
            {/* Simulated Live Doctor Video Stream Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-white shadow-2xl flex items-center justify-center text-5xl mb-3 relative">
              👩‍⚕️
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white ring-2 ring-emerald-500 animate-pulse" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              Dr. Anita Verma
            </h3>
            <p className="text-xs text-emerald-300 font-bold">
              Chief Cognitive Neurologist • Apollo Telehealth
            </p>

            {/* Doctor Overlay Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>DOCTOR VIDEO STREAM</span>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/80 border border-indigo-400 text-white text-[11px] font-black">
                Two-Way Active
              </span>
            </div>
          </div>

          {/* Under Doctor Video: TRANSLATED DOCTOR SIGN DISPLAY */}
          <div className="p-4 rounded-[22px] card-3d border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-900/40 to-purple-900/30 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-300">
                <HandMetal className="w-4 h-4" />
                <span>🤟 Doctor's Sign (Translated to You)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-mono text-indigo-200">
                {doctorIncomingSign.confidence}% Match
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-indigo-500/30 space-y-1">
              <div className="text-xs font-bold text-indigo-200">Doctor is signing:</div>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>{doctorIncomingSign.icon || '🤟'}</span>
                <span>"{doctorIncomingSign.text}"</span>
              </div>
              {doctorIncomingSign.hindiText && (
                <div className="text-xs font-bold text-indigo-300">
                  ({doctorIncomingSign.hindiText})
                </div>
              )}
            </div>

            {/* Doctor Voice Subtitle Stream */}
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 text-xs text-slate-300">
              <span className="font-bold text-indigo-300">Doctor Subtitle: </span>
              <span>{doctorVoiceSubtitles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. 16 PATIENT 1-TAP MEDICAL SHORTCUTS ─────────────────────────────── */}
      <div className="card-3d p-5 sm:p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              Patient Medical Sign Library (16 ISL Shortcuts)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold">
            Tap any card to sign & transmit to doctor immediately
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PATIENT_ISL_DICTIONARY.map(sign => {
            const isEmg = sign.isEmergency;
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => handleSelectPatientShortcut(sign.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 shadow-xs min-h-[90px] ${
                  isEmg
                    ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30 text-rose-300'
                    : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-purple-400/60 hover:bg-purple-500/10 text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{sign.icon}</span>
                  {isEmg && (
                    <span className="px-1 py-0.5 rounded bg-rose-500 text-white text-[8px] font-black">
                      SOS
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 mt-2">
                  <div className="text-xs font-black leading-snug">
                    {sign.label}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold truncate">
                    {sign.hindi}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 5. PRIVACY & CAMERA CONSENT MODAL ───────────────────────────────── */}
      {showConsentModal && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-3d max-w-lg w-full p-6 sm:p-8 rounded-[28px] border-2 border-purple-500/60 space-y-5 shadow-2xl text-left" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl font-black shrink-0">
                🤟
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  Two-Way SignBridge Privacy & Camera Consent
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
                  <strong>Local On-Device Processing:</strong> Hand gestures are analyzed locally on your device in real-time. Raw video frames are never stored permanently.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Two-Way Communication:</strong> Both your signs and the doctor's signs are translated in real-time on each other's screens.
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
                <span>Grant Consent & Start Two-Way Call</span>
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
