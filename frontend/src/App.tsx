import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { CaregiverLayout } from './components/CaregiverLayout';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Patient pages
import PatientDashboard from './pages/PatientDashboard';
import GamesHub from './pages/GamesHub';
import GamePlayer from './pages/GamePlayer';
import MemoryPassportView from './pages/MemoryPassportView';
import MemoryPassportEdit from './pages/MemoryPassportEdit';
import RemindersView from './pages/RemindersView';
import ProgressView from './pages/ProgressView';
import AabhaChat from './pages/AabhaChat';
import PatientHistoryView from './pages/PatientHistoryView';
import MyReportsView from './pages/MyReportsView';
import AppointmentsView from './pages/AppointmentsView';
import VitalsTrackerView from './pages/VitalsTrackerView';
import TeleconsultView from './pages/TeleconsultView';
import MedicineStoreView from './pages/MedicineStoreView';

// Caregiver pages
import CaregiverDashboard from './pages/CaregiverDashboard';
import PatientsList from './pages/PatientsList';
import PatientDetail from './pages/PatientDetail';
import AlertsView from './pages/AlertsView';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminPatientDetail from './pages/AdminPatientDetail';

import { AlarmProvider } from './context/AlarmContext';
import { useThemeStore } from './stores/themeStore';

/** Initializes theme on mount, listens for OS changes, enables smooth transitions after first paint */
const ThemeInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useThemeStore(s => s.theme);

  React.useEffect(() => {
    // Enable smooth transition class AFTER first paint to avoid flash
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-transition');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Re-apply whenever the stored theme value changes
  React.useEffect(() => {
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }, [theme]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AlarmProvider>
        <ThemeInitializer>
        <div className="min-h-screen font-sans relative" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
          <OfflineIndicator />
          <AccessibilityToolbar />
          <Routes>
            {/* ─── Public Routes ─── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ─── Patient Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route element={<Layout />}>
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/patient/dashboard" element={<Navigate to="/patient" replace />} />
                <Route path="/patient/games" element={<GamesHub />} />
                <Route path="/patient/games/:type" element={<GamePlayer />} />
                <Route path="/patient/vitals" element={<VitalsTrackerView />} />
                <Route path="/patient/consultation" element={<TeleconsultView />} />
                <Route path="/patient/pharmacy" element={<MedicineStoreView />} />
                <Route path="/patient/medicine-store" element={<Navigate to="/patient/pharmacy" replace />} />
                <Route path="/patient/memory-passport" element={<MemoryPassportView />} />
                <Route path="/patient/memory-passport/edit" element={<MemoryPassportEdit />} />
                <Route path="/patient/reminders" element={<RemindersView />} />
                <Route path="/patient/appointments" element={<AppointmentsView />} />
                <Route path="/patient/reports" element={<MyReportsView />} />
                <Route path="/patient/history" element={<PatientHistoryView />} />
                <Route path="/patient/progress" element={<ProgressView />} />
                <Route path="/aabha" element={<AabhaChat />} />
              </Route>
            </Route>

            {/* ─── Caregiver Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['CAREGIVER']} />}>
              <Route element={<CaregiverLayout />}>
                <Route path="/caregiver" element={<CaregiverDashboard />} />
                <Route path="/caregiver/patients" element={<PatientsList />} />
                <Route path="/caregiver/patients/:id" element={<PatientDetail />} />
                <Route path="/caregiver/consultation" element={<TeleconsultView />} />
                <Route path="/caregiver/memory-passport/:patientId" element={<MemoryPassportEdit />} />
                <Route path="/caregiver/passport-edit" element={<MemoryPassportEdit />} />
                <Route path="/caregiver/history" element={<PatientHistoryView />} />
                <Route path="/caregiver/alerts" element={<AlertsView />} />
              </Route>
            </Route>

            {/* ─── Admin Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/patients/:id" element={<AdminPatientDetail />} />
            </Route>

            {/* ─── Catch-all ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </ThemeInitializer>
      </AlarmProvider>
    </BrowserRouter>
  );
};

export default App;
