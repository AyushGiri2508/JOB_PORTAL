import { useState, useEffect, useCallback } from 'react';
import { getJobApplications, updateApplicationStatus } from '../api';

/**
 * Custom hook for recruiter managing applications for a specific job.
 */
export const useManageApplications = (jobId) => {
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await getJobApplications(jobId);
      setApplications(data.applications);
      setJob(data.job);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = useCallback(async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
      return newStatus;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    applications,
    job,
    loading,
    handleStatusChange,
  };
};
