import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const About = () => {
  useEffect(() => {
    document.title = 'About MovieVerse - Your Ultimate Movie Experience';
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Page Title Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/20 via-dark-gray to-primary/20 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent">
            About MovieVerse
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your Ultimate Destination for Movie Entertainment
          </p>
        </div>
      </motion.section>

      {/* Content Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-16"
      >
        {/* App Description */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Welcome to MovieVerse
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              MovieVerse is a comprehensive movie booking platform designed to provide you
              with an exceptional cinema experience. We bring together the latest movies,
              convenient booking options, and a seamless user interface to make your movie
              experience unforgettable.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Whether you're looking for the latest blockbusters, timeless classics, or
              discovering new favorites, MovieVerse is your go-to platform for all things
              cinema.
            </p>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-dark-gray p-6 rounded-lg border border-gray-800 hover:border-primary transition-colors"
              >
                <div className="text-primary text-3xl mb-4"></div>
                <h3 className="text-xl font-bold mb-3 text-white">Extensive Movie Library</h3>
                <p className="text-gray-300">
                  Browse through a vast collection of movies, from the latest releases to
                  beloved classics, all in one place.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-dark-gray p-6 rounded-lg border border-gray-800 hover:border-primary transition-colors"
              >
                <div className="text-primary text-3xl mb-4">🎫</div>
                <h3 className="text-xl font-bold mb-3 text-white">Easy Ticket Booking</h3>
                <p className="text-gray-300">
                  Book your tickets with ease. Select your preferred showtime, choose your
                  seats, and complete your purchase seamlessly.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-dark-gray p-6 rounded-lg border border-gray-800 hover:border-primary transition-colors"
              >
                <div className="text-primary text-3xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-3 text-white">Smart Search</h3>
                <p className="text-gray-300">
                  Find your favorite movies quickly with our powerful search functionality.
                  Search by title, genre, or browse trending content.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-dark-gray p-6 rounded-lg border border-gray-800 hover:border-primary transition-colors"
              >
                <div className="text-primary text-3xl mb-4"></div>
                <h3 className="text-xl font-bold mb-3 text-white">Reviews & Ratings</h3>
                <p className="text-gray-300">
                  Read reviews and ratings from other movie enthusiasts to help you decide
                  your next cinematic adventure.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Mission/Vision Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
              Our Mission
            </h2>
            <div className="bg-dark-gray p-8 rounded-lg border border-gray-800">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                At MovieVerse, our mission is to revolutionize the way people experience
                movies. We strive to make cinema accessible, enjoyable, and convenient for
                everyone. By combining cutting-edge technology with a passion for
                entertainment, we create a platform that brings people together through the
                magic of movies.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                We believe that everyone deserves an exceptional movie-going experience,
                whether they're watching at home or in the theater. That's why we've built
                MovieVerse with you in mind - providing a seamless, user-friendly platform
                that makes discovering and booking movies effortless.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div variants={itemVariants}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
              Our Vision
            </h2>
            <div className="bg-dark-gray p-8 rounded-lg border border-gray-800">
              <p className="text-lg text-gray-300 leading-relaxed">
                We envision a future where movie discovery and booking is effortless,
                personalized, and enjoyable for everyone. MovieVerse aims to become the
                leading platform for movie enthusiasts worldwide, continuously evolving to
                meet the changing needs of our users while maintaining our commitment to
                excellence and innovation.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default About;

