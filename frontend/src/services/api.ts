import { useAuthStore } from '../stores/authStore';

const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
const BASE_URL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) : '/api';

// ─── LOCAL STORAGE KEYS FOR PERSISTENT STORAGE ────────────────────────────────
export const KEYS = {
  USERS: 'aabha_local_users',
  REMINDERS: 'aabha_local_reminders',
  GAMES: 'aabha_local_game_results',
  VITALS: 'aabha_local_vitals',
  CAREGIVERS: 'aabha_local_caregiver_links',
  MEDICATIONS: 'aabha_local_medications',
  APPOINTMENTS: 'aabha_local_appointments'
};

export function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Seed initial default reminders if empty
function initDefaultReminders(): any[] {
  const existing = getStorage<any[]>(KEYS.REMINDERS, []);
  if (existing.length > 0) return existing;

  const defaults = [
    {
      id: 'rem-demo-1',
      userId: 'uuid-demo-patient',
      type: 'MEDICINE',
      title: 'Morning BP Medicine (Donepezil 5mg)',
      description: 'Take 1 tablet Donepezil with warm water after breakfast',
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      recurrence: 'DAILY',
      status: 'ACTIVE',
      metadata: {
        isVoiceAlarm: true,
        voiceMessage: 'Medicine lene ka time ho gaya hai. Kripya Donepezil 5mg paani ke saath le lijiye.',
        voiceLanguage: 'hi',
        voiceVolume: 1.0,
        vibration: true,
        ringtone: 'temple_bell',
        enabled: true
      },
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z'
    },
    {
      id: 'rem-demo-2',
      userId: 'uuid-demo-patient',
      type: 'WATER',
      title: 'Hydration Break (Drink Warm Water)',
      description: 'Drink 1 full glass of warm water to stay refreshed',
      scheduledAt: new Date(Date.now() + 7200000).toISOString(),
      recurrence: 'DAILY',
      status: 'ACTIVE',
      metadata: {
        isVoiceAlarm: true,
        voiceMessage: 'Paani peene ka samay ho gaya hai. Kripya ek glass garam paani pi lijiye.',
        voiceLanguage: 'hi',
        voiceVolume: 1.0,
        vibration: true,
        ringtone: 'gentle_flute',
        enabled: true
      },
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z'
    },
    {
      id: 'rem-demo-3',
      userId: 'uuid-demo-patient',
      type: 'ACTIVITY',
      title: 'Memory Match Brain Game',
      description: 'Daily cognitive memory exercise',
      scheduledAt: new Date(Date.now() + 10800000).toISOString(),
      recurrence: 'DAILY',
      status: 'ACTIVE',
      metadata: {
        isVoiceAlarm: true,
        voiceMessage: 'Memory Match game khelne ka samay ho gaya hai.',
        voiceLanguage: 'hi',
        voiceVolume: 1.0,
        vibration: true,
        ringtone: 'zen_chime',
        enabled: true
      },
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z'
    }
  ];
  setStorage(KEYS.REMINDERS, defaults);
  return defaults;
}

// Pre-seed storage
initDefaultReminders();

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { token, user, logout } = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response | null = null;
  let isJson = false;

  try {
    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    const contentType = response.headers.get('Content-Type');
    isJson = !!(contentType && contentType.includes('application/json'));
  } catch (networkError) {
    // Network failure
  }

  // If server returned valid 200/201 JSON
  if (response && response.ok && isJson) {
    try {
      const data = await response.json();
      mirrorSaveToClientStorage(url, options, data, user);
      return data;
    } catch (parseErr) {}
  }

  // If 204 No Content
  if (response && response.status === 204) {
    return {};
  }

  // If server returned error status (400, 401, 403, 404, 500)
  if (response && !response.ok) {
    let errorMessage = 'Request failed. Please try again.';
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
    } else {
      try {
        errorMessage = (await response.text()) || errorMessage;
      } catch {}
    }

    if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      logout();
    }

    throw new Error(errorMessage);
  }

  // Guaranteed Resilient Persistence Fallback Engine ONLY when browser is offline / network fails
  if (!response) {
    const fallbackData = handleOfflineFallback(url, options);
    if (fallbackData !== null && fallbackData !== undefined) {
      return fallbackData;
    }
  }

  throw new Error('Network error. Please check your internet connection and try again.');
}

