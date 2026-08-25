import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  Droplet,
  Moon,
  Smile,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowLeft,
  Calendar,
  Zap,
  Info,
  Thermometer,
  BellRing,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export const VitalsTrackerView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [vitals, setVitals] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [glucose, setGlucose] = useState('100');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [stressLevel, setStressLevel] = useState('3');
  const [mood, setMood] = useState('HAPPY');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  useEffect(() => {
    console.log('[VitalsTrackerView] Mounted successfully. Fetching vitals data...');
    fetchVitalsData();
  }, [user?.id]);

  const fetchVitalsData = async () => {
    setLoading(true);
    try {
      const [vitalsRes, suggRes]: [any, any] = await Promise.all([
        api.get('/vitals').catch(() => ({ vitals: [] })),
        api.get('/vitals/suggestions').catch(() => ({ suggestions: [], metricsSummary: null }))
      ]);

      if (vitalsRes && Array.isArray(vitalsRes.vitals)) {
        setVitals(vitalsRes.vitals);
      }
      if (suggRes && Array.isArray(suggRes.suggestions)) {
        setSuggestions(suggRes.suggestions);
        setMetricsSummary(suggRes.metricsSummary);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/vitals', {
        systolicBp: systolic,
        diastolicBp: diastolic,
        bloodGlucose: glucose,
        heartRate,
        temperature,
        sleepHours,
        stressLevel,
        mood,
        notes
      });

      setLogSuccess(true);
      setTimeout(() => {
        setLogSuccess(false);
        setShowLogModal(false);
        fetchVitalsData();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const latest = vitals[0] || {
    systolicBp: 120,
    diastolicBp: 80,
    bloodGlucose: 100,
    heartRate: 72,
    temperature: 98.6,
    sleepHours: 7.5,
    stressLevel: 3,
    mood: 'HAPPY'
  };

  const isBpElevated = latest.systolicBp && (latest.systolicBp >= 140 || latest.diastolicBp >= 90);
  const isFever = latest.temperature && latest.temperature >= 100.4;
  const isGlucoseHigh = latest.bloodGlucose && latest.bloodGlucose >= 180;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 font-sans p-4 pb-24">
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/patient" className="text-xs font-black text-black underline flex items-center gap-1 mb-2 hover:text-gray-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>🩺</span>
            <span>Daily Vitals & Health Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
            Tracking Blood Pressure, Heart Rate, Blood Sugar, Temperature & Mind-Body Wellness
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-6 py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Log Today's Vitals (दैनिक माप)</span>
        </button>
      </div>

      {/* ─── ABNORMAL ALERTS & REMINDERS BANNER ────────────────────────────── */}
      {(isBpElevated || isFever || isGlucoseHigh) && (
        <div className="card-3d bg-rose-50 border-2 border-red-600 p-5 rounded-3xl space-y-2 animate-fade-in text-red-950">
          <div className="flex items-center gap-2 font-black text-sm text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>⚠️ Clinical Attention Notice on Recent Readings</span>
          </div>
          <div className="text-xs font-bold space-y-1 pl-7">
            {isBpElevated && <p>• Blood Pressure ({latest.systolicBp}/{latest.diastolicBp} mmHg) is elevated. Practice Guided Box Breathing and rest comfortably.</p>}
            {isFever && <p>• Body Temperature ({latest.temperature}°F) indicates a mild fever. Stay well hydrated.</p>}
            {isGlucoseHigh && <p>• Blood Glucose ({latest.bloodGlucose} mg/dL) is high. Review with your doctor.</p>}
          </div>
        </div>
      )}

      {/* ─── 4 MAIN 3D VITALS CARDS (Beating Heart, BP, Sugar, Temp) ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Blood Pressure with 3D Beating Heart */}
        <div className="card-3d bg-white p-5 rounded-3xl space-y-1.5 relative overflow-hidden group">
          {/* Subtle Ambient Pulse Light */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/30 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            {/* 3D Beating Heart with Concentric Pulse Wave */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-2xl bg-rose-400/25 animate-pulse-wave pointer-events-none" />
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-2xl shadow-2xs animate-heartbeat-3d">
                ❤️
              </div>
            </div>

            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isBpElevated
                  ? 'bg-red-200 text-red-950 border border-red-400 animate-pulse'
                  : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
              }`}
            >
              {isBpElevated ? 'Elevated' : 'Normal'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black pt-1 relative z-10">
            {latest.systolicBp}/{latest.diastolicBp}
          </div>
          <div className="text-xs font-black text-gray-800 relative z-10">Blood Pressure</div>
          <div className="text-[10px] font-bold text-gray-500 relative z-10">Target: &lt;130/80 mmHg</div>
        </div>

        {/* 2. Heart Rate with 3D Pulse Icon */}
        <div className="card-3d bg-white p-5 rounded-3xl space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                ⚡
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              Resting Pulse
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black pt-1 relative z-10">
            {latest.heartRate || 72} <span className="text-xs font-bold text-gray-600">bpm</span>
          </div>
          <div className="text-xs font-black text-gray-800 relative z-10">Heart Rate</div>
          <div className="text-[10px] font-bold text-gray-500 relative z-10">Normal: 60–100 bpm</div>
        </div>

        {/* 3. Blood Glucose */}
        <div className="card-3d bg-white p-5 rounded-3xl space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
              🩸
            </div>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isGlucoseHigh
                  ? 'bg-red-200 text-red-950 border border-red-400'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              {isGlucoseHigh ? 'High' : 'Fasting'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black pt-1 relative z-10">
            {latest.bloodGlucose || 100} <span className="text-xs font-bold text-gray-600">mg/dL</span>
          </div>
          <div className="text-xs font-black text-gray-800 relative z-10">Blood Sugar</div>
          <div className="text-[10px] font-bold text-gray-500 relative z-10">Target: 70–130 mg/dL</div>
        </div>

        {/* 4. Body Temperature */}
        <div className="card-3d bg-white p-5 rounded-3xl space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
              🌡️
            </div>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isFever
                  ? 'bg-red-200 text-red-950 border border-red-400'
                  : 'bg-blue-100 text-blue-950 border border-blue-300'
              }`}
            >
              {isFever ? 'Fever' : 'Normal'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black pt-1 relative z-10">
            {latest.temperature || 98.6}°F
          </div>
          <div className="text-xs font-black text-gray-800 relative z-10">Body Temperature</div>
          <div className="text-[10px] font-bold text-gray-500 relative z-10">Normal: 97.0–99.0°F</div>
        </div>
      </div>

      {/* ─── 7-DAY VISUAL TREND CHART ─────────────────────────────────────── */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black">
                Weekly Vitals Trend Visualizer
              </h2>
              <p className="text-xs text-gray-500 font-bold">
                Multi-day progression of Blood Pressure, Glucose & Heart Rate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Systolic BP</span>
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Glucose</span>
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Heart Rate</span>
            </span>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="w-full h-44 bg-gray-50 rounded-2xl border-2 border-black p-4 flex items-end justify-between relative overflow-hidden">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-15 pointer-events-none">
            <div className="border-b border-black w-full" />
            <div className="border-b border-black w-full" />
            <div className="border-b border-black w-full" />
          </div>

          {/* Bar Trend Comparison */}
          {[
            { day: 'Mon', bp: 122, glu: 98, hr: 70 },
            { day: 'Tue', bp: 126, glu: 102, hr: 74 },
            { day: 'Wed', bp: 120, glu: 95, hr: 68 },
            { day: 'Thu', bp: 124, glu: 104, hr: 72 },
            { day: 'Fri', bp: 121, glu: 100, hr: 71 },
            { day: 'Sat', bp: 123, glu: 99, hr: 73 },
            { day: 'Today', bp: latest.systolicBp || 120, glu: latest.bloodGlucose || 100, hr: latest.heartRate || 72 }
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 z-10">
              <div className="flex items-end gap-1 h-24">
                <div
                  className="w-2.5 sm:w-3.5 bg-rose-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${(bar.bp / 160) * 100}%` }}
                  title={`BP: ${bar.bp} mmHg`}
                />
                <div
                  className="w-2.5 sm:w-3.5 bg-amber-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${(bar.glu / 180) * 100}%` }}
                  title={`Glucose: ${bar.glu} mg/dL`}
                />
                <div
                  className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${(bar.hr / 110) * 100}%` }}
                  title={`Heart Rate: ${bar.hr} bpm`}
                />
              </div>
              <span className="text-[10px] font-black text-black mt-1">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SMART AI CORRELATION & SUGGESTIONS CARD ───────────────────────── */}
      <div className="card-3d bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-lg shadow-xs">
            ✨
          </div>
          <span className="text-xs font-black uppercase text-gray-800 tracking-wider">
            ABHA AI Holistic Health Recommendations
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {suggestions.map((s, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-relaxed">
              <span>•</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-gray-600">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Vitals data directly synchronizes with your treating doctor and caregiver portal.</span>
        </div>
      </div>

      {/* ─── HISTORICAL LOGS TABLE ────────────────────────────────────────── */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black">
              Logged Vitals History
            </h2>
            <p className="text-xs text-gray-500 font-bold">
              Archived records for your treating physician & caregiver
            </p>
          </div>

          <button
            onClick={fetchVitalsData}
            className="p-2 border border-black rounded-xl hover:bg-gray-100 text-black transition"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {vitals.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs font-bold text-gray-600">
            No vitals recorded yet. Tap "Log Today's Vitals" to add your first entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50 text-black uppercase font-black">
                  <th className="p-3">Date</th>
                  <th className="p-3">BP (mmHg)</th>
                  <th className="p-3">Heart Rate</th>
                  <th className="p-3">Glucose</th>
                  <th className="p-3">Temp (°F)</th>
                  <th className="p-3">Sleep</th>
                  <th className="p-3">Mood</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                {vitals.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-3 font-black text-black">{new Date(row.loggedAt).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-rose-900">{row.systolicBp}/{row.diastolicBp}</td>
                    <td className="p-3 font-bold text-emerald-900">{row.heartRate ? `${row.heartRate} bpm` : '—'}</td>
                    <td className="p-3 font-bold text-amber-900">{row.bloodGlucose ? `${row.bloodGlucose} mg/dL` : '—'}</td>
                    <td className="p-3 font-bold text-blue-900">{row.temperature ? `${row.temperature}°F` : '98.6°F'}</td>
                    <td className="p-3">{row.sleepHours ? `${row.sleepHours} hrs` : '—'}</td>
                    <td className="p-3">{row.mood || 'HAPPY'}</td>
                    <td className="p-3 text-gray-500 max-w-xs truncate">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── LOG VITALS MODAL ─────────────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-black shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h2 className="text-xl font-black text-black">Log Today's Health Vitals</h2>
              <button onClick={() => setShowLogModal(false)} className="text-gray-600 hover:text-black font-black">
                ✕
              </button>
            </div>

            {logSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-500 text-emerald-950 font-black rounded-2xl text-center">
                ✓ Vitals logged and synced with doctor & caregiver dashboard!
              </div>
            ) : (
              <form onSubmit={handleLogSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Systolic BP (mmHg) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 120"
                      value={systolic}
                      onChange={e => setSystolic(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs sm:text-sm font-bold focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Diastolic BP (mmHg) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 80"
                      value={diastolic}
                      onChange={e => setDiastolic(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs sm:text-sm font-bold focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Blood Glucose (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={glucose}
                      onChange={e => setGlucose(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={heartRate}
                      onChange={e => setHeartRate(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Body Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 98.6"
                      value={temperature}
                      onChange={e => setTemperature(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Sleep Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      value={sleepHours}
                      onChange={e => setSleepHours(e.target.value)}
                      className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Stress Level (1 to 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={e => setStressLevel(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Health Notes / Feeling</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Completed morning walk and guided box breathing"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-black font-black text-xs rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800 shadow cursor-pointer active:scale-95"
                  >
                    {submitting ? 'Saving...' : 'Save Vitals Entry'}
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

export default VitalsTrackerView;
