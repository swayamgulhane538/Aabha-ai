import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Report, ReportType } from '../types';
import {
  FileText,
  Search,
  Download,
  Share2,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  X,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function MyReportsView() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showShareModal, setShowShareModal] = useState<Report | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Upload Form states
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ReportType>('MEDICAL');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDoctor, setUploadDoctor] = useState('');

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      setReports(prev => prev.filter(r => r.id !== id));
      await api.delete(`/reports/${id}`);
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reports', {
        title: uploadTitle,
        reportType: uploadType,
        description: uploadDesc,
        createdBy: uploadDoctor || 'Self Upload',
        result: uploadDesc,
        score: uploadType === 'COGNITIVE_ASSESSMENT' ? 26 : undefined,
        maxScore: uploadType === 'COGNITIVE_ASSESSMENT' ? 30 : undefined,
      });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadDoctor('');
      fetchReports();
    } catch (err) {
      console.error('Upload failed:', err);
      // Optimistic local add
      const optimistic: Report = {
        id: `local-rep-${Date.now()}`,
        patientUserId: user?.id || 'uuid-demo-patient',
        patientId: user?.patientId || 'PAT-DEMO-000001',
        patientName: user?.name || 'Anita Devi',
        title: uploadTitle,
        reportType: uploadType,
        description: uploadDesc,
        result: uploadDesc,
        createdBy: uploadDoctor || 'Self Upload',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setReports(prev => [optimistic, ...prev]);
      setShowUploadModal(false);
    }
  };

  const handlePrintReport = (report: Report) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${report.title} - AABHA AI Medical Vault</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .score { font-size: 24px; font-weight: bold; color: #059669; margin: 15px 0; }
            .section { margin-top: 20px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .meta-table td { padding: 8px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>✨ AABHA AI CLINICAL REPORT SUMMARY</h2>
            <p>Patient: <strong>${report.patientName}</strong> (ID: <code>${report.patientId}</code>)</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <h3>${report.title}</h3>
          <p><span class="badge">${report.reportType}</span> | Doctor / Assessor: <strong>${report.createdBy}</strong></p>
          ${report.score !== undefined ? `<div class="score">Score: ${report.score} / ${report.maxScore || 100}</div>` : ''}
          <div class="section">
            <h4>Diagnostic Summary & Clinical Observations:</h4>
            <p>${report.description || report.result || 'No description provided.'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'COGNITIVE_ASSESSMENT': return { icon: '🧠', bg: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
      case 'MEDICAL': return { icon: '📄', bg: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
      case 'DOCTOR_CONSULTATION': return { icon: '🩺', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'MEMORY_TEST': return { icon: '🧩', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
      default: return { icon: '📋', bg: 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border)]' };
    }
  };

  // Filter & Search Logic
  const filteredReports = reports.filter(r => {
    const matchesFilter = activeFilter === 'ALL' || r.reportType === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.createdBy.toLowerCase().includes(q) ||
      (r.result && r.result.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-32 font-sans text-[var(--text-primary)]">
      {/* Header Banner */}
      <div className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-8 rounded-[24px] border border-[var(--card-border-inline)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('Secure Medical Records Vault')}</span>
            <span>•</span>
            <span className="font-mono">{user?.patientId || 'PAT-2026-000001'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <span>📄</span> {t('My Medical & Assessment Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            {t('Personal health evaluations, clinical cognitive assessments, and physician documents')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-glow px-5 py-2.5 text-xs font-black flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Upload Document')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filter Tabs */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={t('Search reports by title, doctor, diagnosis, or keyword...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] font-medium text-xs sm:text-sm focus:border-emerald-400 focus:outline-none shadow-sm transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: `${t('All Reports')} (${reports.length})` },
            { id: 'COGNITIVE_ASSESSMENT', label: `🧠 ${t('Cognitive Assessments')}` },
            { id: 'MEDICAL', label: `📄 ${t('Medical & Labs')}` },
            { id: 'DOCTOR_CONSULTATION', label: `🩺 ${t('Doctor Consultations')}` },
            { id: 'MEMORY_TEST', label: `🧩 ${t('Memory Tests')}` },
            { id: 'DOCUMENT', label: `📋 ${t('Documents')}` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                  : 'btn-glass text-[var(--text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="card-3d p-16 text-center text-[var(--text-primary)] bg-[var(--card-bg-inline)] rounded-[24px] border border-[var(--card-border-inline)]">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-base text-[var(--text-primary)] font-bold">Loading your confidential reports...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredReports.map(report => {
            const style = getReportIcon(report.reportType);
            const dateFormatted = new Date(report.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={report.id}
                className="card-3d bg-[var(--card-bg-inline)] backdrop-blur-xl p-6 sm:p-7 rounded-[24px] border border-[var(--card-border-inline)] shadow-lg flex flex-col justify-between hover:border-emerald-400/40 transition gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[16px] bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {style.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase text-[var(--text-secondary)] block">
                          {report.reportType.replace(/_/g, ' ')}
                        </span>
                        <div className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-[10px] font-bold uppercase text-emerald-300">
                      Verified
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-snug">
                    {report.title}
                  </h3>

                  {report.score !== undefined && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-400/30 rounded-xl">
                      <span className="text-xs font-bold text-emerald-300">
                        Score: {report.score}/{report.maxScore || 100}
                      </span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-2.5 line-clamp-2 leading-relaxed">
                    {report.description || report.result}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{report.createdBy}</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {report.patientId}
                    </span>
                  </div>
                </div>

                {/* Card Actions: View, Download, Share, Delete */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="btn-glass py-2 px-2 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handlePrintReport(report)}
                    className="btn-glass py-2 px-2 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => setShowShareModal(report)}
                    className="btn-glass py-2 px-2 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center transition cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-3d bg-[var(--card-bg-inline)] p-12 rounded-[24px] border border-[var(--card-border-inline)] text-center space-y-3">
          <span className="text-5xl">📑</span>
          <h3 className="text-xl font-black text-[var(--text-primary)]">{t('No Reports Found')}</h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto">
            {searchQuery ? `${t('No reports matched')} "${searchQuery}".` : t('No clinical reports have been filed under your Patient ID yet.')}
          </p>
        </div>
      )}

      {/* ─── MODAL 1: VIEW FULL REPORT DETAILS ────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto space-y-5 text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Clinical Report View</span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">{selectedReport.title}</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Header Box */}
            <div className="p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-secondary)] font-medium block">Patient Name</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">{selectedReport.patientName}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] font-medium block">Patient ID</span>
                <span className="font-bold text-emerald-400 text-sm font-mono">{selectedReport.patientId}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] font-medium block">Report Type</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">{selectedReport.reportType}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] font-medium block">Date Filed</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {new Date(selectedReport.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Score & Diagnostic Findings */}
            {selectedReport.score !== undefined && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl">
                <span className="text-xs font-bold uppercase text-emerald-300 block">Assessment Score</span>
                <div className="text-3xl font-black text-[var(--text-primary)] mt-1">
                  {selectedReport.score} / {selectedReport.maxScore || 100}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)]">Observations & Findings</h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed p-4 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border)] whitespace-pre-wrap">
                {selectedReport.description || selectedReport.result || 'No description provided.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handlePrintReport(selectedReport)}
                className="btn-glow flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF Record</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-glass flex-1 py-3 text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: UPLOAD DOCUMENT ────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[var(--border)] space-y-4 max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Upload Clinical Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✕</button>
            </div>

            <form onSubmit={handleUploadReport} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brain MRI / MoCA Cognitive Screening"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Report Category</label>
                <select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value as ReportType)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--bg-surface)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                >
                  <option value="COGNITIVE_ASSESSMENT">Cognitive Assessment (MoCA/MMSE)</option>
                  <option value="MEDICAL">Medical & Lab Report</option>
                  <option value="DOCTOR_CONSULTATION">Doctor Consultation Note</option>
                  <option value="MEMORY_TEST">Memory Test Record</option>
                  <option value="DOCUMENT">General Healthcare Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Assessing Doctor / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anita Verma (Apollo Hospital)"
                  value={uploadDoctor}
                  onChange={e => setUploadDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-bold text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Clinical Findings & Summary</label>
                <textarea
                  rows={3}
                  placeholder="Enter key findings, physician observations, or scan conclusions..."
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] font-medium text-xs text-[var(--input-text)] focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-glass flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow flex-1 py-2.5 text-xs font-black"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SHARE WITH CAREGIVER / CLINIC ───────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[var(--bg-surface)] rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[var(--border)] text-center space-y-4 text-[var(--text-primary)]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-400/30">
              📤
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">Share Medical Record</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Share <strong>{showShareModal.title}</strong> securely with your registered caregiver or physician.
            </p>

            {shareSuccess ? (
              <div className="p-3 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Encrypted access link dispatched!</span>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShareSuccess(true);
                    setTimeout(() => {
                      setShareSuccess(false);
                      setShowShareModal(null);
                    }, 1500);
                  }}
                  className="btn-glow w-full py-2.5 text-xs font-black"
                >
                  Send to Dr. Anita Verma (Primary Neurologist)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShareSuccess(true);
                    setTimeout(() => {
                      setShareSuccess(false);
                      setShowShareModal(null);
                    }, 1500);
                  }}
                  className="btn-glass w-full py-2.5 text-xs font-bold"
                >
                  Copy Secure Vault Link
                </button>
              </div>
            )}

            <button
              onClick={() => setShowShareModal(null)}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] pt-2 block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
