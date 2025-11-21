import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-black">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/20 via-dark-gray to-primary/20 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
          >
            Welcome back, {user?.name}!
          </motion.p>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        {/* User Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-dark-gray p-8 rounded-xl mb-8 border border-gray-800 shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            User Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-500 text-sm mb-2">Name</p>
              <p className="text-white text-xl font-semibold">{user?.name}</p>
            </div>
            <div className="bg-black/30 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-500 text-sm mb-2">Email</p>
              <p className="text-white text-xl font-semibold">{user?.email}</p>
            </div>
            {user?.role && (
              <div className="bg-black/30 p-6 rounded-lg border border-gray-700">
                <p className="text-gray-500 text-sm mb-2">Role</p>
                <p className="text-white text-xl font-semibold capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* My Bookings Card */}
          <Link
            to="/my-bookings"
            className="bg-gradient-to-br from-primary/20 to-red-600/20 border border-primary/30 p-8 rounded-xl hover:from-primary/30 hover:to-red-600/30 transition-all duration-300 group shadow-lg hover:shadow-primary/25"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">My Bookings</h3>
              <p className="text-gray-400">View and manage your movie bookings</p>
            </div>
          </Link>

          {/* Browse Movies Card */}
          <Link
            to="/movies"
            className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 p-8 rounded-xl hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-300 group shadow-lg hover:shadow-blue-500/25"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Browse Movies</h3>
              <p className="text-gray-400">Discover new movies to watch</p>
            </div>
          </Link>

          {/* Profile Card */}
          <Link
            to="/profile"
            className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 p-8 rounded-xl hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 group shadow-lg hover:shadow-green-500/25"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Profile Settings</h3>
              <p className="text-gray-400">Update your profile information</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
