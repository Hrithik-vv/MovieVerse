import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                {/* 404 Number */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative mb-8"
                >
                    <h1
                        className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        404
                    </h1>
                    <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                </motion.div>

                {/* Error Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                        Oops! The page you're looking for seems to have wandered off into the cinema.
                        Let's get you back to the show.
                    </p>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-12"
                >
                    <div className="flex justify-center items-center gap-4 text-6xl mb-8">
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                            🎬
                        </motion.span>
                        <motion.span
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            🍿
                        </motion.span>
                        <motion.span
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                        >
                            🎥
                        </motion.span>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-classic px-8 py-3"
                        >
                            🏠 Go Home
                        </motion.button>
                    </Link>
                    <Link to="/movies">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="glass px-8 py-3 rounded-full border border-yellow-400/40 text-white hover:bg-yellow-400/10 transition-all font-semibold"
                        >
                            🎬 Browse Movies
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Animated Background Elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 50, 0],
                            rotate: [360, 180, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity }}
                        className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-600/5 rounded-full blur-3xl"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
