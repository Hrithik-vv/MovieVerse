import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, googleLogin, requestPasswordOtp, resetPasswordWithOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
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
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
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
        <div className="mt-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const idToken = credentialResponse.credential;
              const result = await googleLogin(idToken);
              if (result.success) navigate('/dashboard');
              else setError(result.message);
            }}
            onError={() => setError('Google login failed')}
          />
        </div>
        <div className="mt-3 text-center">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              setShowForgot(true);
              setForgotStep(1);
              setForgotMsg('');
              setOtp('');
              setNewPass('');
              setConfirmPass('');
              setForgotEmail(email || '');
            }}
          >
            Forgot password?
          </button>
        </div>
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-gray-400">
          {/* <Link to="/admin/login" className="text-primary hover:underline">
            Admin Login
          </Link> */}
        </p>
      </motion.div>
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-gray p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-4">
              {forgotStep === 1 ? 'Reset Password' : 'Enter OTP & New Password'}
            </h3>
            {forgotMsg && (
              <div className="mb-3 text-sm text-gray-300">{forgotMsg}</div>
            )}
            {forgotStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-primary hover:bg-red-700 text-white py-2 rounded transition-colors disabled:opacity-50"
                    disabled={forgotLoading || !forgotEmail}
                    onClick={async () => {
                      setForgotLoading(true);
                      setForgotMsg('');
                      const res = await requestPasswordOtp(forgotEmail);
                      setForgotLoading(false);
                      if (res.success) {
                        setForgotMsg('OTP sent. Check your email or server console.');
                        setForgotStep(2);
                      } else {
                        setForgotMsg(res.message);
                      }
                    }}
                  >
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
                    onClick={() => setShowForgot(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="6-digit code"
                  />
                </div>
                <div>
                  <label className="block mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-primary hover:bg-red-700 text-white py-2 rounded transition-colors disabled:opacity-50"
                    disabled={
                      forgotLoading ||
                      !otp ||
                      !newPass ||
                      newPass !== confirmPass ||
                      newPass.length < 6
                    }
                    onClick={async () => {
                      setForgotLoading(true);
                      setForgotMsg('');
                      const res = await resetPasswordWithOtp(forgotEmail, otp, newPass);
                      setForgotLoading(false);
                      if (res.success) {
                        setForgotMsg('Password reset successful. Redirecting to login...');
                        setTimeout(() => {
                          setShowForgot(false);
                          navigate('/login');
                        }, 1200);
                      } else {
                        setForgotMsg(res.message);
                      }
                    }}
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
                    onClick={() => setShowForgot(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

