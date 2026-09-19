import axios from 'axios';

let rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Remove trailing slashes
rawBase = rawBase.trim().replace(/\/+$/, '');
// Ensure it ends with /api
if (!rawBase.endsWith('/api')) {
  rawBase += '/api';
}

const api = axios.create({
  baseURL: rawBase,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecoatlas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('ecoatlas_token');
      localStorage.removeItem('ecoatlas_user');
    }
    return Promise.reject(error);
  }
);

export default api;
