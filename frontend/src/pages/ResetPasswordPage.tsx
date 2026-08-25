import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Abha3DOrb } from '../components/Abha3DOrb';
import { LanguageSelector } from '../components/LanguageSelector';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the URL.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired reset link. Please request a new password reset.');
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
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              Choose a secure password for your registered AABHA account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-center space-y-4 animate-fade-in text-[var(--text-primary)]">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-400/30">
                ✓
              </div>
              <h2 className="text-xl font-black text-emerald-300">
                Password Successfully Updated!
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Your permanent SQL database credentials have been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-glow w-full py-3.5 text-xs font-black flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">New Password *</label>
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
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] text-xs sm:text-sm font-bold focus:border-emerald-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-glow w-full py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{isLoading ? 'Updating Password...' : 'Save New Password & Log In →'}</span>
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
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

export default ResetPasswordPage;
