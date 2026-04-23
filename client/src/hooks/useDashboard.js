import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getMyJobs, deleteJob } from '../api';

/**
 * Custom hook for recruiter dashboard - stats, jobs, and job management.
 */
export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([getDashboardStats(), getMyJobs()]);
      setStats(statsRes.data.stats);
      setJobs(jobsRes.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = useCallback(async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return false;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    stats,
    jobs,
    loading,
    handleDelete,
  };
};
