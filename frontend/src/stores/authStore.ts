import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Role } from '../types';
import { api } from '../services/api';

export const DEMO_PATIENT: User = {
  id: 'uuid-demo-patient',
  patientId: 'PAT-DEMO-000001',
  name: 'Demo Patient',
  email: 'demo.patient@aabha.ai',
  phone: '+91 98765 00000',
  age: 68,
  dateOfBirth: '1958-05-15',
  gender: 'Female',
  emergencyContact: 'Sister Anita Verma (+91 98765 43210)',
  address: '123 Wellness Ave, New Delhi',
  role: 'PATIENT',
  language: 'hi'
};

export const DEMO_NURSE: User = {
  id: 'uuid-demo-nurse',
  patientId: 'CG-DEMO-000001',
  name: 'Sister Anita Verma (Caregiver Nurse)',
  email: 'demo.nurse@aabha.ai',
  phone: '+91 98765 43210',
  age: 38,
  dateOfBirth: '1988-04-12',
  gender: 'Female',
  emergencyContact: 'Apollo Health Desk (+91 98765 00000)',
  address: 'Apollo Memory Clinic & Care Center, New Delhi',
  role: 'CAREGIVER',
  language: 'hi'
};

interface AuthActions {
  login: (identifier: string, pass: string) => Promise<User>;
  continueWithDemoAccount: () => Promise<User>;
  continueWithDemoCaregiverAccount: () => Promise<User>;
  sendOtp: (email: string) => Promise<any>;
  loginWithOtp: (email: string, otp: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  lookupPatient: (query: string) => Promise<any[]>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ─── 1. REAL USER LOGIN (AUTHENTICATE AGAINST DATABASE) ─────────────
      login: async (identifier, password) => {
        set({ isLoading: true });
        const trimmed = identifier.trim();

        try {
          const res = await api.post('/auth/login', { email: trimmed, password });
          const user: User = res.user;
          // Normalize role to uppercase
          user.role = (user.role || 'PATIENT').toUpperCase() as Role;
          set({ user, token: res.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ─── 2. SINGLE DEMO ACCOUNT LOGIN (AUTHENTICATE VIA REAL API) ───────
      continueWithDemoAccount: async () => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', {
            email: 'demo.patient@aabha.ai',
            password: 'demo123'
          });
          const user: User = res.user;
          user.role = (user.role || 'PATIENT').toUpperCase() as Role;
          set({ user, token: res.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          // If network is offline, load secure pre-seeded fallback
          set({
            user: DEMO_PATIENT,
            token: 'demo-token-patient-uuid-demo-patient',
            isAuthenticated: true,
            isLoading: false
          });
          return DEMO_PATIENT;
        }
      },

      // ─── 2.1 DEMO CAREGIVER / NURSE LOGIN (LINKED TO DEMO PATIENT) ──────
      continueWithDemoCaregiverAccount: async () => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', {
            email: 'demo.nurse@aabha.ai',
            password: 'demo123'
          });
          const user: User = res.user;
          user.role = (user.role || 'CAREGIVER').toUpperCase() as Role;
          set({ user, token: res.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error: any) {
          // Fallback if offline
          set({
            user: DEMO_NURSE,
            token: 'demo-token-nurse-uuid-demo-nurse',
            isAuthenticated: true,
            isLoading: false
          });
          return DEMO_NURSE;
        }
      },

      // ─── 3. SEND OTP ───────────────────────────────────────────────────
      sendOtp: async (email: string) => {
        return await api.post('/auth/send-otp', { email: email.trim().toLowerCase() });
      },

      // ─── 4. LOGIN WITH OTP ─────────────────────────────────────────────
      loginWithOtp: async (email: string, otp: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login-otp', { email: email.trim().toLowerCase(), otp: otp.trim() });
          const user: User = res.user;
          user.role = (user.role || 'PATIENT').toUpperCase() as Role;
          set({ user, token: res.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ─── 5. REGISTER NEW PATIENT (PERSISTS IN SQL DATABASE) ────────────
      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', {
            ...data,
            role: 'PATIENT'
          });
          const user: User = res.user;
          user.role = (user.role || 'PATIENT').toUpperCase() as Role;
          set({ user, token: res.accessToken, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ─── 6. FORGOT PASSWORD (REAL EMAIL TOKEN GENERATION) ───────────────
      forgotPassword: async (email: string) => {
        return await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      },

      // ─── 7. RESET PASSWORD (VERIFY TOKEN & UPDATE HASH IN DB) ───────────
      resetPassword: async (token: string, newPassword: string) => {
        return await api.post('/auth/reset-password', { token: token.trim(), newPassword: newPassword.trim() });
      },

      // ─── 8. UPDATE USER PROFILE (PERSISTS TO DB) ───────────────────────
      updateProfile: async (data: Partial<User>) => {
        const res = await api.put('/auth/profile', data);
        const updatedUser: User = res.user;
        updatedUser.role = (updatedUser.role || 'PATIENT').toUpperCase() as Role;
        set({ user: updatedUser });
        return updatedUser;
      },

      // ─── 9. LOOKUP PATIENT ID ──────────────────────────────────────────
      lookupPatient: async (query: string) => {
        const res = await api.get(`/auth/lookup-patient?query=${encodeURIComponent(query)}`);
        return res.matches || [];
      },

      // ─── 10. LOGOUT ────────────────────────────────────────────────────
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        try {
          api.post('/auth/logout').catch(() => {});
        } catch {}
      },

      // ─── 11. REFRESH & PERSIST SESSION FROM DATABASE ───────────────────
      loadUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const res = await api.get('/auth/me');
          if (res && res.id) {
            const user: User = res;
            user.role = (user.role || 'PATIENT').toUpperCase() as Role;
            set({ user, isAuthenticated: true, isLoading: false });
          }
        } catch (err) {
          // Token expired or invalid
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      }
    }),
    {
      name: 'aabha-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
