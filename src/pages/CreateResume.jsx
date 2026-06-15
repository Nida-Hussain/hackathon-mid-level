import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, GraduationCap, Briefcase, Code, Award, FileText,
  Download, Eye, Save, Plus, X, MapPin, Phone, Mail,
  ExternalLink, Sun, Moon, Star, AlertCircle, ChevronDown,
  Globe, Linkedin, Github, Trash2, Layout
} from 'lucide-react';
import ResumeLivePreview from '../components/ResumeLivePreview';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const sectionMeta = {
  personal: { icon: User, label: 'Personal Info', gradient: 'from-violet-500 to-purple-600' },
  summary: { icon: FileText, label: 'Summary', gradient: 'from-blue-500 to-cyan-500' },
  education: { icon: GraduationCap, label: 'Education', gradient: 'from-emerald-500 to-teal-500' },
  experience: { icon: Briefcase, label: 'Experience', gradient: 'from-amber-500 to-orange-500' },
  skills: { icon: Code, label: 'Skills', gradient: 'from-rose-500 to-pink-500' },
  projects: { icon: Award, label: 'Projects', gradient: 'from-indigo-500 to-blue-500' },
  certifications: { icon: Star, label: 'Certifications', gradient: 'from-cyan-500 to-sky-500' },
};

function FormField({ c, label, error, children, required, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: c.label }}>
          {label}
          {required && <span style={{ color: c.danger, fontSize: 15, lineHeight: 1 }}>*</span>}
          {hint && <span style={{ color: c.textMuted, fontSize: 11, fontWeight: 400, marginLeft: 'auto' }}>{hint}</span>}
        </label>
      )}
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: c.danger, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
          <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />{error}
        </motion.p>
      )}
    </div>
  );
}

