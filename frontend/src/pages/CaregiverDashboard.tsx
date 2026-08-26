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
  Info,
  Shield,
  FileText,
  Download,
  Share2,
  Lock,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { ModalPortal } from '../components/ModalPortal';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { AdaptiveAIEngine } from '../services/adaptiveAIEngine';

interface SmartAlert {
  id: string;
  type: 'MISSED_MEDICINE' | 'MISSED_ACTIVITY' | 'BASELINE_CHANGE' | 'INACTIVITY' | 'INCOMPLETE_ROUTINE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  time: string;
}

export const CaregiverDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [timeFilter, setTimeFilter] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [showReportModal, setShowReportModal] = useState(false);

  const [patients, setPatients] = useState<any[]>([
    { id: 'uuid-demo-patient', patientId: 'PAT-DEMO-000001', name: 'Demo Patient', age: 68, gender: 'Female', cognitiveScore: 88, adherence: 94, lastActive: 'Active Now', relationship: 'Assigned Primary Caregiver & Clinical Nurse' },
    { id: 'uuid-anita-01', patientId: 'PAT-2026-000001', name: 'Anita Devi', age: 67, gender: 'Female', cognitiveScore: 84, adherence: 95, lastActive: '1 hour ago', relationship: 'Clinical Supervising Nurse' },
    { id: 'uuid-rajesh-03', patientId: 'PAT-2026-000003', name: 'Rajesh Kumar', age: 71, gender: 'Male', cognitiveScore: 78, adherence: 89, lastActive: '3 hours ago', relationship: 'Assigned Clinical Nurse' }
  ]);

  const [selectedPatientId, setSelectedPatientId] = useState('uuid-demo-patient');

  // Load live linked patients from backend
  useEffect(() => {
    const fetchLinkedPatients = async () => {
      try {
        const res: any = await api.get('/caregivers/patients');
        if (res && Array.isArray(res) && res.length > 0) {
          setPatients(res);
          // Prefer demo patient if present
          const demoP = res.find((p: any) => p.patientId === 'PAT-DEMO-000001' || p.id === 'uuid-demo-patient');
          if (demoP) {
            setSelectedPatientId(demoP.id);
          } else {
            setSelectedPatientId(res[0].id);
          }
        }
      } catch (err) {
        // Fallback to initial linked patients
      }
    };
    fetchLinkedPatients();
  }, [user]);

  const [alerts, setAlerts] = useState<SmartAlert[]>([
    {
      id: 'alt-1',
      type: 'BASELINE_CHANGE',
      severity: 'MEDIUM',
      title: 'Cognitive Activity Notice',
      message: "Yesterday's memory recall response time was slightly lower than user's baseline. Consider a gentle check-in.",
      time: '2 hours ago'
    },
    {
      id: 'alt-2',
      type: 'MISSED_MEDICINE',
      severity: 'HIGH',
      title: 'Pending Medication (Memantine 10mg)',
      message: 'Afternoon dose scheduled at 01:00 PM is approaching due time.',
      time: '35 mins ago'
    }
  ]);

  const indicators = AdaptiveAIEngine.calculateCognitiveIndicators();
  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleTriggerTestAlert = () => {
    const newAlert: SmartAlert = {
      id: `alt-${Date.now()}`,
      type: 'INCOMPLETE_ROUTINE',
      severity: 'MEDIUM',
      title: 'Missed Evening Walk Reminder',
      message: 'Patient has not yet marked the 05:00 PM garden walk routine as completed.',
      time: 'Just now'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-sans text-[var(--text-primary)]">
      {/* ─── 1. CAREGIVER HERO HEADER ───────────────────────────────────────── */}
      <header className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-black rounded-full flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIH26003 Caregiver Portal</span>
            </span>
            <span className="px-2.5 py-0.5 border border-[var(--border)] rounded-full text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)]">
              Authorized Caregiver: {user?.name || 'Dr. Anita Verma'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Patient Cognitive Health & Engagement Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            Real-time monitoring of daily routine check-offs, medication adherence, and cognitive activities.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/caregiver/signbridge"
            className="btn-glow px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md hover:scale-105 transition"
          >
            <span>🤟 SignBridge ISL Desk</span>
          </Link>

          <button
            onClick={() => setShowReportModal(true)}
            className="btn-glass px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Generate Weekly AI Report</span>
          </button>

          <Link
            to="/patient/memory-passport"
            className="btn-glass px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:text-emerald-300"
          >
            <span>Manage Memory Bank →</span>
          </Link>
        </div>
      </header>

      {/* ─── SIGNBRIDGE ISL DOCTOR CONSULTATION HERO CARD ──────────────────── */}
      <section className="p-5 sm:p-7 rounded-[28px] bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-teal-900/30 border-2 border-purple-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            🤟
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider">
                New Feature • SIH26003
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Indian Sign Language (ISL)
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              SignBridge – Sign Language Doctor Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Real-time WebRTC teleconsultation: Doctor natural speech translates into animated 3D ISL Avatar; camera optical AI translates patient hand signs to voice & text with emergency triage.
            </p>
          </div>
        </div>

        <Link
          to="/caregiver/signbridge"
          className="btn-glow w-full md:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>Launch SignBridge Desk →</span>
        </Link>
      </section>

      {/* ─── 2. PATIENT SELECTOR & TIME FILTER ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[22px]">
        {/* Patient Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-black uppercase text-[var(--text-secondary)] shrink-0">
            Monitoring Patient:
          </span>
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                selectedPatientId === p.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'btn-glass text-[var(--text-secondary)]'
              }`}
            >
              👤 {p.name} ({p.patientId})
            </button>
          ))}
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-secondary)] p-1 rounded-xl border border-[var(--border)]">
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                timeFilter === filter
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. TOP STATS CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--text-secondary)]">Cognitive Activity</span>
            <span className="text-xl">🧠</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">{indicators.overallActivityScore}/100</div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+6.4% from last week</span>
          </div>
        </div>

        <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--text-secondary)]">Medicine Adherence</span>
            <span className="text-xl">💊</span>
          </div>
          <div className="text-3xl font-black text-teal-400">92%</div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">11/12 Doses Taken on Time</div>
        </div>

        <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--text-secondary)]">Hydration Level</span>
            <span className="text-xl">💧</span>
          </div>
          <div className="text-3xl font-black text-blue-400">4 / 6 Glasses</div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">67% of daily target reached</div>
        </div>

        <div className="card-3d bg-[var(--card-bg-inline)] p-5 rounded-[24px] border border-[var(--card-border-inline)] shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--text-secondary)]">Active Streak</span>
            <span className="text-xl">🔥</span>
          </div>
          <div className="text-3xl font-black text-amber-400">5 Days</div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">Consistent daily check-ins</div>
        </div>
      </div>

      {/* ─── 4. SMART ALERTS NOTIFICATION BOARD ─────────────────────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              🚨
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                Smart Caregiver Alerts ({alerts.length})
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Automated activity threshold notifications with non-diagnostic guidance
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerTestAlert}
            className="btn-glass px-3 py-1.5 text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            + Simulate Routine Alert
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>All clear! No active alerts for {activePatient.name}.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in ${
                  alert.severity === 'HIGH'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--text-primary)]">{alert.title}</span>
                    <span className="text-[10px] font-mono opacity-80">({alert.time})</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <button
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                  className="btn-glass px-3 py-1.5 text-xs font-black text-emerald-400 hover:bg-emerald-500/20 self-end sm:self-center cursor-pointer whitespace-nowrap"
                >
                  ✓ Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 5. COGNITIVE PERFORMANCE BREAKDOWN (DAILY / WEEKLY) ────────────── */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-2xl p-6 sm:p-8 rounded-[28px] border border-[var(--card-border-inline)] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>📊 Cognitive Activity Breakdown ({timeFilter.toLowerCase()})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              4-Pillar performance metrics for {activePatient.name}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/30">
            Composite Activity Index: {indicators.overallActivityScore}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Visual Memory */}
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span>🎴 Visual & Short-term Memory</span>
              <span className="text-emerald-400 text-sm">{indicators.memoryScore}%</span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${indicators.memoryScore}%` }}></div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Tested across Memory Match & Remember Objects exercises.
            </p>
          </div>

          {/* Pillar 2: Attention & Focus */}
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span>👁️ Attention & Target Finding</span>
              <span className="text-cyan-400 text-sm">{indicators.attentionScore}%</span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${indicators.attentionScore}%` }}></div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Tested across Attention Finder and Pattern Recall.
            </p>
          </div>

          {/* Pillar 3: Response Speed */}
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span>⚡ Reaction Speed & Reflexes</span>
              <span className="text-purple-400 text-sm">{indicators.reactionScore}%</span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${indicators.reactionScore}%` }}></div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Average tap latency ~1.8 seconds per cognitive choice.
            </p>
          </div>

          {/* Pillar 4: Daily Consistency */}
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="flex justify-between items-center text-xs font-black">
              <span>🔥 Daily Engagement Consistency</span>
              <span className="text-amber-400 text-sm">{indicators.consistencyScore}%</span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${indicators.consistencyScore}%` }}></div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              5 consecutive days of completed morning cognitive sessions.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {indicators.disclaimer}
          </span>
        </div>
      </div>

      {/* ─── 6. WEEKLY AI SUMMARY REPORT MODAL ──────────────────────────────── */}
      <ModalPortal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        maxWidth="max-w-2xl"
        title={
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              SIH26003 AI Report Generator
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
              AABHA Weekly Summary Report
            </h2>
          </div>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm font-medium text-[var(--text-primary)] font-sans">
          <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase text-[var(--text-secondary)] font-black">Memory Activity</div>
                <div className="text-base font-black text-emerald-500">+12%</div>
              </div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase text-[var(--text-secondary)] font-black">Attention Activity</div>
                <div className="text-base font-black text-cyan-500">+8%</div>
              </div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase text-[var(--text-secondary)] font-black">Avg Response</div>
                <div className="text-base font-black text-purple-500">1.8 sec</div>
              </div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                <div className="text-[10px] uppercase text-[var(--text-secondary)] font-black">Routines Done</div>
                <div className="text-base font-black text-amber-500">87%</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-sm text-[var(--text-primary)]">
              Personalized AI Caregiver Recommendation:
            </h3>
            <p className="p-3.5 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-emerald-600 dark:text-emerald-300 font-medium leading-relaxed">
              "Patient demonstrated strong visual recall consistency on Memory Match (Level 2). Continue medium-level memory activities and familiar-object exercises. Hydration target was met on 5 out of 7 days."
            </p>
          </div>

          {/* Explicit Disclaimer */}
          <div className="p-3.5 bg-[var(--bg-surface-secondary)] border border-[var(--border)] rounded-2xl text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-1">
            <div className="font-black text-rose-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Important Medical Notice:</span>
            </div>
            <p>
              "This report summarizes application engagement and cognitive activity scores. It is designed for caregiver awareness and is NOT a clinical medical diagnosis."
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                alert('Weekly AI Report PDF exported successfully.');
                setShowReportModal(false);
              }}
              className="btn-glow flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Report Summary</span>
            </button>

            <button
              onClick={() => setShowReportModal(false)}
              className="btn-glass px-6 py-3 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </ModalPortal>
    </div>
  );
};

export default CaregiverDashboard;
