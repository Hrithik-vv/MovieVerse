import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-900 to-black border-t border-yellow-400/20 mt-auto py-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              MovieVerse
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Experience the finest in cinema. Your ultimate destination for discovering, reviewing, and booking the latest movies with elegance and ease.
            </p>
            <div className="flex gap-4">
              {[
                { icon: '📧', label: 'Email' },
                { icon: '📱', label: 'Social' },
                { icon: '🎬', label: 'Theater' }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full glass hover:bg-yellow-400/20 flex items-center justify-center text-xl transition-all duration-300 border border-yellow-400/20 hover:border-yellow-400/60"
                  aria-label={item.label}
                >
                  {item.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-6 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif' }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/movies', label: 'Movies' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/about', label: 'About Us' }
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-0.5 bg-yellow-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-6 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif' }}>
              Contact
            </h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">📧</span>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a href="mailto:support@movieverse.com" className="hover:text-yellow-400 transition-colors">
                    support@movieverse.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">📞</span>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <a href="tel:+12345678900" className="hover:text-yellow-400 transition-colors">
                    +1 234 567 8900
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">📍</span>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p>123 Cinema Street<br />Hollywood, CA 90028</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Decorative divider */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent mb-8" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm mb-2">
            &copy; {currentYear} MovieVerse. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Crafted with <span className="text-yellow-400 animate-pulse">★</span> for movie enthusiasts
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
