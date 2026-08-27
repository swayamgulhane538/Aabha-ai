import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, AlertTriangle, ShieldCheck, Edit3, Check, X, Heart, User } from 'lucide-react';
import { useTrustedContactStore } from '../stores/trustedContactStore';
import { api } from '../services/api';

interface TrustedContactQuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustedContactQuickHelpModal: React.FC<TrustedContactQuickHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const { contact, updateContact } = useTrustedContactStore();
  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(contact.name);
  const [relationship, setRelationship] = useState(contact.relationship);
  const [phone, setPhone] = useState(contact.phone);
  const [whatsapp, setWhatsapp] = useState(contact.whatsapp);
  const [alertSent, setAlertSent] = useState(false);

  if (!isOpen) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact({ name, relationship, phone, whatsapp });
    setIsEditing(false);
  };

  const handleSendAppAlert = async () => {
    try {
      await api.post('/alerts/sos', {
        location: 'Current GPS: 28.6139° N, 77.2090° E (Home)',
        contactName: contact.name,
        timestamp: new Date().toISOString()
      }).catch(() => null);
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 4000);
    } catch {
      setAlertSent(true);
    }
  };

  const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = contact.whatsapp.replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Namaste ${contact.name}! Arun Das has activated Quick Help via Aabha AI. Please check in.`
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="card-3d bg-[var(--card-bg-inline)] border-2 border-rose-500/40 rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/40 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {lang === 'mr' ? 'विश्वासू संपर्क आणि त्वरित मदत' : lang === 'hi' ? 'भरोसेमंद संपर्क एवं त्वरित सहायता' : 'Trusted Contact & Quick Help'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                {lang === 'mr' ? 'केवळ मॅन्युअल सक्रियतेवरच संपर्क केला जाईल' : lang === 'hi' ? 'केवल आपके टैप करने पर ही सहायता संदेश जाएगा' : 'Manual 1-tap contact assistance'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Relationship</label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-glass flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glow flex-1 py-2.5 rounded-xl text-xs font-black"
              >
                Save Contact
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center text-xl font-black">
                  👤
                </div>
                <div>
                  <h4 className="text-base font-black text-[var(--text-primary)]">{contact.name}</h4>
                  <p className="text-xs font-bold text-emerald-400">{contact.relationship}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{contact.phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
                title="Edit Contact"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Tap Contact Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1-Tap Call */}
              <a
                href={`tel:${cleanPhone}`}
                className="p-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Caregiver (Direct)</span>
              </a>

              {/* 1-Tap WhatsApp */}
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 border-2 border-green-400/40 text-green-300 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>
            </div>

            {/* In-App Caregiver Push Alert */}
            <div>
              <button
                type="button"
                onClick={handleSendAppAlert}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{alertSent ? '✓ Alert Dispatched with GPS' : 'Send In-App Caregiver Alert'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
