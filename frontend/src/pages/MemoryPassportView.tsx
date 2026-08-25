import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { BookOpen, Heart, Phone, MessageCircle, Edit3, Trash2, Plus, CheckCircle2, Save, X, Sparkles, Palette, Music, Coffee } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  description: string;
  isApprovedForAI?: boolean;
}

interface HobbyItem {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
}

const DEFAULT_PEOPLE: FamilyMember[] = [
  {
    id: 'p1',
    name: 'Priya Sharma',
    relationship: 'Daughter',
    phone: '+91 98765 43210',
    description: 'Visits every weekend, loves cooking together',
    isApprovedForAI: true
  },
  {
    id: 'p2',
    name: 'Aarav',
    relationship: 'Grandson',
    phone: '+91 98234 56789',
    description: 'Age 7, loves playing football in the garden',
    isApprovedForAI: true
  },
  {
    id: 'p3',
    name: 'Rajesh',
    relationship: 'Son',
    phone: '+91 99887 76655',
    description: 'Calls every evening at 8 PM from Bangalore',
    isApprovedForAI: true
  }
];

const DEFAULT_HOBBIES: HobbyItem[] = [
  {
    id: 'h1',
    title: 'Gardening & Plants (बागकाम / बागवानी)',
    emoji: '🌿',
    category: 'Nature',
    description: 'Tending to Tulsi, roses and watering flowering pots in the morning sun.'
  },
  {
    id: 'h2',
    title: 'Classical Music & Bhajans (शास्त्रीय संगीत / भजन)',
    emoji: '🎵',
    category: 'Music',
    description: 'Listening to morning devotional songs and relaxing flute melodies.'
  },
  {
    id: 'h3',
    title: 'Mindful Painting & Rangoli (चित्रकला / रांगोळी)',
    emoji: '🎨',
    category: 'Art',
    description: 'Drawing festive Rangoli patterns and filling mandalas with bright colors.'
  },
  {
    id: 'h4',
    title: 'Morning Park Walks (सकाळचे फिरणे / सैर)',
    emoji: '🚶‍♂️',
    category: 'Wellness',
    description: 'Gentle 20-minute morning walk with deep breaths and fresh air.'
  }
];

const HOBBY_EMOJIS = ['🌿', '🎵', '🎨', '🚶‍♂️', '📖', '🍳', '🧶', '🧘', '☕', '🌸', '🕊️', '📻'];

