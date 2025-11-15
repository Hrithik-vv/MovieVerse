import React, { useState, useEffect } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';

/**
 * RazorpayCheckout Component
 * 
 * A reusable component for handling Razorpay payments
 * Uses dynamic script loading for clean integration without HTML script tags
 * 
 * @param {Object} props
 * @param {number} props.amount - Payment amount in INR
 * @param {string} props.currency - Currency code (default: 'INR')
 * @param {string} props.orderId - Razorpay order ID
 * @param {string} props.keyId - Razorpay Key ID from environment
 * @param {string} props.name - Merchant name
 * @param {string} props.description - Payment description
 * @param {Object} props.prefill - Prefill data (name, email, contact)
 * @param {Function} props.onSuccess - Success callback (receives payment response)
 * @param {Function} props.onError - Error callback (receives error object)
 * @param {Function} props.onClose - Close callback (when user closes payment modal)
 * @param {boolean} props.disabled - Disable payment button
 * @param {React.ReactNode} props.children - Custom button content
 */
const RazorpayCheckout = ({
  amount,
  currency = 'INR',
  orderId,
  keyId,
  name = 'MovieVerse',
  description = 'Payment for booking',
  prefill = {},
  onSuccess,
  onError,
  onClose,
  disabled = false,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize and open Razorpay checkout
   */
  const handlePayment = async () => {
    // Validate required props
    if (!amount || !orderId || !keyId) {
      const errorMsg = 'Missing required payment details';
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay SDK
      await loadRazorpay();

      // Razorpay checkout options
      const options = {
        key: keyId,
        amount: amount, // Amount in paise (already converted on backend)
        currency: currency,
        name: name,
        description: description,
        order_id: orderId,
        handler: async function (response) {
          // Payment successful
          setLoading(false);
          
          if (onSuccess) {
            onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          }
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || '',
        },
        theme: {
          color: '#e50914', // MovieVerse brand color
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal
            setLoading(false);
            if (onClose) {
              onClose();
            }
          },
        },
      };

      // Create Razorpay instance and open checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment errors
      razorpay.on('payment.failed', function (response) {
        setLoading(false);
        const errorMsg = response.error?.description || 'Payment failed';
        setError(errorMsg);
        
        if (onError) {
          onError({
            code: response.error?.code,
            description: response.error?.description,
            source: response.error?.source,
            step: response.error?.step,
            reason: response.error?.reason,
            metadata: response.error?.metadata,
          });
        }
      });

    } catch (err) {
      // Handle initialization errors
      setLoading(false);
      const errorMsg = err?.message || 'Failed to initialize payment gateway';
      setError(errorMsg);
      
      console.error('Razorpay initialization error:', err);
      
      if (onError) {
        onError(err);
      }
    }
  };

  // Auto-open payment modal when component mounts with valid order data
  useEffect(() => {
    if (amount && orderId && keyId && !isInitialized && !loading && !error && !disabled) {
      handlePayment();
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, orderId, keyId, isInitialized, loading, error, disabled]);

  return (
    <div className="razorpay-checkout">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {children ? (
        <div onClick={!disabled && !loading ? handlePayment : undefined}>
          {children}
        </div>
      ) : (
        <button
          onClick={handlePayment}
          disabled={disabled || loading}
          className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      )}
    </div>
  );
};

export default RazorpayCheckout;

