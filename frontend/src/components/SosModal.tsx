import React, { useState } from 'react';
import { Phone, AlertTriangle, X, CheckCircle2, ShieldAlert, HeartPulse } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { ModalPortal } from './ModalPortal';

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

  const headerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl shadow-md animate-pulse">
        🚨
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-rose-600 leading-tight">
          EMERGENCY SOS
        </h2>
        <p className="text-[11px] font-bold text-[var(--text-secondary)]">
          Immediate Caregiver & Emergency Dispatch
        </p>
      </div>
    </div>
  );

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} title={headerTitle} maxWidth="max-w-lg">
      <div className="space-y-5 font-sans text-[var(--text-primary)]">
        {dispatchedData ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-3xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[var(--text-primary)]">
                Emergency Alert Dispatched!
              </h3>
              <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
                Your assigned caregiver and emergency contacts have received immediate priority notification with your live location.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="tel:112"
                className="w-full py-3.5 bg-rose-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-rose-700 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call Emergency Services (112)</span>
              </a>

              {user?.emergencyContact && (
                <div className="p-3 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-xs font-black text-[var(--text-primary)]">
                  📞 Emergency Contact: {user.emergencyContact}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 btn-glass text-[var(--text-primary)] font-black text-xs rounded-xl cursor-pointer"
            >
              Close Emergency Window
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">
                Triggering this will immediately broadcast an urgent audible alert and GPS location to your caregiver.
              </p>
            </div>

            {/* Target Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                Primary Contact Target:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CAREGIVER', label: 'Primary Caregiver', icon: '👩‍⚕️' },
                  { id: 'FAMILY', label: 'Family Member', icon: '👨‍👩‍👧' },
                  { id: 'DOCTOR', label: 'Consultant Doctor', icon: '🩺' },
                  { id: 'AMBULANCE', label: 'Ambulance (108)', icon: '🚑' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTarget(t.id as any)}
                    className={`p-3 rounded-2xl border-2 text-left font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                      selectedTarget === t.id
                        ? 'border-rose-600 bg-rose-500/15 text-rose-600 dark:text-rose-300'
                        : 'border-[var(--border)] bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:border-rose-400'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                Optional Message / Condition:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Feeling dizzy, need help walking"
                className="w-full p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--input-text)] font-medium outline-none focus:border-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-glass flex-1 py-3 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerEmergency}
                disabled={isTriggering}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isTriggering ? 'Broadcasting...' : 'DISPATCH SOS NOW'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};

export default SosModal;
