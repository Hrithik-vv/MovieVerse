import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const ticketRef = useRef(null);

    useEffect(() => {
        if (!bookingId) {
            setError('No booking ID found');
            setLoading(false);
            return;
        }
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings/${bookingId}`);
            setBooking(res.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = async () => {
        if (!ticketRef.current) return;

        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#1a1a1a',
                scale: 2,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `MovieVerse-Ticket-${booking._id.slice(-8)}.png`;
            link.click();
        } catch (error) {
            console.error('Error generating ticket:', error);
            toast.error('Failed to download ticket');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-red-500/20 text-red-400 p-6 rounded-lg inline-block">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                    <Link to="/dashboard" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded hover:bg-red-700 transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-lg text-center mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-400 mb-2">Payment Successful!</h1>
                <p className="text-gray-300">Your booking has been confirmed.</p>
            </div>

            {booking && (
                <>
                    {/* Ticket Container to Capture */}
                    <div ref={ticketRef} className="bg-dark-gray p-6 rounded-lg shadow-lg mb-6">
                        <div className="border-b border-gray-700 pb-4 mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-primary">MovieVerse Ticket</h2>
                            <span className="text-xs text-gray-500">#{booking._id.slice(-8).toUpperCase()}</span>
                        </div>

                        <div className="flex gap-6 mb-6">
                            <img
                                src={booking.movieId?.poster || 'https://via.placeholder.com/150'}
                                alt={booking.movieId?.title || 'Unknown Movie'}
                                className="w-32 h-48 object-cover rounded"
                                crossOrigin="anonymous"
                            />
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-white">{booking.movieId?.title || 'Unknown Movie'}</h3>
                                <p className="text-gray-300">
                                    <span className="text-gray-500 block text-sm">Theatre</span>
                                    {booking.theatreId?.name || 'Unknown Theatre'}, {booking.theatreId?.location || 'Unknown Location'}
                                </p>
                                <p className="text-gray-300">
                                    <span className="text-gray-500 block text-sm">Showtime</span>
                                    {new Date(booking.showtime).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded">
                            <div>
                                <span className="text-gray-500 text-sm block">Amount Paid</span>
                                <span className="font-bold text-white">₹{booking.totalPrice}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm block">Seats</span>
                                <span className="text-white">
                                    {booking.seats.map(([row, col]) => `R${row + 1}-S${col + 1}`).join(', ')}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-xs text-gray-600">
                            Show this ticket at the entrance
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleDownloadTicket}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Ticket
                        </button>
                        <Link
                            to="/dashboard"
                            className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
                        >
                            My Bookings
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentSuccess;
