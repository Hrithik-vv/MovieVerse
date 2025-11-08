import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBooking();
    loadRazorpay();
  }, []);

  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      alert('Razorpay SDK failed to load. Are you online?');
    };
    document.body.appendChild(script);
  };

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/bookings/${bookingId}`);
      setBooking(res.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded');
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const orderRes = await axios.post(`${API_URL}/api/payment/create-order`, {
        amount: booking.totalPrice,
        bookingId: booking._id,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'MovieVerse',
        description: `Booking for ${booking.movieId.title}`,
        order_id: orderRes.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });

            alert('Payment successful!');
            navigate('/dashboard');
          } catch (error) {
            alert('Payment verification failed');
            console.error(error);
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#e50914',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('Error initiating payment');
      console.error(error);
    } finally {
      setProcessing(false);
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
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded transition-colors disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <p className="text-sm text-gray-400 mt-4 text-center">
          You will be redirected to Razorpay for secure payment
        </p>
      </div>
    </div>
  );
};

export default Payment;

