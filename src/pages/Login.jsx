import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in with Google: ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className={`auth-container ${theme}`}>
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
            <button
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="auth-left-panel"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
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
              Welcome Back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="auth-subtitle"
            >
              Sign in to continue your journey
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="auth-social-icons"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                className="auth-social-icon"
              >
                <Zap size={24} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                className="auth-social-icon"
              >
                <FcGoogle size={24} />
              </motion.div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="auth-features"
            >
              {[
                { icon: Star, text: "Premium Features" },
                { icon: ShieldCheck, text: "Secure Access" },
                { icon: Zap, text: "Lightning Fast" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="auth-feature-item"
                >
                  <feature.icon className="auth-feature-icon" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="auth-right-panel"
          >

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="auth-error-container"
              >
                <p className="auth-error-text">
                  <AlertCircle size={16} />
                  {error}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                {/* Email Field */}
                <div className="relative">
                  <label htmlFor="email" className="auth-label">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="auth-input-container">
                    <div className={`auth-input-icon ${isFocused.email ? 'focused' : ''}`}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused({...isFocused, email: true})}
                      onBlur={() => setIsFocused({...isFocused, email: false})}
                      required
                      className="auth-input"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative">
                  <label htmlFor="password" className="auth-label">
                    <Lock size={16} />
                    Password
                  </label>
                  <div className="auth-input-container">
                    <div className={`auth-input-icon ${isFocused.password ? 'focused' : ''}`}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused({...isFocused, password: true})}
                      onBlur={() => setIsFocused({...isFocused, password: false})}
                      required
                      className="auth-input"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-password-toggle"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="auth-options">
                <label className="auth-checkbox-container">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                  />
                  <span className="auth-checkbox-label">Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="auth-submit-button"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="auth-spinner mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign In
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line"></div>
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line"></div>
            </div>

            {/* Social Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="auth-social-button"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </motion.button>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="auth-footer"
            >
              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="auth-link"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
