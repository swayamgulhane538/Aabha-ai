import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';
import { LanguageSelector } from '../components/LanguageSelector';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { AnimatedBackground } from '../components/AnimatedBackground';
import {
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Search,
  KeyRound,
  Mail,
  Send,
  CheckCircle2,
  Lock,
  UserCheck,
  Sparkles,
  User,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, continueWithDemoAccount, sendOtp, loginWithOtp, lookupPatient, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'password' | 'otp' | 'lookup'>('password');

  // Password Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<any[] | null>(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectByRole = (role: Role) => {
    const roleUpper = (role || 'PATIENT').toUpperCase();
    if (roleUpper === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (roleUpper === 'CAREGIVER') {
      navigate('/caregiver', { replace: true });
    } else {
      navigate('/patient', { replace: true });
    }
  };

  // Handle Standard Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your Email or Patient ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(identifier.trim(), password);
      redirectByRole(loggedUser.role);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('not found') || msg.includes('No registered')) {
        setError('Account not found. Please check your email or Patient ID.');
      } else if (msg.includes('Invalid password') || msg.includes('credentials')) {
        setError('Invalid email or password. Please verify your credentials.');
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Single Demo Account
  const handleContinueDemo = async () => {
    setError('');
    setSubmitting(true);
    try {
      const demoUser = await continueWithDemoAccount();
      navigate('/patient', { replace: true });
    } catch (err: any) {
      setError('Failed to initialize demo session. Please try standard login.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendOtp(otpEmail.trim());
      setOtpSent(true);
      setOtpMessage(res.message || 'OTP code sent to your email.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP code.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await loginWithOtp(otpEmail.trim(), otpCode.trim());
      redirectByRole(loggedUser.role);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Patient ID Lookup
  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!lookupQuery.trim()) return;

    setSubmitting(true);
    try {
      const results = await lookupPatient(lookupQuery.trim());
      setLookupResults(results || []);
    } catch (err: any) {
      setError('Failed to find patient records.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col justify-between p-3 sm:p-6 md:p-10 relative select-none text-[var(--text-primary)]"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <AnimatedBackground />

      {/* Header Bar */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2 text-[var(--text-primary)] font-black text-xl tracking-tight">
          <Abha3DOrb size="sm" state="IDLE" interactive={false} />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AABHA AI
          </span>
        </Link>
        <LanguageSelector />
      </div>

      {/* Main Split-Screen Container */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Side: 3D Holographic AI Guide */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md text-xs font-black text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>Voice-First Clinical Health Companion</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] leading-tight">
              A caring voice for every memory.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              Sign in to access your personalized memory passport, daily routine, medication alarms, and 18+ cognitive therapy games.
            </p>
          </div>

          {/* 3D Orb Visual */}
          <div
            className="p-6 card-3d rounded-3xl flex items-center gap-4 border border-[var(--border)]"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <Abha3DOrb size="md" state="IDLE" interactive={false} />
            <div className="space-y-1 text-left">
              <div className="text-xs font-bold text-emerald-400">AABHA AI Companion Active</div>
              <div className="text-xs text-[var(--text-secondary)]">"Namaste Anita Devi! Let's check your morning memory exercises."</div>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Login Card */}
        <div className="lg:col-span-7 w-full max-w-xl mx-auto">
          <div
            className="card-3d backdrop-blur-2xl p-6 sm:p-10 rounded-[28px] border border-[var(--border)] space-y-6 shadow-2xl"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            {/* Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Sign In to AABHA AI
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Access your healthcare records, memory games & daily alarms
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* ─── 1-CLICK DEMO PATIENT ACCESS CARD ──────────────────────────── */}
            <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase rounded-md">
                    ⭐ Quick Demo Access
                  </span>
                  <span className="font-black text-sm text-[var(--text-primary)]">Demo Patient Portal</span>
                </div>
                <div className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-0.5">
                  ID: PAT-DEMO-000001 • Instant Access
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueDemo}
                disabled={submitting}
                className="btn-glow w-full sm:w-auto px-5 py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Continue with Demo Account →</span>
              </button>
            </div>

            {/* Navigation Mode Tabs */}
            <div className="flex border border-[var(--border)] rounded-2xl p-1 bg-[var(--bg-surface-secondary)] text-xs font-black">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl transition ${
                  activeTab === 'password' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Password Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl transition ${
                  activeTab === 'otp' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Email OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('lookup');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl transition ${
                  activeTab === 'lookup' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Find Patient ID
              </button>
            </div>

            {/* ─── TAB 1: STANDARD PASSWORD LOGIN ───────────────────────────── */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1.5">
                    Email Address or Patient ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. demo.patient@aabha.ai or PAT-2026-000001"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-[var(--text-secondary)] uppercase">
                      Password *
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--border)] bg-[var(--input-bg)] text-emerald-500 focus:ring-emerald-400"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-[var(--text-secondary)] font-medium cursor-pointer">
                    Remember me on this device
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-glow w-full py-3.5 text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ─── TAB 2: EMAIL OTP LOGIN ───────────────────────────────────── */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1.5">
                        Registered Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your registered email address"
                        value={otpEmail}
                        onChange={e => setOtpEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 focus:outline-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-glow w-full py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Sending Code...' : 'Send 6-Digit Code'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs font-bold text-emerald-300">
                      {otpMessage || `We sent a verification code to ${otpEmail}`}
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1.5">
                        Enter 6-Digit OTP Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-emerald-400 bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] text-xl font-mono text-center tracking-widest font-black focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="btn-glass flex-1 py-2.5 text-xs"
                      >
                        Change Email
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-glow flex-1 py-2.5 text-xs font-black"
                      >
                        {submitting ? 'Verifying...' : 'Verify & Sign In'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ─── TAB 3: PATIENT ID LOOKUP ─────────────────────────────────── */}
            {activeTab === 'lookup' && (
              <div className="space-y-4">
                <form onSubmit={handleLookupSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Name, Mobile, or Email..."
                    value={lookupQuery}
                    onChange={e => setLookupQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs font-bold focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-glow px-4 py-2.5 text-xs font-black flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </form>

                {lookupResults !== null && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-black uppercase text-[var(--text-secondary)]">
                      Lookup Results ({lookupResults.length}):
                    </span>

                    {lookupResults.length > 0 ? (
                      lookupResults.map((r, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-secondary)] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-black text-xs text-[var(--text-primary)]">{r.name}</div>
                            <div className="text-[11px] text-[var(--text-secondary)]">
                              Patient ID: <span className="font-mono text-emerald-400 font-black">{r.patientId}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIdentifier(r.patientId);
                              setActiveTab('password');
                            }}
                            className="btn-glow px-3 py-1 text-xs font-black"
                          >
                            Use ID
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)] font-medium p-3 bg-[var(--bg-surface-secondary)] rounded-xl text-center">
                        No patient record found matching "{lookupQuery}".
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── BOTTOM REGISTRATION LINK ────────────────────────────────── */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-secondary)] font-medium gap-2 border-t border-[var(--border)]">
              <div>
                New Patient?{' '}
                <Link to="/register" className="font-black text-emerald-400 underline hover:text-emerald-300">
                  Create an Account
                </Link>
              </div>
              <div className="text-[var(--text-muted)] text-[11px]">
                Persistent SQL Database
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-6xl mx-auto w-full py-4 text-center text-xs text-[var(--text-muted)] font-medium border-t border-[var(--border)]">
        © 2026 AABHA AI • Clinical Healthcare & Dementia Care Assistant
      </div>
    </div>
  );
}
