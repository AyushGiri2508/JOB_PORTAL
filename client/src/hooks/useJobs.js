import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs } from '../api';

/**
 * Custom hook for jobs listing with search, filters, and pagination.
 */
export const useJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    page: 1,
  });

  const fetchJobs = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const f = currentFilters || filters;
      const params = {};
      if (f.search) params.search = f.search;
      if (f.location) params.location = f.location;
      if (f.type) params.type = f.type;
      if (f.category) params.category = f.category;
      params.page = f.page;

      const { data } = await getJobs(params);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    fetchJobs(newFilters);
  };

  const clearFilters = () => {
    const cleared = { search: '', location: '', type: '', category: '', page: 1 };
    setFilters(cleared);
    setSearchParams({});
    setTimeout(() => fetchJobs(cleared), 0);
  };

  const setPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getTypeColor = (type) => {
    const colors = {
      'full-time': 'badge-success',
      'part-time': 'badge-warning',
      contract: 'badge-purple',
      internship: 'badge-primary',
      remote: 'badge-secondary',
    };
    return colors[type] || 'badge-primary';
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return {
    jobs,
    loading,
    pagination,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    handleSearch,
    clearFilters,
    setPage,
    getTypeColor,
    timeAgo,
  };
};
