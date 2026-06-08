import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, FileText, Edit3, Trash2, Download, Eye, Search, Sun, Moon, Palette, Grid3X3, Calendar, Briefcase, GraduationCap, Code, Award, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Footer from '../components/Footer';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [error, setError] = useState(null);

  // ✅ FIX: currentUser ready hone par hi fetch karo
  useEffect(() => {
    if (currentUser) {
      fetchResumes();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchResumes = async () => {
    // ✅ FIX: Double-check auth before Firestore call
    if (!currentUser || !currentUser.uid) {
      console.warn('fetchResumes: No authenticated user found.');
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const q = query(
        collection(db, 'users', currentUser.uid, 'resumes'),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const resumesData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setResumes(resumesData);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      // ✅ FIX: User-friendly error message
      if (err.code === 'permission-denied') {
        setError('Firestore permissions error. Please check your Firebase Security Rules.');
      } else {
        setError('Resumes load karne mein masla aaya. Dobara try karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async () => {
    // ✅ FIX: Auth guard
    if (!currentUser || !currentUser.uid) {
      console.warn('createNewResume: No authenticated user.');
      navigate('/login');
      return;
    }

    try {
      const newResume = {
        title: 'Untitled Resume',
        templateId: selectedTemplate,
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          linkedin: '',
          github: '',
          website: ''
        },
        education: [],
        experience: [],
        skills: [],
        projects: [],
        summary: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(
        collection(db, 'users', currentUser.uid, 'resumes'),
        newResume
      );
      navigate(`/create-resume/${docRef.id}`);
    } catch (err) {
      console.error('Error creating resume:', err);
      if (err.code === 'permission-denied') {
        setError('Resume create karne ki permission nahi. Firebase Security Rules check karein.');
      } else {
        setError('Resume create karne mein masla aaya. Dobara try karein.');
      }
    }
  };

  const deleteResume = async (id) => {
    if (!currentUser || !currentUser.uid) return;

    if (window.confirm('Kya aap yeh resume delete karna chahte hain?')) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'resumes', id));
        setResumes(prev => prev.filter(resume => resume.id !== id));
      } catch (err) {
        console.error('Error deleting resume:', err);
        if (err.code === 'permission-denied') {
          setError('Delete karne ki permission nahi. Firebase Security Rules check karein.');
        } else {
          setError('Resume delete karne mein masla aaya.');
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const filteredResumes = resumes.filter(resume =>
    resume.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resume.personalInfo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FIX: Agar user logged in nahi toh login page par bhejo
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className={`dashboard-bg-gradient ${theme}`}>
      {/* Header */}
      <header className={`navbar-glass ${theme}`}>
        <div className="dashboard-max-width-container">
          <div className="d-flex justify-between items-center h-16">
            <div className="d-flex items-center space-x-4">
              <div className="navbar-brand">
                <div className="navbar-brand-icon">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="navbar-brand-text">ResumeBuilder</h1>
              </div>
            </div>

            <div className="navbar-actions">
              <div className="navbar-search">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input-enhanced pl-11 pr-4 py-2 w-64 text-white placeholder-white/60 ${theme}`}
                  />
                </div>
              </div>

              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={`input-enhanced px-4 py-2 text-white ${theme}`}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="professional">Professional</option>
              </select>

              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                <Palette className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="navbar-user-menu">
                <div className="user-avatar">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <LogOut
                  className="w-5 h-5 logout-btn cursor-pointer transition-all duration-300"
                  onClick={handleLogout}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main-container">
        <div className="d-flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Resumes</h2>
            <p className="text-muted-foreground mt-2">Manage your professional resumes</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewResume}
            className="bg-gradient-linear text-white px-6 py-3 rounded-xl font-semibold d-flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Resume</span>
          </motion.button>
        </div>

        {/* ✅ FIX: Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-300 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* Welcome Section */}
        <div className={`welcome-section ${theme}`}>
          <div className="d-flex justify-between items-center mb-2">
            <h2>Welcome back, {currentUser?.email?.split('@')[0]}!</h2>
            <p>Here's what's happening with your resumes today.</p>
          </div>
          <p>Manage and track your professional resumes</p>
        </div>

        {loading ? (
          <div className="d-flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-linear rounded-2xl d-flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first professional resume.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewResume}
              className="bg-gradient-linear text-white px-6 py-3 rounded-xl font-semibold d-flex items-center space-x-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Resume</span>
            </motion.button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="dashboard-stats-container">
              <div className={`dashboard-stat-card ${theme}`}>
                <div className="dashboard-stat-value">{filteredResumes.length}</div>
                <div className="dashboard-stat-label">Total Resumes</div>
              </div>
              <div className={`dashboard-stat-card ${theme}`}>
                <div className="dashboard-stat-value">
                  {filteredResumes.reduce((acc, resume) => acc + (resume.experience?.length || 0), 0)}
                </div>
                <div className="dashboard-stat-label">Total Experiences</div>
              </div>
              <div className={`dashboard-stat-card ${theme}`}>
                <div className="dashboard-stat-value">
                  {filteredResumes.reduce((acc, resume) => acc + (resume.skills?.length || 0), 0)}
                </div>
                <div className="dashboard-stat-label">Total Skills</div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className={`analytics-section ${theme}`}>
              <div className="analytics-header">
                <h3>Resume Analytics</h3>
              </div>
              <div className="analytics-grid">
                {/* Template Distribution */}
                <div className={`analytics-card ${theme}`}>
                  <h4>Template Distribution</h4>
                  {['classic', 'modern', 'professional'].map(template => {
                    const count = filteredResumes.filter(r => r.templateId === template).length;
                    const percentage = filteredResumes.length > 0
                      ? Math.round((count / filteredResumes.length) * 100)
                      : 0;
                    return (
                      <div key={template} className="mb-4">
                        <div className="progress-label">
                          <span className="capitalize">{template}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className={`progress-bar ${template === 'classic' ? 'progress-bar-template' : template === 'modern' ? 'progress-bar-experience' : 'progress-bar-skills'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Experience Level Distribution */}
                <div className={`analytics-card ${theme}`}>
                  <h4>Experience Levels</h4>
                  {[
                    { label: 'Entry Level', min: 0, max: 2 },
                    { label: 'Mid Level', min: 3, max: 5 },
                    { label: 'Senior Level', min: 6, max: 8 },
                    { label: 'Executive', min: 9, max: Infinity }
                  ].map(({ label, min, max }) => {
                    const count = filteredResumes.filter(r => {
                      const len = r.experience?.length || 0;
                      return len >= min && len <= max;
                    }).length;
                    const percentage = filteredResumes.length > 0
                      ? Math.round((count / filteredResumes.length) * 100)
                      : 0;
                    return (
                      <div key={label} className="mb-4">
                        <div className="progress-label">
                          <span>{label}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className={`progress-bar ${label === 'Entry Level' ? 'progress-bar-education' : label === 'Mid Level' ? 'progress-bar-template' : label === 'Senior Level' ? 'progress-bar-experience' : 'progress-bar-skills'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
              <div className={`quick-action-card ${theme}`} onClick={createNewResume}>
                <div className="quick-action-icon">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="quick-action-title">New Resume</div>
                <div className="quick-action-desc">Create a professional resume</div>
              </div>
              <div
                className={`quick-action-card ${theme}`}
                onClick={() => {
                  if (filteredResumes.length > 0) {
                    navigate(`/create-resume/${filteredResumes[0].id}`);
                  } else {
                    createNewResume();
                  }
                }}
              >
                <div className="quick-action-icon">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div className="quick-action-title">Edit Existing</div>
                <div className="quick-action-desc">Modify your current resume</div>
              </div>
              <div className={`quick-action-card ${theme}`} onClick={() => navigate('/dashboard')}>
                <div className="quick-action-icon">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="quick-action-title">Preview</div>
                <div className="quick-action-desc">View your resume professionally</div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className={`dashboard-activity-timeline ${theme}`}>
              <h3 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {filteredResumes.slice(0, 3).map((resume, index) => (
                  <div key={index} className={`activity-item ${theme}`}>
                    <div className="activity-icon">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Updated "{resume.title}"</div>
                      <div className="activity-time">
                        {resume.updatedAt?.toDate
                          ? resume.updatedAt.toDate().toLocaleString()
                          : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Grid */}
            <div className="resume-grid">
              {filteredResumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card-enhanced p-6 hover:scale-105 transition-all duration-300 d-flex flex-col h-full ${theme}`}
                >
                  <div className="d-flex items-start justify-between mb-4">
                    <div className="d-flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-linear rounded-xl d-flex items-center justify-center shadow-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-foreground truncate max-w-[160px] ${theme}`}>
                          {resume.title}
                        </h3>
                        <p className={`text-sm text-muted-foreground ${theme}`}>
                          {resume.updatedAt?.toDate
                            ? resume.updatedAt.toDate().toLocaleDateString()
                            : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full badge ${
                        resume.templateId === 'modern'
                          ? 'badge-modern'
                          : resume.templateId === 'professional'
                          ? 'badge-professional'
                          : 'badge-secondary'
                      }`}
                    >
                      {resume.templateId}
                    </span>
                  </div>

                  <div className="d-grid gap-3 mb-6 flex-1">
                    <div className={`d-flex items-center text-sm text-muted-foreground ${theme}`}>
                      <Briefcase className="w-4 h-4 mr-3 text-indigo-500" />
                      <span>{resume.experience?.length || 0} experiences</span>
                    </div>
                    <div className={`d-flex items-center text-sm text-muted-foreground ${theme}`}>
                      <GraduationCap className="w-4 h-4 mr-3 text-indigo-500" />
                      <span>{resume.education?.length || 0} educations</span>
                    </div>
                    <div className={`d-flex items-center text-sm text-muted-foreground ${theme}`}>
                      <Code className="w-4 h-4 mr-3 text-indigo-500" />
                      <span>{resume.skills?.length || 0} skills</span>
                    </div>
                  </div>

                  <div className="d-flex space-x-2">
                    <button
                      onClick={() => navigate(`/create-resume/${resume.id}`)}
                      className={`flex-1 btn-enhanced d-flex items-center justify-center space-x-1 py-3 ${theme}`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      className={`flex-1 btn-enhanced d-flex items-center justify-center space-x-1 py-3 ${theme}`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className={`flex-1 btn-enhanced bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30 d-flex items-center justify-center space-x-1 py-3 ${theme}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;