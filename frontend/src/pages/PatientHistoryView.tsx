import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Trash2, Calendar, Pill, Brain, MessageSquare, CheckCircle2, Plus, Sparkles, Filter } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface HistoryItem {
  id: string;
  type: 'MEDICINE' | 'GAME' | 'VOICE' | 'ROUTINE';
  title: string;
  timestamp: string;
  date: string;
  notes: string;
  status: 'COMPLETED' | 'ACKNOWLEDGED';
}

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    type: 'MEDICINE',
    title: 'Morning Blood Pressure Medication (Amlodipine 5mg)',
    timestamp: '08:30 AM',
    date: 'Today',
    notes: 'Taken with warm water after breakfast',
    status: 'COMPLETED'
  },
  {
    id: 'hist-2',
    type: 'GAME',
    title: '2-Player Quiz Battle with Grandson Aarav',
    timestamp: '10:15 AM',
    date: 'Today',
    notes: 'Score: 100 pts. Excellent cognitive reaction speed.',
    status: 'COMPLETED'
  },
  {
    id: 'hist-3',
    type: 'VOICE',
    title: 'AABHA AI Voice Chat — Childhood Memories',
    timestamp: '02:30 PM',
    date: 'Today',
    notes: 'Recalled Guwahati home near Brahmaputra river and Assam tea garden.',
    status: 'ACKNOWLEDGED'
  },
  {
    id: 'hist-4',
    type: 'ROUTINE',
    title: 'Evening Balcony Walk & Hydration (Warm Water)',
    timestamp: '05:00 PM',
    date: 'Yesterday',
    notes: 'Enjoyed fresh air with daughter Priya',
    status: 'COMPLETED'
  },
  {
    id: 'hist-5',
    type: 'MEDICINE',
    title: 'Night Calcium & Vitamin D Tablet',
    timestamp: '09:00 PM',
    date: 'Yesterday',
    notes: 'Taken before sleeping',
    status: 'COMPLETED'
  }
];

export default function PatientHistoryView() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'MEDICINE' | 'GAME' | 'VOICE' | 'ROUTINE'>('MEDICINE');
  const [newNotes, setNewNotes] = useState('');

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear patient history?')) {
      setHistory([]);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: HistoryItem = {
      id: 'hist-' + Date.now(),
      type: newType,
      title: newTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      notes: newNotes || 'Logged manually by patient/caregiver',
      status: 'COMPLETED'
    };

    setHistory(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const filteredHistory = activeFilter === 'ALL'
    ? history
    : history.filter(h => h.type === activeFilter);

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'MEDICINE': return { emoji: '💊', color: 'text-red-700' };
      case 'GAME': return { emoji: '🧠', color: 'text-purple-700' };
      case 'VOICE': return { emoji: '✨', color: 'text-amber-700' };
      case 'ROUTINE': return { emoji: '☕', color: 'text-blue-700' };
      default: return { emoji: '📋', color: 'text-black' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-32">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-black flex items-center gap-2.5">
            <span>📜</span> {t('Patient History & Routine Log')}
          </h1>
          <p className="text-sm sm:text-base text-gray-700 font-bold mt-1">
            Track and manage past medication logs, brain games, and daily routine history
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-2xl font-black text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Medical Log</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 bg-white border-2 border-red-300 hover:border-red-600 hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Events (${history.length})` },
          { id: 'MEDICINE', label: '💊 Medicines' },
          { id: 'GAME', label: '🧠 Games & Quizzes' },
          { id: 'VOICE', label: '✨ AABHA Voice Chats' },
          { id: 'ROUTINE', label: '☕ Daily Routines' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition border-2 ${
              activeFilter === tab.id
                ? 'bg-white border-black text-black shadow-sm ring-2 ring-gray-200'
                : 'bg-white border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Timeline Cards */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(item => {
            const style = getIconAndColor(item.type);

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-black shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-2xl shrink-0 shadow-sm mt-0.5">
                    {style.emoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-black bg-gray-50 text-black">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.date} • {item.timestamp}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-black mt-1">
                      {item.title}
                    </h3>

                    {item.notes && (
                      <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </span>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition"
                    title="Delete this history entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center space-y-2">
            <span className="text-4xl">📜</span>
            <h3 className="text-lg font-black text-black">No History Records Found</h3>
            <p className="text-xs text-gray-500 font-bold">New logs and completed routines will appear here automatically.</p>
          </div>
        )}
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-black">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <span>📋</span> Add Medical / Routine Log
            </h2>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Event Category</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold bg-white focus:border-black outline-none"
                >
                  <option value="MEDICINE">💊 Medicine Taken</option>
                  <option value="GAME">🧠 Brain Exercise / Game</option>
                  <option value="VOICE">✨ AABHA Voice Conversation</option>
                  <option value="ROUTINE">☕ Daily Routine Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Log Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon BP Check: 120/80"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold focus:border-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Notes / Details</label>
                <textarea
                  placeholder="e.g. Patient was in high spirits, drank 2 glasses of water"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold h-20 focus:border-black outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white border-2 border-gray-300 text-black rounded-2xl font-black text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white border-2 border-black text-black rounded-2xl font-black text-sm hover:bg-gray-50 shadow"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
