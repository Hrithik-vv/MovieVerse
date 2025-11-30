import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 6;

const MyBookings = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings/mybookings`);
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const res = await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`);
            fetchBookings();
            // Refresh user data to update wallet balance
            if (fetchUser) {
                await fetchUser();
            }
            toast.success(res.data.message || 'Booking cancelled successfully. Amount credited to wallet!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error cancelling booking');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'all') return true;
        return booking.paymentStatus === filterStatus;
    });

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/40';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/40';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Page Header */}
            <motion.section
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative py-20 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        My Bookings
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '200px' }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-6"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
                        style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                        Manage your cinema experiences
                    </motion.p>
                </div>
            </motion.section>

            <div className="container mx-auto px-4 py-12">
                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap gap-4 mb-12 justify-center"
                >
                    {['all', 'completed', 'pending', 'cancelled'].map((status) => (
                        <motion.button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${filterStatus === status
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/30'
                                : 'glass text-gray-300 hover:bg-yellow-400/10 border border-yellow-400/20'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 text-sm">
                                ({status === 'all' ? bookings.length : bookings.filter(b => b.paymentStatus === status).length})
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
                        </div>
                    </div>
                ) : currentBookings.length > 0 ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="grid gap-8 mb-12"
                        >
                            <AnimatePresence>
                                {currentBookings.map((booking, index) => (
                                    <motion.div
                                        key={booking._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="glass rounded-2xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-500 shadow-xl hover:shadow-yellow-400/20"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Movie Poster */}
                                            <div className="md:w-56 h-80 md:h-auto flex-shrink-0 relative overflow-hidden">
                                                <img
                                                    src={booking.movieId?.poster || 'https://via.placeholder.com/400x600?text=No+Image'}
                                                    alt={booking.movieId?.title || 'Unknown Movie'}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            </div>

                                            {/* Booking Details */}
                                            <div className="flex-1 p-8">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                                    <div>
                                                        <h3 className="text-3xl font-bold text-yellow-400 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                            {booking.movieId?.title || 'Unknown Movie'}
                                                        </h3>
                                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(booking.paymentStatus)}`}>
                                                            {booking.paymentStatus.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {booking.paymentStatus === 'pending' && (
                                                            <Link
                                                                to={`/payment/${booking._id}`}
                                                                className="btn-classic"
                                                            >
                                                                Complete Payment
                                                            </Link>
                                                        )}
                                                        {booking.paymentStatus !== 'cancelled' && (
                                                            (() => {
                                                                const showtime = new Date(booking.showtime);
                                                                const now = new Date();
                                                                const diffHours = (showtime - now) / (1000 * 60 * 60);

                                                                if (diffHours < 2) {
                                                                    return (
                                                                        <span className="px-6 py-3 rounded-full bg-gray-500/20 border border-gray-500/40 text-gray-400 font-semibold cursor-not-allowed" title="Cannot cancel within 2 hours of showtime">
                                                                            Not Cancellable
                                                                        </span>
                                                                    );
                                                                }

                                                                return (
                                                                    <button
                                                                        onClick={() => handleCancelBooking(booking._id)}
                                                                        className="px-6 py-3 rounded-full bg-red-500/20 border border-red-500/40 hover:bg-red-500 text-red-400 hover:text-white transition-all font-semibold"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                );
                                                            })()
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Theatre</p>
                                                                <p className="font-semibold text-white">{booking.theatreId?.name || 'Unknown Theatre'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Location</p>
                                                                <p>{booking.theatreId?.location || 'Unknown Location'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Showtime</p>
                                                                <p className="font-semibold">{new Date(booking.showtime).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Seats</p>
                                                                <p className="font-semibold text-white">
                                                                    {booking.seats.map(([row, col]) => `R${row + 1}-S${col + 1}`).join(', ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                                                                <p className="font-bold text-2xl text-yellow-400">₹{booking.totalPrice}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">

                                                            <div>
                                                                <p className="text-gray-500 text-sm mb-1">Booking ID</p>
                                                                <p className="text-xs font-mono text-gray-400">{booking._id.slice(-8).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex justify-center items-center gap-3 flex-wrap"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-6 py-3 rounded-full font-semibold transition-all ${currentPage === 1
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'glass border border-yellow-400/20 text-white hover:bg-yellow-400/10'
                                        }`}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`w-12 h-12 rounded-full font-semibold transition-all ${currentPage === pageNumber
                                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/30'
                                                    : 'glass border border-yellow-400/20 text-gray-300 hover:bg-yellow-400/10'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                        return <span key={pageNumber} className="text-gray-600">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-6 py-3 rounded-full font-semibold transition-all ${currentPage === totalPages
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'glass border border-yellow-400/20 text-white hover:bg-yellow-400/10'
                                        }`}
                                >
                                    Next
                                </button>
                            </motion.div>
                        )}

                        <div className="text-center mt-6 text-gray-400">
                            Showing {startIndex + 1} - {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-20"
                    >
                        <div className="max-w-md mx-auto">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', duration: 0.6 }}
                                className="w-32 h-32 mx-auto mb-8 rounded-full bg-yellow-400/10 flex items-center justify-center"
                            >
                                <h3 className="text-2xl font-bold text-gray-300 mb-4">No Bookings Yet</h3>
                            </motion.div>
                            <p className="text-gray-400 text-2xl font-light mb-8">
                                {filterStatus === 'all'
                                    ? 'No bookings yet'
                                    : `No ${filterStatus} bookings found`}
                            </p>
                            <Link
                                to="/movies"
                                className="btn-classic inline-block"
                            >
                                Browse Movies
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
