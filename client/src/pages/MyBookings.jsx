import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 6;

const MyBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, cancelled

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
            await axios.put(`${API_URL}/api/bookings/${bookingId}/cancel`);
            fetchBookings();
        } catch (error) {
            alert('Error cancelling booking');
        }
    };

    // Filter bookings based on status
    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'all') return true;
        return booking.paymentStatus === filterStatus;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-400';
            case 'cancelled':
                return 'text-red-400';
            case 'pending':
                return 'text-yellow-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

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
                        My Bookings
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
                    >
                        View and manage your movie bookings
                    </motion.p>
                </div>
            </motion.section>

            <div className="container mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start"
                >
                    {['all', 'completed', 'pending', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${filterStatus === status
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-dark-gray text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 text-sm">
                                ({status === 'all' ? bookings.length : bookings.filter(b => b.paymentStatus === status).length})
                            </span>
                        </button>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : currentBookings.length > 0 ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="grid gap-6 mb-8"
                        >
                            {currentBookings.map((booking, index) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-dark-gray rounded-xl overflow-hidden border border-gray-800 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Movie Poster */}
                                        <div className="md:w-48 h-64 md:h-auto flex-shrink-0">
                                            <img
                                                src={booking.movieId?.poster || 'https://via.placeholder.com/400x600?text=No+Image'}
                                                alt={booking.movieId?.title || 'Unknown Movie'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                                                }}
                                            />
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">
                                                        {booking.movieId?.title || 'Unknown Movie'}
                                                    </h3>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {booking.paymentStatus === 'pending' && (
                                                        <Link
                                                            to={`/payment/${booking._id}`}
                                                            className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40"
                                                        >
                                                            Pay Now
                                                        </Link>
                                                    )}
                                                    {booking.paymentStatus !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            className="bg-red-600/20 border border-red-600/30 hover:bg-red-600 text-red-400 hover:text-white px-6 py-2 rounded-lg transition-all font-semibold"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                                                <div>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Theatre:</span>
                                                        <span className="font-semibold">{booking.theatreId?.name || 'Unknown Theatre'}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Location:</span>
                                                        <span>{booking.theatreId?.location || 'Unknown Location'}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Showtime:</span>
                                                        <span>{new Date(booking.showtime).toLocaleString()}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Seats:</span>
                                                        <span className="font-semibold">
                                                            {booking.seats.map(([row, col]) => `R${row + 1}-S${col + 1}`).join(', ')}
                                                        </span>
                                                    </p>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Amount:</span>
                                                        <span className="font-bold text-primary">₹{booking.totalPrice}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        <span className="text-gray-500 text-sm">Booking ID:</span>
                                                        <span className="text-xs font-mono">{booking._id.slice(-8).toUpperCase()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1 }}
                                className="flex justify-center items-center gap-2 flex-wrap"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            : 'bg-dark-gray text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/25'
                                        }`}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === pageNumber
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                        : 'bg-dark-gray text-gray-300 hover:bg-gray-800 hover:text-white'
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
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            : 'bg-dark-gray text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/25'
                                        }`}
                                >
                                    Next
                                </button>
                            </motion.div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center mt-4 text-gray-400">
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <p className="text-gray-400 text-xl mb-6">
                                {filterStatus === 'all'
                                    ? 'No bookings yet'
                                    : `No ${filterStatus} bookings found`}
                            </p>
                            <Link
                                to="/movies"
                                className="inline-block bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40"
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
