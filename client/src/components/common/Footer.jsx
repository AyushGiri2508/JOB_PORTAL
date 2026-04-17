import { Link } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineMail, HiOutlineHeart } from 'react-icons/hi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <HiOutlineBriefcase />
              </div>
              <span>
                Job<span className="logo-accent">Portal</span>
              </span>
            </Link>
            <p className="footer-desc">
              Your AI-powered career companion. Find your dream job or the perfect
              candidate with intelligent matching and tools.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>For Job Seekers</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/ai-tools">AI Resume Analyzer</Link>
            <Link to="/ai-tools">AI Job Matching</Link>
            <Link to="/ai-tools">Interview Prep</Link>
          </div>

          <div className="footer-links-group">
            <h4>For Recruiters</h4>
            <Link to="/register">Post a Job</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/ai-tools">AI Job Description</Link>
          </div>

          <div className="footer-links-group">
            <h4>Contact</h4>
            <a href="mailto:support@jobportal.com">
              <HiOutlineMail /> support@jobportal.com
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} JobPortal. Made with{' '}
            <HiOutlineHeart className="heart-icon" /> for the future of hiring.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
