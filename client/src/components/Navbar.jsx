import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-gray/95 backdrop-blur-md shadow-xl py-2'
          : 'bg-dark-gray shadow-lg py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="h-8 w-8 md:h-10 md:w-10 shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <img
                src="/img/ChatGPT Image Nov 5, 2025, 11_37_11 AM.png"
                alt="MovieVerse logo"
                className="object-contain h-full w-full"
              />
            </motion.div>
            <motion.span
              className="hidden sm:inline text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent drop-shadow-lg"
              whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(229, 9, 20, 0.8)' }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              MovieVerse
            </motion.span>
          </Link>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="text-gray-300 hover:text-primary hover:underline underline-offset-4 transition-colors duration-200 font-medium"
              >
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/movies"
                className="text-gray-300 hover:text-primary hover:underline underline-offset-4 transition-colors duration-200 font-medium"
              >
                Movies
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/about"
                className="text-gray-300 hover:text-primary hover:underline underline-offset-4 transition-colors duration-200 font-medium"
              >
                About
              </Link>
            </motion.div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex md:hidden items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-gray-300 hover:text-primary transition-colors text-sm font-medium"
            >
              Movies
            </Link>
            <Link
              to="/about"
              className="text-gray-300 hover:text-primary transition-colors text-sm font-medium"
            >
              About
            </Link>
          </div>

          {/* User Menu - Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-gray rounded-lg shadow-xl border border-gray-700 overflow-hidden"
                    >
                      <Link
                        to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/banners"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors duration-200"
                        >
                          Banners
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors duration-200"
                      >
                        Profile
                      </Link>
                      <div className="border-t border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
