import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const features = [
    {
      icon: <HiOutlineSparkles />,
      title: 'AI Resume Analyzer',
      desc: 'Get instant AI-powered feedback on your resume with scoring and improvement suggestions.',
      color: 'purple',
    },
    {
      icon: <HiOutlineLightningBolt />,
      title: 'Smart Job Matching',
      desc: 'Our AI matches your skills and experience to the most relevant job opportunities.',
      color: 'cyan',
    },
    {
      icon: <HiOutlineDocumentText />,
      title: 'Cover Letter Generator',
      desc: 'Generate tailored cover letters for any job application in seconds.',
      color: 'blue',
    },
    {
      icon: <HiOutlineChartBar />,
      title: 'Interview Prep',
      desc: 'AI-generated interview questions and tips specific to your target role.',
      color: 'green',
    },
    {
      icon: <HiOutlineUserGroup />,
      title: 'Recruiter Dashboard',
      desc: 'Manage job postings, review applications, and track hiring pipeline.',
      color: 'orange',
    },
    {
      icon: <HiOutlineShieldCheck />,
      title: 'Application Tracking',
      desc: 'Track all your job applications with real-time status updates.',
      color: 'pink',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Jobs' },
    { value: '50K+', label: 'Job Seekers' },
    { value: '5K+', label: 'Companies' },
    { value: '95%', label: 'Success Rate' },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-badge">
              <HiOutlineSparkles /> AI-Powered Job Platform
            </span>
            <h1 className="hero-title">
              Find Your <span className="gradient-text">Dream Career</span>
              <br />
              With AI Intelligence
            </h1>
            <p className="hero-subtitle">
              Discover thousands of job opportunities with AI-powered resume analysis,
              smart job matching, and automated cover letter generation.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="search-input-group">
                <HiOutlineSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-input-group">
                <HiOutlineLocationMarker className="search-icon" />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg search-btn">
                <HiOutlineSearch /> Search Jobs
              </button>
            </form>

            <div className="hero-tags">
              <span>Popular:</span>
              <Link to="/jobs?search=react">React.js</Link>
              <Link to="/jobs?search=python">Python</Link>
              <Link to="/jobs?search=design">UI Design</Link>
              <Link to="/jobs?search=data">Data Science</Link>
              <Link to="/jobs?search=devops">DevOps</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <motion.div
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat, i) => (
              <motion.div key={i} className="stats-card glass-card" variants={itemVariants}>
                <div className="stats-value">{stat.value}</div>
                <div className="stats-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powered by Artificial Intelligence</h2>
            <p>
              Leverage cutting-edge AI to supercharge your job search or simplify
              your hiring process.
            </p>
          </div>

          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className={`feature-card glass-card feature-${feature.color}`}
                variants={itemVariants}
              >
                <div className={`feature-icon feature-icon-${feature.color}`}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cta-content">
              <h2>Ready to Transform Your Career?</h2>
              <p>
                Join thousands of professionals who have found their perfect role
                through our AI-powered platform.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free <HiOutlineArrowRight />
                </Link>
                <Link to="/jobs" className="btn btn-secondary btn-lg">
                  <HiOutlineBriefcase /> Browse Jobs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
