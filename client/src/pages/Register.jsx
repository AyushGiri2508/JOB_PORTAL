import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'pill',
          });
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      const data = await loginWithGoogle(response.credential);
      toast.success('Account created successfully!');
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        company: formData.company,
      });
      toast.success('Account created successfully!');
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <HiOutlineBriefcase />
          </div>
          <h1>Create Account</h1>
          <p>Start your career journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${formData.role === 'jobseeker' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
            >
              <HiOutlineUser /> Job Seeker
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
            >
              <HiOutlineOfficeBuilding /> Recruiter
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <HiOutlineUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <HiOutlineMail className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.role === 'recruiter' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-with-icon">
                <HiOutlineOfficeBuilding className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <div className="btn-loader" /> : 'Create Account'}
          </button>
        </form>

        {/* Google Sign-Up */}
        {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <div className="google-btn-wrapper" ref={googleBtnRef} />
          </>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
