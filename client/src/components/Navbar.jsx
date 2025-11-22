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
      className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? 'glass shadow-lg py-2 border-b border-yellow-400/20'
        : 'bg-gradient-to-r from-black via-gray-900 to-black shadow-xl py-3'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="h-10 w-10 md:h-12 md:w-12 shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <img
                src="/img/ChatGPT Image Nov 5, 2025, 11_37_11 AM.png"
                alt="MovieVerse logo"
                className="object-contain h-full w-full drop-shadow-lg"
              />
            </motion.div>
            <motion.span
              className="hidden sm:inline text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              MovieVerse
            </motion.span>
          </Link>

          {/* Navigation Links - Centered (conditional based on role) */}
          {user?.role === 'admin' ? (
            // Admin navigation - only Dashboard and Banners
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {[{ label: 'Dashboard', path: '/admin/dashboard' }, { label: 'Banners', path: '/admin/banners' }].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className="relative text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium text-lg group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-200 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            // Regular user navigation
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {['Home', 'Movies', 'My Bookings', 'About'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="relative text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium text-lg group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-200 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mobile Navigation Links */}
          {user?.role === 'admin' ? (
            <div className="flex md:hidden items-center space-x-3">
              <Link to="/admin/dashboard" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/admin/banners" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium">
                Banners
              </Link>
            </div>
          ) : (
            <div className="flex md:hidden items-center space-x-3">
              {['/', '/movies', '/my-bookings', '/about'].map((path, index) => (
                <Link
                  key={path}
                  to={path}
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
                >
                  {['Home', 'Movies', 'Bookings', 'About'][index]}
                </Link>
              ))}
            </div>
          )}


          {/* User Menu - Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="btn-classic flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline">{user.name || 'Account'}</span>
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
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 glass rounded-xl shadow-2xl border border-yellow-400/30 overflow-hidden"
                    >
                      <Link
                        to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-6 py-3 text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 border-b border-white/5"
                      >
                        Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/banners"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-6 py-3 text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 border-b border-white/5"
                        >
                          Banners
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-6 py-3 text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 border-b border-white/5"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="btn-classic"
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
