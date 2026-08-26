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
  VolumeX,
  RefreshCw,
  Layers,
  PhoneIncoming,
  PhoneCall,
  X
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
  textToISLService,
  ISLTranslationResult,
  ISLGlossToken
} from '../services/textToISLService';
import { speechToTextService } from '../services/speechToTextService';
import {
  realTimeSignCommunicationService,
  SignBridgeLiveMessage
} from '../services/realTimeSignCommunicationService';
import { webrtcService, CallConnectionState } from '../services/webrtcService';
import { signalingClient, DoctorAvailabilityStatus } from '../services/signalingClient';

export const SignBridgeDoctorView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const doctorLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const patientRemoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Doctor Availability Status
  const [doctorStatus, setDoctorStatus] = useState<DoctorAvailabilityStatus>('AVAILABLE');

  // Real WebRTC Call State
  const [callState, setCallState] = useState<CallConnectionState>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Incoming Call Notification Modal
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    patientId: string;
    patientName: string;
    timestamp: string;
  } | null>(null);

  // Doctor Natural Speech & ISL Gloss Pipeline state
  const [isMicListening, setIsMicListening] = useState(false);
  const [doctorSpokenSentence, setDoctorSpokenSentence] = useState('Where are you feeling pain?');
  const [currentISLTranslation, setCurrentISLTranslation] = useState<ISLTranslationResult>(
    textToISLService.translateToISL('Where are you feeling pain?')
  );
  const [isConvertingToISL, setIsConvertingToISL] = useState(false);

  // Patient Live Sign Feed
  const [patientDetectedSign, setPatientDetectedSign] = useState<{
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
    confidence: 95,
    time: 'Live',
    isEmergency: false
  });

  const [autoPlayTts, setAutoPlayTts] = useState(true);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // Prescription modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medName, setMedName] = useState('Paracetamol 500mg');
  const [dosageTime, setDosageTime] = useState('02:00 PM');
  const [instructions, setInstructions] = useState('Take with warm water after food');
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // ─── 1. INITIALIZE SIGNALING & REAL WEBRTC LISTENERS ───────────────────────
  useEffect(() => {
    signRecognitionService.setActiveRole('DOCTOR');

    // Register Doctor with signaling server
    signalingClient.registerUser(
      user?.id || 'uuid-demo-nurse',
      'DOCTOR',
      user?.name || 'Dr. Anita Verma',
      'Chief Cognitive Neurologist'
    );

    // WebRTC Service Handlers
    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (doctorLocalVideoRef.current) {
          doctorLocalVideoRef.current.srcObject = stream;
          doctorLocalVideoRef.current.play().catch(() => {});
        }
      },
      onRemoteStream: (stream) => {
        console.log('[DoctorView] Attaching patient remote stream to video element');
        if (patientRemoteVideoRef.current) {
          patientRemoteVideoRef.current.srcObject = stream;
          patientRemoteVideoRef.current.play().catch(() => {});
        }
      },
      onStateChange: (st) => {
        setCallState(st);
        if (st === 'CONNECTED') {
          setDoctorStatus('IN_CONSULTATION');
        } else if (st === 'ENDED' || st === 'REJECTED' || st === 'FAILED' || st === 'IDLE') {
          setDoctorStatus('AVAILABLE');
        }
      },
      onAudioStateChange: (muted) => setIsMuted(muted),
      onVideoStateChange: (off) => setIsVideoOff(off)
    });

    // Signaling Client Callbacks
    signalingClient.setCallbacks({
      onIncomingCall: (data) => {
        console.log('[DoctorView] Incoming call received:', data);
        setIncomingCall(data);
      },
      onSignDetected: (sign) => {
        if (sign) {
          const signInfo = {
            text: sign.text,
            hindiText: sign.hindiText,
            icon: sign.icon || '🤟',
            confidence: sign.confidence || 95,
            time: 'Just now',
            isEmergency: sign.isEmergency
          };
          setPatientDetectedSign(signInfo);

          if (autoPlayTts) {
            handleSpeakPatientSign(sign.text);
          }
        }
      }
    });

    // Configure Doctor Speech-to-Text
    speechToTextService.setCallbacks({
      onInterimText: (text) => {
        setDoctorSpokenSentence(text);
        setIsConvertingToISL(true);
      },
      onFinalText: (text) => {
        setDoctorSpokenSentence(text);
        handleProcessDoctorSpeech(text);
      },
      onStateChange: (listening) => {
        setIsMicListening(listening);
      }
    });

    // BroadcastChannel fallback for same-browser testing
    const unsubscribe = realTimeSignCommunicationService.subscribe((msg: SignBridgeLiveMessage) => {
      if (msg.senderRole === 'PATIENT') {
        if (msg.type === 'PATIENT_SIGN' || msg.type === 'EMERGENCY_ALERT') {
          const signInfo = {
            text: msg.text,
            hindiText: msg.hindiText,
            icon: msg.icon || '🤟',
            confidence: msg.confidence || 95,
            time: 'Just now',
            isEmergency: msg.isEmergency
          };
          setPatientDetectedSign(signInfo);

          if (autoPlayTts) {
            handleSpeakPatientSign(msg.text);
          }
        }
      }
    });

    return () => {
      unsubscribe();
      speechToTextService.stopListening();
      webrtcService.endCall();
    };
  }, [user, autoPlayTts]);

  // Call timer
  useEffect(() => {
    let timer: any = null;
    if (callState === 'CONNECTED') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  // ─── 2. CALL ACTIONS ───────────────────────────────────────────────────────
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const callId = incomingCall.callId;
    setIncomingCall(null);
    await webrtcService.acceptIncomingCall(callId);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    webrtcService.rejectIncomingCall(incomingCall.callId, 'Doctor declined the consultation.');
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    webrtcService.endCall();
    setCallState('IDLE');
    setDoctorStatus('AVAILABLE');
  };

  const handleToggleMute = () => {
    webrtcService.toggleAudio();
  };

  const handleToggleCamera = () => {
    webrtcService.toggleVideo();
  };

  const handleStatusChange = (status: DoctorAvailabilityStatus) => {
    setDoctorStatus(status);
    signalingClient.setDoctorStatus(status);
  };

  const handleToggleSpeechMic = () => {
    speechToTextService.toggleListening();
  };

  const handleProcessDoctorSpeech = (sentence: string) => {
    setIsConvertingToISL(true);
    const translation = textToISLService.translateToISL(sentence);
    setCurrentISLTranslation(translation);
    setIsConvertingToISL(false);

    // Broadcast animated ISL sequence to patient screen via WebRTC signaling
    const activeCallId = webrtcService.getActiveCallId() || 'aabha-signbridge-room';
    signalingClient.broadcastISLSequence(activeCallId, {
      originalText: translation.originalText,
      islGlossArray: translation.islGlossArray,
      tokens: translation.tokens,
      isEmergency: translation.isEmergency
    });

    realTimeSignCommunicationService.sendDoctorVoiceToISL(translation, user?.name || 'Dr. Anita Verma');
  };

  const handleSpeakPatientSign = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`The patient says: ${textToSpeak}`);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;

    setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectDoctorShortcut = (sign: ISLSign) => {
    setDoctorSpokenSentence(sign.label);
    handleProcessDoctorSpeech(sign.label);
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
      {/* ─── 1. DOCTOR TOP BAR ──────────────────────────────────────────────── */}
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
                🩺 Real WebRTC Doctor Desk
              </span>
              <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${
                callState === 'CONNECTED'
                  ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                  : 'bg-slate-700/30 border-slate-600 text-slate-400'
              }`}>
                {callState === 'CONNECTED' ? `LIVE CONSULTATION: ${formatCallTime(callDuration)}` : `STATUS: ${callState}`}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">
              Two-Way Indian Sign Language Telehealth
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Availability Status Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleStatusChange('AVAILABLE')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                doctorStatus === 'AVAILABLE' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 Available
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('IN_CONSULTATION')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                doctorStatus === 'IN_CONSULTATION' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟡 In Consultation
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('OFFLINE')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                doctorStatus === 'OFFLINE' ? 'bg-rose-500 text-white font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 Offline
            </button>
          </div>

          {/* Call Controls if Call Active */}
          {callState === 'CONNECTED' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isMuted ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'btn-glass text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleToggleCamera}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isVideoOff ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'btn-glass text-white'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            </div>
          )}

          {/* Auto-TTS Toggle */}
          <button
            type="button"
            onClick={() => setAutoPlayTts(!autoPlayTts)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 border ${
              autoPlayTts
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-xs'
                : 'bg-slate-700/30 text-slate-400 border-slate-600'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice TTS: {autoPlayTts ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="btn-glow px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prescribe</span>
          </button>
        </div>
      </div>

      {/* ─── 2. INCOMING CALL NOTIFICATION MODAL ─────────────────────────────── */}
      {incomingCall && (
        <div className="p-5 rounded-[24px] bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-teal-600/20 border-2 border-purple-400 text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-3xl font-black shrink-0 animate-bounce">
              <PhoneIncoming className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                  Incoming Video Consultation Request
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {incomingCall.patientName} ({incomingCall.patientId})
              </h3>
              <p className="text-xs text-purple-200 font-medium">
                Deaf / Non-Speaking Patient requesting Two-Way ISL Consultation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleAcceptCall}
              className="btn-glow flex-1 md:flex-initial px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Accept Consultation</span>
            </button>

            <button
              type="button"
              onClick={handleRejectCall}
              className="btn-glass px-5 py-3 rounded-2xl text-xs font-bold text-slate-300 hover:text-white"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. EMERGENCY TRIAGE BANNER (IF CRITICAL SIGN DETECTED) ─────────── */}
      {patientDetectedSign.isEmergency && (
        <div className="p-5 rounded-[24px] bg-gradient-to-r from-rose-600/30 via-red-500/20 to-orange-500/20 border-2 border-rose-500 text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-3xl font-black shrink-0 animate-bounce">
              🚨
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-rose-200">
                🚨 POSSIBLE EMERGENCY DETECTED
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                Patient signaled: <strong>"{patientDetectedSign.text}"</strong>. Please verify symptoms immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSpeakPatientSign(patientDetectedSign.text)}
              className="btn-glass px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Replay Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. MAIN SPLIT: PATIENT REAL STREAM & DOCTOR LOCAL CAMERA + SPEECH ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: REAL PATIENT VIDEO STREAM & DETECTED ISL GESTURE */}
        <div className="space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/40 shadow-2xl min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center p-6 text-center">
            {/* Real WebRTC Remote Video Element */}
            <video
              ref={patientRemoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover min-h-[340px] sm:min-h-[380px] ${callState === 'CONNECTED' ? 'block' : 'hidden'}`}
            />

            {callState !== 'CONNECTED' && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 border-4 border-white shadow-2xl flex items-center justify-center text-5xl mb-1 relative">
                  👤
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white ring-2 ring-emerald-500 animate-pulse" />
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white">
                  Demo Patient (PAT-DEMO-000001)
                </h3>
                <p className="text-xs text-emerald-300 font-bold">
                  Awaiting patient call initiation • ISL Ready
                </p>
              </div>
            )}

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className={`w-2 h-2 rounded-full ${callState === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>PATIENT STREAM ({callState === 'CONNECTED' ? 'REAL WEBRTC' : 'STANDBY'})</span>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/80 border border-emerald-400 text-white text-[11px] font-black">
                {patientDetectedSign.confidence}% AI Match
              </span>
            </div>
          </div>

          {/* Patient Detected Sign Output Card */}
          <div className="p-4 sm:p-5 rounded-[24px] card-3d border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300">
                <HandMetal className="w-4 h-4" />
                <span>🤟 Patient Recognized ISL Sign</span>
              </div>
              <button
                type="button"
                onClick={() => handleSpeakPatientSign(patientDetectedSign.text)}
                className="btn-glass px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 text-amber-300 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 space-y-1">
              <div className="text-xs font-bold text-emerald-200">Patient is saying:</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-2">
                <span>{patientDetectedSign.icon || '🤟'}</span>
                <span>"{patientDetectedSign.text}"</span>
              </div>
              {patientDetectedSign.hindiText && (
                <div className="text-xs font-bold text-emerald-300">
                  ({patientDetectedSign.hindiText})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DOCTOR LOCAL CAMERA + SPEECH INPUT & ISL GLOSS CONVERSION */}
        <div className="space-y-3">
          {/* Doctor Local Camera Box */}
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-purple-500/40 shadow-2xl h-[180px] sm:h-[200px] flex items-center justify-center">
            <video
              ref={doctorLocalVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? 'hidden' : 'block'}`}
            />
            {isVideoOff && (
              <div className="text-slate-400 text-xs font-bold flex flex-col items-center gap-1">
                <VideoOff className="w-8 h-8" />
                <span>Doctor camera is off</span>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 border border-white/20 text-white text-[10px] font-black">
              DOCTOR CAMERA (LOCAL)
            </div>
          </div>

          {/* Natural Speech Mic & Input Box */}
          <div className="p-5 rounded-[28px] card-3d border-2 border-purple-500/60 bg-[var(--bg-surface)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                  Doctor Speech Input (Voice ➔ ISL Avatar)
                </span>
              </div>

              {/* Big Speak Button */}
              <button
                type="button"
                onClick={handleToggleSpeechMic}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-lg ${
                  isMicListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'btn-glow'
                }`}
              >
                <Mic className={`w-4 h-4 ${isMicListening ? 'animate-bounce' : ''}`} />
                <span>{isMicListening ? 'Mic Live (Listening...)' : '🎤 Speak Natural Sentence'}</span>
              </button>
            </div>

            {/* Doctor Spoken Sentence Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleProcessDoctorSpeech(doctorSpokenSentence); }} className="space-y-2">
              <input
                type="text"
                value={doctorSpokenSentence}
                onChange={e => setDoctorSpokenSentence(e.target.value)}
                placeholder="Doctor can speak or type any sentence in English, Hindi, or Hinglish..."
                className="w-full p-3.5 text-sm font-bold rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-hidden"
              />
              <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)]">
                <span>Supports English, Hindi & Hinglish natural sentences</span>
                <button type="submit" className="btn-glass px-3 py-1 rounded-xl text-xs font-bold cursor-pointer">
                  Translate & Broadcast ➔
                </button>
              </div>
            </form>

            {/* Live ISL Gloss Conversion Pipeline Display */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-400/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black uppercase text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>ISL Grammar Translation Pipeline:</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {isConvertingToISL ? 'Converting...' : '✓ Synced with Patient Screen'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentISLTranslation.tokens.map((tok, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
                  >
                    <span>{tok.icon}</span>
                    <span>[{tok.gloss}]</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-300 font-medium">
                The patient screen is actively rendering this sign sequence on the <strong>ISL Animated Avatar Player</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. 16 DOCTOR CLINICAL ISL SHORTCUTS ───────────────────────────────── */}
      <div className="card-3d p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              Doctor 1-Tap Clinical Signs (Broadcasts Directly to Patient Avatar)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold">
            Tap any sentence to generate & play animated ISL signs on patient screen
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {DOCTOR_ISL_DICTIONARY.map(sign => (
            <button
              key={sign.id}
              type="button"
              onClick={() => handleSelectDoctorShortcut(sign)}
              className="p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 shadow-xs min-h-[95px] bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-purple-400/60 hover:bg-purple-500/10 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{sign.icon}</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[8px] font-bold">
                  {sign.category}
                </span>
              </div>

              <div className="space-y-0.5 mt-2">
                <div className="text-xs font-black leading-snug">{sign.label}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold truncate">{sign.hindi}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 6. PRESCRIPTION MODAL ───────────────────────────────────────────── */}
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
