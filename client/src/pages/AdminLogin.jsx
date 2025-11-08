import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      // Wait a bit for context to update, then check user role
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            setError('Access denied. Admin only.');
          }
        } catch (error) {
          setError('Error verifying admin access');
        }
      }, 200);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-gray p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-red-700 text-white py-2 rounded transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          <a href="/login" className="text-primary hover:underline">
            User Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

