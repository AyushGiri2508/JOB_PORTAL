import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineUpload, HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { formData, setFormData, saving, uploading, handleSave, onDrop, getInitials } = useProfile(user, updateUser);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      try { await onDrop(files); toast.success('Resume uploaded! ✅'); }
      catch (err) { toast.error(err.response?.data?.message || err.message || 'Upload failed'); }
    },
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const onSave = async (e) => {
    try { await handleSave(e); toast.success('Profile updated! ✅'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div className="profile-layout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Profile Card */}
          <div className="profile-sidebar">
            <div className="glass-card profile-card">
              <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
              <h2>{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="badge badge-primary">{user?.role}</span>
              {user?.bio && <p className="profile-bio">{user.bio}</p>}
              <div className="profile-quick-info">
                {user?.location && <span><HiOutlineLocationMarker /> {user.location}</span>}
                {user?.experience && <span><HiOutlineBriefcase /> {user.experience}</span>}
                {user?.company && <span><HiOutlineBriefcase /> {user.company}</span>}
              </div>
              {user?.skills?.length > 0 && (
                <div className="profile-skills">
                  {user.skills.map((s, i) => (<span key={i} className="skill-tag">{s}</span>))}
                </div>
              )}
            </div>

            {/* Resume Upload */}
            {user?.role === 'jobseeker' && (
              <div className="glass-card resume-card">
                <h3><HiOutlineDocumentText /> Resume</h3>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
                  <input {...getInputProps()} />
                  {uploading ? (<div className="loader" />) : (
                    <>
                      <HiOutlineUpload className="dropzone-icon" />
                      <p>{isDragActive ? 'Drop your resume here...' : 'Drag & drop or click to upload'}</p>
                      <span>PDF only, max 5MB</span>
                    </>
                  )}
                </div>
                {user?.resume && (<p className="resume-status"><HiOutlineCheck /> Resume uploaded</p>)}
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="profile-main">
            <div className="glass-card profile-form-card">
              <h2>Edit Profile</h2>
              <form onSubmit={onSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><HiOutlineUser /> Full Name</label>
                    <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><HiOutlinePhone /> Phone</label>
                    <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><HiOutlineLocationMarker /> Location</label>
                    <input type="text" className="form-input" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><HiOutlineBriefcase /> Experience</label>
                    <input type="text" className="form-input" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g., 3 years" />
                  </div>
                </div>
                {user?.role === 'recruiter' && (
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input type="text" className="form-input" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Skills (comma separated)</label>
                  <input type="text" className="form-input" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, Python, ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." rows={4} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                  {saving ? <div className="btn-loader" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
