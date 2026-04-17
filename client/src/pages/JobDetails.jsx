import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob, applyToJob } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isJobseeker } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
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
      toast.error('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      return toast.error('Please login to apply');
    }
    setApplying(true);
    try {
      await applyToJob(id, { coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-container">
          <div className="loader" />
          <p className="loader-text">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-wrapper">
        <div className="container empty-state">
          <h3>Job not found</h3>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/jobs" className="back-link">
          <HiOutlineArrowLeft /> Back to Jobs
        </Link>

        <motion.div
          className="job-detail-layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content */}
          <div className="job-detail-main">
            <div className="glass-card job-detail-card">
              <div className="job-detail-header">
                <div className="job-detail-avatar">
                  {job.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="job-detail-title">{job.title}</h1>
                  <p className="job-detail-company">
                    <HiOutlineOfficeBuilding /> {job.company}
                  </p>
                </div>
              </div>

              <div className="job-detail-tags">
                <span className="badge badge-primary">{job.type}</span>
                <span className="badge badge-secondary">{job.category}</span>
                {job.status === 'closed' && (
                  <span className="badge badge-danger">Closed</span>
                )}
              </div>

              <div className="job-detail-info-grid">
                <div className="info-item">
                  <HiOutlineLocationMarker />
                  <span>{job.location}</span>
                </div>
                <div className="info-item">
                  <HiOutlineCurrencyRupee />
                  <span>{job.salary}</span>
                </div>
                <div className="info-item">
                  <HiOutlineBriefcase />
                  <span>{job.experience}</span>
                </div>
                <div className="info-item">
                  <HiOutlineClock />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.deadline && (
                  <div className="info-item">
                    <HiOutlineCalendar />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="job-detail-section">
                <h2>Job Description</h2>
                <div className="job-description-text">
                  {job.description?.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              {job.skills?.length > 0 && (
                <div className="job-detail-section">
                  <h2>Required Skills</h2>
                  <div className="skills-list">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="skill-tag-lg">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="job-detail-sidebar">
            <div className="glass-card apply-card">
              {applied ? (
                <div className="applied-badge">
                  <HiOutlineCheck /> You've Applied
                </div>
              ) : isJobseeker ? (
                <>
                  {!showApplyForm ? (
                    <button
                      className="btn btn-primary btn-lg apply-btn"
                      onClick={() => setShowApplyForm(true)}
                      disabled={job.status === 'closed'}
                    >
                      {job.status === 'closed' ? 'Position Closed' : 'Apply Now'}
                    </button>
                  ) : (
                    <div className="apply-form">
                      <h3>Apply for this position</h3>
                      <div className="form-group">
                        <label className="form-label">Cover Letter (Optional)</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Write a brief cover letter..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={5}
                        />
                      </div>
                      <div className="apply-form-actions">
                        <button
                          className="btn btn-primary"
                          onClick={handleApply}
                          disabled={applying}
                        >
                          {applying ? <div className="btn-loader" /> : 'Submit Application'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowApplyForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn btn-primary btn-lg apply-btn">
                  Login to Apply
                </Link>
              ) : null}

              {user?.resume && (
                <p className="resume-attached">
                  ✅ Your resume is attached to this application
                </p>
              )}
            </div>

            <div className="glass-card sidebar-info-card">
              <h3>About {job.company}</h3>
              <div className="sidebar-company-info">
                <div className="sidebar-avatar">
                  {job.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="sidebar-company-name">{job.company}</p>
                  {job.postedBy?.name && (
                    <p className="sidebar-recruiter">Posted by {job.postedBy.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;
