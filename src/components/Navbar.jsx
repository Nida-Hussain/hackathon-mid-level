import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText,
  Search,
  Sun,
  Moon,
  Palette,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Bell,
  ChevronDown,
  Home,
  Briefcase,
  Award,
  GraduationCap,
  Code,
  Mail,
  Calendar,
  Grid3X3
} from 'lucide-react';

const Navbar = ({ showSearch = true, showUserMenu = true, showThemeToggle = true }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isUserDropdownOpen, isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchTerm);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Navigation items for authenticated users
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/create-resume', label: 'Create Resume', icon: FileText },
    { path: '/dashboard', label: 'My Resumes', icon: Briefcase },
  ];

  return (
    <header className={`navbar-glass ${theme}`}>
      <div className="dashboard-max-width-container">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="d-flex items-center space-x-4">
            <div className="navbar-brand">
              <div className="navbar-brand-icon">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <Link to="/dashboard" className="navbar-brand-text">
                ResumeBuilder
              </Link>
            </div>
            
            {/* Navigation Links */}
            <nav className="d-flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search resumes, templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`input-enhanced pl-11 pr-4 py-2 w-full text-white placeholder-white/60 ${theme}`}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="d-flex items-center space-x-3">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Template Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 d-flex items-center"
              >
                <Palette className="w-5 h-5" />
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="navbar-dropdown-menu">
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-white/80 mb-2">Templates</h3>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm mb-1">
                      Modern
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm mb-1">
                      Classic
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm">
                      Professional
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {showUserMenu && currentUser && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="d-flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-all duration-300"
                >
                  <div className="user-avatar">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="navbar-dropdown-menu right-0 mt-2 w-56">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-white/60 border-b border-white/10">
                        <div className="font-medium text-white">{currentUser?.email?.split('@')[0]}</div>
                        <div className="text-xs">{currentUser?.email}</div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm flex items-center mb-1"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm flex items-center mb-1"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-red-400 text-sm flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <div className="d-flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link to="/dashboard" className="navbar-brand">
              <div className="navbar-brand-icon">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="navbar-brand-text">ResumeBuilder</span>
            </Link>
          </div>

          <div className="d-flex items-center space-x-2">
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            
            {showUserMenu && currentUser && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="d-flex items-center space-x-1 hover:bg-white/10 rounded-full p-1 transition-all duration-300"
                >
                  <div className="user-avatar w-8 h-8 d-flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </button>
                
                {isUserDropdownOpen && (
                  <div className="navbar-dropdown-menu right-0 mt-2 w-48">
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm flex items-center mb-1"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 text-sm flex items-center mb-1"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-red-400 text-sm flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            ref={mobileMenuRef}
            className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path) 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {showSearch && (
              <div className="mt-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search resumes, templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;