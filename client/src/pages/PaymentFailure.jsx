import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentFailure = () => {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Payment failed';

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-dark-gray p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-red-500/30">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
                <p className="text-gray-400 mb-6">{message}</p>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="block w-full bg-primary hover:bg-red-700 text-white py-2 rounded transition-colors"
                    >
                        Try Again via Dashboard
                    </Link>
                    <Link
                        to="/"
                        className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
