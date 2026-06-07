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
  },
  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },
  resetPassword: async (token, password) => {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },
  login2fa: async (tempToken, code) => {
    const response = await fetch(`${API_URL}/auth/2fa/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code }),
    });
    return handleResponse(response);
  },
  setup2fa: async (token) => {
    const response = await fetch(`${API_URL}/auth/2fa/setup`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handleResponse(response);
  },
  verify2fa: async (token, code, secret) => {
    const response = await fetch(`${API_URL}/auth/2fa/verify`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ token: code, secret }),
    });
    return handleResponse(response);
  },
  disable2fa: async (token, password) => {
    const response = await fetch(`${API_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },
};
