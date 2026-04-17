import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeResume, matchJobs, generateCoverLetter, interviewPrep } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineSparkles,
  HiOutlineDocumentSearch,
  HiOutlineLightningBolt,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineUpload,
  HiOutlineChevronDown,
  HiOutlineClipboardCopy,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './AITools.css';

const AITools = () => {
  const { user, isRecruiter } = useAuth();
  const [activeTab, setActiveTab] = useState('resume-analyzer');
  const [loading, setLoading] = useState(false);

  // Resume Analyzer
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const onResumeDrop = async (files) => {
    if (files.length === 0) return;
    setLoading(true);
    setResumeAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('resume', files[0]);
      const { data } = await analyzeResume(formData);
      setResumeAnalysis(data.analysis);
      toast.success('Resume analyzed! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };
  const resumeDropzone = useDropzone({
    onDrop: onResumeDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  // Job Matching
  const [matchResults, setMatchResults] = useState(null);
  const [matchSkills, setMatchSkills] = useState(user?.skills?.join(', ') || '');
  const [matchExperience, setMatchExperience] = useState(user?.experience || '');
  const handleMatchJobs = async () => {
    setLoading(true);
    setMatchResults(null);
    try {
      const { data } = await matchJobs({
        skills: matchSkills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: matchExperience,
      });
      setMatchResults(data.matches);
      if (data.matches.length === 0) toast('No matching jobs found', { icon: '🔍' });
      else toast.success(`Found ${data.matches.length} matches! 🎯`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally {
      setLoading(false);
    }
  };

  // Cover Letter
  const [coverLetterResult, setCoverLetterResult] = useState('');
  const [coverLetterData, setCoverLetterData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
  });
  const handleGenerateCover = async () => {
    if (!coverLetterData.jobTitle || !coverLetterData.company) {
      return toast.error('Job title and company are required');
    }
    setLoading(true);
    setCoverLetterResult('');
    try {
      const { data } = await generateCoverLetter({
        ...coverLetterData,
        userName: user?.name,
        userSkills: user?.skills,
        userExperience: user?.experience,
      });
      setCoverLetterResult(data.coverLetter);
      toast.success('Cover letter generated! ✉️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Interview Prep
  const [interviewResult, setInterviewResult] = useState(null);
  const [interviewData, setInterviewData] = useState({ jobTitle: '', company: '', skills: '' });
  const handleInterviewPrep = async () => {
    if (!interviewData.jobTitle) return toast.error('Job title is required');
    setLoading(true);
    setInterviewResult(null);
    try {
      const { data } = await interviewPrep({
        ...interviewData,
        skills: interviewData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setInterviewResult(data.prepMaterial);
      toast.success('Interview prep ready! 🎓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const tabs = [
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: <HiOutlineDocumentSearch /> },
    { id: 'job-matching', label: 'Job Matching', icon: <HiOutlineLightningBolt /> },
    { id: 'cover-letter', label: 'Cover Letter', icon: <HiOutlineDocumentText /> },
    { id: 'interview-prep', label: 'Interview Prep', icon: <HiOutlineAcademicCap /> },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="ai-header">
          <div className="ai-badge">
            <HiOutlineSparkles /> AI-Powered Tools
          </div>
          <h1>
            Supercharge Your Career with{' '}
            <span className="gradient-text">AI</span>
          </h1>
          <p>Use our intelligent tools to analyze resumes, match jobs, generate cover letters, and prepare for interviews.</p>
        </div>

        {/* Tab Navigation */}
        <div className="ai-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="ai-content"
          >
            {/* ===== RESUME ANALYZER ===== */}
            {activeTab === 'resume-analyzer' && (
              <div className="ai-section">
                <div className="glass-card ai-card">
                  <h2>📄 AI Resume Analyzer</h2>
                  <p className="ai-card-desc">
                    Upload your resume and get instant AI-powered feedback with ATS scoring, skill extraction, and improvement suggestions.
                  </p>

                  <div
                    {...resumeDropzone.getRootProps()}
                    className={`dropzone ai-dropzone ${resumeDropzone.isDragActive ? 'dropzone-active' : ''}`}
                  >
                    <input {...resumeDropzone.getInputProps()} />
                    {loading ? (
                      <div className="ai-loading">
                        <div className="loader" />
                        <p>Analyzing your resume with AI...</p>
                      </div>
                    ) : (
                      <>
                        <HiOutlineUpload className="dropzone-icon" />
                        <p>Drop your resume PDF here or click to upload</p>
                        <span>PDF only, max 5MB</span>
                      </>
                    )}
                  </div>

                  {resumeAnalysis && (
                    <motion.div
                      className="analysis-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* Score Cards */}
                      <div className="score-cards">
                        <div className="score-card">
                          <div className="score-ring" style={{ '--score': resumeAnalysis.overallScore }}>
                            <span>{resumeAnalysis.overallScore}</span>
                          </div>
                          <p>Overall Score</p>
                        </div>
                        <div className="score-card">
                          <div className="score-ring score-ring-ats" style={{ '--score': resumeAnalysis.atsScore }}>
                            <span>{resumeAnalysis.atsScore}</span>
                          </div>
                          <p>ATS Score</p>
                        </div>
                        <div className="score-card">
                          <div className="experience-badge">
                            {resumeAnalysis.experienceLevel}
                          </div>
                          <p>Experience Level</p>
                        </div>
                      </div>

                      {resumeAnalysis.summary && (
                        <div className="analysis-section">
                          <h3>Summary</h3>
                          <p>{resumeAnalysis.summary}</p>
                        </div>
                      )}

                      {resumeAnalysis.extractedSkills?.length > 0 && (
                        <div className="analysis-section">
                          <h3>Extracted Skills</h3>
                          <div className="skill-tags-wrap">
                            {resumeAnalysis.extractedSkills.map((s, i) => (
                              <span key={i} className="skill-tag">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {resumeAnalysis.strengths?.length > 0 && (
                        <div className="analysis-section">
                          <h3>✅ Strengths</h3>
                          <ul className="analysis-list success-list">
                            {resumeAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {resumeAnalysis.weaknesses?.length > 0 && (
                        <div className="analysis-section">
                          <h3>⚠️ Areas for Improvement</h3>
                          <ul className="analysis-list warning-list">
                            {resumeAnalysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {resumeAnalysis.suggestions?.length > 0 && (
                        <div className="analysis-section">
                          <h3>💡 Suggestions</h3>
                          <ul className="analysis-list">
                            {resumeAnalysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {resumeAnalysis.careerSuggestions?.length > 0 && (
                        <div className="analysis-section">
                          <h3>🚀 Career Suggestions</h3>
                          <div className="career-tags">
                            {resumeAnalysis.careerSuggestions.map((c, i) => (
                              <span key={i} className="badge badge-purple">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ===== JOB MATCHING ===== */}
            {activeTab === 'job-matching' && (
              <div className="ai-section">
                <div className="glass-card ai-card">
                  <h2>🎯 AI Job Matching</h2>
                  <p className="ai-card-desc">
                    Enter your skills and experience to find the most relevant job matches ranked by compatibility.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Your Skills (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="React, Node.js, Python, ..."
                      value={matchSkills}
                      onChange={(e) => setMatchSkills(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 3 years"
                      value={matchExperience}
                      onChange={(e) => setMatchExperience(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleMatchJobs}
                    disabled={loading}
                  >
                    {loading ? <div className="btn-loader" /> : <><HiOutlineLightningBolt /> Find Matches</>}
                  </button>

                  {matchResults && matchResults.length > 0 && (
                    <div className="match-results">
                      {matchResults.map((match, i) => (
                        <div key={i} className="glass-card match-card">
                          <div className="match-score-bar">
                            <div
                              className="match-score-fill"
                              style={{ width: `${match.matchScore}%` }}
                            />
                            <span className="match-score-label">{match.matchScore}% Match</span>
                          </div>
                          <h3>{match.job?.title}</h3>
                          <p className="match-company">{match.job?.company} — {match.job?.location}</p>
                          {match.matchReasons?.length > 0 && (
                            <div className="match-reasons">
                              {match.matchReasons.map((r, j) => (
                                <span key={j} className="badge badge-success">{r}</span>
                              ))}
                            </div>
                          )}
                          {match.missingSkills?.length > 0 && (
                            <p className="missing-skills">
                              Missing: {match.missingSkills.join(', ')}
                            </p>
                          )}
                          {match.recommendation && (
                            <p className="match-rec">{match.recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== COVER LETTER ===== */}
            {activeTab === 'cover-letter' && (
              <div className="ai-section">
                <div className="glass-card ai-card">
                  <h2>✉️ AI Cover Letter Generator</h2>
                  <p className="ai-card-desc">
                    Generate a professional, tailored cover letter for any job application.
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Job Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Frontend Developer"
                        value={coverLetterData.jobTitle}
                        onChange={(e) => setCoverLetterData({ ...coverLetterData, jobTitle: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Company name"
                        value={coverLetterData.company}
                        onChange={(e) => setCoverLetterData({ ...coverLetterData, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Description (optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Paste the job description for a more tailored letter..."
                      value={coverLetterData.jobDescription}
                      onChange={(e) => setCoverLetterData({ ...coverLetterData, jobDescription: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleGenerateCover}
                    disabled={loading}
                  >
                    {loading ? <div className="btn-loader" /> : <><HiOutlineSparkles /> Generate Cover Letter</>}
                  </button>

                  {coverLetterResult && (
                    <div className="cover-letter-output">
                      <div className="output-header">
                        <h3>Generated Cover Letter</h3>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyToClipboard(coverLetterResult)}
                        >
                          <HiOutlineClipboardCopy /> Copy
                        </button>
                      </div>
                      <div className="output-text">
                        {coverLetterResult.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== INTERVIEW PREP ===== */}
            {activeTab === 'interview-prep' && (
              <div className="ai-section">
                <div className="glass-card ai-card">
                  <h2>🎓 AI Interview Preparation</h2>
                  <p className="ai-card-desc">
                    Get role-specific interview questions, answers, and preparation tips.
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Job Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Backend Engineer"
                        value={interviewData.jobTitle}
                        onChange={(e) => setInterviewData({ ...interviewData, jobTitle: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Company name"
                        value={interviewData.company}
                        onChange={(e) => setInterviewData({ ...interviewData, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Skills (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="React, Node.js, System Design..."
                      value={interviewData.skills}
                      onChange={(e) => setInterviewData({ ...interviewData, skills: e.target.value })}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleInterviewPrep}
                    disabled={loading}
                  >
                    {loading ? <div className="btn-loader" /> : <><HiOutlineAcademicCap /> Generate Prep Material</>}
                  </button>

                  {interviewResult && (
                    <div className="interview-results">
                      {interviewResult.technicalQuestions?.length > 0 && (
                        <div className="interview-section">
                          <h3>🔧 Technical Questions</h3>
                          {interviewResult.technicalQuestions.map((q, i) => (
                            <div key={i} className="question-card">
                              <div className="question-header">
                                <span className="q-number">Q{i + 1}</span>
                                <span className={`badge badge-${q.difficulty === 'hard' ? 'danger' : q.difficulty === 'medium' ? 'warning' : 'success'}`}>
                                  {q.difficulty}
                                </span>
                              </div>
                              <p className="question-text">{q.question}</p>
                              <p className="question-tip">💡 {q.tip}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {interviewResult.behavioralQuestions?.length > 0 && (
                        <div className="interview-section">
                          <h3>🗣️ Behavioral Questions</h3>
                          {interviewResult.behavioralQuestions.map((q, i) => (
                            <div key={i} className="question-card">
                              <p className="question-text">{q.question}</p>
                              <p className="question-tip">💡 {q.tip}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {interviewResult.dosAndDonts && (
                        <div className="interview-section">
                          <h3>✅ Dos & Don'ts</h3>
                          <div className="dos-donts-grid">
                            <div className="dos-card">
                              <h4>Do's</h4>
                              <ul>
                                {interviewResult.dosAndDonts.dos?.map((d, i) => (
                                  <li key={i}>✅ {d}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="donts-card">
                              <h4>Don'ts</h4>
                              <ul>
                                {interviewResult.dosAndDonts.donts?.map((d, i) => (
                                  <li key={i}>❌ {d}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {interviewResult.preparationChecklist?.length > 0 && (
                        <div className="interview-section">
                          <h3>📋 Preparation Checklist</h3>
                          <ul className="checklist">
                            {interviewResult.preparationChecklist.map((item, i) => (
                              <li key={i}>☐ {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AITools;
