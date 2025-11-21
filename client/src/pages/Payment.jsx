import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, []);


  const fetchBooking = async () => {
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


  const handleInitiatePayment = async () => {
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to make a payment');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!booking) {
      setError('Booking details not available');
      return;
    }

    setError(null);

    try {
      const txnid = `txn_${booking._id}_${Date.now()}`;
      const amount = booking.totalPrice;
      const productinfo = booking._id;
      const firstname = user.name || 'User';
      const email = user.email;

      // Get hash from backend
      const hashRes = await axios.post(
        `${API_URL}/api/payment/hash`,
        {
          txnid,
          amount,
          productinfo,
          firstname,
          email
        }
      );

      if (!hashRes.data.success) {
        throw new Error(hashRes.data.message || 'Failed to generate payment hash');
      }

      const { hash, key } = hashRes.data;

      // Create form and submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment'; // Use test URL for now

      const fields = {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone: '9999999999', // Dummy phone for test
        surl: `${API_URL}/api/payment/response`,
        furl: `${API_URL}/api/payment/response`,
        hash
      };

      for (const key in fields) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error?.response?.data?.message || error.message || 'Failed to initiate payment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-8">Booking not found</div>;
  }

  if (booking.paymentStatus === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-green-500/20 text-green-400 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Payment Already Completed</h2>
          <p>Your booking is confirmed!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-primary hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>

      <div className="bg-dark-gray p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
        <div className="space-y-2 text-gray-300">
          <p><strong>Movie:</strong> {booking.movieId.title}</p>
          <p><strong>Theatre:</strong> {booking.theatreId.name}</p>
          <p><strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}</p>
          <p><strong>Seats:</strong>{' '}
            {booking.seats.map(([row, col]) => `Row ${row + 1}, Seat ${col + 1}`).join(', ')}
          </p>
        </div>
      </div>

      <div className="bg-dark-gray p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <span className="text-2xl font-bold">Total Amount:</span>
          <span className="text-3xl font-bold text-primary">₹{booking.totalPrice}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleInitiatePayment}
          className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded transition-colors"
        >
          Pay with PayU
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          You will be redirected to PayU for secure payment
        </p>
      </div>
    </div>
  );
};

export default Payment;

