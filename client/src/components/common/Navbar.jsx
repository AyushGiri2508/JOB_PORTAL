import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <div className="logo-icon">
            <HiOutlineBriefcase />
          </div>
          <span className="logo-text">
            Aryo<span className="logo-accent">Jobs</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/jobs" className="nav-link">
            <HiOutlineBriefcase /> Jobs
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/ai-tools" className="nav-link nav-link-ai">
                <HiOutlineSparkles /> AI Tools
              </Link>

              {isRecruiter ? (
                <Link to="/dashboard" className="nav-link">
                  <HiOutlineViewGrid /> Dashboard
                </Link>
              ) : (
                <Link to="/my-applications" className="nav-link">
                  <HiOutlineDocumentText /> My Applications
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">{getInitials(user?.name)}</div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <HiOutlineChevronDown
                  className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.name}</p>
                      <span className="dropdown-role badge badge-primary">
                        {user?.role}
                      </span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <HiOutlineUser /> Profile
                    </Link>
                    {isRecruiter && (
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <HiOutlineViewGrid /> Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <HiOutlineLogout /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/jobs" className="mobile-link" onClick={() => setMobileOpen(false)}>
              <HiOutlineBriefcase /> Browse Jobs
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/ai-tools" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  <HiOutlineSparkles /> AI Tools
                </Link>
                {isRecruiter ? (
                  <Link to="/dashboard" className="mobile-link" onClick={() => setMobileOpen(false)}>
                    <HiOutlineViewGrid /> Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/my-applications"
                    className="mobile-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    <HiOutlineDocumentText /> My Applications
                  </Link>
                )}
                <Link to="/profile" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  <HiOutlineUser /> Profile
                </Link>
                <button className="mobile-link mobile-logout" onClick={handleLogout}>
                  <HiOutlineLogout /> Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="mobile-link" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
