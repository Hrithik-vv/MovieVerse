import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-gray shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div className="h-10 w-10 md:h-12 md:w-12 shrink-0">
              <img
                src="/img/ChatGPT Image Nov 5, 2025, 11_37_11 AM.png"
                alt="MovieVerse logo"
                className="object-contain h-full w-full"
              />
            </motion.div>
            <span className="hidden sm:inline text-2xl font-bold text-white tracking-tight">
              MovieVerse
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-gray-300 hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
              Movies
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/banners"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    Banners
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
