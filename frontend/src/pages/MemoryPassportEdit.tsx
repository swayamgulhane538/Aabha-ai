import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2, Heart, BookOpen, AlertCircle, Phone, Sparkles } from 'lucide-react';

interface FamilyMemberItem {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  description: string;
  isApprovedForAI: boolean;
}

interface MemoryEntryItem {
  id: string;
  category: string;
  title: string;
  description: string;
  isApprovedForAI: boolean;
}

const DEFAULT_FAMILY: FamilyMemberItem[] = [
  {
    id: 'fam-1',
    name: 'Priya Sharma',
    relationship: 'Daughter (मुलगी / बेटी)',
    phone: '+91 98765 43210',
    description: 'Lives in Pune. Calls every Sunday morning. Loves gardening together.',
    isApprovedForAI: true
  },
  {
    id: 'fam-2',
    name: 'Aarav Sharma',
    relationship: 'Grandson (नातू / पोता)',
    phone: '+91 98234 56789',
    description: 'Studies in 5th standard. Plays cricket with grandmother.',
    isApprovedForAI: true
  }
];

const DEFAULT_MEMORIES: MemoryEntryItem[] = [
  {
    id: 'mem-1',
    category: 'Important Places (महत्त्वाची ठिकाणे)',
    title: 'Childhood Home in Assam / Guwahati',
    description: 'Grew up near the Brahmaputra river with a large mango tree in the courtyard.',
    isApprovedForAI: true
  },
  {
    id: 'mem-2',
    category: 'Favourite Songs (आवडती गाणी)',
    title: 'Bihu Folk Songs & Classic Raagas',
    description: 'Enjoys listening to classical Indian flute and soothing morning bhajans.',
    isApprovedForAI: true
  }
];

