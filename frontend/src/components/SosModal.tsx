import React, { useState } from 'react';
import { Phone, AlertTriangle, X, CheckCircle2, ShieldAlert, HeartPulse } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [selectedTarget, setSelectedTarget] = useState<'CAREGIVER' | 'FAMILY' | 'DOCTOR' | 'AMBULANCE'>('CAREGIVER');
  const [isTriggering, setIsTriggering] = useState(false);
  const [dispatchedData, setDispatchedData] = useState<any>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleTriggerEmergency = async () => {
    setIsTriggering(true);
    try {
      const res: any = await api.post('/alerts/sos', {
        contactTarget: selectedTarget,
        note: notes || 'Immediate patient assistance requested'
      });
      setDispatchedData(res);
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch SOS alert. Please dial 112 directly.');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-red-600 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl shadow-md animate-pulse">
              🚨
            </div>
            <div>
              <h2 className="text-2xl font-black text-red-600">
                EMERGENCY SOS
              </h2>
              <p className="text-xs font-bold text-gray-600">
                Immediate Caregiver & Emergency Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {dispatchedData ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 mx-auto flex items-center justify-center text-3xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-950">
                Emergency Alert Dispatched!
              </h3>
              <p className="text-xs font-bold text-gray-700 leading-relaxed">
                Your assigned caregiver and emergency contacts have received immediate priority notification with your location and medical profile.
              </p>
            </div>

            {/* Direct Helpline Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href="tel:112"
                className="w-full py-3.5 bg-red-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-red-700 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call Emergency Services (112)</span>
              </a>

              {user?.emergencyContact && (
                <div className="p-3 bg-gray-50 rounded-2xl border-2 border-black text-xs font-black text-black">
                  📞 Emergency Contact: {user.emergencyContact}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800 transition"
            >
              Close Emergency Window
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-600 block">
                Who should we contact immediately?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Caregiver */}
                <button
                  type="button"
                  onClick={() => setSelectedTarget('CAREGIVER')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    selectedTarget === 'CAREGIVER'
                      ? 'border-red-600 bg-red-50 text-red-950 font-black ring-2 ring-red-400'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-black font-bold'
                  }`}
                >
                  <div className="text-2xl">👩‍⚕️</div>
                  <div>
                    <div className="text-xs font-black">Primary Caregiver</div>
                    <div className="text-[11px] text-gray-600">Priya Sharma</div>
                  </div>
                </button>

                {/* 2. Family Emergency Contact */}
                <button
                  type="button"
                  onClick={() => setSelectedTarget('FAMILY')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    selectedTarget === 'FAMILY'
                      ? 'border-red-600 bg-red-50 text-red-950 font-black ring-2 ring-red-400'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-black font-bold'
                  }`}
                >
                  <div className="text-2xl">👨‍👩‍👧</div>
                  <div>
                    <div className="text-xs font-black">Family Contact</div>
                    <div className="text-[11px] text-gray-600 truncate max-w-[120px]">
                      {user?.emergencyContact || '+91 98765 43210'}
                    </div>
                  </div>
                </button>

                {/* 3. Treating Doctor */}
                <button
                  type="button"
                  onClick={() => setSelectedTarget('DOCTOR')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    selectedTarget === 'DOCTOR'
                      ? 'border-red-600 bg-red-50 text-red-950 font-black ring-2 ring-red-400'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-black font-bold'
                  }`}
                >
                  <div className="text-2xl">🩺</div>
                  <div>
                    <div className="text-xs font-black">Treating Doctor</div>
                    <div className="text-[11px] text-gray-600">Dr. Anita Verma</div>
                  </div>
                </button>

                {/* 4. Ambulance */}
                <button
                  type="button"
                  onClick={() => setSelectedTarget('AMBULANCE')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    selectedTarget === 'AMBULANCE'
                      ? 'border-red-600 bg-red-50 text-red-950 font-black ring-2 ring-red-400'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-black font-bold'
                  }`}
                >
                  <div className="text-2xl">🚑</div>
                  <div>
                    <div className="text-xs font-black">Ambulance (112)</div>
                    <div className="text-[11px] text-gray-600">National Helpline</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[11px] font-black uppercase text-gray-600 mb-1 block">
                Quick Message / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Feeling sudden dizziness or need immediate help"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold text-black focus:border-red-600 outline-none"
              />
            </div>

            {/* Trigger Button */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-gray-100 text-black font-black text-xs rounded-2xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isTriggering}
                onClick={handleTriggerEmergency}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>{isTriggering ? 'Dispatching...' : 'CONFIRM SOS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SosModal;
