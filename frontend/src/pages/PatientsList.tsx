import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Shield, X, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const PatientsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPatientId, setLinkPatientId] = useState('');
  const [linkRel, setLinkRel] = useState('Daughter & Primary Caregiver');
  const [linkStatus, setLinkStatus] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/caregivers/patients');
      setPatients(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPatientId.trim()) return;

    try {
      const res: any = await api.post('/caregivers/link', {
        patientId: linkPatientId.trim(),
        relationship: linkRel
      });
      if (res?.patient?.patientId) {
        localStorage.setItem('aabha_active_patient_id', res.patient.patientId);
      }
      setLinkStatus(res?.message || '🎉 Patient linked successfully!');
      setTimeout(() => {
        setLinkStatus('');
        setShowLinkModal(false);
        setLinkPatientId('');
        fetchPatients();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to link patient');
    }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24">
      <header className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500 bg-purple-50 text-xs font-black text-purple-950 uppercase mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Authorized Caregiver Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">{t('My Assigned Patients')}</h1>
          <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
            Access restricted strictly to patients linked with clinical authorization
          </p>
        </div>

        <button
          onClick={() => setShowLinkModal(true)}
          className="px-5 py-3 bg-white border-2 border-black hover:bg-gray-50 text-black rounded-2xl font-black text-sm shadow-sm transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-purple-700" />
          <span>+ Link Patient by ID</span>
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border-2 border-black p-6 sm:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g. PAT-2026-000001) or Name..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-black rounded-2xl text-sm font-bold bg-white focus:outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-bold text-gray-500">Loading patients...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-white border-2 border-gray-200 hover:border-black rounded-3xl p-6 transition flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-400 text-emerald-950 font-mono font-black text-xs rounded-lg">
                      {p.patientId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-900 border border-purple-200">
                      {p.relationship || 'Linked'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-black">{p.name}</h3>
                  <div className="text-xs text-gray-600 font-bold mt-1 space-y-0.5">
                    <div>Age: {p.age} yrs • {p.gender}</div>
                    <div>📞 {p.phone || 'No phone'}</div>
                    <div className="text-emerald-800 font-black">📄 {p.reportsCount} Clinical Reports</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    to={`/caregiver/patients/${p.id}`}
                    className="flex-1 py-2 bg-white border border-black hover:bg-gray-50 text-black text-xs font-black rounded-xl text-center shadow-xs"
                  >
                    View File
                  </Link>
                  <Link
                    to={`/caregiver/memory-passport/${p.id}`}
                    className="flex-1 py-2 bg-white border border-black hover:bg-gray-50 text-black text-xs font-black rounded-xl text-center shadow-xs"
                  >
                    Memory Album
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-bold text-sm bg-gray-50 rounded-2xl">
            No assigned patients found.
          </div>
        )}
      </div>

      {/* LINK PATIENT MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-black space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-xl font-black text-black">Link Patient to Caregiver</h2>
              <button onClick={() => setShowLinkModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {linkStatus ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black rounded-2xl text-center">
                {linkStatus}
              </div>
            ) : (
              <form onSubmit={handleLinkPatient} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    Patient ID or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PAT-2026-000001 or anita1@aabha.ai"
                    value={linkPatientId}
                    onChange={e => setLinkPatientId(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    Caregiver Relationship *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daughter / Registered Nurse"
                    value={linkRel}
                    onChange={e => setLinkRel(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-2xl text-sm font-bold focus:border-black outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-black font-black text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-white border-2 border-black text-black font-black text-xs rounded-xl hover:bg-gray-50 shadow"
                  >
                    Confirm & Link
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

export default PatientsList;