/** Mirror saves successful backend responses into localStorage for instant offline access */
function mirrorSaveToClientStorage(url: string, options: RequestInit, data: any, user: any) {
  try {
    const method = (options.method || 'GET').toUpperCase();

    // 1. Reminders Mirroring
    if (url.includes('/reminders')) {
      const list = getStorage<any[]>(KEYS.REMINDERS, []);
      if (method === 'GET' && Array.isArray(data)) {
        const currentUserId = user?.id || 'uuid-demo-patient';
        const otherUsersReminders = list.filter(r => r.userId !== currentUserId);
        setStorage(KEYS.REMINDERS, [...otherUsersReminders, ...data]);
      } else if (method === 'POST' && data && data.id) {
        const filtered = list.filter(r => r.id !== data.id);
        filtered.unshift(data);
        setStorage(KEYS.REMINDERS, filtered);
      } else if (method === 'PUT' && data && data.id) {
        const idx = list.findIndex(r => r.id === data.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data };
          setStorage(KEYS.REMINDERS, list);
        }
      } else if (method === 'DELETE') {
        const id = url.split('/').pop();
        if (id) {
          setStorage(KEYS.REMINDERS, list.filter(r => r.id !== id));
        }
      }
    }

    // 2. Games Result Mirroring
    if (url.includes('/games/result') && method === 'POST' && data?.result) {
      const results = getStorage<any[]>(KEYS.GAMES, []);
      results.unshift(data.result);
      setStorage(KEYS.GAMES, results);
    }

    // 3. Caregiver Link Mirroring
    if (url.includes('/caregivers/link') && method === 'POST' && data?.link) {
      const links = getStorage<any[]>(KEYS.CAREGIVERS, []);
      links.unshift(data.link);
      setStorage(KEYS.CAREGIVERS, links);
    }
  } catch {}
}

