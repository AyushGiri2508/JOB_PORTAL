import { useState, useEffect, useCallback } from 'react';
import { getMyApplications } from '../api';

/**
 * Custom hook for jobseeker's applications listing.
 */
export const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await getMyApplications();
      setApplications(data.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  const statusSteps = ['pending', 'reviewed', 'shortlisted', 'hired'];

  const getStatusIndex = (status) => {
    if (status === 'rejected') return -1;
    return statusSteps.indexOf(status);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return {
    applications,
    filtered,
    loading,
    filter,
    setFilter,
    statusSteps,
    getStatusIndex,
    timeAgo,
  };
};
