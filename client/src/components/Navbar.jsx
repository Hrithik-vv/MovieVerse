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
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h1 className="text-2xl font-bold text-primary">MovieVerse</h1>
            </motion.div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-gray-300 hover:text-primary transition-colors"
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

