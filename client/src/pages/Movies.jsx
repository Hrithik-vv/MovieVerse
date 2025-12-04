import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import AuthContext from '../context/AuthContext';
import { mapShowsByMovie, pickNextShow } from '../utils/showHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [availabilityMap, setAvailabilityMap] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Movies - MovieVerse';
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [search, genre, rating]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/theatres`);
        setAvailabilityMap(mapShowsByMovie(res.data));
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };
    fetchAvailability();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (rating) params.append('rating', rating);

      const res = await axios.get(`${API_URL}/api/movies?${params}`);
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTickets = (movie, shows = []) => {
    if (!movie) return;
    if (!movie._id || shows.length === 0) {
      navigate(`/movies/${movie._id || movie.id}`);
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    const targetShow = pickNextShow(shows);
    if (!targetShow) {
      navigate(`/movies/${movie._id}`);
      return;
    }
    navigate(`/book/${movie._id}/${targetShow.theatreId}/${targetShow.showId}`);
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Browse Movies
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Discover your next cinematic adventure
          </motion.p>
        </div>
      </motion.section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 mb-12 border border-yellow-400/20"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif' }}>
            Filter Movies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:outline-none focus:border-yellow-400 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:outline-none focus:border-yellow-400 transition-all duration-300"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Min Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:outline-none focus:border-yellow-400 transition-all duration-300"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
            </div>
          </div>
        ) : movies.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            <AnimatePresence>
              {movies.map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MovieCard
                    movie={movie}
                    availableShows={availabilityMap[movie._id] || []}
                    onBook={handleBookTickets}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-yellow-400/10 flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </motion.div>
              <p className="text-gray-400 text-2xl font-light mb-8">
                No movies found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setGenre('');
                  setRating('');
                }}
                className="btn-classic"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Movies;
