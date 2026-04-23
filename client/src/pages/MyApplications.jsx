import { Link } from 'react-router-dom';
import { useApplications } from '../hooks/useApplications';
import { motion } from 'framer-motion';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import './MyApplications.css';

const MyApplications = () => {
  const {
    applications, filtered, loading,
    filter, setFilter,
    statusSteps, getStatusIndex, timeAgo,
  } = useApplications();

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-container">
          <div className="loader" />
          <p className="loader-text">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="my-apps-header">
          <h1>My Applications</h1>
          <p>Track the status of all your job applications</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs">
          {['all', 'pending', 'reviewed', 'shortlisted', 'hired', 'rejected'].map((s) => (
            <button
              key={s}
              className={`status-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="tab-count">
                {s === 'all'
                  ? applications.length
                  : applications.filter((a) => a.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No applications found</h3>
            <p>
              {filter === 'all'
                ? "You haven't applied to any jobs yet"
                : `No ${filter} applications`}
            </p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="applications-list">
            {filtered.map((app, index) => (
              <motion.div
                key={app._id}
                className="application-card glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="app-card-main">
                  <div className="app-card-info">
                    <div className="app-company-avatar">
                      {app.job?.company?.charAt(0).toUpperCase() || 'J'}
                    </div>
                    <div>
                      <h3>{app.job?.title || 'Job Title'}</h3>
                      <p className="app-company">{app.job?.company}</p>
                      <div className="app-meta">
                        <span><HiOutlineLocationMarker /> {app.job?.location}</span>
                        <span><HiOutlineBriefcase /> {app.job?.type}</span>
                        <span><HiOutlineClock /> Applied {timeAgo(app.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/jobs/${app.job?._id}`} className="btn btn-secondary btn-sm">
                    <HiOutlineExternalLink /> View Job
                  </Link>
                </div>

                {/* Status Timeline */}
                <div className="status-timeline">
                  {app.status === 'rejected' ? (
                    <div className="status-rejected-bar">
                      <span className="badge status-rejected">Rejected</span>
                      <p>Unfortunately your application was not selected for this position.</p>
                    </div>
                  ) : (
                    <div className="timeline-track">
                      {statusSteps.map((step, i) => (
                        <div
                          key={step}
                          className={`timeline-step ${
                            i <= getStatusIndex(app.status) ? 'completed' : ''
                          } ${i === getStatusIndex(app.status) ? 'current' : ''}`}
                        >
                          <div className="timeline-dot" />
                          <span className="timeline-label">
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
