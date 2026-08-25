import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Calendar, FileText, Phone, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Report, Assessment } from '../types';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${id}`);
      setPatientData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm font-bold text-gray-500">
        Loading patient clinical file...
      </div>
    );
  }

  if (!patientData?.patient) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-xl font-black text-black">Patient Record Not Found</h2>
        <button
          onClick={() => navigate('/caregiver/patients')}
          className="px-4 py-2 border-2 border-black rounded-xl text-xs font-black"
        >
          ← Back to Patients List
        </button>
      </div>
    );
  }

  const { patient, reports, assessments } = patientData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      <button
        onClick={() => navigate('/caregiver/patients')}
        className="inline-flex items-center gap-1.5 text-black hover:underline font-black text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assigned Patients</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-3xl shadow-sm">
            👵
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-400 text-emerald-950 font-mono font-black text-xs rounded-lg">
                {patient.patientId}
              </span>
              <span className="text-xs font-black border border-black px-2 py-0.5 rounded-full">
                Age: {patient.age || 65} yrs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">{patient.name}</h1>
            <div className="text-xs text-gray-600 font-bold mt-0.5 flex gap-3">
              <span>📧 {patient.email}</span>
              <span>📞 {patient.phone || 'No phone'}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/caregiver/memory-passport/${patient.id}`}
          className="px-4 py-2.5 bg-white border-2 border-black hover:bg-gray-50 text-black text-xs font-black rounded-2xl shadow-sm"
        >
          📖 Manage Memory Album
        </Link>
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports */}
        <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <h3 className="text-base font-black text-black flex items-center gap-1.5">
              <span>📄</span>
              <span>Clinical Reports ({reports?.length || 0})</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-800 font-black">
              UUID Scoped
            </span>
          </div>

          {reports && reports.length > 0 ? (
            <div className="space-y-2.5">
              {reports.map((r: Report) => (
                <div key={r.id} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-black">{r.title}</span>
                    <span className="text-gray-500 font-bold text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.score !== undefined && (
                    <div className="text-xs font-black text-emerald-800">
                      Score: {r.score}/{r.maxScore || 100}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 font-bold line-clamp-2">{r.description || r.result}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-bold p-4 text-center">No reports filed for this patient.</p>
          )}
        </div>

        {/* Assessments */}
        <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <h3 className="text-base font-black text-black flex items-center gap-1.5">
              <span>🧠</span>
              <span>Cognitive Assessments ({assessments?.length || 0})</span>
            </h3>
          </div>

          {assessments && assessments.length > 0 ? (
            <div className="space-y-2.5">
              {assessments.map((a: Assessment) => (
                <div key={a.id} className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-black">{a.assessmentType}</span>
                    <span className="text-gray-500 font-bold text-[11px]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs font-black text-emerald-800">
                    Score: {a.score}/{a.maxScore} — {a.result}
                  </div>
                  {a.notes && <p className="text-xs text-gray-600 font-bold">{a.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-bold p-4 text-center">No assessments recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
