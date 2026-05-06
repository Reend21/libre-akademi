import { API_URL, handleResponse } from './client';

export const coursesApi = {
  createCourse: async (token, formData) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    return handleResponse(response);
  },
  uploadLesson: async (token, courseId, formData) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/lessons`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    return handleResponse(response);
  },
  getAllCourses: async (search = '', category = '', page = 1, limit = 20) => {
    const url = new URL(`${API_URL}/courses`);
    if (search) url.searchParams.append('search', search);
    if (category) url.searchParams.append('category', category);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url);
    return handleResponse(response);
  },
  getCourse: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`);
    return handleResponse(response);
  },
  deleteCourse: async (token, id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};
