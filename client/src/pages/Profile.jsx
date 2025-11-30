import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.put(`${API_URL}/api/users/profile`, { name }, config);
            setUser({ ...user, name: res.data.name });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setPassLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.put(
                `${API_URL}/api/users/password`,
                { currentPassword, newPassword },
                config
            );
            toast.success('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    My Profile
                </motion.h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: User Info & Wallet */}
                    <div className="space-y-8">
                        {/* Wallet Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-8 rounded-2xl border border-yellow-400/20 shadow-xl shadow-yellow-400/10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">My Wallet</h2>

                            </div>
                            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 rounded-xl text-black">
                                <p className="text-sm font-semibold opacity-80 mb-1">Available Balance</p>
                                <p className="text-4xl font-bold">₹{user?.walletBalance || 0}</p>
                            </div>
                            <p className="text-gray-400 text-sm mt-4">
                                Use this balance to book tickets.
                            </p>
                        </motion.div>

                        {/* Profile Update Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-2xl border border-gray-800"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-black/30 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column: Change Password */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass p-8 rounded-2xl border border-gray-800 h-fit"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                    placeholder="•••••••• (Min 8 chars)"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={passLoading}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 border border-gray-700"
                            >
                                {passLoading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
