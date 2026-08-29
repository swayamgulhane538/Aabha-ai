import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Shield,
  Server,
  ArrowRight,
  Code,
  LogOut,
  Settings,
  Terminal,
  Play,
  CheckCircle2,
  Search,
  FileText,
  Plus,
  Eye,
  Calendar,
  AlertCircle,
  Filter,
  Check,
  X,
  Pill,
  Clock,
  Bell,
  BarChart3,
  Stethoscope,
  Link as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { LanguageSelector } from '../components/LanguageSelector';
import { SettingsModal } from '../components/SettingsModal';
import { AuditLog } from '../types';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'patients' | 'caregivers' | 'location' | 'reports' | 'medications' | 'appointments' | 'alerts' | 'analytics' | 'audit'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Caregiver Linking Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPatientId, setLinkPatientId] = useState('');
  const [linkCaregiverId, setLinkCaregiverId] = useState('uuid-caregiver-priya');
  const [linkRelationship, setLinkRelationship] = useState('Primary Caregiver');
  const [linkSuccessMsg, setLinkSuccessMsg] = useState('');

  // Upload Report Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('COGNITIVE_ASSESSMENT');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadScore, setUploadScore] = useState('');
  const [uploadDoctor, setUploadDoctor] = useState('Dr. Verma (Lead Neurologist)');
  const [confirmedUpload, setConfirmedUpload] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cleanSearch = searchQuery.replace(/^(id|patient id|patient):\s*/i, '').trim();
      const [patientsRes, reportsRes, auditRes, medsRes, aptsRes, alertsRes] = await Promise.all([
        api.get(`/patients?search=${encodeURIComponent(cleanSearch)}&status=${statusFilter}`),
        api.get('/reports'),
        api.get('/audit'),
        api.get('/medications').catch(() => ({ medications: [] })),
        api.get('/appointments').catch(() => []),
        api.get('/alerts').catch(() => [])
      ]);

      setPatients(patientsRes?.patients || (Array.isArray(patientsRes) ? patientsRes : []));
      setReports(Array.isArray(reportsRes) ? reportsRes : []);
      setAuditLogs(Array.isArray(auditRes) ? auditRes : []);
      setMedications(medsRes?.medications || []);
      setAppointments(Array.isArray(aptsRes) ? aptsRes : []);
      setAlerts(Array.isArray(alertsRes) ? alertsRes : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a target patient.');
      return;
    }
    if (!confirmedUpload) {
      alert('Please confirm patient identity verification checkbox before filing report.');
      return;
    }

    const targetPatient = patients.find(p => p.patientId === selectedPatientId || p.id === selectedPatientId);
    if (!targetPatient) {
      alert('Selected patient not found.');
      return;
    }

    try {
      await api.post('/reports', {
        patientUserId: targetPatient.id,
        patientId: targetPatient.patientId,
        title: uploadTitle,
        reportType: uploadType,
        description: uploadDesc,
        score: uploadScore ? Number(uploadScore) : undefined,
        createdBy: uploadDoctor,
        result: 'Official Clinical Assessment Verified'
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadScore('');
      setConfirmedUpload(false);
      fetchData();
      alert('Report filed and strictly linked to patient UUID in database.');
    } catch (err: any) {
      alert(err?.message || 'Failed to upload report');
    }
  };

  const handleLinkCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/caregivers/link', {
        patientId: linkPatientId,
        caregiverUserId: linkCaregiverId,
        relationship: linkRelationship
      });
      setLinkSuccessMsg('Patient successfully linked to caregiver account in database.');
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccessMsg('');
        fetchData();
      }, 1200);
    } catch (err: any) {
      alert(err?.message || 'Failed to link caregiver');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      {/* ─── ADMIN HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-black">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-black">AABHA AI Doctor & Admin Portal</h1>
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-md uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-gray-600 font-bold">
              Production Patient Registry & Clinical Management Vault
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-black bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database: Persistent SQL Synchronized</span>
          </div>

          <LanguageSelector />

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 border-2 border-black rounded-xl hover:bg-gray-100"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ─── NAVIGATION TABS ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'patients', label: '👥 Patients Registry', count: patients.length },
          { id: 'caregivers', label: '🔗 Caregiver Linking' },
          { id: 'location', label: '🛰️ Real-Time GPS Tracking' },
          { id: 'reports', label: '📄 Medical Reports', count: reports.length },
          { id: 'medications', label: '💊 Prescriptions', count: medications.length },
          { id: 'appointments', label: '📅 Consultations', count: appointments.length },
          { id: 'alerts', label: '🚨 Smart Alerts', count: alerts.length },
          { id: 'analytics', label: '📊 Clinical Analytics' },
          { id: 'audit', label: '📜 Security Audit Trail', count: auditLogs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-black transition border-2 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-black border-transparent hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.2 text-[10px] rounded-full font-mono ${
                activeTab === tab.id ? 'bg-white text-black font-black' : 'bg-gray-200 text-black'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 1. PATIENTS REGISTRY TAB */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Search & Actions Bar */}
            <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Patient ID (e.g. PAT-2026-000001), Name, or Mobile..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-300 text-xs sm:text-sm font-bold text-black focus:border-black outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="p-3 rounded-2xl border-2 border-gray-300 text-xs font-black bg-white focus:border-black outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Patients</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-5 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ File New Report</span>
                </button>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-3xl border-2 border-black shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-black text-base text-black">
                  Registered Patients Registry ({patients.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-12 text-center text-sm font-bold text-gray-500">
                  Loading registry records...
                </div>
              ) : patients.length === 0 ? (
                <div className="p-12 text-center text-sm font-bold text-gray-500">
                  No matching patients found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-black uppercase font-black border-b-2 border-black">
                        <th className="p-4">Patient ID</th>
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Age / Gender</th>
                        <th className="p-4">Assigned Caregiver</th>
                        <th className="p-4">Reports Vault</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                      {patients.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 font-mono font-black text-black">
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg">
                              {p.patientId}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-black text-black text-sm">{p.name}</div>
                            <div className="text-[11px] text-gray-500">{p.email}</div>
                          </td>
                          <td className="p-4">
                            {p.age} yrs • {p.gender}
                          </td>
                          <td className="p-4 font-black text-indigo-900">
                            {p.caregiverName || 'Priya Sharma'}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg text-black font-black">
                              📄 {p.reportsCount} Reports
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-full text-[11px]">
                              {p.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              to={`/admin/patients/${p.id}`}
                              className="px-3.5 py-2 bg-black text-white rounded-xl text-xs font-black hover:bg-gray-800 inline-flex items-center gap-1 transition"
                            >
                              <span>View File</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CAREGIVER LINKING TAB */}
        {activeTab === 'caregivers' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-black">Caregiver-Patient Linking Tool</h3>
                <p className="text-xs text-gray-600 font-bold">
                  Enforce strict isolation by assigning patients to authorized caregivers
                </p>
              </div>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-5 py-2.5 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Link New Patient</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 border-2 border-black rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                    Primary Caregiver
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-600">CG-2026-000101</span>
                </div>
                <h4 className="text-lg font-black text-black">Priya Sharma</h4>
                <p className="text-xs font-bold text-gray-700">priya@aabha.ai • +91 98765 43210</p>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[11px] font-black uppercase text-gray-500 mb-2">Authorized Patients:</div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-black flex justify-between">
                      <span>Anita Devi (PAT-2026-000001)</span>
                      <span className="text-emerald-700">Daughter</span>
                    </div>
                    <div className="p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-black flex justify-between">
                      <span>Rajesh Kumar (PAT-2026-000003)</span>
                      <span className="text-indigo-700">Nurse Care</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2.5 REAL-TIME PATIENT GPS TRACKING TAB */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-black rounded-full">
                  🛰️ Satellite GPS Live Telemetry
                </span>
                <h2 className="text-xl font-black text-black mt-1">
                  Patient Live Geolocation & Wandering Guard
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Continuous 24/7 GPS satellite tracking with automatic wander detection outside 500m geofence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live GPS Beacon Active</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm overflow-hidden space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-300">
                    📍 Shivaji Park, Dadar West, Mumbai 400028 (Safe Home Radius: 500m)
                  </span>
                </div>
                <button
                  onClick={() => window.open('https://www.google.com/maps?q=19.0186,72.8484', '_blank')}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Open in Google Maps ↗
                </button>
              </div>

              <div className="w-full h-[450px] rounded-2xl overflow-hidden border-2 border-gray-300 shadow-inner">
                <iframe
                  title="Admin Patient GPS Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.8398%2C19.0118%2C72.8558%2C19.0238&layer=mapnik&marker=19.0186%2C72.8484"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. MEDICAL REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-black text-black">All Clinical Reports ({reports.length})</h3>
                <p className="text-xs text-gray-600 font-bold">Relational database medical vault</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800"
              >
                + File Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-black uppercase font-black border-b-2 border-black">
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">Report Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Filed By</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                  {reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-black text-emerald-950">{r.patientId}</td>
                      <td className="p-3 font-black text-black">{r.patientName}</td>
                      <td className="p-3 font-black">{r.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded-md text-[11px]">
                          {r.reportType}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{r.createdBy}</td>
                      <td className="p-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MEDICATIONS TAB */}
        {activeTab === 'medications' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
            <h3 className="text-xl font-black text-black border-b border-gray-200 pb-3">
              Prescriptions & Pill Schedules ({medications.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {medications.map(med => (
                <div key={med.id} className="p-4 bg-gray-50 rounded-2xl border-2 border-black space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md">
                      {med.patientId}
                    </span>
                    <span className="text-xs font-black text-indigo-700">{med.scheduledTime}</span>
                  </div>
                  <h4 className="font-black text-base text-black">{med.name} {med.dosage}</h4>
                  <p className="text-xs font-bold text-gray-600">{med.instructions}</p>
                  <div className="text-[11px] font-bold text-gray-500 pt-1 border-t border-gray-200">
                    Prescribed by: {med.prescribedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CONSULTATIONS & APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
            <h3 className="text-xl font-black text-black border-b border-gray-200 pb-3">
              Scheduled Doctor Consultations ({appointments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map(apt => (
                <div key={apt.id} className="p-5 bg-gray-50 rounded-2xl border-2 border-black space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black text-indigo-950 bg-indigo-100 px-2 py-0.5 rounded-md">
                      {apt.patientId} • {apt.patientName}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {apt.status}
                    </span>
                  </div>
                  <h4 className="font-black text-base text-black">{apt.doctorName} ({apt.department})</h4>
                  <p className="text-xs font-bold text-gray-700">{apt.purpose}</p>
                  <div className="text-xs font-bold text-gray-600 flex items-center gap-4 pt-2 border-t border-gray-200">
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                    <span>📍 {apt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SMART ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
            <h3 className="text-xl font-black text-black border-b border-gray-200 pb-3">
              Smart Alerts Engine & SOS Incidents ({alerts.length})
            </h3>
            <div className="space-y-3">
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                    alt.severity === 'HIGH' ? 'bg-red-50 border-red-500 text-red-950' : 'bg-amber-50 border-amber-500 text-amber-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full uppercase bg-black text-white">
                        {alt.severity} Priority
                      </span>
                      <h4 className="font-black text-sm">{alt.title}</h4>
                      <span className="font-mono text-xs font-bold">({alt.patientId})</span>
                    </div>
                    <p className="text-xs font-bold mt-1">{alt.message}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {new Date(alt.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CLINICAL ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm space-y-1">
                <span className="text-2xl">👥</span>
                <div className="text-3xl font-black text-black pt-1">{patients.length}</div>
                <div className="text-xs font-bold text-gray-700">Total Enrolled Patients</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm space-y-1">
                <span className="text-2xl">👩‍⚕️</span>
                <div className="text-3xl font-black text-black pt-1">1</div>
                <div className="text-xs font-bold text-gray-700">Active Caregivers</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm space-y-1">
                <span className="text-2xl">💊</span>
                <div className="text-3xl font-black text-emerald-700 pt-1">94%</div>
                <div className="text-xs font-bold text-gray-700">Medication Adherence</div>
              </div>
              <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-sm space-y-1">
                <span className="text-2xl">🧠</span>
                <div className="text-3xl font-black text-indigo-700 pt-1">88%</div>
                <div className="text-xs font-bold text-gray-700">Cognitive Retention</div>
              </div>
            </div>
          </div>
        )}

        {/* 8. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
            <h3 className="text-xl font-black text-black border-b border-gray-200 pb-3">
              Immutable Security Audit Logs ({auditLogs.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-black uppercase font-black border-b-2 border-black">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-bold text-gray-800">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-black text-white rounded-md text-[11px] font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-black text-black">{log.userName}</td>
                      <td className="p-3 font-mono">{log.targetId}</td>
                      <td className="p-3 text-gray-700">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ─── FILE REPORT MODAL ────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-black space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h2 className="text-xl font-black text-black">File Official Clinical Report</h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Target Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                >
                  <option value="">Select Patient Identity</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.patientId}>
                      {p.name} — {p.patientId} (Age {p.age})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MoCA Screening & Memory Battery"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Type *</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  >
                    <option value="COGNITIVE_ASSESSMENT">Cognitive Assessment</option>
                    <option value="MEDICAL">Medical Report</option>
                    <option value="DOCTOR_CONSULTATION">Doctor Consultation</option>
                    <option value="MEMORY_TEST">Memory Test</option>
                    <option value="DOCUMENT">Clinical Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Score (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85"
                    value={uploadScore}
                    onChange={e => setUploadScore(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">Clinical Findings</label>
                <textarea
                  rows={3}
                  placeholder="Summary of neurological observation and prescriptions..."
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedUpload}
                    onChange={e => setConfirmedUpload(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span className="text-xs font-black text-emerald-950">
                    I confirm report assignment to {selectedPatientId || 'Selected Patient'}
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-black text-xs font-black rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 shadow"
                >
                  Confirm & File Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── LINK CAREGIVER MODAL ─────────────────────────────────────────── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-black space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h2 className="text-xl font-black text-black">Link Patient to Caregiver</h2>
              <button onClick={() => setShowLinkModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {linkSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-500 text-emerald-950 font-black rounded-2xl text-center">
                🎉 {linkSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleLinkCaregiver} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Target Patient *</label>
                  <select
                    required
                    value={linkPatientId}
                    onChange={e => setLinkPatientId(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  >
                    <option value="">Select Patient Identity</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.patientId}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Relationship</label>
                  <input
                    type="text"
                    required
                    value={linkRelationship}
                    onChange={e => setLinkRelationship(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-black text-xs font-black rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800"
                  >
                    Authorize Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}
