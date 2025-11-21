import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import AuthContext from '../context/AuthContext';
import { mapShowsByMovie, pickNextShow } from '../utils/showHelpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    <div className="min-h-screen bg-dark">
      {/* Page Title Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-primary/20 via-dark-gray to-primary/20 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent"
          >
            Movies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
          >
            Your Ultimate Destination for Movie Entertainment
          </motion.p>
        </div>
      </motion.section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
      <div className="bg-dark-gray p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label className="block text-sm font-medium mb-2">Min Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              availableShows={availabilityMap[movie._id] || []}
              onBook={handleBookTickets}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl">No movies found</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Movies;

