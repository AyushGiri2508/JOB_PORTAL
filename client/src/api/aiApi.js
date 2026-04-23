import API from './axiosInstance';

export const analyzeResume = (formData) =>
  API.post('/ai/analyze-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const matchJobs = (data) => API.post('/ai/match-jobs', data);
export const generateCoverLetter = (data) => API.post('/ai/generate-cover-letter', data);
export const generateJobDescription = (data) => API.post('/ai/generate-job-description', data);
export const interviewPrep = (data) => API.post('/ai/interview-prep', data);
