import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Stethoscope, Plus, CheckCircle2, AlertCircle, Phone, ArrowLeft, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export const AppointmentsView: React.FC = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Form State
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('Cognitive Neurology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/appointments');
      if (Array.isArray(res)) {
        setAppointments(res);
      }
    } catch (err) {
      console.warn('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    setSuccessMsg('');
    try {
      await api.post('/appointments', {
        doctorName,
        department,
        date,
        time,
        location,
        purpose
      });
      setSuccessMsg('Appointment scheduled successfully!');
      setTimeout(() => {
        setIsBookModalOpen(false);
        setSuccessMsg('');
        fetchAppointments();
      }, 1200);
    } catch (err) {
      // Optimistic local add
      const newApt = {
        id: `apt-${Date.now()}`,
        doctorName: doctorName || 'Dr. Anita Verma',
        department: department || 'Cognitive Neurology',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:30 AM',
        location: location || 'Room 402, Apollo Memory Clinic',
        purpose: purpose || 'Follow-up Evaluation',
        status: 'UPCOMING'
      };
      setAppointments(prev => [newApt, ...prev]);
      setIsBookModalOpen(false);
    } finally {
      setBooking(false);
    }
  };

  const speakAppointments = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const count = appointments.filter(a => a.status === 'UPCOMING').length;
      const text = `You have ${count} upcoming appointments scheduled with your neurologist.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filtered = appointments.filter(a => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="card-3d flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] border border-[var(--card-border-inline)]">
        <div>
          <Link to="/patient" className="text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-400 flex items-center gap-1 mb-2 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span>📅 Doctor Consultations & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Memory health consultations, neurology evaluations & routine geriatric visits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakAppointments}
            className="btn-glass px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
            title="Read schedule aloud"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Read Aloud</span>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="btn-glow px-4 py-2.5 text-xs font-black flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition border ${
              filter === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                : 'btn-glass text-[var(--text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="card-3d p-12 text-center text-sm font-bold text-[var(--text-secondary)] bg-[var(--card-bg-inline)] rounded-[24px] border border-[var(--card-border-inline)]">
          Loading appointments schedule...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-3d p-12 text-center bg-[var(--card-bg-inline)] rounded-[24px] border border-[var(--card-border-inline)] space-y-3">
          <div className="text-4xl">📅</div>
          <h3 className="text-lg font-black text-[var(--text-primary)]">No Appointments Found</h3>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            You do not have any {filter.toLowerCase()} appointments scheduled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(apt => (
            <div
              key={apt.id}
              className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 rounded-[24px] border border-[var(--card-border-inline)] space-y-4 flex flex-col justify-between hover:border-emerald-400/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{apt.department || 'Neurology'}</span>
                  </span>

                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-black rounded-full border ${
                      apt.status === 'UPCOMING'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)]">{apt.doctorName}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{apt.purpose}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{apt.time}</span>
                  </div>
                </div>

                {apt.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{apt.location}</span>
                  </div>
                )}
              </div>

              {apt.notes && (
                <div className="p-2.5 bg-[var(--bg-surface-secondary)] rounded-xl text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border)]">
                  <strong>Notes:</strong> {apt.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[var(--border)] space-y-4 max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Schedule Doctor Appointment</h2>
              <button onClick={() => setIsBookModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anita Verma"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--bg-surface)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                >
                  <option value="Cognitive Neurology">Cognitive Neurology</option>
                  <option value="Geriatric Psychiatry">Geriatric Psychiatry</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Memory Care Specialist">Memory Care Specialist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Location / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. Room 402, Apollo Memory Clinic"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Routine 3-Month MoCA Memory Follow-up"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="btn-glass flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="btn-glow flex-1 py-2.5 text-xs font-black"
                >
                  {booking ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;
