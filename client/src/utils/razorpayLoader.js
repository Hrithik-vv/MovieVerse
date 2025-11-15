/**
 * Razorpay Loader Utility
 * Dynamically loads Razorpay SDK without using script tags in HTML
 * This provides a clean, library-like interface
 */

let razorpayLoaded = false;
let loadPromise = null;

/**
 * Load Razorpay SDK dynamically
 * @returns {Promise<void>} Promise that resolves when Razorpay is loaded
 */
export const loadRazorpay = () => {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Return resolved promise if already loaded
  if (razorpayLoaded && window.Razorpay) {
    return Promise.resolve();
  }

  // Create new load promise
  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      razorpayLoaded = true;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // Handle successful load
    script.onload = () => {
      razorpayLoaded = true;
      loadPromise = null;
      resolve();
    };

    // Handle load error
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    };

    // Append script to document
    document.body.appendChild(script);
  });

  return loadPromise;
};

/**
 * Check if Razorpay is loaded
 * @returns {boolean} True if Razorpay is loaded
 */
export const isRazorpayLoaded = () => {
  return razorpayLoaded && typeof window.Razorpay !== 'undefined';
};

