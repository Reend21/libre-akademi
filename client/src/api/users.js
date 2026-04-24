import { API_URL, handleResponse } from './client';

export const usersApi = {
  getUserProfile: async (username) => {
    const response = await fetch(`${API_URL}/users/${username}`);
    return handleResponse(response);
  },
  updateProfile: async (token, profileData) => {
    const isFormData = profileData instanceof FormData;
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: isFormData ? profileData : JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
  updatePassword: async (token, passwords) => {
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwords),
    });
    return handleResponse(response);
  }
};
