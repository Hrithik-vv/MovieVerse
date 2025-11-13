import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

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
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`);
      fetchReviews();
      fetchMovieDetails();
    } catch (error) {
      alert('Error deleting review');
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.img
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          src={movie.poster}
          alt={movie.title}
          className="w-full rounded-lg"
        />
        <div>
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl text-primary">
              {movie.rating ? movie.rating.toFixed(1) : 'N/A'} ⭐
            </span>
            <span className="text-gray-400">
              {new Date(movie.releaseDate).getFullYear()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genre.map((g, idx) => (
              <span
                key={idx}
                className="bg-primary/20 text-primary px-3 py-1 rounded"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="text-gray-300 mb-6">{movie.description}</p>
          {movie.trailerURL && (
            <a
              href={movie.trailerURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
            >
              Watch Trailer
            </a>
          )}
        </div>
      </div>

      {/* Book Now Section */}
      {theatres.length > 0 && (
        <section className="bg-dark-gray p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Book Tickets</h2>
          {theatres.map((theatre) => (
            <div key={theatre._id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {theatre.name} - {theatre.location}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {theatre.shows
                  .filter((show) => {
                    if (!show.movieId) return false;
                    if (typeof show.movieId === 'object') {
                      return show.movieId._id?.toString() === id;
                    }
                    return show.movieId.toString() === id;
                  })
                  .map((show) => (
                    <button
                      key={show._id}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          navigate(
                            `/book/${id}/${theatre._id}/${show._id}`
                          );
                        }
                      }}
                      className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      {new Date(show.showtime).toLocaleString()}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Reviews Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              {showReviewForm ? 'Cancel' : 'Add Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleAddReview} className="bg-dark-gray p-6 rounded-lg mb-6">
            <div className="mb-4">
              <label className="block mb-2">Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full px-4 py-2 rounded bg-dark text-white"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Comment</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                rows="4"
                className="w-full px-4 py-2 rounded bg-dark text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-dark-gray p-6 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{review.userId.name}</h4>
                  <div className="text-primary">
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
                {user && user._id === review.userId._id && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-300">{review.comment}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-gray-400 text-center py-8">No reviews yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;

