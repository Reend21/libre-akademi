import { API_URL, handleResponse, authHeaders } from './client';

export const getAuthenticatedHome = async (token) => {
  const response = await fetch(`${API_URL}/home/authenticated`, {
    headers: authHeaders(token)
  });
  return handleResponse(response);
};
