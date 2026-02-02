import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
  });

  const { signup, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google signup failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const containerClass = `auth-container ${theme || 'light'}`;

  return (
    <div className={containerClass}>
      {/* Animated Background Elements */}
      <div className="auth-background-elements">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="auth-floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="auth-wrapper">
        <div className="auth-grid">
          {/* Theme Toggle */}
          <div className="auth-theme-toggle">
            <button onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Left Panel - Promotional / Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="auth-left-panel"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="auth-icon-container"
            >
              <Sparkles size={40} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="auth-title"
            >
              Join Us Today
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="auth-subtitle"
            >
              Create an account to get started
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="auth-features"
            >
              <div className="auth-feature-item">
                <Star className="auth-feature-icon" />
                <span>Premium Features</span>
              </div>
              <div className="auth-feature-item">
                <ShieldCheck className="auth-feature-icon" />
                <span>Secure Access</span>
              </div>
              <div className="auth-feature-item">
                <Zap className="auth-feature-icon" />
                <span>Lightning Fast</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="auth-right-panel"
          >
            <div className="auth-header">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="auth-icon-container"
              >
                <Sparkles size={32} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="auth-title"
              >
                Create Account
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="auth-subtitle"
              >
                Join us to create amazing resumes
              </motion.p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="auth-error-container"
              >
                <p className="auth-error-text">
                  <svg
                    className="auth-w-4 auth-h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                {/* Name */}
                <div className="relative">
                  <label htmlFor="name" className="auth-label">
                    <User size={16} /> Full Name
                  </label>
                  <div className="auth-input-container">
                    <div
                      className={`auth-input-icon ${isFocused.name ? 'focused' : ''}`}
                    >
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsFocused((prev) => ({ ...prev, name: true }))}
                      onBlur={() => setIsFocused((prev) => ({ ...prev, name: false }))}
                      required
                      placeholder="Enter your full name"
                      className="auth-input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label htmlFor="email" className="auth-label">
                    <Mail size={16} /> Email Address
                  </label>
                  <div className="auth-input-container">
                    <div
                      className={`auth-input-icon ${isFocused.email ? 'focused' : ''}`}
                    >
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused((prev) => ({ ...prev, email: true }))}
                      onBlur={() => setIsFocused((prev) => ({ ...prev, email: false }))}
                      required
                      placeholder="Enter your email"
                      className="auth-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label htmlFor="password" className="auth-label">
                    <Lock size={16} /> Password
                  </label>
                  <div className="auth-input-container">
                    <div
                      className={`auth-input-icon ${isFocused.password ? 'focused' : ''}`}
                    >
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused((prev) => ({ ...prev, password: true }))}
                      onBlur={() => setIsFocused((prev) => ({ ...prev, password: false }))}
                      required
                      minLength={6}
                      placeholder="Enter your password"
                      className="auth-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-terms-container">
                <input type="checkbox" id="terms" required className="auth-checkbox" />
                <label htmlFor="terms" className="auth-terms-label">
                  I agree to the{' '}
                  <Link to="/terms" className="auth-terms-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="auth-terms-link">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? (
                  <>
                    <div className="auth-spinner mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignup}
              disabled={loading}
              className="auth-social-button"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="auth-footer"
            >
              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Signup;