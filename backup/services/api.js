import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/login/', credentials),
  register: (userData) => api.post('/register/', userData),
  logout: () => api.post('/logout/'),
};

// Jobs API calls
export const jobsAPI = {
  getAll: () => api.get('/jobs/'),
  getById: (id) => api.get(`/jobs/${id}/`),
  create: (jobData) => api.post('/jobs/', jobData),
  update: (id, jobData) => api.put(`/jobs/${id}/`, jobData),
  delete: (id) => api.delete(`/jobs/${id}/`),
};

// Tasks API calls
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  getById: (id) => api.get(`/tasks/${id}/`),
  create: (taskData) => api.post('/tasks/', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}/`, taskData),
  delete: (id) => api.delete(`/tasks/${id}/`),
};

// Sticky Notes API calls
export const stickyNotesAPI = {
  getAll: () => api.get('/sticky-notes/'),
  getById: (id) => api.get(`/sticky-notes/${id}/`),
  create: (noteData) => api.post('/sticky-notes/', noteData),
  update: (id, noteData) => api.put(`/sticky-notes/${id}/`, noteData),
  delete: (id) => api.delete(`/sticky-notes/${id}/`),
};

export default api;