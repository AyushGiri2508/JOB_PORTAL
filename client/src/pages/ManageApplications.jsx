import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../api';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentDownload,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineEye,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './ManageApplications.css';

const ManageApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const { data } = await getJobApplications(jobId);
      setApplications(data.applications);
      setJob(data.job);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-container">
          <div className="loader" />
          <p className="loader-text">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="back-link" onClick={() => navigate('/dashboard')}>
          <HiOutlineArrowLeft /> Back to Dashboard
        </button>

        <div className="manage-header">
          <h1>Applications for: {job?.title}</h1>
          <p>{applications.length} total applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-state-icon">📬</div>
            <h3>No applications yet</h3>
            <p>Wait for candidates to apply to this position</p>
          </div>
        ) : (
          <div className="applicants-list">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                className="glass-card applicant-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="applicant-main">
                  <div className="applicant-info">
                    <div className="applicant-avatar">
                      {app.applicant?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="applicant-details">
                      <h3>{app.applicant?.name}</h3>
                      <div className="applicant-contact">
                        <span>
                          <HiOutlineMail /> {app.applicant?.email}
                        </span>
                        {app.applicant?.phone && (
                          <span>
                            <HiOutlinePhone /> {app.applicant.phone}
                          </span>
                        )}
                        {app.applicant?.location && (
                          <span>
                            <HiOutlineLocationMarker /> {app.applicant.location}
                          </span>
                        )}
                      </div>
                      {app.applicant?.skills?.length > 0 && (
                        <div className="applicant-skills">
                          {app.applicant.skills.slice(0, 5).map((s, i) => (
                            <span key={i} className="skill-tag">{s}</span>
                          ))}
                        </div>
                      )}
                      {app.applicant?.experience && (
                        <p className="applicant-exp">
                          Experience: {app.applicant.experience}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="applicant-actions-col">
                    <span className={`badge status-${app.status}`}>{app.status}</span>
                    <div className="status-buttons">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusChange(app._id, 'reviewed')}
                        title="Mark Reviewed"
                      >
                        <HiOutlineEye />
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusChange(app._id, 'shortlisted')}
                        title="Shortlist"
                      >
                        <HiOutlineStar />
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusChange(app._id, 'hired')}
                        title="Hire"
                      >
                        <HiOutlineCheck />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusChange(app._id, 'rejected')}
                        title="Reject"
                      >
                        <HiOutlineX />
                      </button>
                    </div>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="cover-letter-section">
                    <h4>Cover Letter</h4>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplications;
