import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePostJob } from '../hooks/usePostJob';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formData, setFormData, loading, aiLoading, handleSubmit, handleAiGenerate } = usePostJob(user?.company);

  const onSubmit = async (e) => {
    try {
      await handleSubmit(e);
      toast.success('Job posted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
  };

  const onAiGenerate = async () => {
    try { await handleAiGenerate(); toast.success('AI description generated! ✨'); }
    catch (err) { toast.error(err.response?.data?.message || err.message || 'AI generation failed'); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft /> Back to Dashboard
        </button>

        <motion.div className="glass-card post-job-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="post-job-header"><h1>Post a New Job</h1><p>Fill in the details to create a new job posting</p></div>

          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input type="text" className="form-input" placeholder="e.g., Senior React Developer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input type="text" className="form-input" placeholder="Company name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input type="text" className="form-input" placeholder="e.g., Bangalore, India / Remote" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Salary</label>
                <input type="text" className="form-input" placeholder="e.g., ₹8-15 LPA" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="full-time">Full Time</option><option value="part-time">Part Time</option>
                  <option value="contract">Contract</option><option value="internship">Internship</option><option value="remote">Remote</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {['Technology','Marketing','Finance','Design','Sales','HR','Engineering','Healthcare','Education','Other'].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input type="text" className="form-input" placeholder="e.g., 2-4 years" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input type="date" className="form-input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (comma separated)</label>
              <input type="text" className="form-input" placeholder="React, Node.js, MongoDB, TypeScript..." value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
            </div>

            <div className="form-group">
              <div className="description-header">
                <label className="form-label">Job Description *</label>
                <button type="button" className="btn btn-secondary btn-sm ai-btn" onClick={onAiGenerate} disabled={aiLoading}>
                  {aiLoading ? <div className="btn-loader" /> : <><HiOutlineSparkles /> Generate with AI</>}
                </button>
              </div>
              <textarea className="form-textarea description-textarea" placeholder="Describe the role, responsibilities, and requirements..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={12} required />
            </div>

            <div className="post-job-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? <div className="btn-loader" /> : 'Post Job'}</button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>Cancel</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;
