import { API_URL, handleResponse, authHeaders } from './client';

export const authApi = {
  login: async (identifier, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return handleResponse(response);
  },
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  getMe: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    return handleResponse(response);
  },
  updateLanguage: async (token, language) => {
    const response = await fetch(`${API_URL}/auth/language`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ language }),
    });
    return handleResponse(response);
  }
};
