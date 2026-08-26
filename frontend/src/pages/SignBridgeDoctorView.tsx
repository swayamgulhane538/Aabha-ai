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
  FileText,
  User,
  Plus,
  Activity,
  HandMetal,
  Clock,
  MessageSquare,
  Keyboard
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import {
  signRecognitionService,
  RecognitionResult
} from '../services/signRecognitionService';
import {
  DOCTOR_ISL_DICTIONARY,
  signTranslationService,
  ISLSign
} from '../services/signTranslationService';
import {
  realTimeSignCommunicationService,
  CommunicationMode,
  SignBridgeLiveMessage
} from '../services/realTimeSignCommunicationService';
import { webrtcService, CallConnectionState } from '../services/webrtcService';

export const SignBridgeDoctorView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const doctorVideoRef = useRef<HTMLVideoElement | null>(null);
  const roomId = 'aabha-signbridge-room';

  const [callActive, setCallActive] = useState(true);
  const [callState, setCallState] = useState<CallConnectionState>('CONNECTED');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(72);

  // Two-Way Modes: SIGN_LANGUAGE | VOICE | TEXT
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('SIGN_LANGUAGE');
  const [doctorSignModeActive, setDoctorSignModeActive] = useState(true);

  // Doctor Local Detected Sign (DOCTOR ISL GESTURE RECOGNITION)
  const [detectedDoctorSign, setDetectedDoctorSign] = useState<string>('Where is the pain?');
  const [detectedHindi, setDetectedHindi] = useState<string>('दर्द किस जगह पर हो रहा है?');
  const [confidence, setConfidence] = useState<number>(94);
  const [isLowConfidence, setIsLowConfidence] = useState<boolean>(false);
  const [showVisualConfirmation, setShowVisualConfirmation] = useState<boolean>(false);

  // Patient Remote Incoming Sign (TWO-WAY RECEIVE FROM PATIENT)
  const [patientIncomingSign, setPatientIncomingSign] = useState<{
    text: string;
    hindiText?: string;
    icon?: string;
    confidence: number;
    time: string;
    isEmergency?: boolean;
  }>({
    text: 'I have pain',
    hindiText: 'मुझे दर्द हो रहा है',
    icon: '😣',
    confidence: 94,
    time: 'Live',
    isEmergency: false
  });

  // Doctor Speech-to-Text (STT) state
  const [isListeningStt, setIsListeningStt] = useState(false);
  const [doctorSpokenText, setDoctorSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Consultation Transcript
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
    { sender: 'Patient (ISL)', text: 'I have pain', hindiText: 'मुझे दर्द हो रहा है', time: '10:31 AM', role: 'PATIENT', icon: '😣' }
  ]);

  const [customMsg, setCustomMsg] = useState('');

  // Prescription modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medName, setMedName] = useState('Paracetamol 500mg');
  const [dosageTime, setDosageTime] = useState('02:00 PM');
  const [instructions, setInstructions] = useState('Take with warm water after lunch');
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // ─── 1. INITIALIZE TWO-WAY WEBRTC & REAL-TIME COMMUNICATION ───────────────
  useEffect(() => {
    signRecognitionService.setActiveRole('DOCTOR');
    realTimeSignCommunicationService.setRoomId(roomId);
    realTimeSignCommunicationService.startPolling(2000);

    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (doctorVideoRef.current) {
          doctorVideoRef.current.srcObject = stream;
          doctorVideoRef.current.play().catch(() => {});
          signRecognitionService.setVideoSource(doctorVideoRef.current);
          signRecognitionService.startAnalysis();
        }
      },
      onStateChange: (st) => setCallState(st)
    });

    webrtcService.startCall(roomId).then(stream => {
      if (stream && doctorVideoRef.current) {
        doctorVideoRef.current.srcObject = stream;
        doctorVideoRef.current.play().catch(() => {});
        signRecognitionService.setVideoSource(doctorVideoRef.current);
        signRecognitionService.startAnalysis();
      }
    });

    // Local ISL recognition event callback (DOCTOR SIDE)
    signRecognitionService.onRecognition((res: RecognitionResult) => {
      setDetectedDoctorSign(res.text);
      setDetectedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(res.isLowConfidence);

      if (!res.isLowConfidence) {
        setShowVisualConfirmation(true);
        setTimeout(() => setShowVisualConfirmation(false), 3000);
      }

      // Broadcast translated doctor sign to patient screen in real-time
      realTimeSignCommunicationService.sendDoctorSign(res, user?.name || 'Dr. Anita Verma');
    });

    // Subscribe to incoming messages from PATIENT SCREEN (TWO-WAY RECEIVE)
    const unsubscribe = realTimeSignCommunicationService.subscribe((msg: SignBridgeLiveMessage) => {
      if (msg.senderRole === 'PATIENT') {
        if (msg.type === 'PATIENT_SIGN' || msg.type === 'EMERGENCY_ALERT') {
          setPatientIncomingSign({
            text: msg.text,
            hindiText: msg.hindiText,
            icon: msg.icon || '🤟',
            confidence: msg.confidence || 92,
            time: 'Just now',
            isEmergency: msg.isEmergency
          });

          setTranscript(prev => [
            ...prev,
            {
              sender: msg.senderName || 'Patient (ISL)',
              text: msg.text,
              hindiText: msg.hindiText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              role: 'PATIENT',
              icon: msg.icon
            }
          ]);
        }
      }
    });

    // Initialize Browser Speech-To-Text API for Doctor Subtitles
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-IN';

        recog.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setDoctorSpokenText(currentTranscript);
            realTimeSignCommunicationService.sendDoctorSubtitle(currentTranscript, user?.name || 'Dr. Anita Verma');
          }
        };

        recog.onerror = () => setIsListeningStt(false);
        recog.onend = () => setIsListeningStt(false);
        recognitionRef.current = recog;
      }
    }

    return () => {
      unsubscribe();
      realTimeSignCommunicationService.stopPolling();
      webrtcService.endCall();
      signRecognitionService.stopAnalysis();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [user]);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── 2. HANDLERS ───────────────────────────────────────────────────────────
  const handleToggleDoctorSignMode = () => {
    const nextState = !doctorSignModeActive;
    setDoctorSignModeActive(nextState);
    signRecognitionService.setRecognitionActive(nextState);
  };

  const handleModeChange = (mode: CommunicationMode) => {
    setCommunicationMode(mode);
    realTimeSignCommunicationService.broadcastModeChange(mode, 'DOCTOR');
  };

  // Toggle Doctor STT
  const handleToggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListeningStt) {
      recognitionRef.current.stop();
      setIsListeningStt(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningStt(true);
      } catch {
        setIsListeningStt(false);
      }
    }
  };

  // 1-Tap Medical Shortcut Trigger (Doctor)
  const handleSelectDoctorShortcut = (signId: string) => {
    const res = signRecognitionService.triggerManualSign(signId, 'DOCTOR');
    if (res) {
      setDetectedDoctorSign(res.text);
      setDetectedHindi(res.hindiText);
      setConfidence(res.confidence);
      setIsLowConfidence(false);
      setShowVisualConfirmation(true);
      setTimeout(() => setShowVisualConfirmation(false), 3000);

      setTranscript(prev => [
        ...prev,
        {
          sender: 'You (Dr. Anita Verma)',
          text: res.text,
          hindiText: res.hindiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: 'DOCTOR',
          icon: res.icon
        }
      ]);

      realTimeSignCommunicationService.sendDoctorSign(res, user?.name || 'Dr. Anita Verma');
    }
  };

  // Send Custom Doctor Text
  const handleSendCustomDoctorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const manualResult: RecognitionResult = {
      signId: 'd_custom',
      role: 'DOCTOR',
      text: customMsg.trim(),
      hindiText: '',
      confidence: 100,
      isEmergency: false,
      category: 'GENERAL',
      timestamp: Date.now(),
      isLowConfidence: false,
      motionIntensity: 100,
      icon: '💬'
    };

    setTranscript(prev => [
      ...prev,
      {
        sender: 'You (Dr. Anita Verma)',
        text: customMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'DOCTOR',
        icon: '💬'
      }
    ]);

    realTimeSignCommunicationService.sendDoctorSign(manualResult, user?.name || 'Dr. Anita Verma');
    setCustomMsg('');
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/medications', {
        name: medName,
        dosage: '500mg',
        scheduledTime: dosageTime,
        instructions
      });
      setPrescriptionSaved(true);
      setTimeout(() => {
        setPrescriptionSaved(false);
        setShowPrescriptionModal(false);
      }, 1500);
    } catch {
      setShowPrescriptionModal(false);
    }
  };

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans p-3 sm:p-6 pb-24 text-[var(--text-primary)] select-none">
      {/* ─── 1. DOCTOR TOP BAR & MULTI-MODAL CONTROLS ───────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 card-3d rounded-[28px] border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/caregiver"
            className="btn-glass p-2.5 rounded-full hover:scale-105 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                🩺 Two-Way Doctor Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                LIVE CONSULTATION: {formatCallTime(callDuration)}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">
              Two-Way Sign Language Clinical Consultation
            </h1>
          </div>
        </div>

        {/* Multi-Modal Mode Switcher: Sign ↔ Voice ↔ Text */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)]">
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
              <span>🎤 Voice (STT)</span>
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

          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="btn-glow px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prescribe</span>
          </button>
        </div>
      </div>

      {/* ─── 2. TWO-WAY REAL-TIME DUAL VIDEO CONSULTATION GRID ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN: PATIENT VIDEO STREAM & PATIENT DETECTED SIGN ─── */}
        <div className="space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/40 shadow-2xl min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center p-6 text-center">
            {/* Patient Stream Representation */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 border-4 border-white shadow-2xl flex items-center justify-center text-5xl mb-3 relative">
              👤
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white ring-2 ring-emerald-500 animate-pulse" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              Demo Patient (PAT-DEMO-000001)
            </h3>
            <p className="text-xs text-emerald-300 font-bold">
              Age 68 • Living with Dementia • Indian Sign Language Active
            </p>

            {/* Top Overlay Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>PATIENT LIVE STREAM</span>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/80 border border-emerald-400 text-white text-[11px] font-black">
                Two-Way Connected
              </span>
            </div>
          </div>

          {/* Under Patient Video: PATIENT TRANSLATED SIGN DISPLAY */}
          <div className="p-4 rounded-[22px] card-3d border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300">
                <HandMetal className="w-4 h-4" />
                <span>🤟 Patient's Sign (Translated to You)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-200">
                {patientIncomingSign.confidence}% Match
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1">
              <div className="text-xs font-bold text-emerald-200">Patient is saying:</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-2">
                <span>{patientIncomingSign.icon || '🤟'}</span>
                <span>"{patientIncomingSign.text}"</span>
              </div>
              {patientIncomingSign.hindiText && (
                <div className="text-xs font-bold text-emerald-300">
                  ({patientIncomingSign.hindiText})
                </div>
              )}
            </div>

            {patientIncomingSign.isEmergency && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-black flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>CRITICAL SYMPTOM ALERT: Patient signaled emergency discomfort!</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: DOCTOR CAMERA & LOCAL SIGN RECOGNITION ─── */}
        <div className="space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-[var(--border)] shadow-2xl min-h-[340px] sm:min-h-[380px] flex items-center justify-center">
            <video
              ref={doctorVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1] min-h-[340px] sm:min-h-[380px]"
            />

            {/* Top Overlay Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>DOCTOR (YOU)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-black border ${
                  doctorSignModeActive ? 'bg-purple-500/80 border-purple-400 text-white' : 'bg-slate-700/80 border-slate-600 text-slate-300'
                }`}>
                  ISL: {doctorSignModeActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Visual Sign Confirmation Toast */}
            {showVisualConfirmation && (
              <div className="absolute top-12 left-4 right-4 z-20 p-3 rounded-2xl bg-purple-600/90 backdrop-blur-md border-2 border-purple-400 text-white shadow-2xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-200 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-purple-200">✓ Doctor Sign Sent to Patient</div>
                    <div className="text-sm font-black">{detectedDoctorSign}</div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold px-2 py-0.5 bg-black/30 rounded-lg">
                  {confidence}%
                </div>
              </div>
            )}

            {/* Gesture Tracking Reticle Frame */}
            {doctorSignModeActive && (
              <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-purple-400/40 rounded-3xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[9px] font-mono text-purple-400/80">
                  <span>SHOW_SIGN_HERE</span>
                  <span>ISL_DOCTOR_CAM</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-purple-400/80">
                  <span>MOTION_CLASSIFIER_ACTIVE</span>
                  <span>{confidence}%_CONF</span>
                </div>
              </div>
            )}
          </div>

          {/* Under Doctor Video: Sign Language Toggle & Detected Doctor Sign */}
          <div className="p-4 rounded-[22px] card-3d border border-[var(--border)] space-y-2.5" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--text-secondary)]">
                <HandMetal className="w-4 h-4 text-purple-400" />
                <span>Your Sign Language (Doctor)</span>
              </div>

              <button
                type="button"
                onClick={handleToggleDoctorSignMode}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  doctorSignModeActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                Sign Language: {doctorSignModeActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Detected Sign Box */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-1">
              <div className="text-[11px] font-bold text-[var(--text-secondary)]">Detected Sign:</div>
              <div className="text-xl sm:text-2xl font-black text-purple-400">
                "{detectedDoctorSign}"
              </div>
              <div className="text-xs font-bold text-[var(--text-secondary)]">
                ({detectedHindi})
              </div>
            </div>

            {/* Voice Subtitles (Speech-to-Text) Controller */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-[var(--text-secondary)]">Voice Subtitles:</span>
              </div>

              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  isListeningStt
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isListeningStt ? 'bg-white' : 'bg-emerald-400'}`} />
                <span>{isListeningStt ? 'Mic Live (Broadcasting)' : 'Start Voice Subtitles'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. 13 DOCTOR 1-TAP ISL GESTURE SHORTCUTS ──────────────────────────── */}
      <div className="card-3d p-5 sm:p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
              Doctor Clinical Sign Library (13 ISL Shortcuts)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold">
            Tap any card to sign & transmit to patient screen immediately
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {DOCTOR_ISL_DICTIONARY.map(sign => (
            <button
              key={sign.id}
              type="button"
              onClick={() => handleSelectDoctorShortcut(sign.id)}
              className="p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 shadow-xs min-h-[90px] bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-purple-400/60 hover:bg-purple-500/10 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{sign.icon}</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                  {sign.category}
                </span>
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
          ))}
        </div>

        {/* Custom Text Chat Form */}
        <form onSubmit={handleSendCustomDoctorMessage} className="flex gap-2 pt-2 border-t border-[var(--border)]">
          <input
            type="text"
            value={customMsg}
            onChange={e => setCustomMsg(e.target.value)}
            placeholder="Type custom clinical message to patient..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-hidden"
          />
          <button
            type="submit"
            className="btn-glow px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* ─── 4. PRESCRIPTION MODAL ───────────────────────────────────────────── */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-3d max-w-md w-full p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                💊
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  Log Prescription Order
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Patient: Demo Patient (PAT-DEMO-000001)
                </p>
              </div>
            </div>

            {prescriptionSaved ? (
              <div className="p-6 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>Prescription recorded and synced to Patient Alarms!</span>
              </div>
            ) : (
              <form onSubmit={handleSavePrescription} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">Medication Name & Strength</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={e => setMedName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={dosageTime}
                    onChange={e => setDosageTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">Dosage Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-glow flex-1 py-2.5 rounded-xl text-xs font-black">
                    Save to Patient Routine
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="btn-glass px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignBridgeDoctorView;
