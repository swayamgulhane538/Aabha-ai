import { useAuthStore } from '../stores/authStore';

const BASE_URL = '/api';

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
    throw new Error('Network error. Please check your connection.');
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

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body?: any) => fetchWithAuth(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body?: any) => fetchWithAuth(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (url: string, body?: any) => fetchWithAuth(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
};
