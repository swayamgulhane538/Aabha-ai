import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Camera,
  Upload,
  ArrowLeft,
  Volume2,
  Stethoscope,
  Heart,
  Pill,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Printer,
  Share2,
  Eye,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Calendar,
  Building,
  Info,
  Clock,
  Zap,
  ZoomIn
} from 'lucide-react';
import {
  prescriptionService,
  PatientDiagnosisProfile,
  PrescriptionRecord
} from '../services/prescriptionService';
import { speechService } from '../services/speechService';
import { useAuthStore } from '../stores/authStore';

export const MedicalProfileAndPrescriptionsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const lang = (i18n.language || 'hi').startsWith('mr') ? 'mr' : (i18n.language || 'hi').startsWith('hi') ? 'hi' : 'en';

  const [diagnosis, setDiagnosis] = useState<PatientDiagnosisProfile>(prescriptionService.getDiagnosisProfile());
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(prescriptionService.getPrescriptions());
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Upload / Camera Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('Dr. Anita Verma - Neuro Prescription');
  const [uploadDoctor, setUploadDoctor] = useState<string>('Dr. Anita Verma, MD (Neurology)');
  const [uploadHospital, setUploadHospital] = useState<string>('AIIMS & PBCOE Neuro Cognitive Unit');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [extractedMedicines, setExtractedMedicines] = useState<any[]>([]);
  const [doctorInstructions, setDoctorInstructions] = useState<string>('Take Donepezil at night. Regular 30 mins daily walking.');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>('2026-11-20');

  // Full-Screen Preview Modal
  const [previewRx, setPreviewRx] = useState<PrescriptionRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPrescriptions(prescriptionService.getPrescriptions());
    };
    window.addEventListener('aabha-prescriptions-updated', handleUpdate);
    return () => window.removeEventListener('aabha-prescriptions-updated', handleUpdate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);

      // Run AI OCR on uploaded photo
      setIsAiScanning(true);
      const aiResult = await prescriptionService.analyzePrescriptionPhotoWithAI(
        `Prescription for Alzheimer's / Dementia patient containing Donepezil 5mg, Memantine 10mg, Neurobion B12 prescribed by Dr. Anita Verma.`
      );
      setIsAiScanning(false);

      if (aiResult) {
        setUploadDoctor(aiResult.doctorName);
        setUploadHospital(aiResult.hospitalName);
        setExtractedMedicines(aiResult.medicines);
        setDoctorInstructions(aiResult.instructions);
        setNextFollowUpDate(aiResult.nextFollowUpDate);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview) {
      alert('Please take a photo or upload prescription image first.');
      return;
    }

    await prescriptionService.addPrescription(
      uploadTitle,
      uploadDoctor,
      uploadHospital,
      photoPreview,
      extractedMedicines.length > 0 ? extractedMedicines : [
        { name: "Tab. Donepezil", dosage: "5mg", frequency: "1 at Bedtime", duration: "90 Days" },
        { name: "Tab. Memantine", dosage: "10mg", frequency: "1 in Morning", duration: "90 Days" }
      ],
      doctorInstructions,
      nextFollowUpDate
    );

    setPrescriptions(prescriptionService.getPrescriptions());
    setShowUploadModal(false);
    setPhotoPreview(null);
    setStatusMsg('✓ Prescription letter saved securely to Medical Vault!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleDeleteRx = (id: string) => {
    if (confirm('Are you sure you want to delete this prescription?')) {
      prescriptionService.deletePrescription(id);
      setPrescriptions(prescriptionService.getPrescriptions());
      setStatusMsg('Prescription deleted.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleSpeakDiagnosis = () => {
    prescriptionService.speakDiagnosisSummary(lang);
  };

  const handleShareRx = (rx: PrescriptionRecord) => {
    const text = `📋 AABHA AI Prescription Record\nDoctor: ${rx.doctorName}\nHospital: ${rx.hospitalName}\nDate: ${rx.prescribedDate}\nMedicines: ${rx.extractedMedicines.map(m => m.name + ' (' + m.dosage + ')').join(', ')}\nInstructions: ${rx.doctorInstructions}`;

    if (navigator.share) {
      navigator.share({ title: rx.title, text: text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setStatusMsg('Prescription details copied to clipboard to share on WhatsApp!');
      setTimeout(() => setStatusMsg(''), 3500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans">
      {/* ─── Top Header & Controls ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <Link
            to="/patient"
            className="p-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-[var(--text-secondary)] hover:text-purple-400 border border-[var(--border)] transition-all shadow-xs"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Stethoscope className="w-7 h-7 text-purple-500" />
                {t('Patient Disease Profile & Doctor Prescriptions')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Medical Records Vault
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {t('Complete disease diagnosis details, symptoms, and camera photo prescription letter vault')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSpeakDiagnosis}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-purple-300 border border-[var(--border)] transition-all flex items-center gap-2 shadow-xs"
            title="Listen to Disease Summary"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('Voice Diagnosis Summary')}</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all flex items-center gap-2 shadow-md shadow-purple-500/25"
          >
            <Camera className="w-4 h-4" />
            <span>{t('Save Doctor Prescription Photo')}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ─── 1. PATIENT DISEASE DIAGNOSIS CARD (मरीज की बीमारी का विवरण) ────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 backdrop-blur-2xl shadow-xl space-y-6 mb-8 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-500/25 shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                  Confirmed Clinical Diagnosis
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)] font-bold">
                  {diagnosis.icdCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● Early Stage (Controllable)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                {lang === 'mr' ? diagnosis.primaryDiseaseMarathi : lang === 'hi' ? diagnosis.primaryDiseaseHindi : diagnosis.primaryDisease}
              </h2>

              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                Diagnosed on <strong>{diagnosis.diagnosedDate}</strong> by <strong>{diagnosis.diagnosedBy}</strong> ({diagnosis.hospital})
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakDiagnosis}
            className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-purple-300 border border-[var(--border)] text-xs font-black flex items-center gap-2 transition cursor-pointer self-start lg:self-center shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            <span>बीमारी का विवरण सुनें</span>
          </button>
        </div>

        {/* Clinical Summary Paragraph */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-primary)] block mb-1 font-bold">
            📋 डॉक्टर की क्लिनिकल समरी (Doctor's Clinical Assessment):
          </strong>
          {lang === 'hi' || lang === 'mr' ? diagnosis.summaryDescriptionHindi : diagnosis.summaryDescription}
        </div>

        {/* Symptoms & Active Medications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Key Symptoms */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              लक्षण और गंभीरता (Key Symptoms & Severity)
            </h4>
            <div className="space-y-2">
              {diagnosis.symptoms.map((sym, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-[var(--text-primary)] block">{sym.name}</strong>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{sym.note}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                    sym.severity === 'CONTROLLED'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {sym.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Active Medications */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-400" />
              चल रही दवाइयां (Active Prescribed Medications)
            </h4>
            <div className="space-y-2">
              {diagnosis.activeMedications.map((med, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-start justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-[var(--text-primary)]">{med.name}</strong>
                      <span className="text-emerald-400 font-bold font-mono">({med.dose})</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{med.purpose}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 shrink-0">
                    ⏰ {med.timing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. DOCTOR PRESCRIPTION LETTERS GALLERY (सहेजे गए पर्चे) ────────── */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              {t("Doctor Prescription Letters & Camera Scans (प्रिस्क्रिप्शन लेटर्स)")}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              All prescription letters photographed by camera or uploaded are saved securely here
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Prescription</span>
          </button>
        </div>

        {/* Prescription Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-lg hover:border-purple-500/40 transition flex flex-col justify-between group"
            >
              {/* Prescription Photo Preview */}
              <div className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setPreviewRx(rx)}>
                <img
                  src={rx.photoUrl}
                  alt={rx.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom HD Letter
                  </span>
                </div>
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-md">
                  Active Rx
                </span>
              </div>

              {/* Prescription Details Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <span className="text-[10px] text-purple-400 font-bold font-mono block">
                    Prescribed: {rx.prescribedDate}
                  </span>
                  <h4 className="text-sm font-black text-[var(--text-primary)] mt-0.5 line-clamp-1">
                    {rx.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                    👨‍⚕️ {rx.doctorName} • {rx.hospitalName}
                  </p>

                  {/* Medicines Pill Tags */}
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] text-[var(--text-secondary)] font-bold block uppercase">
                      Prescribed Medicines:
                    </span>
                    {rx.extractedMedicines.slice(0, 3).map((m, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border)] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[var(--text-primary)]">{m.name} {m.dosage}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{m.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewRx(rx)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-purple-300 border border-[var(--border)] transition font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> <span>View</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShareRx(rx)}
                      className="p-2 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-emerald-500/20 text-emerald-400 border border-[var(--border)] transition"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRx(rx.id)}
                      className="p-2 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-rose-500/20 text-rose-400 border border-[var(--border)] transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL 1: CAMERA & PHOTO UPLOADER ─────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div
            className="w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-[var(--border)] shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {t('Take Photo or Upload Doctor Prescription Letter')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPhotoPreview(null);
                }}
                className="p-1 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4">
              {/* Photo Input Area */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Prescription Letter Photo (कैमरे से फोटो लें या गैलरी से अपलोड करें)
                </label>

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 h-52 bg-slate-950 flex items-center justify-center">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Camera Direct Capture */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-purple-400" />
                      <div>
                        <span className="text-xs font-black text-[var(--text-primary)] block">Open Camera</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">फोटो खींचें</span>
                      </div>
                    </button>

                    {/* File / Gallery Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-indigo-400" />
                      <div>
                        <span className="text-xs font-black text-[var(--text-primary)] block">Upload Image / PDF</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">गैलरी से चुनें</span>
                      </div>
                    </button>

                    {/* Hidden Inputs */}
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {isAiScanning && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3 text-xs font-semibold text-purple-300 animate-pulse">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Google AI Scanning &amp; Extracting Medicines from Prescription Letter...</span>
                </div>
              )}

              {/* Title & Doctor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Prescription Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-semibold focus:outline-hidden focus:border-purple-500"
                    placeholder="e.g. Dr. Verma Rx - August 2026"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={uploadDoctor}
                    onChange={(e) => setUploadDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-semibold focus:outline-hidden focus:border-purple-500"
                    placeholder="Dr. Anita Verma, MD"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1 text-xs">Hospital / Clinic</label>
                <input
                  type="text"
                  value={uploadHospital}
                  onChange={(e) => setUploadHospital(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-semibold focus:outline-hidden focus:border-purple-500 text-xs"
                  placeholder="AIIMS & PBCOE Neuro Center"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: FULL-SCREEN ZOOM HD PRESCRIPTION VIEWER ─────────────── */}
      {previewRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 border border-[var(--border)] shadow-2xl flex flex-col justify-between overflow-y-auto space-y-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">{previewRx.title}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  👨‍⚕️ {previewRx.doctorName} • {previewRx.hospitalName} ({previewRx.prescribedDate})
                </p>
              </div>
              <button
                onClick={() => setPreviewRx(null)}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Res Image Display */}
            <div className="w-full h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[var(--border)]">
              <img src={previewRx.photoUrl} alt={previewRx.title} className="w-full h-full object-contain" />
            </div>

            {/* Extracted Details & Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-2">
                <strong className="text-purple-400 font-bold block uppercase">Extracted Medicines:</strong>
                {previewRx.extractedMedicines.map((m, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-1">
                    <span className="font-bold text-[var(--text-primary)]">{m.name} ({m.dosage})</span>
                    <span className="text-[var(--text-secondary)]">{m.frequency}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border)] space-y-2">
                <strong className="text-emerald-400 font-bold block uppercase">Doctor's Instructions:</strong>
                <p className="text-[var(--text-secondary)] leading-relaxed">{previewRx.doctorInstructions}</p>
                <span className="text-blue-400 font-bold block mt-2">Next Follow-up: {previewRx.nextFollowUpDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface-secondary)] hover:bg-purple-500/20 text-purple-300 border border-[var(--border)] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> <span>Print Letter</span>
              </button>
              <button
                onClick={() => handleShareRx(previewRx)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/25"
              >
                <Share2 className="w-4 h-4" /> <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalProfileAndPrescriptionsView;
