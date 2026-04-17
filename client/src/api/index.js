import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const googleLogin = (data) => API.post('/auth/google', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);

// ===== JOBS =====
export const getJobs = (params) => API.get('/jobs', { params });
export const getJob = (id) => API.get(`/jobs/${id}`);
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/my-jobs');

// ===== APPLICATIONS =====
export const applyToJob = (jobId, data) => API.post(`/applications/${jobId}`, data);
export const getMyApplications = () => API.get('/applications/me');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) =>
  API.put(`/applications/${id}/status`, { status });
export const getDashboardStats = () => API.get('/applications/stats');

// ===== RESUME =====
export const uploadResume = (formData) =>
  API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ===== AI =====
export const analyzeResume = (formData) =>
  API.post('/ai/analyze-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const matchJobs = (data) => API.post('/ai/match-jobs', data);
export const generateCoverLetter = (data) => API.post('/ai/generate-cover-letter', data);
export const generateJobDescription = (data) => API.post('/ai/generate-job-description', data);
export const interviewPrep = (data) => API.post('/ai/interview-prep', data);

export default API;
