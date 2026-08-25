import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Role } from '../types';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { LanguageSelector } from '../components/LanguageSelector';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('PATIENT');
  const [language, setLanguage] = useState('hi');
  const [error, setError] = useState('');

  const handleDobChange = (val: string) => {
    setDateOfBirth(val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      if (!isNaN(birthYear)) {
        setAge(String(new Date().getFullYear() - birthYear));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }
    if (password.length < 4) {
      setError(t('Password must be at least 4 characters'));
      return;
    }

    try {
      const newUser = await register({
        name,
        email,
        phone,
        dateOfBirth,
        age: age ? Number(age) : 65,
        gender,
        emergencyContact,
        address,
        password,
        role,
        preferredLanguage: language
      });

      if (newUser.role === 'ADMIN') navigate('/admin');
      else if (newUser.role === 'CAREGIVER') navigate('/caregiver');
      else navigate('/patient');
    } catch (err: any) {
      setError(err.message || t('Registration failed'));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 md:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden relative select-none text-[var(--text-primary)]"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <AnimatedBackground />

      <div className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <Abha3DOrb size="sm" state="IDLE" interactive={false} />
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AABHA AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link to="/login" className="btn-glass px-3.5 py-1.5 text-xs font-bold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full my-6">
        <div
          className="card-3d backdrop-blur-2xl p-6 sm:p-10 rounded-[28px] border border-[var(--border)] shadow-2xl space-y-6"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unique Patient ID Generator Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Create New Healthcare Account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Every registered patient automatically receives a permanent Patient ID (e.g. PAT-2026-XXXXXX).
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Account Role *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={`p-3 rounded-2xl border font-bold text-xs sm:text-sm text-left transition ${
                    role === 'PATIENT' ? 'bg-emerald-500/20 border-emerald-400 text-[var(--text-primary)] shadow-md ring-1 ring-emerald-400/50' : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  👵 Patient Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CAREGIVER')}
                  className={`p-3 rounded-2xl border font-bold text-xs sm:text-sm text-left transition ${
                    role === 'CAREGIVER' ? 'bg-emerald-500/20 border-emerald-400 text-[var(--text-primary)] shadow-md ring-1 ring-emerald-400/50' : 'bg-[var(--bg-surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  👩‍⚕️ Caregiver / Nurse
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anita Devi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anita.devi@aabha.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => handleDobChange(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  placeholder="65"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anita Verma (+91 98765 43210)"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 4 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-glow w-full py-4 text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{isLoading ? 'Creating Patient Profile...' : 'Complete Registration & Generate ID →'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 font-bold underline hover:text-[var(--text-primary)]">
              Sign In to your account
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full py-4 text-center text-xs text-[var(--text-muted)] font-medium border-t border-[var(--border)]">
        © 2026 AABHA AI • Clinical Healthcare & Dementia Care Assistant
      </div>
    </div>
  );
};

export default RegisterPage;
