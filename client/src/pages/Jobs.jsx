import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs } from '../api';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineFilter,
  HiOutlineX,
} from 'react-icons/hi';
import './Jobs.css';

const Jobs = () => {
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

  useEffect(() => {
    fetchJobs();
  }, [filters.page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      params.page = filters.page;

      const { data } = await getJobs(params);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', category: '', page: 1 });
    setSearchParams({});
    setTimeout(fetchJobs, 0);
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

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Search & Filters Header */}
        <div className="jobs-header">
          <div className="jobs-header-text">
            <h1>Find Your Perfect Job</h1>
            <p>Discover {pagination.total || 0} opportunities waiting for you</p>
          </div>

          <form className="jobs-search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <HiOutlineSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="search-input-wrapper">
              <HiOutlineLocationMarker className="search-icon" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="form-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <HiOutlineSearch /> Search
            </button>
            <button
              type="button"
              className="btn btn-secondary filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <HiOutlineFilter />
            </button>
          </form>

          {/* Filter Bar */}
          {showFilters && (
            <motion.div
              className="filter-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>

              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Engineering">Engineering</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>

              <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                <HiOutlineX /> Clear
              </button>
            </motion.div>
          )}
        </div>

        {/* Job Results */}
        {loading ? (
          <div className="loader-container">
            <div className="loader" />
            <p className="loader-text">Finding the best jobs for you...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="jobs-grid">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/jobs/${job._id}`} className="job-card glass-card">
                    <div className="job-card-header">
                      <div className="job-company-avatar">
                        {job.company?.charAt(0).toUpperCase()}
                      </div>
                      <div className="job-card-meta">
                        <h3 className="job-card-title">{job.title}</h3>
                        <p className="job-card-company">{job.company}</p>
                      </div>
                      <span className={`badge ${getTypeColor(job.type)}`}>{job.type}</span>
                    </div>

                    <div className="job-card-details">
                      <span>
                        <HiOutlineLocationMarker /> {job.location}
                      </span>
                      <span>
                        <HiOutlineCurrencyRupee /> {job.salary}
                      </span>
                      <span>
                        <HiOutlineBriefcase /> {job.experience}
                      </span>
                    </div>

                    {job.skills?.length > 0 && (
                      <div className="job-card-skills">
                        {job.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="skill-tag skill-more">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="job-card-footer">
                      <span className="job-card-time">
                        <HiOutlineClock /> {timeAgo(job.createdAt)}
                      </span>
                      <span className="job-card-apply">View Details →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
