import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!token) {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only log out on user authentication errors, not Razorpay/payment errors
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
          
          // Don't log out if it's a Razorpay authentication error
          if (errorMessage.includes('Razorpay') || errorMessage.includes('API keys')) {
            // This is a Razorpay error, not a user auth error - don't log out
            return Promise.reject(error);
          }
          
          // Only log out on actual user authentication errors
          if (errorMessage.includes('Not authorized') || 
              errorMessage.includes('token') || 
              errorMessage.includes('Authentication required') ||
              !errorMessage) { // If no message, assume it's a user auth error
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    fetchUser();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const googleLogin = async (idToken) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, { idToken });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  const requestPasswordOtp = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password/request-otp`, { email });
      return { success: true, message: res.data?.message || 'OTP sent' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password/reset`, { email, otp, newPassword });
      return { success: true, message: res.data?.message || 'Password reset successful' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, requestPasswordOtp, resetPasswordWithOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

