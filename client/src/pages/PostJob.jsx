import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob, generateJobDescription } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: user?.company || '',
    location: '',
    type: 'full-time',
    salary: '',
    skills: '',
    experience: 'Fresher',
    category: 'Technology',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await createJob(jobData);
      toast.success('Job posted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title) return toast.error('Enter a job title first');
    setAiLoading(true);
    try {
      const { data } = await generateJobDescription({
        title: formData.title,
        company: formData.company,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        type: formData.type,
        experience: formData.experience,
      });
      const jd = data.jobDescription;
      let description = jd.description || '';
      if (jd.responsibilities?.length) {
        description += '\n\nResponsibilities:\n' + jd.responsibilities.map((r) => `• ${r}`).join('\n');
      }
      if (jd.requirements?.length) {
        description += '\n\nRequirements:\n' + jd.requirements.map((r) => `• ${r}`).join('\n');
      }
      if (jd.niceToHave?.length) {
        description += '\n\nNice to Have:\n' + jd.niceToHave.map((r) => `• ${r}`).join('\n');
      }
      if (jd.benefits?.length) {
        description += '\n\nBenefits:\n' + jd.benefits.map((r) => `• ${r}`).join('\n');
      }
      setFormData({ ...formData, description });
      toast.success('AI description generated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft /> Back to Dashboard
        </button>

        <motion.div
          className="glass-card post-job-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="post-job-header">
            <h1>Post a New Job</h1>
            <p>Fill in the details to create a new job posting</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bangalore, India / Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., ₹8-15 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR', 'Engineering', 'Healthcare', 'Education', 'Other'].map(
                    (cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 2-4 years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="React, Node.js, MongoDB, TypeScript..."
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div className="description-header">
                <label className="form-label">Job Description *</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm ai-btn"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <div className="btn-loader" />
                  ) : (
                    <>
                      <HiOutlineSparkles /> Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                className="form-textarea description-textarea"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={12}
                required
              />
            </div>

            <div className="post-job-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <div className="btn-loader" /> : 'Post Job'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;
