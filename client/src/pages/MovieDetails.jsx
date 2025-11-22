import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    fetchTheatres();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/movies/${id}`);
      setMovie(res.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/movie/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchTheatres = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/theatres`);
      const theatresWithShows = res.data.filter((theatre) =>
        theatre.shows.some((show) => show.movieId.toString() === id)
      );
      setTheatres(theatresWithShows);
    } catch (error) {
      console.error('Error fetching theatres:', error);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/reviews`, {
        movieId: id,
        comment: reviewText,
        rating: reviewRating,
      });
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchReviews();
      fetchMovieDetails();
      toast.success('Review added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`);
      fetchReviews();
      fetchMovieDetails();
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!movie) {
    return <div className="container mx-auto px-4 py-8">Movie not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section with Movie Info */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95)), url(${movie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Movie Poster - Reduced Size */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center md:justify-start"
            >
              <div className="relative group">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-64 h-96 object-cover rounded-xl shadow-2xl border-2 border-yellow-400/30 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>

            {/* Movie Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-2"
            >
              <h1
                className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center glass px-4 py-2 rounded-full border border-yellow-400/30">
                  <span className="text-2xl text-yellow-400 font-bold">
                    {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="ml-2 text-yellow-400">★</span>
                </div>
                <span className="glass px-4 py-2 rounded-full text-gray-300 border border-yellow-400/20">
                  {new Date(movie.releaseDate).getFullYear()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-semibold text-sm"
                  >
                    {g}
                  </motion.span>
                ))}
              </div>

              <p className="text-gray-300 text-lg mb-6 leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
                {movie.description}
              </p>

              {movie.trailerURL && (
                <motion.a
                  href={movie.trailerURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-classic inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Watch Trailer
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        {/* Book Tickets Section */}
        {theatres.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2
              className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Book Tickets
            </h2>
            <div className="space-y-6">
              {theatres.map((theatre) => (
                <motion.div
                  key={theatre._id}
                  whileHover={{ y: -4 }}
                  className="glass rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-300 shadow-lg"
                >
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {theatre.name}
                    <span className="text-gray-400 text-lg ml-2">• {theatre.location}</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {theatre.shows
                      .filter((show) => {
                        if (!show.movieId) return false;
                        if (typeof show.movieId === 'object') {
                          return show.movieId._id?.toString() === id;
                        }
                        return show.movieId.toString() === id;
                      })
                      .map((show) => (
                        <motion.button
                          key={show._id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!user) {
                              navigate('/login');
                            } else {
                              navigate(`/book/${id}/${theatre._id}/${show._id}`);
                            }
                          }}
                          className="glass px-4 py-3 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10 text-white transition-all font-semibold"
                        >
                          {new Date(show.showtime).toLocaleString()}
                        </motion.button>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Reviews
            </h2>
            {user && (
              <motion.button
                onClick={() => setShowReviewForm(!showReviewForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={showReviewForm ? 'glass px-6 py-3 rounded-full border border-yellow-400/30 text-white transition-all font-semibold' : 'btn-classic'}
              >
                {showReviewForm ? 'Cancel' : '+ Add Review'}
              </motion.button>
            )}
          </div>

          {showReviewForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddReview}
              className="glass rounded-xl p-6 border border-yellow-400/20 mb-8"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-yellow-400 font-semibold">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg glass border border-yellow-400/20 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {'⭐'.repeat(r)} ({r} Star{r > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-yellow-400 font-semibold">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows="4"
                    placeholder="Share your thoughts about this movie..."
                    className="w-full px-4 py-3 rounded-lg glass border border-yellow-400/20 text-white focus:outline-none focus:border-yellow-400 transition-colors placeholder-gray-500"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-classic mt-4"
              >
                Submit Review
              </motion.button>
            </motion.form>
          )}

          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{review.userId.name}</h4>
                    <div className="text-yellow-400 text-xl">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  {user && user._id === review.userId._id && (
                    <motion.button
                      onClick={() => handleDeleteReview(review._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-400 hover:text-red-300 font-semibold px-4 py-2 rounded-lg border border-red-400/30 hover:bg-red-400/10 transition-all"
                    >
                      Delete
                    </motion.button>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass rounded-xl border border-yellow-400/10"
              >
                <p className="text-gray-400 text-lg">No reviews yet. Be the first to review this movie!</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MovieDetails;

