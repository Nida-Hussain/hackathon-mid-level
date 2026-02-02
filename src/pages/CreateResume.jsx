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

function CreateResume() {
  const { id } = useParams();
  const { currentUser } = useAuth();
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
  const [activeSection, setActiveSection] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (id) {
      loadResume();
    }
  }, [id]);

  const loadResume = async () => {
    if (!currentUser || !id) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid, 'resumes', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResumeData(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading resume:', error);
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

  const handleInputChange = (section, field, value, index = null) => {
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
    <div id="resume-preview" className="bg-white p-8 shadow-lg min-h-[842px] w-[595px] mx-auto">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
        <div className="d-flex flex-wrap gap-4 text-sm text-gray-600">
          {resumeData.personalInfo.email && <span><Mail className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && <span><Phone className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.address && <span><MapPin className="inline w-4 h-4 mr-1" /> {resumeData.personalInfo.address}</span>}
          {resumeData.personalInfo.linkedin && <span><ExternalLink className="inline w-4 h-4 mr-1" /> LinkedIn: {resumeData.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 border-b pb-1">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 border-b pb-1">Experience</h2>
          {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{exp.position || 'Position'}</h3>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
              </div>
              <p className="text-gray-700 font-medium">{exp.company || 'Company'} • {exp.location || 'Location'}</p>
              <p className="text-gray-700 mt-1">{exp.description || 'Description'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resumeData.education.filter(edu => edu.institution || edu.degree).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 border-b pb-1">Education</h2>
          {resumeData.education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{edu.degree || 'Degree'}</h3>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate || 'Present'}</span>
              </div>
              <p className="text-gray-700 font-medium">{edu.institution || 'Institution'} • {edu.fieldOfStudy || 'Field of Study'}</p>
              {edu.grade && <p className="text-gray-600 text-sm">Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.filter(skill => skill.name).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 border-b pb-1">Skills</h2>
          <div className="d-flex flex-wrap gap-2">
            {resumeData.skills.filter(skill => skill.name).map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resumeData.projects.filter(project => project.name || project.description).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 border-b pb-1">Projects</h2>
          {resumeData.projects.filter(project => project.name || project.description).map((project, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex justify-between items-start">
                <h3 className="font-semibold text-gray-900">{project.name || 'Project Name'}</h3>
                {project.link && <a href={project.link} className="text-blue-600 text-sm hover:underline">{project.link}</a>}
              </div>
              <p className="text-gray-700 mt-1">{project.description || 'Description'}</p>
              {project.technologies && <p className="text-gray-600 text-sm mt-1">Technologies: {project.technologies}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-radial from-indigo-500/10 via-purple-500/10 to-pink-500/10">
      {/* Header */}
      <header className="navbar-glass sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="d-flex justify-between items-center h-16">
            <div className="d-flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-linear rounded-xl d-flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">ResumeBuilder</h1>
            </div>

            <div className="d-flex items-center space-x-4">
              <input
                type="text"
                value={resumeData.title}
                onChange={(e) => handleInputChange('title', 'title', e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                placeholder="Resume Title"
              />

              <select
                value={resumeData.templateId}
                onChange={(e) => handleInputChange('templateId', 'templateId', e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white transition-all duration-300"
              >
                <option value="modern" className="bg-gray-800 text-white">Modern</option>
                <option value="classic" className="bg-gray-800 text-white">Classic</option>
                <option value="professional" className="bg-gray-800 text-white">Professional</option>
              </select>

              <button
                onClick={() => toggleTheme()}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={saveResume}
                disabled={isSaving}
                className="btn-enhanced-primary d-flex items-center space-x-2 px-4 py-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              <button
                onClick={exportToPDF}
                className="btn-enhanced bg-green-600/20 border-green-600/30 text-green-600 hover:bg-green-600/30 d-flex items-center space-x-2 px-4 py-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => navigate(`/resume/${id}`)}
                className="btn-enhanced d-flex items-center space-x-2 px-4 py-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>

              {saveStatus && (
                <span className={`text-sm ${saveStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {saveStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="d-flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar - Hidden on mobile by default, shown with overlay */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 card-enhanced transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out h-full lg:h-auto`}>
          <div className="p-4 h-full d-flex flex-col">
            <nav className="flex-1">
              <ul className="d-grid gap-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                        className={`w-full d-flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-gradient-linear text-white shadow-lg hover:scale-105'
                            : 'hover:bg-white/10 text-white hover:scale-[1.02]'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{section.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden mt-4 p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile header for toggling sidebar */}
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {sections.find(s => s.id === activeSection)?.label || 'Resume Editor'}
          </h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-accent text-accent-foreground"
          >
            Menu
          </button>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="d-grid gap-6">
              {activeSection === 'personal' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-enhanced p-6"
                >
                  <h2 className="text-xl font-semibold mb-4 d-flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h2>

                  <div className="grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">Phone</label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">Address</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.address}
                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="123 Main St, City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">LinkedIn</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">GitHub</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.github}
                        onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-white/80">Website</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-white/80">Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 h-24 resize-none"
                        placeholder="A brief summary of your professional background and career goals..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'summary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-enhanced p-6"
                >
                  <h2 className="text-xl font-semibold mb-4 d-flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2" />
                    Professional Summary
                  </h2>

                  <div className="d-grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white/80">Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 h-32 resize-none"
                        placeholder="A compelling summary that highlights your key qualifications, experience, and career objectives..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'education' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-enhanced p-6"
                >
                  <div className="d-flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold d-flex items-center text-white">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Education
                    </h2>
                    <button
                      onClick={() => addNewItem('education')}
                      className="btn-enhanced d-flex items-center space-x-1 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="card-enhanced p-4 relative">
                        <button
                          onClick={() => removeItem('education', index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Institution</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="University Name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => handleInputChange('education', 'fieldOfStudy', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Computer Science, Business, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Grade/GPA</label>
                            <input
                              type="text"
                              value={edu.grade}
                              onChange={(e) => handleInputChange('education', 'grade', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="3.8/4.0, A-, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Start Date</label>
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">End Date</label>
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
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
                  className="card-enhanced p-6"
                >
                  <div className="d-flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold d-flex items-center text-white">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Work Experience
                    </h2>
                    <button
                      onClick={() => addNewItem('experience')}
                      className="btn-enhanced d-flex items-center space-x-1 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="card-enhanced p-4 relative">
                        <button
                          onClick={() => removeItem('experience', index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Company</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Company Name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Job Title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => handleInputChange('experience', 'location', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="City, State"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Leave blank if current"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 h-20 resize-none"
                            placeholder="Describe your responsibilities and achievements..."
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
                  className="card-enhanced p-6"
                >
                  <div className="d-flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold d-flex items-center text-white">
                      <Code className="w-5 h-5 mr-2" />
                      Skills
                    </h2>
                    <button
                      onClick={() => addNewItem('skills')}
                      className="btn-enhanced d-flex items-center space-x-1 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="card-enhanced p-4 relative">
                        <button
                          onClick={() => removeItem('skills', index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Skill Name</label>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="JavaScript, Python, Leadership..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Proficiency Level</label>
                            <select
                              value={skill.level}
                              onChange={(e) => handleInputChange('skills', 'level', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white transition-all duration-300"
                            >
                              <option value="Beginner" className="bg-gray-800 text-white">Beginner</option>
                              <option value="Intermediate" className="bg-gray-800 text-white">Intermediate</option>
                              <option value="Advanced" className="bg-gray-800 text-white">Advanced</option>
                              <option value="Expert" className="bg-gray-800 text-white">Expert</option>
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
                  className="card-enhanced p-6"
                >
                  <div className="d-flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold d-flex items-center text-white">
                      <Award className="w-5 h-5 mr-2" />
                      Projects
                    </h2>
                    <button
                      onClick={() => addNewItem('projects')}
                      className="btn-enhanced d-flex items-center space-x-1 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="card-enhanced p-4 relative">
                        <button
                          onClick={() => removeItem('projects', index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Project Name</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Project Name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Technologies Used</label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="React, Node.js, MongoDB..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-white/80">Project Link</label>
                            <input
                              type="url"
                              value={project.link}
                              onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="https://project-url.com"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300 h-20 resize-none"
                            placeholder="Describe the project, your role, and key accomplishments..."
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
                  className="card-enhanced p-6"
                >
                  <div className="d-flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold d-flex items-center text-white">
                      <Award className="w-5 h-5 mr-2" />
                      Certifications
                    </h2>
                    <button
                      onClick={() => addNewItem('certifications')}
                      className="btn-enhanced d-flex items-center space-x-1 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="d-grid gap-4">
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="card-enhanced p-4 relative">
                        <button
                          onClick={() => removeItem('certifications', index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Certification Name</label>
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="AWS Certified Developer"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Issuer</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                              placeholder="Amazon Web Services"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Date</label>
                            <input
                              type="month"
                              value={cert.date}
                              onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Credential ID</label>
                            <input
                              type="text"
                              value={cert.credentialId}
                              onChange={(e) => handleInputChange('certifications', 'credentialId', e.target.value, index)}
                              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/60 transition-all duration-300"
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
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="card-enhanced overflow-hidden">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 border-b border-white/20">
                  <h3 className="font-medium text-white">Live Preview</h3>
                </div>
                <div className="p-4 bg-white/5 overflow-auto max-h-[calc(100vh-200px)]">
                  <LivePreview />
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