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
  Sparkles,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  Activity,
  HandMetal,
  Info,
  Lock,
  Layers,
  User,
  Heart,
  PhoneIncoming,
  RotateCcw,
  Loader2
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
  textToISLService,
  ISLGlossToken,
  ISLTranslationResult,
  ISL_GLOSS_CATALOG
} from '../services/textToISLService';
import {
  realTimeSignCommunicationService,
  SignBridgeLiveMessage
} from '../services/realTimeSignCommunicationService';
import { webrtcService, CallConnectionState } from '../services/webrtcService';
import { signalingClient, DoctorPresence } from '../services/signalingClient';
import { ISLAvatarPlayer } from '../components/ISLAvatarPlayer';

export const SignBridgePatientView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const patientLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const doctorRemoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Privacy Consent Modal
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(true);

  // Available Doctors List & Selected Doctor
  const [doctorsList, setDoctorsList] = useState<DoctorPresence[]>([
    {
      doctorId: 'uuid-demo-nurse',
      doctorName: 'Dr. Anita Verma',
      specialty: 'Chief Cognitive Neurologist',
      status: 'AVAILABLE'
    }
  ]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('uuid-demo-nurse');

  // Real WebRTC Call State
  const [callState, setCallState] = useState<CallConnectionState>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Doctor Spoken Sentence & ISL Animated Sequence (FOR PATIENT VISUAL RECEPTION)
  const [doctorSentence, setDoctorSentence] = useState<string>('Can you show me where you are feeling pain?');
  const [islAnimationSequence, setIslAnimationSequence] = useState<ISLGlossToken[]>([
    ISL_GLOSS_CATALOG.SHOW,
    ISL_GLOSS_CATALOG.WHERE,
    ISL_GLOSS_CATALOG.PAIN
  ]);

  // Patient Local Detected Sign
  const [detectedPatientSign, setDetectedPatientSign] = useState<string>('I have pain');
  const [confidence, setConfidence] = useState<number>(95);
  const [isLowConfidence, setIsLowConfidence] = useState<boolean>(false);
  const [showVisualConfirmation, setShowVisualConfirmation] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  // ─── 1. INITIALIZE SIGNALING & REAL WEBRTC LISTENERS ───────────────────────
  useEffect(() => {
    signRecognitionService.setActiveRole('PATIENT');

    // Register Patient with signaling server
    signalingClient.registerUser(
      user?.id || 'uuid-demo-patient',
      'PATIENT',
      user?.name || 'Demo Patient'
    );

    // Fetch initial doctors list
    (api.get('/consultations/doctors') as Promise<DoctorPresence[]>)
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setDoctorsList(res);
          setSelectedDoctorId(res[0].doctorId);
        }
      })
      .catch(() => {});

    // WebRTC Service Handlers
    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (patientLocalVideoRef.current) {
          patientLocalVideoRef.current.srcObject = stream;
          patientLocalVideoRef.current.play().catch(() => {});
          signRecognitionService.setVideoSource(patientLocalVideoRef.current);
          signRecognitionService.startAnalysis();
        }
      },
      onRemoteStream: (stream) => {
        console.log('[PatientView] Attaching doctor remote stream to video element');
        if (doctorRemoteVideoRef.current) {
          doctorRemoteVideoRef.current.srcObject = stream;
          doctorRemoteVideoRef.current.play().catch(() => {});
        }
      },
      onStateChange: (st) => {
        setCallState(st);
        if (st === 'CONNECTED') {
          setErrorMessage('');
        } else if (st === 'ENDED' || st === 'REJECTED' || st === 'FAILED') {
          signRecognitionService.stopAnalysis();
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onAudioStateChange: (muted) => setIsMuted(muted),
      onVideoStateChange: (off) => setIsVideoOff(off)
    });

    // Signaling Client Callbacks
    signalingClient.setCallbacks({
      onDoctorListUpdate: (docs) => {
        setDoctorsList(docs);
      },
      onISLSequence: (data) => {
        if (data.sequence) {
          setDoctorSentence(data.sequence.originalText || 'Doctor speaking');
          if (data.sequence.tokens) {
            setIslAnimationSequence(data.sequence.tokens);
          }
        }
      },
      onCallRejected: (data) => {
        setErrorMessage(data.reason || 'Doctor is unable to accept the consultation right now.');
      }
    });

    // Patient Camera Sign Detection callback
    signRecognitionService.onRecognition((res: RecognitionResult) => {
      setDetectedPatientSign(res.text);
      setConfidence(res.confidence);
      setIsLowConfidence(res.isLowConfidence);

      if (!res.isLowConfidence) {
        setShowVisualConfirmation(true);
        setTimeout(() => setShowVisualConfirmation(false), 3000);
      }

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      // Broadcast sign to doctor in real-time
      const activeCallId = webrtcService.getActiveCallId() || 'aabha-signbridge-room';
      signalingClient.broadcastSign(activeCallId, res);
      realTimeSignCommunicationService.sendPatientSign(res, user?.name || 'Patient');
    });

    // BroadcastChannel fallback for same-browser testing
    const unsubscribe = realTimeSignCommunicationService.subscribe((msg: SignBridgeLiveMessage) => {
      if (msg.senderRole === 'DOCTOR' || msg.senderRole === 'CAREGIVER') {
        if (msg.type === 'DOCTOR_VOICE_TO_ISL_SEQUENCE' && msg.islTokens) {
          setDoctorSentence(msg.text);
          setIslAnimationSequence(msg.islTokens);
        } else if (msg.type === 'DOCTOR_SPEECH_SUBTITLE') {
          setDoctorSentence(msg.text);
          const translation = textToISLService.translateToISL(msg.text);
          setIslAnimationSequence(translation.tokens);
        }
      }
    });

    return () => {
      unsubscribe();
      webrtcService.endCall();
      signRecognitionService.stopAnalysis();
    };
  }, [user]);

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

  // ─── 2. USER ACTIONS ───────────────────────────────────────────────────────
  const handleStartRealCall = async () => {
    setErrorMessage('');
    setShowConsentModal(false);
    setConsentGiven(true);

    const doc = doctorsList.find(d => d.doctorId === selectedDoctorId) || doctorsList[0];
    if (!doc) {
      setErrorMessage('No doctor available to connect.');
      return;
    }

    try {
      await api.post('/signbridge/consent', { consentGiven: true });
    } catch {}

    // Initiate real WebRTC call over network
    await webrtcService.startOutgoingCall(
      doc.doctorId,
      user?.id || 'uuid-demo-patient',
      user?.name || 'Demo Patient'
    );
  };

  const handleEndCall = () => {
    webrtcService.endCall();
    signRecognitionService.stopAnalysis();
    setCallState('IDLE');
  };

  const handleToggleMute = () => {
    webrtcService.toggleAudio();
  };

  const handleToggleCamera = () => {
    webrtcService.toggleVideo();
  };

  // 1-Tap Visual Patient Shortcut Trigger
  const handleSelectPatientVisualSign = (signId: string) => {
    const res = signRecognitionService.triggerManualSign(signId, 'PATIENT');
    if (res) {
      setDetectedPatientSign(res.text);
      setConfidence(res.confidence);
      setIsLowConfidence(false);
      setShowVisualConfirmation(true);
      setTimeout(() => setShowVisualConfirmation(false), 3000);

      if (res.isEmergency) {
        setIsEmergencyActive(true);
      }

      const activeCallId = webrtcService.getActiveCallId() || 'aabha-signbridge-room';
      signalingClient.broadcastSign(activeCallId, res);
      realTimeSignCommunicationService.sendPatientSign(res, user?.name || 'Patient');
    }
  };

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentDoctor = doctorsList.find(d => d.doctorId === selectedDoctorId) || doctorsList[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans p-3 sm:p-6 pb-24 text-[var(--text-primary)] select-none">
      {/* ─── 1. TOP STATUS & EMERGENCY BAR ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 card-3d rounded-[28px] border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/patient"
            className="btn-glass p-3 rounded-2xl hover:scale-105 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-black uppercase tracking-wider">
                🤟 Real WebRTC Video Consultation & SignBridge
              </span>

              {/* Call State Pill */}
              <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${
                callState === 'CONNECTED'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : callState === 'RINGING' || callState === 'CALLING' || callState === 'CONNECTING'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-slate-700/30 border-slate-600 text-slate-400'
              }`}>
                {callState === 'CONNECTED' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                <span>{callState === 'CONNECTED' ? `🟢 CONNECTED • ${formatCallTime(callDuration)}` : `STATUS: ${callState}`}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
              Live Doctor & Indian Sign Language Consultation
            </h1>
          </div>
        </div>

        {/* Doctor Availability & Start Consultation Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {callState === 'IDLE' || callState === 'ENDED' || callState === 'REJECTED' || callState === 'FAILED' ? (
            <button
              type="button"
              onClick={handleStartRealCall}
              disabled={currentDoctor?.status === 'IN_CONSULTATION' || currentDoctor?.status === 'OFFLINE'}
              className="btn-glow px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Start Real Video Call with {currentDoctor?.doctorName || 'Doctor'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isMuted ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'btn-glass text-[var(--text-primary)]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleCamera}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isVideoOff ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'btn-glass text-[var(--text-primary)]'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          )}

          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => handleSelectPatientVisualSign('p_emergency')}
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-2 text-xs sm:text-sm shadow-xl cursor-pointer active:scale-95 animate-pulse"
          >
            <span className="text-lg">🚨</span>
            <span className="hidden sm:inline">SOS</span>
          </button>
        </div>
      </div>

      {/* ─── 2. CALL STATE BANNER / ERROR ALERTS ─────────────────────────────── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs text-rose-300 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {(callState === 'CALLING' || callState === 'RINGING' || callState === 'CONNECTING') && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in">
          <Loader2 className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
          <div>
            <div>Calling {currentDoctor?.doctorName || 'Doctor'}...</div>
            <div className="text-[11px] text-amber-300/80 font-normal">
              Waiting for doctor to accept consultation on their device.
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. EMERGENCY ACTIVE WARNING BANNER ───────────────────────────────── */}
      {isEmergencyActive && (
        <div className="p-5 rounded-[24px] bg-gradient-to-r from-rose-600/30 via-red-500/20 to-orange-500/20 border-2 border-rose-500 text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-3xl font-black shrink-0 animate-bounce">
              🚨
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-rose-200">
                Critical Medical Sign Detected
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                Dr. Anita Verma and emergency nursing staff have been alerted immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="tel:108"
              className="btn-glow w-full md:w-auto px-6 py-3 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108</span>
            </a>
            <button
              onClick={() => setIsEmergencyActive(false)}
              className="btn-glass px-4 py-3 rounded-xl text-xs font-bold text-slate-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ─── 4. MAIN SPLIT: DOCTOR REAL LIVE VIDEO & ISL AVATAR PLAYER ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 6 COLS: REAL DOCTOR VIDEO STREAM CONTAINER */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/50 shadow-2xl min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center p-6 text-center">
            {/* Real WebRTC Remote Video Element */}
            <video
              ref={doctorRemoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover min-h-[380px] sm:min-h-[420px] ${callState === 'CONNECTED' ? 'block' : 'hidden'}`}
            />

            {/* Fallback Doctor Placeholder when call not yet connected */}
            {callState !== 'CONNECTED' && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-white shadow-2xl flex items-center justify-center text-6xl relative animate-pulse">
                  👩‍⚕️
                  <span className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ring-2 ${
                    currentDoctor?.status === 'AVAILABLE'
                      ? 'bg-emerald-400 ring-emerald-500'
                      : currentDoctor?.status === 'IN_CONSULTATION'
                      ? 'bg-amber-400 ring-amber-500'
                      : 'bg-rose-500 ring-rose-600'
                  }`} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {currentDoctor?.doctorName || 'Dr. Anita Verma'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300 font-bold">
                  {currentDoctor?.specialty || 'Chief Clinical Neurologist'}
                </p>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentDoctor?.status === 'AVAILABLE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : currentDoctor?.status === 'IN_CONSULTATION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                }`}>
                  Status: {currentDoctor?.status || 'AVAILABLE'}
                </span>
              </div>
            )}

            {/* Top Overlay Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className={`w-2 h-2 rounded-full ${callState === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>DOCTOR LIVE STREAM ({callState === 'CONNECTED' ? 'REAL WEBRTC' : 'READY'})</span>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/80 border border-emerald-400 text-white text-xs font-black shadow-md">
                STUN / WebRTC
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: DOCTOR ISL ANIMATED SIGN AVATAR PLAYER */}
        <div className="lg:col-span-6 space-y-3">
          <ISLAvatarPlayer
            sequence={islAnimationSequence}
            originalDoctorText={doctorSentence}
            isEmergency={isEmergencyActive}
            autoPlay={true}
          />
        </div>
      </div>

      {/* ─── 5. BOTTOM SECTION: REAL PATIENT CAMERA & DETECTED SIGN FEEDBACK ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 6 COLS: REAL PATIENT LOCAL CAMERA STREAM CONTAINER */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-[var(--border)] shadow-2xl min-h-[320px] sm:min-h-[360px] flex items-center justify-center">
            {/* Real HTMLVideoElement for Patient Local Camera */}
            <video
              ref={patientLocalVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] min-h-[320px] sm:min-h-[360px] ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {isVideoOff && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-slate-400">
                <VideoOff className="w-14 h-14 text-slate-500" />
                <p className="text-sm font-bold">Camera is turned off</p>
              </div>
            )}

            {/* Video Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>MY SIGN CAMERA (LOCAL STREAM)</span>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-purple-500/80 border border-purple-400 text-white text-xs font-black shadow-md">
                {confidence}% Confidence
              </span>
            </div>

            {/* Visual Confirmation Toast */}
            {showVisualConfirmation && (
              <div className="absolute top-14 left-4 right-4 z-20 p-3.5 rounded-2xl bg-emerald-600/95 backdrop-blur-md border-2 border-emerald-300 text-white shadow-2xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-emerald-200">✓ SIGN SENT TO DOCTOR</div>
                    <div className="text-base font-black">{detectedPatientSign}</div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold px-2 py-1 bg-black/40 rounded-xl">
                  {confidence}%
                </div>
              </div>
            )}

            {/* Gesture Tracking Reticle Frame */}
            <div className="absolute inset-x-8 inset-y-12 border-2 border-dashed border-emerald-400/40 rounded-3xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-[9px] font-mono text-emerald-400/80">
                <span>SHOW_SIGN_HERE</span>
                <span>REAL_OPTICAL_TRACKING</span>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-emerald-400/80">
                <span>ACTIVE</span>
                <span>{confidence}%_MATCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: DETECTED SIGN CARD & QUICK CONTROLS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-[28px] card-3d border-2 border-emerald-500/50 bg-[var(--bg-surface)] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
                <HandMetal className="w-4 h-4 text-emerald-400" />
                <span>You are saying to {currentDoctor?.doctorName || 'Doctor'}:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-mono font-bold">
                Real-Time Data
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 leading-tight">
                "{detectedPatientSign}"
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">
                The doctor sees your live video, reads this translated sign, and hears the speech synthesis over the internet.
              </div>
            </div>

            {isLowConfidence && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Sign unclear. Please repeat or tap the big buttons below.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 6. ULTRA-LARGE ACCESSIBILITY TOUCH CHIPS (NO READING REQUIRED) ─────── */}
      <div className="card-3d p-6 rounded-[28px] border border-[var(--border)] space-y-4 shadow-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              1-Tap Visual Patient Response Signs (No Typing Required)
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-bold">
            Tap any sign to transmit to {currentDoctor?.doctorName || 'Doctor'} immediately
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {PATIENT_ISL_DICTIONARY.map(sign => {
            const isEmg = sign.isEmergency;
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => handleSelectPatientVisualSign(sign.id)}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition cursor-pointer active:scale-95 shadow-md min-h-[105px] ${
                  isEmg
                    ? 'bg-rose-500/20 border-rose-500/60 hover:bg-rose-500/30 text-rose-300'
                    : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] hover:border-purple-400/60 hover:bg-purple-500/10 text-[var(--text-primary)]'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1">{sign.icon}</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black leading-tight">{sign.label}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold">{sign.hindi}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 7. PRIVACY & CAMERA CONSENT MODAL ───────────────────────────────── */}
      {showConsentModal && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-3d max-w-lg w-full p-6 sm:p-8 rounded-[28px] border-2 border-purple-500/60 space-y-5 shadow-2xl text-left" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl font-black shrink-0">
                🤟
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  Doctor Video & Indian Sign Language Consultation
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Real WebRTC Telehealth with Two-Way ISL
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-surface-secondary)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Real Video & Audio:</strong> You will connect with {currentDoctor?.doctorName || 'Dr. Anita Verma'} over an encrypted WebRTC connection.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Visual Sign Reception:</strong> The doctor's speech is automatically converted into animated Indian Sign Language avatars in real-time.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartRealCall}
                className="btn-glow flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Grant Permissions & Start Call</span>
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
