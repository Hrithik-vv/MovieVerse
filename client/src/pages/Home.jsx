import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [dbMovies, setDbMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [trendingRes, dbRes] = await Promise.all([
        axios.get(`${API_URL}/api/tmdb/trending`),
        axios.get(`${API_URL}/api/movies`),
      ]);
      setTrendingMovies(trendingRes.data.slice(0, 10));
      setDbMovies(dbRes.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/api/tmdb/search?query=${searchQuery}`);
      setTrendingMovies(res.data);
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const displayMovies = dbMovies.length > 0 ? dbMovies : trendingMovies;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gradient-to-r from-dark to-dark-gray">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            Welcome to MovieVerse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            Discover, Review, and Book Your Favorite Movies
          </motion.p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
                className="flex-1 px-4 py-3 rounded-lg bg-dark-gray text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Movies Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">
          {dbMovies.length > 0 ? 'Featured Movies' : 'Trending Movies'}
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayMovies.map((movie) => (
              <MovieCard key={movie._id || movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