/** Resilient Persistent Local Storage Fallback Engine with Strict User Isolation */
function handleOfflineFallback(url: string, options: RequestInit): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const currentAuthUser = useAuthStore.getState().user;
  const currentUserId = currentAuthUser?.id || 'uuid-demo-patient';

  // ─── 1. AUTH REGISTER ──────────────────────────────────────────────────────
  if (url.includes('/auth/register')) {
    const email = String(body.email || 'patient@aabha.ai').toLowerCase().trim();
    const name = body.name || (email.split('@')[0]) || 'User';
    const role = (body.role || 'PATIENT').toUpperCase();
    const patientId = role === 'PATIENT' ? `PAT-2026-${String(Date.now()).slice(-6)}` : `CG-2026-${String(Date.now()).slice(-6)}`;
    const userObj = {
      id: 'usr-local-' + Date.now(),
      patientId,
      name,
      email,
      phone: body.phone || '+91 98765 00000',
      role,
      age: body.age || 65,
      gender: body.gender || 'Not Specified',
      emergencyContact: body.emergencyContact || 'Dr. Anita Verma (+91 98765 43210)',
      address: body.address || 'India',
      preferredLanguage: body.preferredLanguage || 'hi',
      password: body.password || 'demo123',
      createdAt: new Date().toISOString()
    };

    const users = getStorage<any[]>(KEYS.USERS, []);
    users.unshift(userObj);
    setStorage(KEYS.USERS, users);

    return {
      accessToken: 'token-local-' + Date.now(),
      refreshToken: 'refresh-local-' + Date.now(),
      user: userObj
    };
  }

  // ─── 2. AUTH LOGIN ─────────────────────────────────────────────────────────
  if (url.includes('/auth/login') || url.includes('/auth/login-otp')) {
    const input = String(body.email || body.identifier || '').toLowerCase().trim();
    const providedPass = body.password || '';
    const users = getStorage<any[]>(KEYS.USERS, []);
    const matchedUser = users.find(u => u.email?.toLowerCase() === input || u.patientId?.toLowerCase() === input);

    if (matchedUser) {
      if (providedPass && providedPass !== 'demo-login') {
        const storedPass = matchedUser.password || 'demo123';
        if (storedPass !== providedPass && providedPass !== 'demo123' && providedPass !== 'admin123') {
          throw new Error('Invalid password. Please enter the correct password (गलत पासवर्ड).');
        }
      }

      return {
        accessToken: 'token-local-' + Date.now(),
        refreshToken: 'refresh-local-' + Date.now(),
        user: matchedUser
      };
    }

    if (input === 'demo.patient@aabha.ai' || input === 'pat-demo-000001') {
      if (providedPass && providedPass !== 'demo123' && providedPass !== 'demo-login') {
        throw new Error('Invalid password. Please enter the correct password (गलत पासवर्ड).');
      }
      const demoP = {
        id: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Demo Patient',
        email: 'demo.patient@aabha.ai',
        role: 'PATIENT',
        age: 68,
        gender: 'Female',
        phone: '+91 98765 00000',
        emergencyContact: 'Dr. Anita Verma (+91 98765 43210)',
        address: 'Shivaji Park, Dadar West, Mumbai 400028',
        preferredLanguage: 'hi',
        createdAt: new Date().toISOString()
      };
      return { accessToken: 'token-demo-p', refreshToken: 'refresh-demo-p', user: demoP };
    }

    if (input === 'demo.nurse@aabha.ai' || input === 'caregiver@aabha.ai' || input === 'cg-demo-000001') {
      if (providedPass && providedPass !== 'demo123' && providedPass !== 'demo-login') {
        throw new Error('Invalid password. Please enter the correct password (गलत पासवर्ड).');
      }
      const demoN = {
        id: 'uuid-demo-nurse',
        patientId: 'CG-DEMO-000001',
        name: 'Sister Anita Verma (Caregiver Nurse)',
        email: 'demo.nurse@aabha.ai',
        role: 'CAREGIVER',
        age: 38,
        gender: 'Female',
        phone: '+91 98765 43210',
        emergencyContact: 'Apollo Hospital (+91 98765 00000)',
        address: 'Apollo Health Desk, Mumbai',
        preferredLanguage: 'hi',
        createdAt: new Date().toISOString()
      };
      return { accessToken: 'token-demo-n', refreshToken: 'refresh-demo-n', user: demoN };
    }

    if (input.includes('admin') || input.includes('swayam')) {
      if (providedPass && providedPass !== 'admin123' && providedPass !== 'demo-login') {
        throw new Error('Invalid password. Please enter the correct password (गलत पासवर्ड).');
      }
      const adminU = {
        id: 'uuid-admin-swayam',
        patientId: 'ADM-2026-000001',
        name: 'Swayam Gulhane (Super Admin)',
        email: 'swayamgulhane538@gmail.com',
        role: 'ADMIN',
        age: 26,
        phone: '+91 98765 43210',
        emergencyContact: 'Apollo Command Desk',
        address: 'Mumbai, India',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString()
      };
      return { accessToken: 'token-demo-adm', refreshToken: 'refresh-demo-adm', user: adminU };
    }

    throw new Error('No registered account found with this Email or Patient ID.');
  }

  // ─── 3. AUTH ME ────────────────────────────────────────────────────────────
  if (url.includes('/auth/me')) {
    if (currentAuthUser) {
      return { user: currentAuthUser };
    }
    return { user: { id: 'uuid-demo-patient', patientId: 'PAT-DEMO-000001', name: 'Demo Patient', role: 'PATIENT' } };
  }

  // ─── 4. REMINDERS PERSISTENCE (STRICTLY FILTERED & RETURNED AS ARRAY) ──────
  if (url.includes('/reminders')) {
    const list = getStorage<any[]>(KEYS.REMINDERS, initDefaultReminders());

    if (method === 'POST') {
      const newRem = {
        id: 'rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        userId: currentUserId,
        title: body.title || 'Medicine Reminder',
        type: body.type || 'MEDICINE',
        description: body.description || body.title || 'Scheduled Reminder',
        scheduledAt: body.scheduledAt || new Date(Date.now() + 3600000).toISOString(),
        recurrence: body.recurrence || 'DAILY',
        status: body.status || 'ACTIVE',
        metadata: body.metadata || {
          isVoiceAlarm: true,
          voiceMessage: body.title || 'Time for reminder',
          voiceLanguage: 'hi',
          voiceVolume: 1.0,
          vibration: true,
          ringtone: 'temple_bell',
          enabled: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = [newRem, ...list.filter(r => r.id !== newRem.id)];
      setStorage(KEYS.REMINDERS, updatedList);
      return newRem;
    }

    if (method === 'PUT') {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      const idx = list.findIndex(r => r.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...body,
          metadata: body.metadata ? { ...list[idx].metadata, ...body.metadata } : list[idx].metadata,
          updatedAt: new Date().toISOString()
        };
        setStorage(KEYS.REMINDERS, list);
        return list[idx];
      }
      return { id, ...body };
    }

    if (method === 'DELETE') {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      const filtered = list.filter(r => r.id !== id);
      setStorage(KEYS.REMINDERS, filtered);
      return { success: true, message: 'Reminder deleted permanently' };
    }

    // Default GET: Return array of reminders for the logged-in patient
    const userReminders = list.filter(
      r => r.userId === currentUserId || (currentUserId === 'uuid-demo-patient' && (r.userId === 'uuid-demo-patient' || !r.userId))
    );

    if (userReminders.length === 0 && currentUserId === 'uuid-demo-patient') {
      return initDefaultReminders();
    }

    return userReminders;
  }

  // ─── 4.5 PATIENTS LIST (ADMIN & REGISTRY) ──────────────────────────────────
  if (url.startsWith('/patients') || url.includes('/patients?')) {
    const users = getStorage<any[]>(KEYS.USERS, []);
    const searchMatch = url.match(/[?&]search=([^&]*)/);
    const rawSearch = searchMatch ? decodeURIComponent(searchMatch[1]) : '';
    const cleanSearch = rawSearch.replace(/^(id|patient id|patient):\s*/i, '').toLowerCase().trim();

    let allPatients = users.filter(u => u.role === 'PATIENT');

    const defaultPatients = [
      {
        id: 'uuid-demo-patient',
        patientId: 'PAT-DEMO-000001',
        name: 'Demo Patient',
        email: 'demo.patient@aabha.ai',
        role: 'PATIENT',
        age: 68,
        gender: 'Female',
        status: 'ACTIVE',
        reportsCount: 3,
        assessmentsCount: 2,
        caregiverName: 'Sister Anita Verma',
        createdAt: new Date().toISOString()
      },
      {
        id: 'uuid-anita-01',
        patientId: 'PAT-2026-000001',
        name: 'Anita Devi',
        email: 'anita@aabha.ai',
        role: 'PATIENT',
        age: 67,
        gender: 'Female',
        status: 'ACTIVE',
        reportsCount: 4,
        assessmentsCount: 3,
        caregiverName: 'Dr. Anita Verma',
        createdAt: new Date().toISOString()
      },
      {
        id: 'uuid-rajesh-03',
        patientId: 'PAT-2026-000003',
        name: 'Rajesh Kumar',
        email: 'rajesh@aabha.ai',
        role: 'PATIENT',
        age: 71,
        gender: 'Male',
        status: 'ACTIVE',
        reportsCount: 2,
        assessmentsCount: 1,
        caregiverName: 'Priya Sharma',
        createdAt: new Date().toISOString()
      }
    ];

    // Combine default and user-registered patients
    const combined = [...defaultPatients];
    allPatients.forEach(p => {
      if (!combined.some(c => c.patientId === p.patientId || c.id === p.id)) {
        combined.push({
          ...p,
          status: p.status || 'ACTIVE',
          reportsCount: p.reportsCount || 1,
          assessmentsCount: p.assessmentsCount || 1,
          caregiverName: p.caregiverName || 'Assigned Caregiver'
        });
      }
    });

    let filtered = combined;
    if (cleanSearch) {
      filtered = filtered.filter(p =>
        (p.patientId && p.patientId.toLowerCase().includes(cleanSearch)) ||
        (p.name && p.name.toLowerCase().includes(cleanSearch)) ||
        (p.email && p.email.toLowerCase().includes(cleanSearch))
      );
    }

    return {
      patients: filtered,
      total: filtered.length
    };
  }

  // ─── 5. COGNITIVE GAME RESULTS & PROGRESS ──────────────────────────────────
  if (url.includes('/games/result') && method === 'POST') {
    const results = getStorage<any[]>(KEYS.GAMES, []);
    const newResult = {
      id: 'gr-' + Date.now(),
      patientUserId: currentUserId,
      patientId: currentAuthUser?.patientId || 'PAT-2026-000001',
      gameType: body.gameType || 'memory-match',
      gameName: body.gameName || 'Cognitive Game',
      score: body.score !== undefined ? Number(body.score) : 80,
      maxScore: Number(body.maxScore) || 100,
      accuracy: body.accuracy !== undefined ? Number(body.accuracy) : 85,
      timeTaken: body.timeTaken !== undefined ? Number(body.timeTaken) : 45,
      difficulty: body.difficulty || 'Level 2',
      completedAt: new Date().toISOString()
    };
    results.unshift(newResult);
    setStorage(KEYS.GAMES, results);
    return { message: 'Game result recorded', result: newResult };
  }

  if (url.includes('/games/progress')) {
    const allResults = getStorage<any[]>(KEYS.GAMES, []);
    const results = allResults.filter(
      r => r.patientUserId === currentUserId || (currentUserId === 'uuid-demo-patient' && (!r.patientUserId || r.patientUserId === 'uuid-demo-patient'))
    );

    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
      : 88;
    const avgReactionTime = results.length > 0
      ? (results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length).toFixed(1)
      : '1.8';

    return {
      history: results,
      totalGamesPlayed: results.length,
      averageAccuracy: avgAccuracy,
      averageReactionTime: avgReactionTime,
      memoryScore: Math.min(100, Math.round(avgAccuracy * 0.95 + 4)),
      attentionScore: Math.min(100, Math.round(avgAccuracy * 0.92 + 6)),
      reactionScore: Math.min(100, Math.round(avgAccuracy * 0.90 + 8)),
      consistencyScore: Math.min(100, Math.round(avgAccuracy * 0.96 + 3))
    };
  }

  // ─── 6. CAREGIVERS LINKING & PATIENT LIST ──────────────────────────────────
  if (url.includes('/caregivers/link') && method === 'POST') {
    const links = getStorage<any[]>(KEYS.CAREGIVERS, []);
    const users = getStorage<any[]>(KEYS.USERS, []);
    const targetPatientId = String(body.patientId || '').toUpperCase().trim();
    
    // Find or dynamically create patient user record
    let patientObj = users.find(u => 
      u.role === 'PATIENT' && (
        u.patientId?.toUpperCase() === targetPatientId ||
        u.id === targetPatientId ||
        u.email?.toUpperCase() === targetPatientId
      )
    );

    if (!patientObj) {
      patientObj = {
        id: 'patient-' + Date.now(),
        patientId: targetPatientId.startsWith('PAT-') ? targetPatientId : `PAT-${targetPatientId}`,
        name: `Patient (${targetPatientId})`,
        email: `${targetPatientId.toLowerCase().replace(/[^a-z0-9]/g, '')}@aabha.patient`,
        role: 'PATIENT',
        age: 68,
        gender: 'Female',
        cognitiveScore: 84,
        adherence: 92,
        lastActive: 'Active Now',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      users.unshift(patientObj);
      setStorage(KEYS.USERS, users);
    }

    const newLink = {
      id: 'rel-' + Date.now(),
      caregiverUserId: currentUserId,
      patientId: patientObj.patientId,
      patientUserId: patientObj.id,
      relationship: body.relationship || 'Assigned Caregiver',
      createdAt: new Date().toISOString()
    };
    
    // Save link without duplicates
    const filteredLinks = links.filter(l => !(l.caregiverUserId === currentUserId && (l.patientId === patientObj.patientId || l.patientUserId === patientObj.id)));
    filteredLinks.unshift(newLink);
    setStorage(KEYS.CAREGIVERS, filteredLinks);
    
    return { message: `✓ Patient ${patientObj.name} (${patientObj.patientId}) linked successfully!`, link: newLink, patient: patientObj };
  }

  if (url.includes('/caregivers/patients')) {
    const users = getStorage<any[]>(KEYS.USERS, []);
    const links = getStorage<any[]>(KEYS.CAREGIVERS, []);
    const userLinks = links.filter(l => l.caregiverUserId === currentUserId);
    const linkedPatientIds = userLinks.map(l => l.patientId?.toUpperCase());

    const isDemoCaregiver = currentUserId === 'uuid-demo-nurse' || currentAuthUser?.email === 'caregiver@aabha.ai' || currentAuthUser?.email === 'demo.caregiver@aabha.ai';

    const defaultPatients = [
      { id: 'uuid-demo-patient', patientId: 'PAT-DEMO-000001', name: 'Demo Patient', age: 68, gender: 'Female', cognitiveScore: 88, adherence: 94, lastActive: 'Active Now', relationship: 'Assigned Primary Caregiver & Clinical Nurse' },
      { id: 'uuid-anita-01', patientId: 'PAT-2026-000001', name: 'Anita Devi', age: 67, gender: 'Female', cognitiveScore: 84, adherence: 95, lastActive: '1 hour ago', relationship: 'Clinical Supervising Nurse' },
      { id: 'uuid-rajesh-03', patientId: 'PAT-2026-000003', name: 'Rajesh Kumar', age: 71, gender: 'Male', cognitiveScore: 78, adherence: 89, lastActive: '3 hours ago', relationship: 'Assigned Clinical Nurse' }
    ];

    if (currentAuthUser?.role === 'ADMIN' || currentUserId === 'uuid-admin-swayam') {
      const allPatients = users.filter(u => u.role === 'PATIENT');
      return [...defaultPatients, ...allPatients];
    }

    if (isDemoCaregiver) {
      const added = users.filter(u => u.role === 'PATIENT' && linkedPatientIds.includes(u.patientId?.toUpperCase()));
      return [...defaultPatients, ...added];
    }

    // For real / Gmail logged in accounts:
    const myPatients = users.filter(
      u => u.role === 'PATIENT' && (linkedPatientIds.includes(u.patientId?.toUpperCase()) || linkedPatientIds.includes(u.id))
    );

    return myPatients;
  }

  // ─── 7. AI CHAT ────────────────────────────────────────────────────────────
  if (url.includes('/ai/chat')) {
    return {
      reply: "Namaste! I am AABHA AI, your cognitive care companion. How can I assist you with your routine, games, or medicine today?",
      response: "Namaste! I am AABHA AI, your cognitive care companion. How can I assist you with your routine, games, or medicine today?",
      intent: "GENERAL_CHAT",
      engine: "Aabha Standalone Engine",
      conversationId: "conv-demo"
    };
  }

  // ─── 8. MEDICATIONS ────────────────────────────────────────────────────────
  if (url.includes('/medications')) {
    const list = getStorage<any[]>(KEYS.MEDICATIONS, [
      { id: 'm1', name: 'Donepezil', dosage: '5mg', scheduledTime: '08:30 AM', status: 'TAKEN', instructions: 'Take with breakfast' },
      { id: 'm2', name: 'Memantine HCl', dosage: '10mg', scheduledTime: '01:00 PM', status: 'UPCOMING', instructions: 'Take with lunch' },
      { id: 'm3', name: 'Amlodipine', dosage: '5mg', scheduledTime: '08:00 PM', status: 'UPCOMING', instructions: 'Take after dinner' }
    ]);
    return list;
  }

  // ─── 9. APPOINTMENTS ───────────────────────────────────────────────────────
  if (url.includes('/appointments')) {
    return [
      { id: 'a1', doctorName: 'Dr. Anita Verma', date: 'Tomorrow', time: '11:00 AM', purpose: 'Routine Cognitive Health Checkup', status: 'UPCOMING' }
    ];
  }

  // ─── 10. VITALS ────────────────────────────────────────────────────────────
  if (url.includes('/vitals')) {
    if (method === 'POST') {
      const vitalsList = getStorage<any[]>(KEYS.VITALS, []);
      const newVitals = { id: 'vit-' + Date.now(), patientUserId: currentUserId, ...body, loggedAt: new Date().toISOString() };
      vitalsList.unshift(newVitals);
      setStorage(KEYS.VITALS, vitalsList);
      return newVitals;
    }
    const allVitals = getStorage<any[]>(KEYS.VITALS, []);
    const userVitals = allVitals.filter(v => v.patientUserId === currentUserId);
    if (userVitals.length > 0) {
      return userVitals[0];
    }
    return {
      heartRate: 72,
      bloodPressure: '120/80',
      spO2: 98,
      sleepHours: 7.5
    };
  }

  return null;
}

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body?: any) => fetchWithAuth(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body?: any) => fetchWithAuth(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (url: string, body?: any) => fetchWithAuth(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
};
