import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { LanguageSelector } from '../components/LanguageSelector';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{ message: string; email: string; resetUrl?: string; token?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessData(null);

    try {
      const res = await forgotPassword(email.trim());
      setSuccessData(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'No registered account found with this email address.');
    } finally {
      setIsLoading(false);
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
            <span>Back to Login</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto w-full my-8">
        <div
          className="card-3d backdrop-blur-2xl p-6 sm:p-10 rounded-[28px] border border-[var(--border)] shadow-2xl space-y-6"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-[20px] bg-emerald-500/20 border border-emerald-400/30 mx-auto flex items-center justify-center text-3xl shadow-lg">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              Enter your registered email address to receive an official secure password reset link.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successData ? (
            <div className="p-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 space-y-3 animate-fade-in text-[var(--text-primary)]">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Password Reset Link Created!</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                {successData.message}
              </p>
              {successData.resetUrl && (
                <div className="pt-2">
                  <Link
                    to={successData.resetUrl}
                    className="btn-glow w-full py-3 text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Set New Password</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1.5">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. demo.patient@aabha.ai"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-glow w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{isLoading ? 'Generating Link...' : 'Send Password Reset Link →'}</span>
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
            Remembered your password?{' '}
            <Link to="/login" className="text-emerald-400 font-bold underline hover:text-[var(--text-primary)]">
              Back to Login
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

export default ForgotPasswordPage;
