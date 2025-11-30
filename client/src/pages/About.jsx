import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'About MovieVerse';
  }, []);

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            About MovieVerse
          </h1>
          <p className="text-gray-400">
            Your Movie Booking Platform
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome</h2>
          <p className="text-gray-300 mb-3">
            MovieVerse is a comprehensive movie booking platform designed to provide you
            with an exceptional cinema experience. We bring together the latest movies,
            convenient booking options, and a seamless user interface.
          </p>
          <p className="text-gray-300">
            Whether you're looking for the latest blockbusters or timeless classics,
            MovieVerse is your go-to platform for all things cinema.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
          <div className="space-y-4">
            <div className="bg-dark-gray p-5 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Extensive Movie Library</h3>
              <p className="text-gray-300">
                Browse through a vast collection of movies, from the latest releases to
                beloved classics, all in one place.
              </p>
            </div>

            <div className="bg-dark-gray p-5 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Easy Ticket Booking</h3>
              <p className="text-gray-300">
                Book your tickets with ease. Select your preferred showtime, choose your
                seats, and complete your purchase seamlessly.
              </p>
            </div>

            <div className="bg-dark-gray p-5 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Smart Search</h3>
              <p className="text-gray-300">
                Find your favorite movies quickly with our powerful search functionality.
                Search by title, genre, or browse trending content.
              </p>
            </div>

            <div className="bg-dark-gray p-5 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-2">Reviews & Ratings</h3>
              <p className="text-gray-300">
                Read reviews and ratings from other movie enthusiasts to help you decide
                your next cinematic adventure.
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <div className="bg-dark-gray p-6 rounded-lg">
            <p className="text-gray-300 mb-4">
              At MovieVerse, our mission is to revolutionize the way people experience
              movies. We strive to make cinema accessible, enjoyable, and convenient for
              everyone.
            </p>
            <p className="text-gray-300">
              We believe that everyone deserves an exceptional movie-going experience.
              That's why we've built MovieVerse with you in mind - providing a seamless,
              user-friendly platform that makes discovering and booking movies effortless.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
          <div className="bg-dark-gray p-6 rounded-lg">
            <p className="text-gray-300">
              We envision a future where movie discovery and booking is effortless,
              personalized, and enjoyable for everyone. MovieVerse aims to become the
              leading platform for movie enthusiasts worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

