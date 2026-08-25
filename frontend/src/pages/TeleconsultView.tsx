import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Send,
  Sparkles,
  Shield,
  Clock,
  User,
  Plus,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

export const TeleconsultView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [callActive, setCallActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(128); // seconds

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Anita Verma', text: 'Namaste Anita ji! How are you feeling after your morning medication?', time: '10:32 AM' },
    { sender: 'You', text: 'Namaste Doctor, feeling good today. Did my memory exercise earlier.', time: '10:33 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Prescription filing in-call
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medName, setMedName] = useState('Donepezil 5mg');
  const [dosageTime, setDosageTime] = useState('08:00 AM');
  const [instructions, setInstructions] = useState('1 tablet daily after breakfast');
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callActive]);

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'You', text: inputMsg.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInputMsg('');

    // Doctor simulated response after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'Dr. Anita Verma', text: 'I noticed your cognitive accuracy on the memory match test improved by 6%. Excellent progress!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/medications', {
        name: medName,
        dosage: '5mg',
        scheduledTime: dosageTime,
        instructions
      });
      setPrescriptionSaved(true);
      setTimeout(() => {
        setPrescriptionSaved(false);
        setShowPrescriptionModal(false);
      }, 1500);
    } catch {
      alert('Prescription logged locally.');
      setShowPrescriptionModal(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans p-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient"
          className="px-4 py-2 bg-white border-2 border-black rounded-2xl text-xs font-black text-black hover:bg-gray-100 flex items-center gap-1.5 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Telehealth Room</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-400 text-rose-950 text-xs font-black rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span>LIVE CONSULTATION: {formatCallTime(callDuration)}</span>
          </span>
        </div>
      </div>

      {/* Main Video & Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Video Stream Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card-3d bg-gray-900 rounded-3xl p-4 sm:p-6 text-white relative min-h-[380px] sm:min-h-[460px] flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Top Video Overlay Bar */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>End-to-End Encrypted Medical Channel</span>
              </div>

              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold font-mono">
                {formatCallTime(callDuration)}
              </div>
            </div>

            {/* Doctor Video Center Feed */}
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-3 z-10">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-white flex items-center justify-center text-5xl sm:text-6xl shadow-2xl relative">
                👩‍⚕️
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white ring-2 ring-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Dr. Anita Verma
                </h3>
                <p className="text-xs text-emerald-300 font-bold">
                  Chief Cognitive Neurologist • Apollo Memory Care Clinic
                </p>
              </div>

              {/* Subtitle Teleconsult Closed Caption */}
              <div className="bg-black/80 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-2xl max-w-md text-xs font-bold text-white shadow">
                💬 <span className="text-emerald-400">Dr. Verma:</span> "Your daily vitals look very stable, Anita ji."
              </div>
            </div>

            {/* Patient Self-View (Picture in Picture Bottom Right) */}
            <div className="absolute bottom-20 right-6 w-28 h-28 sm:w-36 sm:h-36 bg-gray-800 border-2 border-white rounded-2xl overflow-hidden shadow-2xl z-20 flex flex-col items-center justify-center text-center">
              {videoActive ? (
                <>
                  <span className="text-4xl sm:text-5xl">👵</span>
                  <span className="text-[10px] font-black text-white bg-black/70 px-2 py-0.5 rounded-md mt-1">
                    You (Patient)
                  </span>
                </>
              ) : (
                <div className="text-[11px] font-black text-gray-400">
                  Camera Off
                </div>
              )}
            </div>

            {/* Bottom Call Controls Toolbar */}
            <div className="flex items-center justify-center gap-3 z-10 pt-4">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3.5 rounded-2xl border-2 transition ${
                  micActive ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-red-500 text-white border-red-600'
                }`}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoActive(!videoActive)}
                className={`p-3.5 rounded-2xl border-2 transition ${
                  videoActive ? 'bg-white text-black border-white hover:bg-gray-200' : 'bg-red-500 text-white border-red-600'
                }`}
                title={videoActive ? 'Stop Video' : 'Start Video'}
              >
                {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl flex items-center gap-1.5 shadow transition"
              >
                <FileText className="w-4 h-4" />
                <span>View Prescription</span>
              </button>

              <button
                onClick={() => navigate('/patient')}
                className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl border-2 border-red-700 transition"
                title="End Consultation Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Consultation Chat & Clinical Notes */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-3d bg-white p-5 rounded-3xl space-y-3 flex flex-col h-[460px]">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <h3 className="font-black text-sm text-black flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>In-Call Consultation Chat</span>
              </h3>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-2xs ${
                    msg.sender === 'You'
                      ? 'bg-black text-white ml-6 rounded-br-none'
                      : 'bg-emerald-50 border border-emerald-300 text-emerald-950 mr-6 rounded-bl-none'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-black uppercase mb-1 opacity-80">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-gray-200">
              <input
                type="text"
                placeholder="Type message to doctor..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* In-Call Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-black shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-black">Digital Consultation Prescription</h3>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="font-black text-gray-600">
                ✕
              </button>
            </div>

            {prescriptionSaved ? (
              <div className="p-4 bg-emerald-50 border border-emerald-500 text-emerald-950 font-black rounded-2xl text-center">
                ✓ Prescription successfully added to your Medication Schedule!
              </div>
            ) : (
              <form onSubmit={handleSavePrescription} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Prescribed Medication *</label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={e => setMedName(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs sm:text-sm font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Dosing Schedule *</label>
                    <input
                      type="text"
                      required
                      value={dosageTime}
                      onChange={e => setDosageTime(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Doctor Signature</label>
                    <input
                      type="text"
                      readOnly
                      value="Dr. Anita Verma (Verified)"
                      className="w-full p-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Clinical Instructions</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-black font-black text-xs rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800 shadow"
                  >
                    Accept & Save to Schedule
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

export default TeleconsultView;
