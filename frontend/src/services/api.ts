import { useAuthStore } from '../stores/authStore';

const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
const BASE_URL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) : '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { token, logout } = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  } catch (networkError) {
    // If backend is unreachable (e.g. online static preview), provide fallback
    console.warn(`API network request failed for ${url}, checking offline fallback...`);
    const fallbackData = handleOfflineFallback(url, options);
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw new Error('Network error. Please check your internet connection.');
  }

  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    let errorMessage = 'Something went wrong. Please try again.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // Handle empty responses (204 No Content, etc.)
  const contentType = response.headers.get('Content-Type');
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return {};
  }

  return response.json();
}

/** Fallback for when deployed online statically without a running backend */
function handleOfflineFallback(url: string, options: RequestInit): any {
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Auth Login Fallback
  if (url.includes('/auth/login')) {
    const isCaregiver = body.email?.includes('caregiver');
    return {
      token: 'demo-online-token-' + Date.now(),
      user: {
        id: isCaregiver ? 'usr-caregiver-demo' : 'usr-patient-demo',
        name: isCaregiver ? 'Dr. Anita Verma' : 'Arun Das',
        email: body.email || 'demo.patient@aabha.ai',
        role: isCaregiver ? 'CAREGIVER' : 'PATIENT',
        patientId: 'ABHA-2026-ARUN'
      }
    };
  }

  // 2. AI Chat Fallback
  if (url.includes('/ai/chat')) {
    return {
      reply: "Namaste! I am AABHA AI, your cognitive care companion. How can I assist you with your routine, games, or medicine today?",
      response: "Namaste! I am AABHA AI, your cognitive care companion. How can I assist you with your routine, games, or medicine today?",
      intent: "GENERAL_CHAT",
      engine: "Aabha Standalone Engine",
      conversationId: "conv-demo"
    };
  }

  // 3. Medications Fallback
  if (url.includes('/medications')) {
    return [
      { id: 'm1', name: 'Donepezil', dosage: '5mg', scheduledTime: '08:30 AM', status: 'TAKEN', instructions: 'Take with breakfast' },
      { id: 'm2', name: 'Memantine HCl', dosage: '10mg', scheduledTime: '01:00 PM', status: 'UPCOMING', instructions: 'Take with lunch' },
      { id: 'm3', name: 'Amlodipine', dosage: '5mg', scheduledTime: '08:00 PM', status: 'UPCOMING', instructions: 'Take after dinner' }
    ];
  }

  // 4. Appointments Fallback
  if (url.includes('/appointments')) {
    return [
      { id: 'a1', doctorName: 'Dr. Anita Verma', date: 'Tomorrow', time: '11:00 AM', purpose: 'Routine Cognitive Health Checkup', status: 'UPCOMING' }
    ];
  }

  // 5. Vitals Fallback
  if (url.includes('/vitals')) {
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
