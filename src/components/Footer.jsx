import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Github, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      <div className="premium-footer-inner">
        <div className="premium-footer-top">
          <div className="premium-footer-brand">
            <div className="premium-footer-logo">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="premium-footer-name">ResumeBuilder</h3>
              <p className="premium-footer-tagline">Build your career with confidence</p>
            </div>
          </div>

          <div className="premium-footer-links">
            <Link to="/dashboard" className="premium-footer-link">Dashboard</Link>
            <Link to="/create-resume" className="premium-footer-link">Create Resume</Link>
          </div>

          <div className="premium-footer-social">
            <a href="mailto:support@resumebuilder.com" className="premium-footer-social-link" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="premium-footer-social-link" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="premium-footer-bottom">
          <p className="premium-footer-copyright">
            &copy; {year} ResumeBuilder. All rights reserved.
          </p>
          <p className="premium-footer-made-with">
            Made with <Heart className="w-3 h-3 inline-block text-red-400 fill-red-400" /> for professionals
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