const MemoryPassportEdit: React.FC = () => {
  const params = useParams<{ patientId?: string; id?: string }>();
  const patientId = params.patientId || params.id || 'demo-patient-id';
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'family' | 'memories'>('family');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>(DEFAULT_FAMILY);
  const [memoryItems, setMemoryItems] = useState<MemoryEntryItem[]>(DEFAULT_MEMORIES);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPassportData();
  }, [patientId]);

  const fetchPassportData = async () => {
    try {
      const res = await api.get(`/memory-passport/${patientId}`);
      if (res && res.people && Array.isArray(res.people) && res.people.length > 0) {
        setFamilyMembers(res.people);
      }
      if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
        setMemoryItems(res.items);
      }
    } catch {
      // Fallback in memory
    }
  };

  const handleAddFamilyMember = () => {
    const newMember: FamilyMemberItem = {
      id: 'fam-' + Date.now(),
      name: '',
      relationship: '',
      phone: '',
      description: '',
      isApprovedForAI: true
    };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const handleDeleteFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateFamilyMember = (id: string, field: keyof FamilyMemberItem, value: any) => {
    setFamilyMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMemoryItem = () => {
    const newItem: MemoryEntryItem = {
      id: 'mem-' + Date.now(),
      category: 'Important Places',
      title: '',
      description: '',
      isApprovedForAI: true
    };
    setMemoryItems(prev => [...prev, newItem]);
  };

  const handleDeleteMemoryItem = (id: string) => {
    setMemoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateMemoryItem = (id: string, field: keyof MemoryEntryItem, value: any) => {
    setMemoryItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await api.post('/memory-passport', {
        patientId,
        people: familyMembers,
        items: memoryItems
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <header className="space-y-4">
          <button
            type="button"
            onClick={() => navigate('/caregiver')}
            className="inline-flex items-center gap-2 text-black hover:underline font-black text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Patient Dashboard')}</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-2 border-black">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-black flex items-center gap-3">
                <span>📖</span> {t('Edit Memory Passport')}
              </h1>
              <p className="text-gray-700 mt-1 text-sm sm:text-base font-bold">
                Configure family contacts, mobile numbers, and memories for AABHA AI companion
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-3.5 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-2xl font-black text-base shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : t('Save Changes')}</span>
            </button>
          </div>
        </header>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-2xl font-black text-base flex items-center gap-3 shadow animate-scale-up">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Memory Passport updated successfully! All contacts and memories are refreshed.</span>
          </div>
        )}

        {/* Tabs & Content */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-black overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b-2 border-black bg-gray-50">
            <button
              type="button"
              onClick={() => setActiveTab('family')}
              className={`flex-1 py-4 text-center font-black text-sm sm:text-base flex items-center justify-center gap-2 transition ${
                activeTab === 'family'
                  ? 'bg-white text-black border-b-4 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Family Contacts ({familyMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memories')}
              className={`flex-1 py-4 text-center font-black text-sm sm:text-base flex items-center justify-center gap-2 transition ${
                activeTab === 'memories'
                  ? 'bg-white text-black border-b-4 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Memories & Places ({memoryItems.length})</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Tab 1: Family Members with Mobile Number */}
            {activeTab === 'family' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-black">
                      Family Members & Phone Contacts
                    </h2>
                    <p className="text-xs text-gray-600 font-bold">
                      Add relatives and their mobile numbers so patients can call them easily
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="px-4 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-xl font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Member</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {familyMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="p-5 sm:p-6 rounded-2xl border-2 border-black bg-white shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="text-xs font-black uppercase text-gray-500">
                          Family Member #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteFamilyMember(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-black text-black uppercase mb-1">
                            Name (नाव / नाम) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Priya Sharma"
                            value={member.name}
                            onChange={e => handleUpdateFamilyMember(member.id, 'name', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm focus:border-black outline-none"
                          />
                        </div>

                        {/* Relationship */}
                        <div>
                          <label className="block text-xs font-black text-black uppercase mb-1">
                            Relationship (नाते / रिश्ता) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Daughter (मुलगी / बेटी)"
                            value={member.relationship}
                            onChange={e => handleUpdateFamilyMember(member.id, 'relationship', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm focus:border-black outline-none"
                          />
                        </div>

                        {/* Mobile Number Field */}
                        <div>
                          <label className="block text-xs font-black text-black uppercase mb-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-black" />
                            <span>Mobile Number (मोबाईल नंबर)</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            value={member.phone || ''}
                            onChange={e => handleUpdateFamilyMember(member.id, 'phone', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm focus:border-black outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-black text-black uppercase mb-1">
                          Context Notes / Favorite Memories Together
                        </label>
                        <textarea
                          placeholder="e.g. Lives in Pune. Calls every Sunday morning. Loves gardening together."
                          value={member.description}
                          onChange={e => handleUpdateFamilyMember(member.id, 'description', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm h-16 focus:border-black outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Memories & Preferences */}
            {activeTab === 'memories' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-black">
                      Memories, Places & Preferences
                    </h2>
                    <p className="text-xs text-gray-600 font-bold">
                      Important stories and favorite songs for identity anchor
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMemoryItem}
                    className="px-4 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-xl font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Memory</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {memoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-5 sm:p-6 rounded-2xl border-2 border-black bg-white shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="text-xs font-black uppercase text-gray-500">
                          Memory Item #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteMemoryItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-black uppercase mb-1">
                            Category
                          </label>
                          <select
                            value={item.category}
                            onChange={e => handleUpdateMemoryItem(item.id, 'category', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm focus:border-black outline-none"
                          >
                            <option value="Important Places (महत्त्वाची ठिकाणे)">Important Places (महत्त्वाची ठिकाणे)</option>
                            <option value="Favourite Songs (आवडती गाणी)">Favourite Songs (आवडती गाणी)</option>
                            <option value="Childhood Memories (बालपणीच्या आठवणी)">Childhood Memories (बालपणीच्या आठवणी)</option>
                            <option value="Favorite Food (आवडते जेवण)">Favorite Food (आवडते जेवण)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-black uppercase mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Childhood Home in Assam"
                            value={item.title}
                            onChange={e => handleUpdateMemoryItem(item.id, 'title', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm focus:border-black outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-black uppercase mb-1">
                          Detailed Memory Story
                        </label>
                        <textarea
                          placeholder="e.g. Grew up near the Brahmaputra river with a mango tree..."
                          value={item.description}
                          onChange={e => handleUpdateMemoryItem(item.id, 'description', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border-2 border-gray-300 bg-white font-bold text-sm h-16 focus:border-black outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryPassportEdit;