export default function MemoryPassportView() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [people, setPeople] = useState<FamilyMember[]>(DEFAULT_PEOPLE);
  const [hobbies, setHobbies] = useState<HobbyItem[]>(DEFAULT_HOBBIES);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit/Add Family Member Modal State
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Edit/Add Hobby Modal State
  const [editingHobby, setEditingHobby] = useState<HobbyItem | null>(null);
  const [showAddHobbyModal, setShowAddHobbyModal] = useState(false);
  const [hobbyTitle, setHobbyTitle] = useState('');
  const [hobbyEmoji, setHobbyEmoji] = useState('🌿');
  const [hobbyCategory, setHobbyCategory] = useState('Nature');
  const [hobbyDesc, setHobbyDesc] = useState('');

  useEffect(() => {
    fetchPassport();
  }, [user]);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/memory-passport');
      if (res && res.people && Array.isArray(res.people) && res.people.length > 0) {
        setPeople(res.people);
      }
      if (res && res.hobbies && Array.isArray(res.hobbies) && res.hobbies.length > 0) {
        setHobbies(res.hobbies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Family Handlers ---
  const handleOpenEditMember = (person: FamilyMember) => {
    setEditingMember(person);
    setFormName(person.name);
    setFormRelation(person.relationship);
    setFormPhone(person.phone || '');
    setFormDesc(person.description || '');
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setFormName('');
    setFormRelation('');
    setFormPhone('');
    setFormDesc('');
    setShowAddMemberModal(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updatedList: FamilyMember[] = [];
    if (editingMember) {
      updatedList = people.map(p =>
        p.id === editingMember.id
          ? { ...p, name: formName, relationship: formRelation, phone: formPhone, description: formDesc }
          : p
      );
    } else {
      const newMember: FamilyMember = {
        id: 'p-' + Date.now(),
        name: formName,
        relationship: formRelation || 'Family Member',
        phone: formPhone,
        description: formDesc || 'Loved family member',
        isApprovedForAI: true
      };
      updatedList = [...people, newMember];
    }

    setPeople(updatedList);
    setEditingMember(null);
    setShowAddMemberModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      await api.post('/memory-passport', { people: updatedList, hobbies });
    } catch {}
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Delete this family member from passport?')) {
      const updatedList = people.filter(p => p.id !== id);
      setPeople(updatedList);
      try {
        await api.post('/memory-passport', { people: updatedList, hobbies });
      } catch {}
    }
  };

  // --- Hobby Handlers ---
  const handleOpenEditHobby = (h: HobbyItem) => {
    setEditingHobby(h);
    setHobbyTitle(h.title);
    setHobbyEmoji(h.emoji);
    setHobbyCategory(h.category);
    setHobbyDesc(h.description);
  };

  const handleOpenAddHobby = () => {
    setEditingHobby(null);
    setHobbyTitle('');
    setHobbyEmoji('🌿');
    setHobbyCategory('Nature');
    setHobbyDesc('');
    setShowAddHobbyModal(true);
  };

  const handleSaveHobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hobbyTitle.trim()) return;

    let updatedHobbies: HobbyItem[] = [];
    if (editingHobby) {
      updatedHobbies = hobbies.map(h =>
        h.id === editingHobby.id
          ? { ...h, title: hobbyTitle, emoji: hobbyEmoji, category: hobbyCategory, description: hobbyDesc }
          : h
      );
    } else {
      const newHobby: HobbyItem = {
        id: 'h-' + Date.now(),
        title: hobbyTitle,
        emoji: hobbyEmoji,
        category: hobbyCategory,
        description: hobbyDesc
      };
      updatedHobbies = [...hobbies, newHobby];
    }

    setHobbies(updatedHobbies);
    setEditingHobby(null);
    setShowAddHobbyModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      await api.post('/memory-passport', { people, hobbies: updatedHobbies });
    } catch {}
  };

  const handleDeleteHobby = async (id: string) => {
    if (window.confirm('Delete this hobby from passport?')) {
      const updatedHobbies = hobbies.filter(h => h.id !== id);
      setHobbies(updatedHobbies);
      try {
        await api.post('/memory-passport', { people, hobbies: updatedHobbies });
      } catch {}
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] border border-[var(--card-border-inline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <span>📖</span> {t('My Memory Album & Passport')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Your family contacts, mobile numbers, and favorite hobbies & passions
          </p>
        </div>

        {/* Action Buttons: Add Family Member & Write Hobbies */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddHobby}
            className="btn-glass px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>+ Write Hobbies (छंद लिहा)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddMember}
            className="btn-glow px-4 py-2.5 text-xs font-black flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold rounded-2xl flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Information saved and updated successfully!</span>
        </div>
      )}

      {/* ─── SECTION 1: FAMILY CONTACTS & PHONE NUMBERS ──────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {t('My Family Members & Contacts')} ({people.length})
            </h2>
          </div>
          <button
            onClick={handleOpenAddMember}
            className="text-xs font-bold text-emerald-400 hover:underline"
          >
            + Add New Relative
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {people.map((person) => {
            const cleanPhone = person.phone ? person.phone.replace(/[^0-9+]/g, '') : '';

            return (
              <div
                key={person.id}
                className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] border border-[var(--card-border-inline)] flex flex-col justify-between gap-4 text-center hover:border-emerald-400/40 transition relative group shadow-lg"
              >
                {/* Card Top Header with Edit & Delete */}
                <div className="flex items-center justify-between w-full border-b border-[var(--border)] pb-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Contact Card</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(person)}
                      className="p-1.5 bg-[var(--bg-surface-secondary)] border border-[var(--border)] hover:border-emerald-400 rounded-lg text-[var(--text-secondary)] text-xs font-bold flex items-center gap-1 transition"
                      title="Edit Family Member"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(person.id)}
                      className="p-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg text-rose-400 text-xs transition"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white/30 flex items-center justify-center shadow-lg mb-3">
                    <span className="text-3xl font-black text-white">{person.name?.charAt(0) || '❤️'}</span>
                  </div>

                  <h3 className="font-black text-xl text-[var(--text-primary)]">{person.name}</h3>
                  <div className="inline-block bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-emerald-400 px-3 py-0.5 rounded-full text-xs font-bold mt-1">
                    {person.relationship}
                  </div>

                  {person.phone ? (
                    <div className="mt-2 text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 rounded-xl">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{person.phone}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(person)}
                      className="mt-2 text-xs text-emerald-400 font-bold underline"
                    >
                      + Add Phone Number
                    </button>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mt-3">
                    {person.description}
                  </p>
                </div>

                {/* 1-Click Direct Call & WhatsApp Action Buttons */}
                {cleanPhone ? (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="btn-glass py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 text-emerald-400"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(person)}
                      className="btn-glass w-full py-2 text-xs font-bold"
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 2: HOBBIES, INTERESTS & PASSIONS ────────────────────── */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {t('My Hobbies & Favorite Passions (माझे आवडते छंद)')} ({hobbies.length})
            </h2>
          </div>
          <button
            onClick={handleOpenAddHobby}
            className="btn-glass px-3.5 py-1.5 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Write New Hobby</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {hobbies.map((h) => (
            <div
              key={h.id}
              className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] border border-[var(--card-border-inline)] flex flex-col justify-between gap-4 hover:border-purple-400/40 transition shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-[18px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {h.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400 block">
                      {h.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                      {h.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditHobby(h)}
                    className="p-1.5 bg-[var(--bg-surface-secondary)] border border-[var(--border)] hover:border-purple-400 rounded-lg text-[var(--text-secondary)] text-xs transition"
                    title="Edit Hobby"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHobby(h.id)}
                    className="p-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg text-rose-400 text-xs transition"
                    title="Delete Hobby"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                “{h.description}”
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MODAL 1: EDIT / ADD FAMILY MEMBER ───────────────────────────── */}
      {(editingMember !== null || showAddMemberModal) && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>👨‍👩‍👧</span>
                <span>{editingMember ? 'Edit Family Contact' : 'Add New Family Member'}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setShowAddMemberModal(false);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Name (नाव / नाम) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-bold text-sm focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Relationship (नाते / रिश्ता) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daughter (मुलगी / बेटी) or Grandson"
                  value={formRelation}
                  onChange={e => setFormRelation(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-bold text-sm focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile / Phone Number (मोबाईल नंबर)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-bold text-sm focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Description / Memory Context
                </label>
                <textarea
                  placeholder="e.g. Visits every weekend, loves cooking and gardening together"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-medium text-xs h-20 focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setShowAddMemberModal(false);
                  }}
                  className="btn-glass flex-1 py-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow flex-1 py-3 text-xs font-black flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: WRITE / EDIT HOBBIES & PASSIONS ────────────────────── */}
      {(editingHobby !== null || showAddHobbyModal) && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>🎨</span>
                <span>{editingHobby ? 'Edit Hobby / Interest' : 'Write New Hobby (छंद लिहा)'}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingHobby(null);
                  setShowAddHobbyModal(false);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHobby} className="space-y-4">
              {/* Emoji Icon Picker */}
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1.5">
                  Select Icon / Emoji (आयकॉन निवडा)
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setHobbyEmoji(em)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition ${
                        hobbyEmoji === em ? 'border-emerald-400 bg-emerald-500/20 scale-110 shadow-sm' : 'border-[var(--border)] bg-[var(--bg-surface-secondary)] hover:border-emerald-400'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Hobby Title (छंदाचे नाव) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gardening, Painting, Listening to Bhajans, Knitting"
                  value={hobbyTitle}
                  onChange={e => setHobbyTitle(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-bold text-sm focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Category
                </label>
                <select
                  value={hobbyCategory}
                  onChange={e => setHobbyCategory(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--bg-surface)] text-[var(--input-text)] font-bold text-xs focus:border-emerald-400 outline-none"
                >
                  <option value="Nature">🌿 Nature & Plants (निसर्ग / बागकाम)</option>
                  <option value="Music">🎵 Music & Bhajans (संगीत / भजन)</option>
                  <option value="Reading">📖 Reading & Stories (वाचन / कथा)</option>
                  <option value="Cooking">🍳 Traditional Cooking (पाककला / स्वयंपाक)</option>
                  <option value="Crafts">🧶 Crafts & Knitting (विणकाम / कला)</option>
                  <option value="Wellness">🧘 Yoga & Walking (योग / चालणे)</option>
                  <option value="Social">☕ Family & Friends (गप्पागोष्टी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                  Why you love it / Memory notes (आवडण्याचे कारण / आठवणी)
                </label>
                <textarea
                  placeholder="e.g. Enjoys spending time in the garden watering tulsi and rose plants every morning"
                  value={hobbyDesc}
                  onChange={e => setHobbyDesc(e.target.value)}
                  className="w-full p-3 border border-[var(--input-border)] rounded-2xl bg-[var(--input-bg)] text-[var(--input-text)] font-medium text-xs h-20 focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHobby(null);
                    setShowAddHobbyModal(false);
                  }}
                  className="btn-glass flex-1 py-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow flex-1 py-3 text-xs font-black flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Hobby</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
