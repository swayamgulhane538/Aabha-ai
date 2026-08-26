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
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { webrtcService, CallConnectionState } from '../services/webrtcService';

const DOCTOR_PREDEFINED_RESPONSES = [
  { id: 'r1', label: 'Please repeat', hindi: 'कृपया दोबारा बताएं' },
  { id: 'r2', label: 'Where is the pain?', hindi: 'दर्द किस जगह पर है?' },
  { id: 'r3', label: 'How long have you had this problem?', hindi: 'यह समस्या कब से है?' },
  { id: 'r4', label: 'Take your medicine', hindi: 'अपनी निर्धारित दवा लें' },
  { id: 'r5', label: 'Please visit the hospital', hindi: 'कृपया नज़दीकी अस्पताल आएं' },
  { id: 'r6', label: 'This is an emergency', hindi: 'यह आपातकालीन स्थिति है' }
];

export const SignBridgeDoctorView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomId = 'aabha-signbridge-room';

  const [callActive, setCallActive] = useState(true);
  const [callState, setCallState] = useState<CallConnectionState>('CONNECTED');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(65);

  // Doctor Speech-to-Text (STT) state
  const [isListeningStt, setIsListeningStt] = useState(false);
  const [doctorSpokenText, setDoctorSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Patient Live Sign Feed
  const [latestPatientSign, setLatestPatientSign] = useState<{
    text: string;
    hindiText?: string;
    confidence: number;
    isEmergency?: boolean;
    time: string;
  }>({
    text: 'I have pain',
    hindiText: 'मुझे दर्द हो रहा है',
    confidence: 94,
    isEmergency: false,
    time: 'Just now'
  });

  const [transcript, setTranscript] = useState<Array<{ sender: string; text: string; time: string; type?: string; isEmergency?: boolean }>>([
    { sender: 'Dr. Anita Verma', text: 'Namaste! I am watching your signs. Please let me know how you are feeling.', time: '10:30 AM', type: 'DOCTOR' },
    { sender: 'Patient (ISL)', text: 'I have pain', time: '10:31 AM', type: 'PATIENT' }
  ]);

  const [customMsg, setCustomMsg] = useState('');

  // Prescription modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medName, setMedName] = useState('Paracetamol 500mg');
  const [dosageTime, setDosageTime] = useState('02:00 PM');
  const [instructions, setInstructions] = useState('Take with warm water after lunch');
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // ─── 1. INITIALIZE DOCTOR CALL & SPEECH-TO-TEXT ───────────────────────────
  useEffect(() => {
    webrtcService.setHandlers({
      onLocalStream: (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      },
      onStateChange: (st) => setCallState(st)
    });

    webrtcService.startCall(roomId).then(stream => {
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    });

    // Initialize Browser Speech-To-Text API
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
            // Broadcast as live subtitles to patient
            api.post('/signbridge/messages', {
              roomId,
              text: currentTranscript,
              type: 'DOCTOR_SPEECH_SUBTITLE'
            }).catch(() => {});
          }
        };

        recog.onerror = () => setIsListeningStt(false);
        recog.onend = () => setIsListeningStt(false);
        recognitionRef.current = recog;
      }
    }

    return () => {
      webrtcService.endCall();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for patient signs from backend
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res: any = await api.get(`/signbridge/messages/${roomId}`);
        if (Array.isArray(res) && res.length > 0) {
          const patientSigns = res.filter((m: any) => m.type === 'SIGN_TRANSLATION');
          if (patientSigns.length > 0) {
            const latest = patientSigns[patientSigns.length - 1];
            setLatestPatientSign({
              text: latest.text,
              hindiText: latest.hindiText,
              confidence: latest.confidence || 92,
              isEmergency: latest.isEmergency,
              time: 'Live'
            });
          }
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

  // Send Predefined Doctor Response
  const handleSendPredefinedResponse = (text: string) => {
    setTranscript(prev => [
      ...prev,
      {
        sender: 'You (Dr. Anita Verma)',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'DOCTOR'
      }
    ]);

    api.post('/signbridge/messages', {
      roomId,
      text,
      type: 'DOCTOR_SPEECH_SUBTITLE'
    }).catch(() => {});
  };

  // Send Custom Text Response
  const handleSendCustomDoctorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    handleSendPredefinedResponse(customMsg.trim());
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
      {/* ─── 1. DOCTOR TOP BAR ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 card-3d rounded-[24px] border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Link
            to="/caregiver"
            className="btn-glass p-2.5 rounded-full hover:scale-105 transition cursor-pointer flex items-center justify-center border border-[var(--border)]"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                🩺 Doctor Clinical Desk
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                SignBridge Telehealth Consultation
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Patient: Demo Patient (PAT-DEMO-000001) • Indian Sign Language Live Translator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE CONSULTATION: {formatCallTime(callDuration)}</span>
          </div>

          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="btn-glow px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prescribe</span>
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN SPLIT INTERFACE ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: PATIENT STREAM & LIVE SIGN TRANSLATOR */}
        <div className="lg:col-span-7 space-y-4">
          {/* Patient Video Container */}
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 border-2 border-[var(--border)] shadow-2xl min-h-[360px] sm:min-h-[440px] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1] min-h-[360px] sm:min-h-[440px]"
            />

            {/* Overlay: Patient Details */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Patient Stream (Demo Patient • Age 68)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-purple-500/80 border border-purple-400 text-white text-xs font-black flex items-center gap-1.5">
                <HandMetal className="w-3.5 h-3.5" />
                <span>ISL Classifier Active</span>
              </div>
            </div>

            {/* Doctor Self PiP Video */}
            <div className="absolute bottom-4 right-4 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 z-10 flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-xl flex items-center justify-center border-2 border-white mb-1">
                👩‍⚕️
              </div>
              <div className="text-[10px] font-black text-white truncate">
                Dr. Anita Verma
              </div>
              <div className="text-[8px] font-bold text-emerald-300">
                You (Doctor)
              </div>
            </div>
          </div>

          {/* REAL-TIME TRANSLATED SIGN DISPLAY (HIGH CONTRAST) */}
          <div className="card-3d p-5 rounded-[24px] border-2 border-purple-500/60 bg-gradient-to-r from-purple-900/30 to-indigo-900/20 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
                <HandMetal className="w-4 h-4" />
                <span>Patient Real-Time ISL Translation</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-[10px] font-bold text-purple-300">
                {latestPatientSign.confidence}% Model Confidence
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              "{latestPatientSign.text}"
            </div>
            {latestPatientSign.hindiText && (
              <div className="text-sm font-bold text-[var(--text-secondary)]">
                ({latestPatientSign.hindiText})
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: DOCTOR SPEECH-TO-TEXT & CLINICAL PHRASES */}
        <div className="lg:col-span-5 space-y-4">
          {/* Doctor Speech-To-Text (STT) Subtitles Controller */}
          <div className="card-3d p-5 rounded-[24px] border border-[var(--border)] space-y-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
                  Doctor Live Speech-To-Text (Subtitles)
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  isListeningStt
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isListeningStt ? 'bg-white' : 'bg-emerald-400'}`} />
                <span>{isListeningStt ? 'Mic Live (Listening)' : 'Start Voice Subtitles'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium min-h-[50px]">
              {doctorSpokenText ? (
                <span className="text-white font-bold text-sm">"{doctorSpokenText}"</span>
              ) : (
                <span>Speak into your microphone to stream real-time large subtitles onto the patient's screen.</span>
              )}
            </div>
          </div>

          {/* Predefined 1-Tap Doctor Responses */}
          <div className="card-3d p-5 rounded-[24px] border border-[var(--border)] space-y-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
              Quick Doctor Clinical Responses
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DOCTOR_PREDEFINED_RESPONSES.map(resp => (
                <button
                  key={resp.id}
                  type="button"
                  onClick={() => handleSendPredefinedResponse(resp.label)}
                  className="p-2.5 rounded-xl text-left bg-[var(--bg-surface-secondary)] border border-[var(--border)] hover:border-emerald-400/50 hover:bg-emerald-500/10 text-xs font-bold transition cursor-pointer active:scale-95 space-y-0.5"
                >
                  <div className="font-black text-[var(--text-primary)]">{resp.label}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">{resp.hindi}</div>
                </button>
              ))}
            </div>

            {/* Custom Doctor Message Input */}
            <form onSubmit={handleSendCustomDoctorMessage} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="Type doctor message to patient..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-hidden"
              />
              <button
                type="submit"
                className="btn-glow px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Running Transcript Box */}
          <div className="card-3d p-4 rounded-2xl border border-[var(--border)] max-h-56 overflow-y-auto space-y-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="text-[11px] font-black uppercase text-[var(--text-secondary)] tracking-wider">
              Consultation Transcript ({transcript.length})
            </div>
            {transcript.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs font-bold ${
                  m.type === 'DOCTOR'
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 ml-4'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mr-4'
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

      {/* ─── 3. PRESCRIPTION FILING MODAL ────────────────────────────────────── */}
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
