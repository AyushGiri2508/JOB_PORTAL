import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeResume, matchJobs, generateCoverLetter, interviewPrep } from '../api';

/**
 * Custom hook for all AI tools - resume analyzer, job matching, cover letter, interview prep.
 */
export const useAITools = (user) => {
  const [activeTab, setActiveTab] = useState('resume-analyzer');
  const [loading, setLoading] = useState(false);

  // ===== Resume Analyzer =====
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const onResumeDrop = useCallback(async (files) => {
    if (files.length === 0) return;
    setLoading(true);
    setResumeAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('resume', files[0]);
      const { data } = await analyzeResume(formData);
      setResumeAnalysis(data.analysis);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeDropzone = useDropzone({
    onDrop: onResumeDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  // ===== Job Matching =====
  const [matchResults, setMatchResults] = useState(null);
  const [matchSkills, setMatchSkills] = useState(user?.skills?.join(', ') || '');
  const [matchExperience, setMatchExperience] = useState(user?.experience || '');

  const handleMatchJobs = useCallback(async () => {
    setLoading(true);
    setMatchResults(null);
    try {
      const { data } = await matchJobs({
        skills: matchSkills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: matchExperience,
      });
      setMatchResults(data.matches);
      return data.matches;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchSkills, matchExperience]);

  // ===== Cover Letter =====
  const [coverLetterResult, setCoverLetterResult] = useState('');
  const [coverLetterData, setCoverLetterData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
  });

  const handleGenerateCover = useCallback(async () => {
    if (!coverLetterData.jobTitle || !coverLetterData.company) {
      throw new Error('Job title and company are required');
    }
    setLoading(true);
    setCoverLetterResult('');
    try {
      const { data } = await generateCoverLetter({
        ...coverLetterData,
        userName: user?.name,
        userSkills: user?.skills,
        userExperience: user?.experience,
      });
      setCoverLetterResult(data.coverLetter);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [coverLetterData, user]);

  // ===== Interview Prep =====
  const [interviewResult, setInterviewResult] = useState(null);
  const [interviewData, setInterviewData] = useState({ jobTitle: '', company: '', skills: '' });

  const handleInterviewPrep = useCallback(async () => {
    if (!interviewData.jobTitle) {
      throw new Error('Job title is required');
    }
    setLoading(true);
    setInterviewResult(null);
    try {
      const { data } = await interviewPrep({
        ...interviewData,
        skills: interviewData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setInterviewResult(data.prepMaterial);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [interviewData]);

  // ===== Utilities =====
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    // Resume Analyzer
    resumeAnalysis,
    resumeDropzone,
    // Job Matching
    matchResults,
    matchSkills,
    setMatchSkills,
    matchExperience,
    setMatchExperience,
    handleMatchJobs,
    // Cover Letter
    coverLetterResult,
    coverLetterData,
    setCoverLetterData,
    handleGenerateCover,
    // Interview Prep
    interviewResult,
    interviewData,
    setInterviewData,
    handleInterviewPrep,
    // Utilities
    copyToClipboard,
  };
};
