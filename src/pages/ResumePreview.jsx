import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Download,
  Printer,
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  Building,
  Sun,
  Moon
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ResumePreview() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    if (!currentUser || !id) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid, 'resumes', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResumeData(docSnap.data());
        setSelectedTemplate(docSnap.data().templateId || 'modern');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const input = document.getElementById('resume-container');
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0
      });

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

      pdf.save(`${resumeData?.title || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const printResume = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background d-flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-background d-flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Resume not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const ResumeTemplate = () => {
    if (selectedTemplate === 'classic') {
      return (
        <div className="bg-white p-8 shadow-lg min-h-[842px] w-[595px] mx-auto">
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="text-center text-gray-600 d-grid gap-1">
              {resumeData.personalInfo.email && <p className="d-flex items-center justify-center"><Mail className="w-4 h-4 mr-2 inline" /> {resumeData.personalInfo.email}</p>}
              {resumeData.personalInfo.phone && <p className="d-flex items-center justify-center"><Phone className="w-4 h-4 mr-2 inline" /> {resumeData.personalInfo.phone}</p>}
              {resumeData.personalInfo.address && <p className="d-flex items-center justify-center"><MapPin className="w-4 h-4 mr-2 inline" /> {resumeData.personalInfo.address}</p>}
              {resumeData.personalInfo.linkedin && <p className="d-flex items-center justify-center"><ExternalLink className="w-4 h-4 mr-2 inline" /> {resumeData.personalInfo.linkedin}</p>}
            </div>
          </div>

          {/* Summary */}
          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">SUMMARY</h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">EXPERIENCE</h2>
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
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">EDUCATION</h2>
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
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">SKILLS</h2>
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
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">PROJECTS</h2>
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

          {/* Certifications */}
          {resumeData.certifications.filter(cert => cert.name).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 border-b pb-1">CERTIFICATIONS</h2>
              {resumeData.certifications.filter(cert => cert.name).map((cert, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium text-gray-900">{cert.name}</p>
                  <p className="text-gray-700 text-sm">{cert.issuer} • {cert.date}</p>
                  {cert.credentialId && <p className="text-gray-600 text-xs">ID: {cert.credentialId}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (selectedTemplate === 'professional') {
      return (
        <div className="bg-white p-8 shadow-lg min-h-[842px] w-[595px] mx-auto">
          {/* Header */}
          <div className="border-b border-gray-300 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {resumeData.personalInfo.address || 'Professional Title'}
            </p>

            <div className="d-flex flex-wrap gap-6 text-sm text-gray-600">
              {resumeData.personalInfo.email && (
                <div className="d-flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.email}
                </div>
              )}
              {resumeData.personalInfo.phone && (
                <div className="d-flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.phone}
                </div>
              )}
              {resumeData.personalInfo.linkedin && (
                <div className="d-flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.linkedin.replace('https://', '')}
                </div>
              )}
              {resumeData.personalInfo.website && (
                <div className="d-flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.website.replace('https://', '')}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">PROFESSIONAL SUMMARY</h2>
              <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">PROFESSIONAL EXPERIENCE</h2>
              {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{exp.position || 'Position'}</h3>
                    <span className="text-gray-600 font-medium">{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">{exp.company || 'Company'} • {exp.location || 'Location'}</p>
                  <p className="text-gray-600 leading-relaxed">{exp.description || 'Description'}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education.filter(edu => edu.institution || edu.degree).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">EDUCATION</h2>
              {resumeData.education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                    <span className="text-gray-600 font-medium">{edu.startDate} - {edu.endDate || 'Present'}</span>
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
              <h2 className="text-xl font-semibold mb-4 text-gray-800">SKILLS</h2>
              <div className="d-grid grid-cols-2 gap-2">
                {resumeData.skills.filter(skill => skill.name).map((skill, index) => (
                  <div key={index} className="d-flex justify-between">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="text-gray-600 text-sm">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.filter(project => project.name || project.description).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">KEY PROJECTS</h2>
              {resumeData.projects.filter(project => project.name || project.description).map((project, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">{project.name || 'Project Name'}</h3>
                    {project.link && <a href={project.link} className="text-blue-600 text-sm hover:underline">{project.link.replace('https://', '')}</a>}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{project.description || 'Description'}</p>
                  {project.technologies && <p className="text-gray-700 text-sm mt-1">Technologies: {project.technologies}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Modern template (default)
      return (
        <div className="bg-white p-8 shadow-lg min-h-[842px] w-[595px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-indigo-100 mb-4">
              {resumeData.personalInfo.address || 'Professional Title'}
            </p>

            <div className="d-flex flex-wrap gap-4 text-sm">
              {resumeData.personalInfo.email && (
                <div className="d-flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.email}
                </div>
              )}
              {resumeData.personalInfo.phone && (
                <div className="d-flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.phone}
                </div>
              )}
              {resumeData.personalInfo.linkedin && (
                <div className="d-flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {resumeData.personalInfo.linkedin.replace('https://', '')}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 border-l-4 border-indigo-600 pl-3">PROFESSIONAL SUMMARY</h2>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          <div className="d-grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="d-grid gap-6">
              {/* Experience */}
              {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-gray-800 border-l-4 border-indigo-600 pl-3">EXPERIENCE</h2>
                  {resumeData.experience.filter(exp => exp.company || exp.position || exp.description).map((exp, index) => (
                    <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <div className="d-flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900">{exp.position || 'Position'}</h3>
                        <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{exp.company || 'Company'} • {exp.location || 'Location'}</p>
                      <p className="text-gray-600 text-sm">{exp.description || 'Description'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.filter(skill => skill.name).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-gray-800 border-l-4 border-indigo-600 pl-3">SKILLS</h2>
                  <div className="d-flex flex-wrap gap-2">
                    {resumeData.skills.filter(skill => skill.name).map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="d-grid gap-6">
              {/* Education */}
              {resumeData.education.filter(edu => edu.institution || edu.degree).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-gray-800 border-l-4 border-indigo-600 pl-3">EDUCATION</h2>
                  {resumeData.education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
                    <div key={index} className="mb-3 bg-gray-50 p-4 rounded-lg">
                      <div className="d-flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                        <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate || 'Present'}</span>
                      </div>
                      <p className="text-gray-700 font-medium">{edu.institution || 'Institution'} • {edu.fieldOfStudy || 'Field of Study'}</p>
                      {edu.grade && <p className="text-gray-600 text-sm mt-1">Grade: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.filter(project => project.name || project.description).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-gray-800 border-l-4 border-indigo-600 pl-3">PROJECTS</h2>
                  {resumeData.projects.filter(project => project.name || project.description).map((project, index) => (
                    <div key={index} className="mb-3 bg-gray-50 p-4 rounded-lg">
                      <div className="d-flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900">{project.name || 'Project Name'}</h3>
                        {project.link && <a href={project.link} className="text-blue-600 text-sm hover:underline">{project.link.replace('https://', '')}</a>}
                      </div>
                      <p className="text-gray-600 text-sm">{project.description || 'Description'}</p>
                      {project.technologies && <p className="text-gray-700 text-xs mt-2">Tech: {project.technologies}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="navbar-blur sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="d-flex justify-between items-center h-16">
            <div className="d-flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="d-flex items-center space-x-2 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <span className="text-lg font-semibold">{resumeData?.title || 'Resume'}</span>
            </div>

            <div className="d-flex items-center space-x-4">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="professional">Professional</option>
              </select>

              <button
                onClick={() => toggleTheme()}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={printResume}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors d-flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={exportToPDF}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors d-flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Resume Preview */}
      <div className="d-flex items-center justify-center p-8">
        <div id="resume-container">
          <ResumeTemplate />
        </div>
      </div>
    </div>
  );
}

export default ResumePreview;