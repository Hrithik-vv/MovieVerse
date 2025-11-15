import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
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
      // Use axios with default headers set by AuthContext
      // This ensures the token is automatically included
      const orderRes = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
          amount: booking.totalPrice,
          bookingId: booking._id,
        }
      );

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create payment order');
      }

      // Store order data for RazorpayCheckout component
      setOrderData({
        orderId: orderRes.data.orderId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency || 'INR',
      });
    } catch (error) {
      console.error('Error creating payment order:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      // Don't redirect to login if it's a Razorpay authentication error (401 from Razorpay, not user auth)
      // Only redirect if it's a user authentication error (401 from our server)
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || '';
        
        // If it's a Razorpay authentication error, don't treat it as user auth failure
        if (errorMessage.includes('Razorpay') || errorMessage.includes('API keys')) {
          setError('Razorpay authentication failed. The API keys are invalid. Please contact the administrator.');
          return;
        }
        
        // If it's a user authentication error, redirect to login
        if (errorMessage.includes('Not authorized') || errorMessage.includes('token')) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
      }
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        'Failed to initiate payment. Please try again.';
      
      setError(errorMessage);
      
      // If it's a configuration error, show a more helpful message
      if (errorMessage.includes('not configured') || errorMessage.includes('RAZORPAY')) {
        setError('Payment gateway is not configured. Please contact the administrator.');
      }
      
      // If it's a Razorpay authentication error, show specific message
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('authentication')) {
        setError('Razorpay authentication failed. The API keys are invalid. Please contact the administrator.');
      }
    }
  };

 
  const handlePaymentSuccess = async (paymentResponse) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Verify payment on backend
      const verifyRes = await axios.post(
        `${API_URL}/api/payment/verify`,
        {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId: booking._id,
        },
        { headers }
      );

      if (verifyRes.data.success) {
        // Payment verified successfully
        alert('Payment successful! Your booking is confirmed.');
        navigate('/dashboard');
      } else {
        throw new Error(verifyRes.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError(
        error?.response?.data?.message || 
        error?.message || 
        'Payment verification failed. Please contact support.'
      );
      // Reset order data to allow retry
      setOrderData(null);
    }
  };

 
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(
      error?.description || 
      error?.message || 
      'Payment failed. Please try again.'
    );
    setOrderData(null);
  };

 
  const handlePaymentClose = () => {
    setOrderData(null);
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

        {!orderData ? (
          <button
            onClick={handleInitiatePayment}
            className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded transition-colors"
          >
            Pay Now
          </button>
        ) : (
          <RazorpayCheckout
            amount={orderData.amount}
            currency={orderData.currency}
            orderId={orderData.orderId}
            keyId={process.env.REACT_APP_RAZORPAY_KEY_ID}
            name="MovieVerse"
            description={`Booking for ${booking.movieId.title}`}
            prefill={{
              name: 'User',
              email: 'user@example.com',
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onClose={handlePaymentClose}
          />
        )}

        <p className="text-sm text-gray-400 mt-4 text-center">
          You will be redirected to Razorpay for secure payment
        </p>
      </div>
    </div>
  );
};

export default Payment;

