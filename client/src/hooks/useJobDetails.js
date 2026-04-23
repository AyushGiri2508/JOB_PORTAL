import { useState, useEffect, useCallback } from 'react';
import { getJob, applyToJob } from '../api';

/**
 * Custom hook for fetching a single job and handling applications.
 */
export const useJobDetails = (id, user) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const { data } = await getJob(id);
      setJob(data.job);
      // Check if user already applied
      if (data.job.applications && user) {
        const hasApplied = data.job.applications.some(
          (app) => app.applicant?.toString() === user._id || app.applicant === user._id
        );
        setApplied(hasApplied);
      }
    } catch (err) {
      // Error is handled in UI layer via toast
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleApply = useCallback(async () => {
    setApplying(true);
    try {
      await applyToJob(id, { coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setApplying(false);
    }
  }, [id, coverLetter]);

  return {
    job,
    loading,
    applying,
    applied,
    coverLetter,
    setCoverLetter,
    showApplyForm,
    setShowApplyForm,
    handleApply,
  };
};
