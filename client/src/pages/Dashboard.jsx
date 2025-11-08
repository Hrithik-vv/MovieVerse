import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="bg-dark-gray p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Information</h2>
        <p className="text-gray-300">Name: {user?.name}</p>
        <p className="text-gray-300">Email: {user?.email}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-dark-gray p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img
                    src={booking.movieId.poster}
                    alt={booking.movieId.title}
                    className="w-24 h-32 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.movieId.title}
                    </h3>
                    <p className="text-gray-400">
                      {booking.theatreId.name} - {booking.theatreId.location}
                    </p>
                    <p className="text-gray-400">
                      Showtime: {new Date(booking.showtime).toLocaleString()}
                    </p>
                    <p className="text-gray-400">
                      Seats:{' '}
                      {booking.seats
                        .map(([row, col]) => `Row ${row + 1}, Seat ${col + 1}`)
                        .join(', ')}
                    </p>
                    <p className="text-gray-400">Amount: ₹{booking.totalPrice}</p>
                    <p
                      className={`mt-2 ${
                        booking.paymentStatus === 'completed'
                          ? 'text-green-400'
                          : booking.paymentStatus === 'cancelled'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      Status: {booking.paymentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.paymentStatus === 'pending' && (
                    <Link
                      to={`/payment/${booking._id}`}
                      className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Pay Now
                    </Link>
                  )}
                  {booking.paymentStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl mb-4">No bookings yet</p>
          <Link
            to="/movies"
            className="text-primary hover:underline"
          >
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

