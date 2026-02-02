import './App.css';
import './styles/auth.css';
import './styles/dashboard.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateResume from './pages/CreateResume';
import ResumePreview from './pages/ResumePreview';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create-resume" element={<ProtectedRoute><CreateResume /></ProtectedRoute>} />
              <Route path="/create-resume/:id" element={<ProtectedRoute><CreateResume /></ProtectedRoute>} />
              <Route path="/resume/:id" element={<ProtectedRoute><ResumePreview /></ProtectedRoute>} />
            </Routes>
          </div>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

export default App;
