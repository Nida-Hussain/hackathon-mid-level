import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Briefcase, GraduationCap, Code, Award, FileText, Star, Globe } from 'lucide-react';

function SectionHeader({ icon: Icon, title, color = '#6366f1' }) {
  return (
    <div style={{ marginBottom: 12, borderBottom: `2px solid ${color}30`, paddingBottom: 6 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 12, height: 12, color: '#fff' }} />
        </div>
        {title}
      </h2>
    </div>
  );
}

function ResumeLivePreview({ resumeData }) {
  const p = resumeData.personalInfo || {};
  const font = 'Inter, system-ui, -apple-system, sans-serif';

  return (
    <div id="resume-preview"
      style={{
        background: '#ffffff',
        width: 595, margin: '0 auto', minHeight: 842,
        color: '#1e293b', fontFamily: font,
        fontSize: 13, lineHeight: 1.5,
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '32px 32px 24px',
        color: '#f8fafc',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
          {p.fullName || 'Your Name'}
        </h1>
        {p.jobTitle && (
          <p style={{ fontSize: 14, fontWeight: 500, color: '#a5b4fc', margin: '0 0 14px' }}>{p.jobTitle}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 11, color: '#cbd5e1' }}>
          {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail style={{ width: 11, height: 11 }} /> {p.email}</span>}
          {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone style={{ width: 11, height: 11 }} /> {p.phone}</span>}
          {p.address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 11, height: 11 }} /> {p.address}</span>}
          {p.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink style={{ width: 11, height: 11 }} /> {p.linkedin}</span>}
          {p.github && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink style={{ width: 11, height: 11 }} /> {p.github}</span>}
          {p.website && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe style={{ width: 11, height: 11 }} /> {p.website}</span>}
        </div>
      </div>

      <div style={{ padding: '24px 32px', flex: 1 }}>
        {p.summary && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={FileText} title="Professional Summary" color="#6366f1" />
            <p style={{ color: '#475569', lineHeight: 1.6, margin: 0, fontSize: 12 }}>{p.summary}</p>
          </div>
        )}

        {resumeData.experience?.filter(e => e.company || e.position).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={Briefcase} title="Experience" color="#f59e0b" />
            {resumeData.experience.filter(e => e.company || e.position).map((exp, i) => (
              <div key={i} style={{ marginBottom: i < resumeData.experience.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, margin: 0 }}>{exp.position || 'Position'}</h3>
                    <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, margin: '1px 0 0' }}>
                      {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                    </p>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 4 }}>
                    {exp.description.split('\n').map((line, li) => (
                      <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                        <span style={{ color: '#6366f1', fontSize: 10, marginTop: 3 }}>•</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {resumeData.education?.filter(e => e.institution || e.degree).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={GraduationCap} title="Education" color="#10b981" />
            {resumeData.education.filter(e => e.institution || e.degree).map((edu, i) => (
              <div key={i} style={{ marginBottom: i < resumeData.education.length - 1 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, margin: 0 }}>{edu.degree || 'Degree'}</h3>
                    <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 500, margin: '1px 0 0' }}>
                      {edu.institution}{edu.fieldOfStudy ? ` | ${edu.fieldOfStudy}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {(edu.startDate || edu.endDate) && (
                      <span style={{ fontSize: 10, color: '#64748b' }}>{edu.startDate} - {edu.endDate || 'Present'}</span>
                    )}
                    {edu.grade && <p style={{ fontSize: 10, color: '#10b981', fontWeight: 600, margin: '1px 0 0' }}>GPA: {edu.grade}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resumeData.skills?.filter(s => s.name).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={Code} title="Skills" color="#f43f5e" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {resumeData.skills.filter(s => s.name).map((skill, i) => (
                <span key={i} style={{
                  background: '#f1f5f9', color: '#334155', padding: '4px 10px',
                  borderRadius: 6, fontSize: 11, fontWeight: 500, border: '1px solid #e2e8f0',
                }}>
                  {skill.name}
                  {skill.level !== 'Intermediate' && (
                    <span style={{ color: '#94a3b8', fontSize: 10, marginLeft: 4 }}>({skill.level})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {resumeData.projects?.filter(p => p.name).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={Award} title="Projects" color="#8b5cf6" />
            {resumeData.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} style={{ marginBottom: i < resumeData.projects.length - 1 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, margin: 0 }}>{proj.name}</h3>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 10, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ExternalLink style={{ width: 10, height: 10 }} /> Link
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p style={{ fontSize: 12, color: '#475569', margin: '3px 0 0', lineHeight: 1.5 }}>{proj.description}</p>
                )}
                {proj.technologies && (
                  <p style={{ fontSize: 10, color: '#64748b', margin: '2px 0 0' }}>
                    <span style={{ fontWeight: 600 }}>Tech:</span> {proj.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {resumeData.certifications?.filter(c => c.name).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader icon={Star} title="Certifications" color="#06b6d4" />
            {resumeData.certifications.filter(c => c.name).map((cert, i) => (
              <div key={i} style={{
                marginBottom: i < resumeData.certifications.length - 1 ? 8 : 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 12, margin: 0 }}>{cert.name}</p>
                  <p style={{ fontSize: 11, color: '#6366f1', margin: '1px 0 0' }}>
                    {cert.issuer}{cert.credentialId ? ` | ${cert.credentialId}` : ''}
                  </p>
                </div>
                {cert.date && <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0 }}>{cert.date}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeLivePreview;
