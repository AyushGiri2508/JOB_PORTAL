import API from './axiosInstance';

export const applyToJob = (jobId, data) => API.post(`/applications/${jobId}`, data);
export const getMyApplications = () => API.get('/applications/me');
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, status) =>
  API.put(`/applications/${id}/status`, { status });
export const getDashboardStats = () => API.get('/applications/stats');
