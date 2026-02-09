import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  FileText,
  Download,
  Eye,
  Save,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Upload,
  Layout,
  Palette,
  Type,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';

// Import the custom CSS for the resume creation page
import '../styles/resume-create-enhanced.css';

function CreateResume() {
  const { id } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState({
    title: 'Untitled Resume',
    templateId: 'modern',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    education: [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
    skills: [{ name: '', level: 'Intermediate' }],
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    certifications: [{ name: '', issuer: '', date: '', credentialId: '' }]
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [activeSection, setActiveSection] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [previewScale, setPreviewScale] = useState('75'); // Default to 75% zoom

  // Check authentication state first
  if (authLoading) {
    return (
      <div className="create-resume-bg d-flex-items-center-justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="create-resume-bg d-flex-items-center-justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white mb-4">You must be logged in to create a resume.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-linear text-white px-6 py-3 rounded-xl font-semibold d-flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Login</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate completion percentage for each section
  const calculateCompletion = (section) => {
    // Ensure resumeData and its properties exist before accessing
    if (!resumeData) return 0;
    
    if (section === 'personal') {
      const personalInfo = resumeData.personalInfo || {};
      const { fullName, email } = personalInfo;
      const requiredFields = [fullName, email];
      const filledFields = requiredFields.filter(field => field && field.trim() !== '');
      return Math.round((filledFields.length / requiredFields.length) * 100);
    }
    
    if (section === 'education') {
      const education = resumeData.education || [];
      const filledEducations = education.filter(edu => 
        edu.institution || edu.degree || edu.fieldOfStudy
      );
      return filledEducations.length > 0 ? 100 : 0;
    }
    
    if (section === 'experience') {
      const experience = resumeData.experience || [];
      const filledExperiences = experience.filter(exp => 
        exp.company || exp.position || exp.description
      );
      return filledExperiences.length > 0 ? 100 : 0;
    }
    
    if (section === 'skills') {
      const skills = resumeData.skills || [];
      const filledSkills = skills.filter(skill => 
        skill.name
      );
      return filledSkills.length > 0 ? 100 : 0;
    }
    
    if (section === 'projects') {
      const projects = resumeData.projects || [];
      const filledProjects = projects.filter(project => 
        project.name || project.description
      );
      return filledProjects.length > 0 ? 100 : 0;
    }
    
    if (section === 'certifications') {
      const certifications = resumeData.certifications || [];
      const filledCerts = certifications.filter(cert => 
        cert.name || cert.issuer
      );
      return filledCerts.length > 0 ? 100 : 0;
    }
    
    if (section === 'summary') {
      const personalInfo = resumeData.personalInfo || {};
      return personalInfo.summary ? 100 : 0;
    }
    
    return 0;
  };
  
  // Overall completion percentage
  const overallCompletion = () => {
    if (!resumeData) return 0;
    const sections = ['personal', 'education', 'experience', 'skills', 'projects', 'certifications', 'summary'];
    const completedSections = sections.filter(section => calculateCompletion(section) > 0);
    return Math.round((completedSections.length / sections.length) * 100);
  };

  useEffect(() => {
    if (id && currentUser) {
      loadResume();
    }
  }, [id, currentUser]);

  const loadResume = async () => {
    if (!currentUser) {
      console.log('No current user, cannot load resume');
      return;
    }
    
    if (!id) {
      console.log('No resume ID provided');
      return;
    }

    try {
      console.log(`Attempting to load resume with ID: ${id} for user: ${currentUser.uid}`);
      const docRef = doc(db, 'users', currentUser.uid, 'resumes', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('Resume data loaded:', docSnap.data());
        setResumeData(docSnap.data());
      } else {
        console.log('Resume document does not exist');
        // Initialize with empty data if document doesn't exist
        setResumeData({
          title: 'Untitled Resume',
          templateId: 'modern',
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            linkedin: '',
            github: '',
            website: '',
            summary: ''
          },
          education: [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }],
          experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
          skills: [{ name: '', level: 'Intermediate' }],
          projects: [{ name: '', description: '', technologies: '', link: '' }],
          certifications: [{ name: '', issuer: '', date: '', credentialId: '' }]
        });
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      // Set default data in case of error
      setResumeData({
        title: 'Untitled Resume',
        templateId: 'modern',
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          linkedin: '',
          github: '',
          website: '',
          summary: ''
        },
        education: [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }],
        experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
        skills: [{ name: '', level: 'Intermediate' }],
        projects: [{ name: '', description: '', technologies: '', link: '' }],
        certifications: [{ name: '', issuer: '', date: '', credentialId: '' }]
      });
    }
  };

  const saveResume = async () => {
    if (!currentUser || !id) return;

    try {
      setIsSaving(true);
      setSaveStatus('Saving...');

      const docRef = doc(db, 'users', currentUser.uid, 'resumes', id);
      await updateDoc(docRef, {
        ...resumeData,
        updatedAt: serverTimestamp()
      });

      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const validateField = (section, field, value) => {
    const errors = { ...validationErrors };
    
    // Clear previous error for this field
    delete errors[`${section}.${field}`];
    
    // Validation rules
    if (section === 'personalInfo') {
      if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        errors[`${section}.${field}`] = 'Please enter a valid email address';
      }
      if (field === 'phone' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
        errors[`${section}.${field}`] = 'Please enter a valid phone number';
      }
      if (field === 'linkedin' && value && !value.startsWith('https://') && !value.startsWith('http://')) {
        errors[`${section}.${field}`] = 'Please enter a valid URL starting with https:// or http://';
      }
      if (field === 'github' && value && !value.startsWith('https://') && !value.startsWith('http://')) {
        errors[`${section}.${field}`] = 'Please enter a valid URL starting with https:// or http://';
      }
      if (field === 'website' && value && !value.startsWith('https://') && !value.startsWith('http://')) {
        errors[`${section}.${field}`] = 'Please enter a valid URL starting with https:// or http://';
      }
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (section, field, value, index = null) => {
    // Validate the field
    validateField(section, field, value);
    
    if (index !== null) {
      const newArray = [...resumeData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      setResumeData(prev => ({ ...prev, [section]: newArray }));
    } else {
      setResumeData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const getValidationError = (section, field) => {
    if (!validationErrors) return null;
    return validationErrors[`${section}.${field}`];
  };

  const addNewItem = (section) => {
    const newItem = {};
    switch (section) {
      case 'education':
        newItem.institution = '';
        newItem.degree = '';
        newItem.fieldOfStudy = '';
        newItem.startDate = '';
        newItem.endDate = '';
        newItem.grade = '';
        break;
      case 'experience':
        newItem.company = '';
        newItem.position = '';
        newItem.startDate = '';
        newItem.endDate = '';
        newItem.description = '';
        newItem.location = '';
        break;
      case 'skills':
        newItem.name = '';
        newItem.level = 'Intermediate';
        break;
      case 'projects':
        newItem.name = '';
        newItem.description = '';
        newItem.technologies = '';
        newItem.link = '';
        break;
      case 'certifications':
        newItem.name = '';
        newItem.issuer = '';
        newItem.date = '';
        newItem.credentialId = '';
        break;
      default:
        return;
    }

    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const exportToPDF = async () => {
    const input = document.getElementById('resume-preview');
    if (!input) return;

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resumeData.title || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  const LivePreview = () => (
    <div id="resume-preview" className="create-resume-preview-paper">
      {/* Header */}
      <div className="create-resume-preview-header-section">
        <h1 className="create-resume-preview-name">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
        <div className="create-resume-preview-contact">
          {resumeData.personalInfo.email && <span><Mail className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && <span><Phone className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.address && <span><MapPin className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.address}</span>}
          {resumeData.personalInfo.linkedin && <span><ExternalLink className="inline w-4 h-4 mr-1" /> LinkedIn: {resumeData.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.personalInfo.summary && (
        <div className="create-resume-preview-section">
          <h2 className="create-resume-preview-section-title">Summary</h2>
          <p className="create-resume-preview-item-description">{resumeData.personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).length > 0 && (
        <div className="create-resume-preview-section">
          <h2 className="create-resume-preview-section-title">Experience</h2>
          {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).map((exp, index) => (
            <div key={index} className="create-resume-preview-item">
              <div className="d-flex justify-between items-start">
                <h3 className="create-resume-preview-item-title">{exp.position || 'Position'}</h3>
                <span className="create-resume-preview-item-dates">{exp.startDate} - {exp.endDate || 'Present'}</span>
              </div>
              <p className="create-resume-preview-item-subtitle">{exp.company || 'Company'} • {exp.location || 'Location'}</p>
              <p className="create-resume-preview-item-description">{exp.description || 'Description'}</p>
            </div>
          ))}
        </div>
      )}
  
      {resumeData.education.filter(edu => edu.institution || edu.degree).length > 0 && (
        <div className="create-resume-preview-section">
          <h2 className="create-resume-preview-section-title">Education</h2>
          {resumeData.education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
            <div key={index} className="create-resume-preview-item">
              <div className="d-flex justify-between items-start">
                <h3 className="create-resume-preview-item-title">{edu.degree || 'Degree'}</h3>
                <span className="create-resume-preview-item-dates">{edu.startDate} - {edu.endDate || 'Present'}</span>
              </div>
              <p className="create-resume-preview-item-subtitle">{edu.institution || 'Institution'} • {edu.fieldOfStudy || 'Field of Study'}</p>
              {edu.grade && <p className="text-gray-600 text-sm">Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.filter(skill => skill.name).length > 0 && (
        <div className="create-resume-preview-section">
          <h2 className="create-resume-preview-section-title">Skills</h2>
          <div className="create-resume-preview-skills">
            {resumeData.skills.filter(skill => skill.name).map((skill, index) => (
              <span key={index} className="create-resume-preview-skill">
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}

    
      {resumeData.projects.filter(project => project.name || project.description).length > 0 && (
        <div className="create-resume-preview-section">
          <h2 className="create-resume-preview-section-title">Projects</h2>
          {resumeData.projects.filter(project => project.name || project.description).map((project, index) => (
            <div key={index} className="create-resume-preview-item">
              <div className="d-flex justify-between items-start">
                <h3 className="create-resume-preview-item-title">{project.name || 'Project Name'}</h3>
                {project.link && <a href={project.link} className="text-blue-600 text-sm hover:underline">{project.link}</a>}
              </div>
              <p className="create-resume-preview-item-description">{project.description || 'Description'}</p>
              {project.technologies && <p className="text-gray-600 text-sm mt-1">Technologies: {project.technologies}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );


  return (
    <div className={`create-resume-bg ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className={`create-resume-navbar ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <div className={`create-resume-nav-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
          <div className="create-resume-navbar-left flex items-center space-x-4 flex-shrink-0">
            <div className="create-resume-brand-icon flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ResumeBuilder</h1>
              <div className="flex items-center mt-1">
                <div className="create-resume-progress-container w-32">
                  <div
                    className="create-resume-progress-bar"
                    style={{ width: `${overallCompletion()}%` }}
                  ></div>
                </div>
                <span className="text-sm text-white/80 ml-2 font-medium">{overallCompletion()}% Complete</span>
              </div>
            </div>
          </div>

          <div className="create-resume-navbar-right flex items-center space-x-3 flex-wrap gap-2">
            <div className="create-resume-title-container">
              <input
                type="text"
                value={resumeData.title}
                onChange={(e) => handleInputChange('title', 'title', e.target.value)}
                className="create-resume-input"
                placeholder="Enter resume title"
              />
            </div>

            <select
              value={resumeData.templateId}
              onChange={(e) => handleInputChange('templateId', 'templateId', e.target.value)}
              className="create-resume-select"
            >
              <option value="modern">Modern Template</option>
              <option value="classic">Classic Template</option>
              <option value="professional">Professional Template</option>
            </select>

            <button
              onClick={() => toggleTheme()}
              className="create-resume-theme-toggle p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={saveResume}
              disabled={isSaving}
              className="create-resume-btn create-resume-btn-save d-flex items-center space-x-2 px-4 py-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={exportToPDF}
              className="create-resume-btn create-resume-btn-export d-flex items-center space-x-2 px-4 py-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => navigate(`/resume/${id}`)}
              className="create-resume-btn create-resume-btn-preview d-flex items-center space-x-2 px-4 py-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            {saveStatus && (
              <span className={`create-resume-status ${typeof saveStatus === 'string' && saveStatus.includes('Error') ? 'error' : typeof saveStatus === 'string' && saveStatus === 'Saved!' ? 'success' : ''}`}>
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}

      <div className="create-resume-main">
        {/* Sidebar - Hidden on mobile by default, shown with overlay */}
        <div className={`create-resume-sidebar ${theme === 'dark' ? 'dark-mode' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <div className="create-resume-sidebar-header">
            <div className="create-resume-sidebar-title-container">
              <h2 className="create-resume-sidebar-title">Resume Sections</h2>
              <div className="create-resume-total-completion">
                <span className="create-resume-completion-text">Overall Progress:</span>
                <span className="create-resume-completion-value">{overallCompletion()}%</span>
              </div>
            </div>
            <p className="create-resume-sidebar-subtitle">Click to edit different sections</p>
          </div>
          <nav className="create-resume-nav-list">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const completion = calculateCompletion(section.id);
              const isComplete = completion === 100;
              const isInProgress = completion > 0 && completion < 100;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`create-resume-nav-item ${theme === 'dark' ? 'dark-mode' : ''} ${activeSection === section.id ? 'active' : ''}`}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <div className="create-resume-nav-icon">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="create-resume-nav-content">
                    <div className="create-resume-nav-label">{section.label}</div>
                    <div className="create-resume-nav-progress">
                      <div className="create-resume-nav-progress-container">
                        <div
                          className="create-resume-nav-progress-bar"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                      <span className={`create-resume-nav-progress-text ${
                        isComplete ? 'complete' :
                        isInProgress ? 'in-progress' :
                        'not-started'
                      }`}>
                        {completion}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="create-resume-overlay open"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile header for toggling sidebar */}
        <div className="create-resume-mobile-header lg:hidden">
          <h2 className="create-resume-mobile-title">
            {sections.find(s => s.id === activeSection)?.label || 'Resume Editor'}
          </h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="create-resume-mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            <span>Menu</span>
          </button>
        </div>

        {/* Main Editor */}
        <div className="create-resume-editor">
          <div className="create-resume-editor-grid">
            {/* Form Section */}
            <div className="create-resume-form-section">
              {activeSection === 'personal' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`create-resume-card personal ${theme === 'dark' ? 'dark-mode' : ''} create-resume-animate`}
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h2>
                  </div>

                  <div className="create-resume-form-grid personal-info-grid">
                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.fullName || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'fullName') ? 'error' : ''}`}
                        placeholder="John Doe"
                      />
                      {getValidationError('personalInfo', 'fullName') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'fullName')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Email</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo?.email || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'email') ? 'error' : ''}`}
                        placeholder="john@example.com"
                      />
                      {getValidationError('personalInfo', 'email') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'email')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Phone</label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo?.phone || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'phone') ? 'error' : ''}`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {getValidationError('personalInfo', 'phone') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'phone')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Address</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.address || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        className="create-resume-form-input"
                        placeholder="123 Main St, City"
                      />
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">LinkedIn</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo?.linkedin || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'linkedin') ? 'error' : ''}`}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {getValidationError('personalInfo', 'linkedin') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'linkedin')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">GitHub</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo?.github || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'github') ? 'error' : ''}`}
                        placeholder="https://github.com/username"
                      />
                      {getValidationError('personalInfo', 'github') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'github')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Website</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo?.website || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                        className={`create-resume-form-input ${getValidationError('personalInfo', 'website') ? 'error' : ''}`}
                        placeholder="https://yourwebsite.com"
                      />
                      {getValidationError('personalInfo', 'website') && (
                        <p className="create-resume-error-message">{getValidationError('personalInfo', 'website')}</p>
                      )}
                    </div>

                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo?.summary || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        className="create-resume-form-textarea"
                        placeholder="A brief summary of your professional background and career goals..."
                        rows="4"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'summary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`create-resume-card summary ${theme === 'dark' ? 'dark-mode' : ''} create-resume-animate`}
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <FileText className="w-5 h-5" />
                      Professional Summary
                    </h2>
                  </div>

                  <div className="create-resume-form-grid personal-info-grid">
                    <div className="create-resume-form-field">
                      <label className="create-resume-form-label">Summary</label>
                      <textarea
                        value={resumeData.personalInfo?.summary || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        className="create-resume-form-textarea"
                        placeholder="A compelling summary that highlights your key qualifications, experience, and career objectives..."
                        rows="6"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'education' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="create-resume-card education create-resume-animate"
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </h2>
                    <button
                      onClick={() => addNewItem('education')}
                      className="create-resume-add-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {(resumeData.education || []).map((edu, index) => (
                      <div key={index} className="create-resume-item">
                        <button
                          onClick={() => removeItem('education', index)}
                          className="create-resume-remove-btn"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="create-resume-form-grid">
                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Institution</label>
                            <input
                              type="text"
                              value={edu?.institution || ''}
                              onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="University Name"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Degree</label>
                            <input
                              type="text"
                              value={edu?.degree || ''}
                              onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Field of Study</label>
                            <input
                              type="text"
                              value={edu?.fieldOfStudy || ''}
                              onChange={(e) => handleInputChange('education', 'fieldOfStudy', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Computer Science, Business, etc."
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Grade/GPA</label>
                            <input
                              type="text"
                              value={edu?.grade || ''}
                              onChange={(e) => handleInputChange('education', 'grade', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="3.8/4.0, A-, etc."
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Start Date</label>
                            <input
                              type="month"
                              value={edu?.startDate || ''}
                              onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                              className="create-resume-form-input"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">End Date</label>
                            <input
                              type="month"
                              value={edu?.endDate || ''}
                              onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)}
                              className="create-resume-form-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'experience' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="create-resume-card experience create-resume-animate"
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </h2>
                    <button
                      onClick={() => addNewItem('experience')}
                      className="create-resume-add-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {(resumeData.experience || []).map((exp, index) => (
                      <div key={index} className="create-resume-item">
                        <button
                          onClick={() => removeItem('experience', index)}
                          className="create-resume-remove-btn"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="create-resume-form-grid">
                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Company</label>
                            <input
                              type="text"
                              value={exp?.company || ''}
                              onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Company Name"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Position</label>
                            <input
                              type="text"
                              value={exp?.position || ''}
                              onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Job Title"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Location</label>
                            <input
                              type="text"
                              value={exp?.location || ''}
                              onChange={(e) => handleInputChange('experience', 'location', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="City, State"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Start Date</label>
                            <input
                              type="month"
                              value={exp?.startDate || ''}
                              onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                              className="create-resume-form-input"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">End Date</label>
                            <input
                              type="month"
                              value={exp?.endDate || ''}
                              onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Leave blank if current"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="create-resume-form-label">Description</label>
                          <textarea
                            value={exp?.description || ''}
                            onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                            className="create-resume-form-textarea"
                            placeholder="Describe your responsibilities and achievements..."
                            rows="3"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'skills' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="create-resume-card skills create-resume-animate"
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <Code className="w-5 h-5" />
                      Skills
                    </h2>
                    <button
                      onClick={() => addNewItem('skills')}
                      className="create-resume-add-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {(resumeData.skills || []).map((skill, index) => (
                      <div key={index} className="create-resume-item">
                        <button
                          onClick={() => removeItem('skills', index)}
                          className="create-resume-remove-btn"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="create-resume-form-grid">
                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Skill Name</label>
                            <input
                              type="text"
                              value={skill?.name || ''}
                              onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="JavaScript, Python, Leadership..."
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Proficiency Level</label>
                            <select
                              value={skill?.level || 'Intermediate'}
                              onChange={(e) => handleInputChange('skills', 'level', e.target.value, index)}
                              className="create-resume-form-select"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="create-resume-card projects create-resume-animate"
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <Award className="w-5 h-5" />
                      Projects
                    </h2>
                    <button
                      onClick={() => addNewItem('projects')}
                      className="create-resume-add-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {(resumeData.projects || []).map((project, index) => (
                      <div key={index} className="create-resume-item">
                        <button
                          onClick={() => removeItem('projects', index)}
                          className="create-resume-remove-btn"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="create-resume-form-grid">
                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Project Name</label>
                            <input
                              type="text"
                              value={project?.name || ''}
                              onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Project Name"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Technologies Used</label>
                            <input
                              type="text"
                              value={project?.technologies || ''}
                              onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="React, Node.js, MongoDB..."
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Project Link</label>
                            <input
                              type="url"
                              value={project?.link || ''}
                              onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="https://project-url.com"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="create-resume-form-label">Description</label>
                          <textarea
                            value={project?.description || ''}
                            onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                            className="create-resume-form-textarea"
                            placeholder="Describe the project, your role, and key accomplishments..."
                            rows="3"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'certifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="create-resume-card certifications create-resume-animate"
                >
                  <div className="create-resume-card-header">
                    <h2 className="create-resume-card-title">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h2>
                    <button
                      onClick={() => addNewItem('certifications')}
                      className="create-resume-add-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {(resumeData.certifications || []).map((cert, index) => (
                      <div key={index} className="create-resume-item">
                        <button
                          onClick={() => removeItem('certifications', index)}
                          className="create-resume-remove-btn"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="create-resume-form-grid">
                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Certification Name</label>
                            <input
                              type="text"
                              value={cert?.name || ''}
                              onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="AWS Certified Developer"
                            />
                          </div>

                          <div className="create-resume-form-field">
                                <label className="create-resume-form-label">Issuer</label>
                            <input
                              type="text"
                              value={cert?.issuer || ''}
                              onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="Amazon Web Services"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Date</label>
                            <input
                              type="month"
                              value={cert?.date || ''}
                              onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                              className="create-resume-form-input"
                            />
                          </div>

                          <div className="create-resume-form-field">
                            <label className="create-resume-form-label">Credential ID</label>
                            <input
                              type="text"
                              value={cert?.credentialId || ''}
                              onChange={(e) => handleInputChange('certifications', 'credentialId', e.target.value, index)}
                              className="create-resume-form-input"
                              placeholder="ID-123456"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-6 lg:self-start mt-6 lg:mt-0">
              <div className="create-resume-preview">
                <div className="create-resume-preview-header">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    <h3 className="create-resume-preview-title">Live Preview</h3>
                  </div>
                  <div className="create-resume-preview-actions">
                    <button
                      onClick={() => setPreviewScale('75')}
                      className={`zoom-btn ${previewScale === '75' ? 'active' : ''}`}
                      title="75% Zoom"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setPreviewScale('90')}
                      className={`zoom-btn ${previewScale === '90' ? 'active' : ''}`}
                      title="90% Zoom"
                    >
                      90%
                    </button>
                    <button
                      onClick={() => setPreviewScale('100')}
                      className={`zoom-btn ${previewScale === '100' ? 'active' : ''}`}
                      title="100% Zoom"
                    >
                      100%
                    </button>
                    <button
                      onClick={() => setPreviewScale('110')}
                      className={`zoom-btn ${previewScale === '110' ? 'active' : ''}`}
                      title="110% Zoom"
                    >
                      110%
                    </button>
                  </div>
                </div>
                <div className="create-resume-preview-content">
                  <div className={`create-resume-preview-scale zoom-${previewScale}`}>
                    <LivePreview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;