import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getMyJobs, deleteJob } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePencil,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([getDashboardStats(), getMyJobs()]);
      setStats(statsRes.data.stats);
      setJobs(jobsRes.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((j) => j._id !== jobId));
      toast.success('Job deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-container">
          <div className="loader" />
          <p className="loader-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: <HiOutlineBriefcase />,
      label: 'Active Jobs',
      value: stats?.activeJobs || 0,
      color: 'blue',
    },
    {
      icon: <HiOutlineUserGroup />,
      label: 'Total Applications',
      value: stats?.totalApplications || 0,
      color: 'purple',
    },
    {
      icon: <HiOutlineClock />,
      label: 'Pending Review',
      value: stats?.pendingApplications || 0,
      color: 'orange',
    },
    {
      icon: <HiOutlineStar />,
      label: 'Shortlisted',
      value: stats?.shortlistedApplications || 0,
      color: 'cyan',
    },
    {
      icon: <HiOutlineCheck />,
      label: 'Hired',
      value: stats?.hiredApplications || 0,
      color: 'green',
    },
    {
      icon: <HiOutlineX />,
      label: 'Rejected',
      value: stats?.rejectedApplications || 0,
      color: 'red',
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Recruiter Dashboard</h1>
            <p>
              Welcome back, <strong>{user?.name}</strong>!{' '}
              {user?.company && `| ${user.company}`}
            </p>
          </div>
          <Link to="/dashboard/post-job" className="btn btn-primary">
            <HiOutlinePlus /> Post New Job
          </Link>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="dashboard-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {statCards.map((stat, i) => (
            <div key={i} className={`glass-card stat-card stat-${stat.color}`}>
              <div className={`stat-icon stat-icon-${stat.color}`}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Recent Applications */}
        {stats?.recentApplications?.length > 0 && (
          <div className="dashboard-section">
            <h2>Recent Applications</h2>
            <div className="glass-card table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="applicant-cell">
                          <div className="applicant-avatar-sm">
                            {app.applicant?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="applicant-name">{app.applicant?.name}</p>
                            <p className="applicant-email">{app.applicant?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{app.job?.title}</td>
                      <td>
                        <span className={`badge status-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My Jobs */}
        <div className="dashboard-section">
          <div className="section-title-row">
            <h2>My Job Postings ({jobs.length})</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state glass-card">
              <div className="empty-state-icon">📋</div>
              <h3>No jobs posted yet</h3>
              <p>Start by posting your first job</p>
              <Link to="/dashboard/post-job" className="btn btn-primary">
                <HiOutlinePlus /> Post a Job
              </Link>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  className="glass-card job-list-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="job-list-info">
                    <h3>{job.title}</h3>
                    <div className="job-list-meta">
                      <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {job.status}
                      </span>
                      <span>{job.location}</span>
                      <span>{job.type}</span>
                      <span>{job.applicationCount || 0} applications</span>
                    </div>
                  </div>
                  <div className="job-list-actions">
                    <Link
                      to={`/dashboard/applications/${job._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <HiOutlineEye /> View Applications
                    </Link>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleDelete(job._id)}
                      title="Delete"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
