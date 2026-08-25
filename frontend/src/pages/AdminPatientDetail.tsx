import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Report, Assessment, AuditLog } from '../types';
import {
  ArrowLeft,
  User,
  Shield,
  FileText,
  Activity,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  X
} from 'lucide-react';

export default function AdminPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<any>('MEDICAL');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadScore, setUploadScore] = useState('');
  const [uploadDoctor, setUploadDoctor] = useState('Dr. Verma (Lead Neurologist)');
  const [confirmedUpload, setConfirmedUpload] = useState(false);

  useEffect(() => {
    fetchPatientDetail();
  }, [id]);

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${id}`);
      setPatientData(res);
    } catch (err) {
      console.error('Failed to load patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedUpload) {
      alert('Please confirm patient identity verification checkbox before filing report.');
      return;
    }

    try {
      await api.post('/reports', {
        patientUserId: patientData?.patient?.id,
        patientId: patientData?.patient?.patientId,
        title: uploadTitle,
        reportType: uploadType,
        description: uploadDesc,
        score: uploadScore ? Number(uploadScore) : undefined,
        createdBy: uploadDoctor,
        result: 'Official Clinical Report Verified by Admin'
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadScore('');
      setConfirmedUpload(false);
      fetchPatientDetail();
    } catch (err: any) {
      alert(err?.message || 'Failed to upload report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-12 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xl font-black text-black">Loading Patient Clinical Record...</p>
      </div>
    );
  }

  if (!patientData?.patient) {
    return (
      <div className="min-h-screen bg-white p-12 text-center space-y-4">
        <h2 className="text-2xl font-black text-black">Patient Record Not Found</h2>
        <button
          onClick={() => navigate('/admin')}
          className="px-6 py-2.5 bg-white border-2 border-black rounded-xl font-black"
        >
          ← Back to Registry
        </button>
      </div>
    );
  }

  const { patient, reports, assessments, caregiver, auditLogs } = patientData;

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-black hover:underline font-black text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Registry</span>
        </button>

        {/* Patient Profile Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-black flex items-center justify-center text-3xl shrink-0 shadow-sm">
              👵
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-500 text-emerald-950 font-mono font-black text-sm rounded-full">
                  {patient.patientId}
                </span>
                <span className="px-2.5 py-0.5 border border-black rounded-full text-xs font-black">
                  Age: {patient.age || 65} yrs
                </span>
                <span className="px-2.5 py-0.5 border border-gray-300 rounded-full text-xs font-bold text-gray-700">
                  {patient.gender}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-black">
                {patient.name}
              </h1>

              <div className="text-xs text-gray-700 font-bold flex flex-wrap gap-4 pt-1">
                <span>📧 {patient.email}</span>
                <span>📞 {patient.phone || 'No phone'}</span>
                <span>📍 {patient.address || 'Address unlisted'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-3 bg-white border-2 border-black hover:bg-gray-50 text-black font-black text-sm rounded-2xl shadow-sm transition flex items-center gap-2 self-start md:self-center"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Upload Clinical Report</span>
          </button>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Emergency & Caregiver info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm space-y-3">
              <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>👨‍👩‍👧</span>
                <span>Assigned Caregiver</span>
              </h3>
              {caregiver ? (
                <div className="space-y-1.5 text-xs font-bold text-gray-800">
                  <div className="text-sm font-black text-black">{caregiver.name}</div>
                  <div className="text-gray-600">{caregiver.relationship || 'Primary Caregiver'}</div>
                  <div>📧 {caregiver.email}</div>
                  <div>📞 {caregiver.phone || '+91 98765 43210'}</div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-bold">No linked caregiver in database.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm space-y-3">
              <h3 className="text-base font-black text-black flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>🚨</span>
                <span>Emergency Contact</span>
              </h3>
              <p className="text-xs font-bold text-gray-800 leading-relaxed">
                {patient.emergencyContact || 'None provided'}
              </p>
            </div>
          </div>

          {/* Column 2 & 3: Reports & Assessments */}
          <div className="md:col-span-2 space-y-6">
            {/* Reports Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
                  <span>📄</span>
                  <span>Medical & Assessment Reports ({reports?.length || 0})</span>
                </h3>
                <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Linked to UUID: {patient.id.slice(0, 12)}...
                </span>
              </div>

              {reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((r: Report) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-black transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full border border-black bg-gray-50">
                            {r.reportType}
                          </span>
                          <span className="text-xs text-gray-500 font-bold">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-black mt-1">{r.title}</h4>
                        {r.score !== undefined && (
                          <span className="text-xs font-black text-emerald-800">
                            Score: {r.score}/{r.maxScore || 100}
                          </span>
                        )}
                        <p className="text-xs text-gray-600 font-bold mt-1 line-clamp-1">
                          {r.description || r.result}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-3 py-1.5 bg-white border border-black hover:bg-gray-50 text-black text-xs font-black rounded-xl"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-bold p-4 bg-gray-50 rounded-2xl text-center">
                  No medical reports filed for this patient yet.
                </p>
              )}
            </div>

            {/* Assessments Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-black flex items-center gap-2 border-b border-gray-200 pb-3">
                <span>🧠</span>
                <span>Clinical Cognitive Assessments ({assessments?.length || 0})</span>
              </h3>

              {assessments && assessments.length > 0 ? (
                <div className="space-y-3">
                  {assessments.map((a: Assessment) => (
                    <div key={a.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-black">{a.assessmentType}</span>
                        <span className="font-bold text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm font-black text-emerald-800">
                        Score: {a.score}/{a.maxScore} — {a.result}
                      </div>
                      {a.notes && <p className="text-xs text-gray-600 font-bold">{a.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-bold p-4 bg-gray-50 rounded-2xl text-center">
                  No assessments recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-black space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h2 className="text-xl font-black text-black">Upload Report for Patient</h2>
                <button onClick={() => setShowUploadModal(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Strict Assignment Verification Banner */}
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl space-y-1">
                <div className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Verified Target Assignment</span>
                </div>
                <div className="text-sm font-black text-black">
                  This report will be permanently assigned to:
                </div>
                <div className="text-base font-black text-amber-950">
                  {patient.name} ({patient.patientId})
                </div>
                <div className="text-[11px] text-gray-600 font-mono">
                  Internal UUID: {patient.id}
                </div>
              </div>

              <form onSubmit={handleUploadReport} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Report Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brain MRI / Neuropsychological Battery"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Report Type</label>
                    <select
                      value={uploadType}
                      onChange={e => setUploadType(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold bg-white focus:border-black outline-none"
                    >
                      <option value="COGNITIVE_ASSESSMENT">Cognitive Battery</option>
                      <option value="MEDICAL">Medical Report</option>
                      <option value="DOCTOR_CONSULTATION">Doctor Consultation</option>
                      <option value="MEMORY_TEST">Memory Test</option>
                      <option value="PROGRESS_SUMMARY">Progress Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black uppercase mb-1">Score (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 85"
                      value={uploadScore}
                      onChange={e => setUploadScore(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">Clinical Findings</label>
                  <textarea
                    placeholder="Enter diagnostic evaluation, prescription notes, and recommendations..."
                    value={uploadDesc}
                    onChange={e => setUploadDesc(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold h-20 focus:border-black outline-none"
                  />
                </div>

                {/* Identity Verification Checkbox */}
                <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedUpload}
                    onChange={e => setConfirmedUpload(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-xs font-black text-black">
                    I confirm this report belongs strictly to {patient.name} ({patient.patientId})
                  </span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-black font-black text-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white border-2 border-black text-black font-black text-sm rounded-xl hover:bg-gray-50 shadow"
                  >
                    Save & File Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
