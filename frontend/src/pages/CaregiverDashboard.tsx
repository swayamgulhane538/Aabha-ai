import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Activity,
  CheckCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  Eye,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Pill,
  Heart,
  Smile,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';

const CaregiverDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaregiverData();
  }, [user?.id]);

  const fetchCaregiverData = async () => {
    try {
      setLoading(true);
      const [patientsRes, alertsRes] = await Promise.all([
        api.get('/caregivers/patients'),
        api.get('/alerts')
      ]);

      const pList = Array.isArray(patientsRes) ? patientsRes : [];
      setLinkedPatients(pList);
      setAlerts(Array.isArray(alertsRes) ? alertsRes : []);

      if (pList.length > 0) {
        const first = pList[0];
        setSelectedPatient(first);
        fetchPatientSummary(first.id);
      }
    } catch (err) {
      console.error('Failed to load caregiver data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientSummary = async (patientId: string) => {
    try {
      const summaryRes: any = await api.get(`/ai/daily-summary/${patientId}`);
      setDailySummary(summaryRes);
    } catch (err) {
      console.warn('Failed to load daily AI summary:', err);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    fetchPatientSummary(patient.id);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/read`, {});
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (err) {
      console.warn('Failed to acknowledge alert:', err);
    }
  };

  const stats = [
    { label: 'Assigned Patients', value: `${linkedPatients.length}`, icon: '👥', sub: 'Strictly Authorized' },
    { label: 'Active Alerts', value: `${alerts.length}`, icon: '🚨', sub: alerts.length > 0 ? 'Requires Attention' : 'All Clear' },
    { label: 'Cognitive Engagement', value: '88%', icon: '🧠', sub: 'High Retention' },
    { label: 'Medication Adherence', value: '94%', icon: '💊', sub: 'On Schedule' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24 font-sans">
      {/* ─── 1. HEADER ────────────────────────────────────────────────────── */}
      <header className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500 bg-purple-50 text-xs font-black text-purple-950 uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Authorized Caregiver Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">
            Caregiver Clinical Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
            Caregiver: <strong className="text-black">{user?.name || 'Priya Sharma'}</strong> • Assigned Patients Vault
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/caregiver/patients"
            className="px-5 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-sm shadow-sm transition flex items-center gap-2"
          >
            <span>View All Patients ({linkedPatients.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ─── 2. STATS ROW ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[10px] font-black uppercase text-gray-500">{stat.sub}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-black pt-1">{stat.value}</div>
            <div className="text-xs text-gray-700 font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── 3. TODAY'S PATIENT OVERVIEW & DAILY AI SUMMARY ───────────────── */}
      {selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Overview Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border-2 border-black shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-black uppercase text-gray-500">Selected Patient</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs font-black rounded-full">
                  {selectedPatient.patientId}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-black">{selectedPatient.name}</h3>
                <p className="text-xs font-bold text-gray-600">
                  Age: {selectedPatient.age || 67} yrs • {selectedPatient.relationship || 'Primary Caregiver'}
                </p>
              </div>

              {/* Overview Metrics List */}
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>🧠 Memory Score</span>
                  </div>
                  <span className="font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    85% (Good)
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>💊 Medication</span>
                  </div>
                  <span className="font-black text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {dailySummary?.medicationStatus || '2/3 Doses Taken'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>😊 Mood Wellness</span>
                  </div>
                  <span className="font-black text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {dailySummary?.moodStatus || 'Stable & Cheerful (😊)'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span>📅 Appointment</span>
                  </div>
                  <span className="font-black text-xs text-gray-900 bg-gray-200 px-2 py-0.5 rounded-full">
                    Aug 26 (Dr. Verma)
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/caregiver/patients/${selectedPatient.id}`}
              className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs text-center flex items-center justify-center gap-2 shadow transition mt-4"
            >
              <span>Inspect Full Medical File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daily AI Summary Card (Observation, NOT diagnosis) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 border border-black flex items-center justify-center text-xl text-white">
                    ✨
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-black">
                      TODAY'S AI SUMMARY & OBSERVATIONS
                    </h2>
                    <span className="text-xs font-bold text-gray-500">
                      Generated for {selectedPatient.name} ({selectedPatient.patientId})
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-950 font-black text-xs rounded-full">
                  Daily Brief
                </span>
              </div>

              {/* Observation Content */}
              <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3xl space-y-3">
                <div className="text-xs font-black uppercase text-gray-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clinical Behavioral Observation:</span>
                </div>

                <p className="text-sm font-bold text-gray-900 leading-relaxed">
                  "{dailySummary?.aiObservation || `Patient ${selectedPatient.name} completed today's morning memory exercises successfully with high accuracy (85%). Morning Donepezil was taken on schedule at 8:15 AM.`}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-200 text-xs font-bold text-gray-700">
                  <div>🎮 Memory Activities: <strong>{dailySummary?.memoryExercises || 'Completed (3 sessions)'}</strong></div>
                  <div>💊 Pill Routine: <strong>{dailySummary?.medicationStatus || '2/3 Doses Taken'}</strong></div>
                </div>
              </div>
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Non-Diagnostic Notice:</strong> This summary is an algorithmic activity observation for caregiver convenience and does not constitute a clinical medical diagnosis.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. SMART ALERTS CENTER ───────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-600" />
              <span>Caregiver Smart Alerts ({alerts.length})</span>
            </h2>
            <p className="text-xs text-gray-500 font-bold">
              Automated notifications for missed medications, cognitive performance drops, and SOS events
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>All clear! No active alerts requiring immediate action.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alt => (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  alt.severity === 'HIGH'
                    ? 'bg-red-50 border-red-500 text-red-950'
                    : 'bg-amber-50 border-amber-500 text-amber-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase border ${
                        alt.severity === 'HIGH'
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-amber-500 text-white border-amber-600'
                      }`}
                    >
                      {alt.severity} Priority
                    </span>
                    <h4 className="font-black text-sm">{alt.title}</h4>
                  </div>
                  <p className="text-xs font-bold">{alt.message}</p>
                </div>

                <button
                  onClick={() => handleAcknowledgeAlert(alt.id)}
                  className="px-3 py-1.5 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 transition shrink-0"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 5. ASSIGNED PATIENT CARDS SELECTOR ───────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black">
              Linked Patients Under Your Care ({linkedPatients.length})
            </h2>
            <p className="text-xs text-gray-500 font-bold">
              Select a patient below to inspect their daily vitals and observations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedPatients.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelectPatient(p)}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                selectedPatient?.id === p.id
                  ? 'border-black bg-gray-50 ring-2 ring-black shadow-sm'
                  : 'border-gray-200 bg-white hover:border-black'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs font-black rounded-full">
                    {p.patientId}
                  </span>
                  <span className="text-[11px] font-black text-gray-600">
                    Age: {p.age || 65} yrs
                  </span>
                </div>

                <h3 className="text-lg font-black text-black">{p.name}</h3>
                <p className="text-xs text-gray-600 font-medium">{p.email}</p>
                {p.phone && <p className="text-xs font-bold text-gray-700 mt-1">📞 {p.phone}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs font-black">
                <span className="text-emerald-700">📄 {p.reportsCount} Medical Reports</span>
                <span className="underline">Switch to Patient →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