function EmptyState({ c, icon: Icon, title, desc, action, onClick, color }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${color || '#6366f1'}, ${color || '#7c3aed'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', opacity: 0.8 }}>
        <Icon style={{ width: 28, height: 28, color: '#fff' }} />
      </div>
      <h4 style={{ color: c.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
      <p style={{ color: c.textMuted, fontSize: 13, marginBottom: 18, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.4 }}>{desc}</p>
      <button onClick={onClick}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${color || '#6366f1'}, ${color || '#7c3aed'})`, color: '#fff', boxShadow: `0 4px 14px rgba(99,102,241,0.25)`, transition: 'all 0.2s' }}>
        <Plus style={{ width: 14, height: 14 }} /> {action}
      </button>
    </motion.div>
  );
}

function SectionCard({ c, isDark, sectionMeta, sectionId, isOpen, onToggle, completionPct, children }) {
  const meta = sectionMeta[sectionId];
  const Icon = meta.icon;
  const isComplete = completionPct === 100;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: c.card, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${isOpen ? c.borderActive : c.border}`,
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: isOpen ? `0 4px 24px rgba(99,102,241,0.08)` : 'none',
      }}>
      <button onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', border: 'none', background: 'transparent', color: c.text,
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = c.cardHover}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${meta.gradient.replace('from-', '').replace('to-', '').split(' ').join(', ').replace('violet', '#8b5cf6').replace('purple', '#a855f7').replace('blue', '#3b82f6').replace('cyan', '#06b6d4').replace('emerald', '#10b981').replace('teal', '#14b8a6').replace('amber', '#f59e0b').replace('orange', '#f97316').replace('rose', '#f43f5e').replace('pink', '#ec4899').replace('indigo', '#6366f1').replace('sky', '#0ea5e9')})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{meta.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <div style={{ width: 64, height: 5, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: isComplete ? c.success : (completionPct > 0 ? c.accent : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.15)'), width: `${completionPct}%`, transition: 'width 0.5s, background 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 500 }}>{isComplete ? 'Done' : `${completionPct}%`}</span>
            </div>
          </div>
        </div>
        <ChevronDown style={{ width: 16, height: 16, color: c.textMuted, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ padding: '0 18px 20px', borderTop: `1px solid ${c.border}` }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getPreviewTransform(previewScale) {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return previewScale === '75' ? 'scale(0.42)' : previewScale === '90' ? 'scale(0.49)' : previewScale === '100' ? 'scale(0.55)' : 'scale(0.55)';
  }
  return previewScale === '75' ? 'scale(0.48)' : previewScale === '90' ? 'scale(0.56)' : previewScale === '100' ? 'scale(0.64)' : 'scale(0.64)';
}

function CreateResume() {
  const { id } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [resumeData, setResumeData] = useState({
    title: 'Untitled Resume',
    templateId: 'modern',
    personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', github: '', website: '', summary: '', jobTitle: '' },
    education: [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
    skills: [{ name: '', level: 'Intermediate' }],
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    certifications: [{ name: '', issuer: '', date: '', credentialId: '' }],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [previewScale, setPreviewScale] = useState('100');
  const [loadingResume, setLoadingResume] = useState(id ? true : false);
  const [mobileFormOpen, setMobileFormOpen] = useState(true);

  const loadResume = async () => {
    if (!currentUser || !id) { setLoadingResume(false); return; }
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid, 'resumes', id));
      if (snap.exists()) {
        const d = snap.data();
        setResumeData({
          title: d.title || 'Untitled Resume',
          templateId: d.templateId || 'modern',
          personalInfo: { fullName: '', email: '', phone: '', address: '', linkedin: '', github: '', website: '', summary: '', jobTitle: '', ...(d.personalInfo || {}) },
          education: d.education?.length ? d.education : [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }],
          experience: d.experience?.length ? d.experience : [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
          skills: d.skills?.length ? d.skills : [{ name: '', level: 'Intermediate' }],
          projects: d.projects?.length ? d.projects : [{ name: '', description: '', technologies: '', link: '' }],
          certifications: d.certifications?.length ? d.certifications : [{ name: '', issuer: '', date: '', credentialId: '' }],
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoadingResume(false); }
  };

  useEffect(() => {
    if (id && currentUser) loadResume();
    else setLoadingResume(false);
  }, [id, currentUser]);

  const c = isDark ? {
    bg: '#0b0d1a',
    surface: '#131627',
    card: '#1a1d31',
    cardHover: '#1f2340',
    border: 'rgba(99,102,241,0.12)',
    borderActive: 'rgba(99,102,241,0.35)',
    input: '#101225',
    inputBorder: 'rgba(148,163,184,0.15)',
    text: '#f1f5f9',
    textMuted: 'rgba(148,163,184,0.6)',
    label: '#a5b4fc',
    headerBg: 'rgba(11,13,26,0.92)',
    accent: '#818cf8',
    sidebarBg: 'rgba(19,22,39,0.85)',
    itemBg: 'rgba(26,29,49,0.6)',
    success: '#34d399',
    danger: '#f87171',
  } : {
    bg: '#f4f6fc',
    surface: '#ffffff',
    card: '#ffffff',
    cardHover: '#f8f9ff',
    border: 'rgba(99,102,241,0.12)',
    borderActive: 'rgba(99,102,241,0.35)',
    input: '#f8faff',
    inputBorder: 'rgba(99,102,241,0.18)',
    text: '#0f172a',
    textMuted: 'rgba(71,85,105,0.5)',
    label: '#4f46e5',
    headerBg: 'rgba(255,255,255,0.92)',
    accent: '#6366f1',
    sidebarBg: 'rgba(255,255,255,0.85)',
    itemBg: 'rgba(99,102,241,0.04)',
    success: '#059669',
    danger: '#dc2626',
  };

  if (authLoading || loadingResume) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTopColor: c.accent, animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ color: c.textMuted, marginTop: 20, fontSize: 15 }}>{id ? 'Loading resume...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `rgba(99,102,241,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle style={{ width: 36, height: 36, color: c.accent }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.text, marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: c.textMuted, fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>You need to sign in to create and edit resumes.</p>
          <button onClick={() => navigate('/login')}
            style={{ background: `linear-gradient(135deg, ${c.accent}, #7c3aed)`, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: `0 8px 24px rgba(99,102,241,0.25)`, transition: 'all 0.2s' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const calcCompletion = (section) => {
    if (!resumeData) return 0;
    if (section === 'personal') {
      const p = resumeData.personalInfo || {};
      const req = [p.fullName, p.email].filter(Boolean).length;
      const opt = [p.phone, p.address, p.jobTitle, p.linkedin, p.github, p.website].filter(Boolean).length;
      return Math.round((req / 2) * 50 + (opt / 6) * 50);
    }
    if (section === 'education') return (resumeData.education || []).filter(e => e.institution || e.degree).length > 0 ? 100 : 0;
    if (section === 'experience') return (resumeData.experience || []).filter(e => e.company || e.position).length > 0 ? 100 : 0;
    if (section === 'skills') return (resumeData.skills || []).filter(s => s.name).length > 0 ? 100 : 0;
    if (section === 'projects') return (resumeData.projects || []).filter(p => p.name).length > 0 ? 100 : 0;
    if (section === 'certifications') return (resumeData.certifications || []).filter(c => c.name).length > 0 ? 100 : 0;
    if (section === 'summary') return (resumeData.personalInfo?.summary || '').trim() ? 100 : 0;
    return 0;
  };

  const overallPct = () => {
    const all = ['personal', 'summary', 'education', 'experience', 'skills', 'projects', 'certifications'];
    return Math.round((all.filter(s => calcCompletion(s) > 0).length / all.length) * 100);
  };

  const saveResume = async () => {
    if (!currentUser || !id) return;
    try {
      setIsSaving(true); setSaveStatus('Saving...');
      await updateDoc(doc(db, 'users', currentUser.uid, 'resumes', id), { ...resumeData, updatedAt: serverTimestamp() });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error(e); setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 2000);
    } finally { setIsSaving(false); }
  };

  const validateField = (section, field, value) => {
    const errs = { ...validationErrors };
    delete errs[`${section}.${field}`];
    if (section === 'personalInfo') {
      if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) errs[`${section}.${field}`] = 'Invalid email';
      if (field === 'phone' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) errs[`${section}.${field}`] = 'Invalid phone';
    }
    setValidationErrors(errs);
  };

  const handleChange = (section, field, value, index) => {
    validateField(section, field, value);
    if (index !== undefined && index !== null) {
      setResumeData(prev => {
        const arr = [...prev[section]];
        arr[index] = { ...arr[index], [field]: value };
        return { ...prev, [section]: arr };
      });
    } else if (section === 'title' || section === 'templateId') {
      setResumeData(prev => ({ ...prev, [section]: value }));
    } else {
      setResumeData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
  };

  const getErr = (section, field) => validationErrors ? validationErrors[`${section}.${field}`] : null;

  const addItem = (section) => {
    const tpl = {
      education: { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' },
      experience: { company: '', position: '', startDate: '', endDate: '', description: '', location: '' },
      skills: { name: '', level: 'Intermediate' },
      projects: { name: '', description: '', technologies: '', link: '' },
      certifications: { name: '', issuer: '', date: '', credentialId: '' },
    };
    if (tpl[section]) setResumeData(prev => ({ ...prev, [section]: [...prev[section], tpl[section]] }));
  };

  const removeItem = (section, index) => setResumeData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));

  const exportPDF = async () => {
    const orig = document.getElementById('resume-preview');
    if (!orig) return;
    try {
      const clone = orig.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.transform = 'none';
      clone.style.width = '595px';
      clone.style.borderRadius = '0';
      clone.style.boxShadow = 'none';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 595,
        height: clone.scrollHeight,
        logging: false,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = 210;
      const pdfH = 297;
      const imgH = (canvas.height * pdfW) / canvas.width;

      let heightLeft = imgH;
      let pos = 0;
      pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
      heightLeft -= pdfH;

      while (heightLeft > 0) {
        pos = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
        heightLeft -= pdfH;
      }

      pdf.save(`${resumeData.title || 'resume'}.pdf`);
    } catch (e) { console.error(e); }
  };

  const sections = Object.entries(sectionMeta).map(([id, meta]) => ({ id, ...meta }));

  const inputBase = {
    width: '100%', background: c.input, border: `1.5px solid ${c.inputBorder}`,
    borderRadius: 10, color: c.text, padding: '11px 14px', fontSize: 14,
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const textareaBase = { ...inputBase, minHeight: 100, resize: 'vertical', lineHeight: 1.6 };
  const selectBase = {
    ...inputBase, appearance: 'none', cursor: 'pointer', paddingRight: 36,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(isDark ? '#a5b4fc' : '#4f46e5')}' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: 14,
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, transition: 'background 0.3s', overflowY: 'auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .scroll-custom::-webkit-scrollbar { width: 5px; }
        .scroll-custom::-webkit-scrollbar-track { background: transparent; }
        .scroll-custom::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}; border-radius: 3px; }
        .scroll-custom::-webkit-scrollbar-thumb:hover { background: ${isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.25)'}; }
        input:focus, select:focus, textarea:focus { border-color: ${c.accent} !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
        input:hover, select:hover, textarea:hover { border-color: ${isDark ? 'rgba(129,140,248,0.35)' : 'rgba(99,102,241,0.3)'} !important; }
        @media (max-width: 1023px) { .form-scroll { overflow: visible !important; max-height: none !important; } }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: c.headerBg, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${c.border}`,
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Resume Builder</span>
              <div style={{ width: 1, height: 18, background: c.border, margin: '0 4px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 50, height: 4, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', width: `${overallPct()}%`, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 600 }}>{overallPct()}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="text" value={resumeData.title}
                onChange={e => handleChange('title', 'title', e.target.value)}
                style={{ ...inputBase, width: 120, padding: '6px 10px', fontSize: 12, background: isDark ? 'rgba(255,255,255,0.04)' : c.input }}
                placeholder="Resume title" />
              <select value={resumeData.templateId}
                onChange={e => handleChange('templateId', 'templateId', e.target.value)}
                style={{ ...selectBase, width: 90, padding: '6px 10px', fontSize: 12, background: isDark ? 'rgba(255,255,255,0.04)' : c.input }}>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="professional">Pro</option>
              </select>
              <button onClick={toggleTheme}
                style={{ width: 32, height: 32, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.04)' : c.input, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: c.text, transition: 'all 0.2s', flexShrink: 0 }}>
                {isDark ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
              </button>
              <button onClick={saveResume} disabled={isSaving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${c.accent}, #7c3aed)`, color: '#fff', boxShadow: `0 4px 12px rgba(99,102,241,0.25)`, opacity: isSaving ? 0.7 : 1, transition: 'all 0.2s' }}>
                <Save style={{ width: 12, height: 12 }} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile toggle */}
      <div style={{ display: 'none' }} className="mobile-toggle-placeholder" />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 16, flexDirection: window.innerWidth < 1024 ? 'column' : 'row' }}>
          {/* Left sidebar - section nav */}
          <div style={{
            width: window.innerWidth < 1024 ? '100%' : 200, flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ padding: '8px 0', marginBottom: 4 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Sections</h3>
            </div>
            {sections.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              const pct = calcCompletion(s.id);
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    background: isActive ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)') : 'transparent',
                    color: isActive ? c.accent : c.textMuted,
                    transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  }}>
                  <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  {pct === 100 ? (
                    <Check style={{ width: 12, height: 12, color: c.success }} />
                  ) : (
                    <span style={{ fontSize: 10, color: c.textMuted }}>{pct}%</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Middle - Form */}
          <div className="scroll-custom" style={{
            flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
            overflow: 'visible',
            paddingRight: 4,
          }}>
            {sections.map(s => (
              <SectionCard key={s.id} c={c} isDark={isDark} sectionMeta={sectionMeta} sectionId={s.id} isOpen={activeSection === s.id} onToggle={() => setActiveSection(activeSection === s.id ? null : s.id)} completionPct={calcCompletion(s.id)}>
                {s.id === 'personal' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 14 }}>
                    <FormField c={c} label="Full Name" required error={getErr('personalInfo', 'fullName')}>
                      <input type="text" value={resumeData.personalInfo?.fullName || ''} onChange={e => handleChange('personalInfo', 'fullName', e.target.value)}
                        style={{ ...inputBase, borderColor: getErr('personalInfo', 'fullName') ? c.danger : c.inputBorder }} placeholder="John Doe" />
                    </FormField>
                    <FormField c={c} label="Email" required error={getErr('personalInfo', 'email')}>
                      <input type="email" value={resumeData.personalInfo?.email || ''} onChange={e => handleChange('personalInfo', 'email', e.target.value)}
                        style={{ ...inputBase, borderColor: getErr('personalInfo', 'email') ? c.danger : c.inputBorder }} placeholder="john@example.com" />
                    </FormField>
                    <FormField c={c} label="Job Title">
                      <input type="text" value={resumeData.personalInfo?.jobTitle || ''} onChange={e => handleChange('personalInfo', 'jobTitle', e.target.value)} style={inputBase} placeholder="Software Engineer" />
                    </FormField>
                    <FormField c={c} label="Phone" error={getErr('personalInfo', 'phone')}>
                      <input type="tel" value={resumeData.personalInfo?.phone || ''} onChange={e => handleChange('personalInfo', 'phone', e.target.value)}
                        style={{ ...inputBase, borderColor: getErr('personalInfo', 'phone') ? c.danger : c.inputBorder }} placeholder="+1 (555) 123-4567" />
                    </FormField>
                    <FormField c={c} label="Location">
                      <input type="text" value={resumeData.personalInfo?.address || ''} onChange={e => handleChange('personalInfo', 'address', e.target.value)} style={inputBase} placeholder="City, State" />
                    </FormField>
                    <FormField c={c} label="LinkedIn">
                      <input type="url" value={resumeData.personalInfo?.linkedin || ''} onChange={e => handleChange('personalInfo', 'linkedin', e.target.value)} style={inputBase} placeholder="linkedin.com/in/username" />
                    </FormField>
                    <FormField c={c} label="GitHub">
                      <input type="url" value={resumeData.personalInfo?.github || ''} onChange={e => handleChange('personalInfo', 'github', e.target.value)} style={inputBase} placeholder="github.com/username" />
                    </FormField>
                    <FormField c={c} label="Website">
                      <input type="url" value={resumeData.personalInfo?.website || ''} onChange={e => handleChange('personalInfo', 'website', e.target.value)} style={inputBase} placeholder="yourwebsite.com" />
                    </FormField>
                  </div>
                )}

                {s.id === 'summary' && (
                  <div style={{ marginTop: 14 }}>
                    <FormField c={c} label="Professional Summary">
                      <textarea value={resumeData.personalInfo?.summary || ''} onChange={e => handleChange('personalInfo', 'summary', e.target.value)}
                        style={textareaBase} rows={4}
                        placeholder="A brief summary highlighting your key qualifications and career objectives..." />
                    </FormField>
                  </div>
                )}

                {s.id === 'education' && (
                  <div style={{ marginTop: 14 }}>
                    {(resumeData.education || []).length === 0 ? (
                      <EmptyState c={c} icon={GraduationCap} title="No education added"
                        desc="Add your academic background to strengthen your resume."
                        action="Add Education" onClick={() => addItem('education')}
                        color="#10b981" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(resumeData.education || []).map((edu, i) => (
                          <div key={i} style={{ background: c.itemBg, borderRadius: 10, padding: 14, border: `1px solid ${c.border}`, position: 'relative' }}>
                            <button onClick={() => removeItem('education', i)}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: `${c.danger}18`, border: `1px solid ${c.danger}30`, color: c.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {edu.institution || edu.degree ? `${edu.institution || 'Institution'} - ${edu.degree || 'Degree'}` : 'New Education'}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              <FormField c={c} label="Institution"><input type="text" value={edu?.institution || ''} onChange={e => handleChange('education', 'institution', e.target.value, i)} style={inputBase} placeholder="University" /></FormField>
                              <FormField c={c} label="Degree"><input type="text" value={edu?.degree || ''} onChange={e => handleChange('education', 'degree', e.target.value, i)} style={inputBase} placeholder="Bachelor's" /></FormField>
                              <FormField c={c} label="Field"><input type="text" value={edu?.fieldOfStudy || ''} onChange={e => handleChange('education', 'fieldOfStudy', e.target.value, i)} style={inputBase} placeholder="Computer Science" /></FormField>
                              <FormField c={c} label="GPA"><input type="text" value={edu?.grade || ''} onChange={e => handleChange('education', 'grade', e.target.value, i)} style={inputBase} placeholder="3.8/4.0" /></FormField>
                              <FormField c={c} label="Start"><input type="month" value={edu?.startDate || ''} onChange={e => handleChange('education', 'startDate', e.target.value, i)} style={inputBase} /></FormField>
                              <FormField c={c} label="End"><input type="month" value={edu?.endDate || ''} onChange={e => handleChange('education', 'endDate', e.target.value, i)} style={inputBase} /></FormField>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem('education')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${c.border}`, background: 'transparent', color: c.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Plus style={{ width: 14, height: 14 }} /> Add Education
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {s.id === 'experience' && (
                  <div style={{ marginTop: 14 }}>
                    {(resumeData.experience || []).length === 0 ? (
                      <EmptyState c={c} icon={Briefcase} title="No experience added"
                        desc="Add your work history to showcase your career journey."
                        action="Add Experience" onClick={() => addItem('experience')}
                        color="#f59e0b" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(resumeData.experience || []).map((exp, i) => (
                          <div key={i} style={{ background: c.itemBg, borderRadius: 10, padding: 14, border: `1px solid ${c.border}`, position: 'relative' }}>
                            <button onClick={() => removeItem('experience', i)}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: `${c.danger}18`, border: `1px solid ${c.danger}30`, color: c.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {exp.company || exp.position ? `${exp.company || 'Company'} - ${exp.position || 'Position'}` : 'New Experience'}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              <FormField c={c} label="Company"><input type="text" value={exp?.company || ''} onChange={e => handleChange('experience', 'company', e.target.value, i)} style={inputBase} placeholder="Company" /></FormField>
                              <FormField c={c} label="Position"><input type="text" value={exp?.position || ''} onChange={e => handleChange('experience', 'position', e.target.value, i)} style={inputBase} placeholder="Job Title" /></FormField>
                              <FormField c={c} label="Location"><input type="text" value={exp?.location || ''} onChange={e => handleChange('experience', 'location', e.target.value, i)} style={inputBase} placeholder="City, State" /></FormField>
                              <FormField c={c} label="Start"><input type="month" value={exp?.startDate || ''} onChange={e => handleChange('experience', 'startDate', e.target.value, i)} style={inputBase} /></FormField>
                              <FormField c={c} label="End"><input type="month" value={exp?.endDate || ''} onChange={e => handleChange('experience', 'endDate', e.target.value, i)} style={inputBase} placeholder="Leave blank if current" /></FormField>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <FormField c={c} label="Description">
                                <textarea value={exp?.description || ''} onChange={e => handleChange('experience', 'description', e.target.value, i)} style={textareaBase} rows={3} placeholder="Describe your responsibilities and achievements..." />
                              </FormField>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem('experience')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${c.border}`, background: 'transparent', color: c.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Plus style={{ width: 14, height: 14 }} /> Add Experience
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {s.id === 'skills' && (
                  <div style={{ marginTop: 14 }}>
                    {(resumeData.skills || []).length === 0 ? (
                      <EmptyState c={c} icon={Code} title="No skills added"
                        desc="Add your technical and professional skills."
                        action="Add Skill" onClick={() => addItem('skills')}
                        color="#f43f5e" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(resumeData.skills || []).map((skill, i) => (
                          <div key={i} style={{ background: c.itemBg, borderRadius: 10, padding: 12, border: `1px solid ${c.border}`, position: 'relative' }}>
                            <button onClick={() => removeItem('skills', i)}
                              style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: `${c.danger}18`, border: `1px solid ${c.danger}30`, color: c.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}>
                              <X style={{ width: 12, height: 12 }} />
                            </button>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              <FormField c={c} label="Skill"><input type="text" value={skill?.name || ''} onChange={e => handleChange('skills', 'name', e.target.value, i)} style={inputBase} placeholder="JavaScript, Python..." /></FormField>
                              <FormField c={c} label="Level">
                                <select value={skill?.level || 'Intermediate'} onChange={e => handleChange('skills', 'level', e.target.value, i)} style={selectBase}>
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Expert">Expert</option>
                                </select>
                              </FormField>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem('skills')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${c.border}`, background: 'transparent', color: c.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Plus style={{ width: 14, height: 14 }} /> Add Skill
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {s.id === 'projects' && (
                  <div style={{ marginTop: 14 }}>
                    {(resumeData.projects || []).length === 0 ? (
                      <EmptyState c={c} icon={Award} title="No projects added"
                        desc="Showcase your work to demonstrate your capabilities."
                        action="Add Project" onClick={() => addItem('projects')}
                        color="#6366f1" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(resumeData.projects || []).map((proj, i) => (
                          <div key={i} style={{ background: c.itemBg, borderRadius: 10, padding: 14, border: `1px solid ${c.border}`, position: 'relative' }}>
                            <button onClick={() => removeItem('projects', i)}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: `${c.danger}18`, border: `1px solid ${c.danger}30`, color: c.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name || 'New Project'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              <FormField c={c} label="Name"><input type="text" value={proj?.name || ''} onChange={e => handleChange('projects', 'name', e.target.value, i)} style={inputBase} placeholder="Project Name" /></FormField>
                              <FormField c={c} label="Technologies"><input type="text" value={proj?.technologies || ''} onChange={e => handleChange('projects', 'technologies', e.target.value, i)} style={inputBase} placeholder="React, Node.js..." /></FormField>
                              <FormField c={c} label="Link"><input type="url" value={proj?.link || ''} onChange={e => handleChange('projects', 'link', e.target.value, i)} style={inputBase} placeholder="https://..." /></FormField>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <FormField c={c} label="Description">
                                <textarea value={proj?.description || ''} onChange={e => handleChange('projects', 'description', e.target.value, i)} style={textareaBase} rows={2} placeholder="Describe the project..." />
                              </FormField>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem('projects')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${c.border}`, background: 'transparent', color: c.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Plus style={{ width: 14, height: 14 }} /> Add Project
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {s.id === 'certifications' && (
                  <div style={{ marginTop: 14 }}>
                    {(resumeData.certifications || []).length === 0 ? (
                      <EmptyState c={c} icon={Star} title="No certifications added"
                        desc="Add professional certifications and credentials."
                        action="Add Certification" onClick={() => addItem('certifications')}
                        color="#06b6d4" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(resumeData.certifications || []).map((cert, i) => (
                          <div key={i} style={{ background: c.itemBg, borderRadius: 10, padding: 14, border: `1px solid ${c.border}`, position: 'relative' }}>
                            <button onClick={() => removeItem('certifications', i)}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: `${c.danger}18`, border: `1px solid ${c.danger}30`, color: c.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Trash2 style={{ width: 13, height: 13 }} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cert.name || cert.issuer ? `${cert.name || 'Certification'} - ${cert.issuer || 'Issuer'}` : 'New Certification'}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                              <FormField c={c} label="Name"><input type="text" value={cert?.name || ''} onChange={e => handleChange('certifications', 'name', e.target.value, i)} style={inputBase} placeholder="AWS Certified Developer" /></FormField>
                              <FormField c={c} label="Issuer"><input type="text" value={cert?.issuer || ''} onChange={e => handleChange('certifications', 'issuer', e.target.value, i)} style={inputBase} placeholder="Amazon Web Services" /></FormField>
                              <FormField c={c} label="Date"><input type="month" value={cert?.date || ''} onChange={e => handleChange('certifications', 'date', e.target.value, i)} style={inputBase} /></FormField>
                              <FormField c={c} label="Credential ID"><input type="text" value={cert?.credentialId || ''} onChange={e => handleChange('certifications', 'credentialId', e.target.value, i)} style={inputBase} placeholder="ABC-123" /></FormField>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addItem('certifications')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${c.border}`, background: 'transparent', color: c.textMuted, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <Plus style={{ width: 14, height: 14 }} /> Add Certification
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            ))}
          </div>

          {/* Right - Preview */}
          <div style={{ width: window.innerWidth < 1024 ? '100%' : 420, flexShrink: 0 }}>
            <div style={{ position: window.innerWidth < 1024 ? 'static' : 'sticky', top: 76 }}>
              <div style={{
                background: c.surface, borderRadius: 14, overflow: 'hidden',
                border: `1px solid ${c.border}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layout style={{ width: 14, height: 14, color: c.accent }} />
                    <span style={{ color: c.text, fontWeight: 600, fontSize: 12 }}>Preview</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {['75', '90', '100', '110'].map(z => (
                      <button key={z} onClick={() => setPreviewScale(z)}
                        style={{
                          padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                          background: previewScale === z ? c.accent : 'transparent',
                          color: previewScale === z ? '#fff' : c.textMuted,
                        }}>
                        {z}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="scroll-custom" style={{ padding: 12, maxHeight: window.innerWidth < 1024 ? '420px' : 'calc(100vh - 190px)', overflow: 'auto', background: isDark ? '#090b15' : '#f1f4f9', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ transition: 'transform 0.3s', transform: getPreviewTransform(previewScale), transformOrigin: 'top center' }}>
                    <ResumeLivePreview resumeData={resumeData} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={exportPDF}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: `0 4px 12px rgba(16,185,129,0.2)`, transition: 'all 0.2s' }}>
                  <Download style={{ width: 13, height: 13 }} /> PDF
                </button>
                <button onClick={() => navigate(`/resume/${id}`)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${c.accent}, #7c3aed)`, color: '#fff', boxShadow: `0 4px 12px rgba(99,102,241,0.2)`, transition: 'all 0.2s' }}>
                  <Eye style={{ width: 13, height: 13 }} /> Full View
                </button>
              </div>

              {saveStatus && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, textAlign: 'center',
                    background: saveStatus === 'Saved!' ? `${c.success}18` : saveStatus.includes('Error') ? `${c.danger}18` : `${c.accent}18`,
                    color: saveStatus === 'Saved!' ? c.success : saveStatus.includes('Error') ? c.danger : c.accent,
                    border: `1px solid ${saveStatus === 'Saved!' ? `${c.success}30` : saveStatus.includes('Error') ? `${c.danger}30` : `${c.accent}30`}` }}>
                  {saveStatus}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;
