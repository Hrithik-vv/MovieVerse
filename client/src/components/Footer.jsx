import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-gray border-t border-gray-800 mt-auto py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">MovieVerse</h3>
            <p className="text-gray-400">
              Your one-stop destination for movie reviews and ticket booking.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary hover:underline underline-offset-4 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-gray-400 hover:text-primary hover:underline underline-offset-4 transition-colors">
                  Movies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: support@movieverse.com</p>
            <p className="text-gray-400">Phone: +1 234 567 8900</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; 2024 MovieVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

