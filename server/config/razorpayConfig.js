const Razorpay = require("razorpay");

console.log("RAZORPAY CONFIG FILE LOADED:", __filename);

console.log("==========================================");
console.log("Checking Razorpay Environment Variables");
console.log("==========================================");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID || " NOT LOADED");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET || " NOT LOADED");
console.log("RAZORPAY_SECRET:", process.env.RAZORPAY_SECRET || " NOT LOADED");


const getRazorpaySecret = () => {
  return process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
};

const hasRazorpayConfig = () => {
  return Boolean(process.env.RAZORPAY_KEY_ID && getRazorpaySecret());
};

// Razorpay instance
let razorpayInstance = null;

if (hasRazorpayConfig()) {
  try {
    console.log(" Initializing Razorpay with:");
    console.log(" → key_id:", process.env.RAZORPAY_KEY_ID);
    console.log(" → key_secret:", getRazorpaySecret());

    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: getRazorpaySecret(),
    });

    console.log("✓ Razorpay configured successfully");
  } catch (err) {
    console.error(" Failed to initialize Razorpay:", err.message);
  }
} else {
  console.warn("⚠ Razorpay NOT configured");
}

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    throw new Error("Razorpay is not configured — missing keys");
  }
  return razorpayInstance;
};

const isRazorpayConfigured = () => {
  return hasRazorpayConfig() && razorpayInstance !== null;
};

module.exports = {
  getRazorpayInstance,
  isRazorpayConfigured,
  getRazorpaySecret,
};
