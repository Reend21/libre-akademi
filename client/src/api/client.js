// Shared API client utilities
// F10 + F15: Single source of truth for API config and response handling

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${API_BASE}/api`;

export async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Bir hata oluştu');
  }
  // Rewrite relative avatar URLs to absolute
  if (data && data.avatar && data.avatar.startsWith('/')) {
    data.avatar = `${API_BASE}${data.avatar}`;
  }
  return data;
}

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
