import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import ManageApplications from './pages/ManageApplications';
import AITools from './pages/AITools';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Authenticated */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tools"
            element={
              <ProtectedRoute>
                <AITools />
              </ProtectedRoute>
            }
          />

          {/* Jobseeker */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute roles={['jobseeker']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Recruiter */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/post-job"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/applications/:jobId"
            element={
              <ProtectedRoute roles={['recruiter']}>
                <ManageApplications />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0c1020',
              color: '#f1f5f9',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0c1020' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0c1020' } },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
