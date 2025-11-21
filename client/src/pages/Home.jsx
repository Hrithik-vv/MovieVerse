import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import AuthContext from '../context/AuthContext';
import { mapShowsByMovie, pickNextShow } from '../utils/showHelpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [dbMovies, setDbMovies] = useState([]);
  const [availableMovies, setAvailableMovies] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Home - MovieVerse';
  }, []);

  useEffect(() => {
    fetchMovies();
  }, []);

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

  const fetchMovies = async () => {
    try {
      const [trendingRes, dbRes, theatresRes] = await Promise.all([
        axios.get(`${API_URL}/api/tmdb/trending`),
        axios.get(`${API_URL}/api/movies`),
        axios.get(`${API_URL}/api/theatres`),
      ]);
      setTrendingMovies(trendingRes.data.slice(0, 10));
      setDbMovies(dbRes.data);

      const availability = mapShowsByMovie(theatresRes.data);
      setAvailabilityMap(availability);

      const moviesWithShows = dbRes.data.filter(
        (movie) => availability[movie._id]?.length
      );
      setAvailableMovies(moviesWithShows);
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

  const displayMovies =
    availableMovies.length > 0
      ? availableMovies
      : dbMovies.length > 0
      ? dbMovies
      : trendingMovies;

  // Get newest 3 admin-added movies (sorted by createdAt desc already)
  const newlyAddedMovies = dbMovies.slice(0, 3);

  // Prefer admin-provided banners if available, fallback to TMDB backdrops
  const [adminBanners, setAdminBanners] = useState([]);
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/banners/active`);
        console.log('Loaded banners:', res.data);
        setAdminBanners(res.data || []);
      } catch (e) {
        console.error('Error loading banners:', e);
        setAdminBanners([]);
      }
    };
    loadBanners();
  }, []);

  // Get banner data or just image URLs
  const bannerData = adminBanners.length > 0
    ? adminBanners.map((b) => ({
        imageUrl: `${API_URL}${b.imageUrl}`,
        title: b.title,
        subtitle: b.subtitle,
      }))
    : (trendingMovies || [])
        .filter((m) => m.backdrop_path)
        .map((m) => ({
          imageUrl: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          title: null,
          subtitle: null,
        }))
        .slice(0, 5);

  const slideshowImages = bannerData.map((b) => b.imageUrl);

  // Reset slide when images change
  useEffect(() => {
    setCurrentSlide(0);
  }, [slideshowImages.length]);

  // Auto-rotate slideshow if more than 1 image
  useEffect(() => {
    if (slideshowImages.length < 2) return;
    const id = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slideshowImages.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slideshowImages.length]);

  return (
    <div>
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
            Discover Your Next Favorite Movie
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

      {/* Hero Section */}
      <section className="relative min-h-[520px] flex items-center bg-black overflow-hidden">
        {slideshowImages.length > 0 ? (
          slideshowImages.map((src, i) => (
            <motion.img
              key={`${src}-${i}`}
              src={src}
              alt="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: currentSlide === i ? 0.65 : 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                console.error('Failed to load banner image:', src);
                e.target.style.display = 'none';
              }}
            />
          ))
        ) : (
          <img
            src="/img/hero.jpg"
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            onError={(e) => {
              e.currentTarget.src =
                '/img/ChatGPT Image Nov 5, 2025, 11_37_11 AM.png';
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          {bannerData.length > 0 && bannerData[currentSlide] ? (
            <>
              {bannerData[currentSlide].title && (
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`title-${currentSlide}`}
                  className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white"
                >
                  {bannerData[currentSlide].title}
                </motion.h1>
              )}
              {bannerData[currentSlide].subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  key={`subtitle-${currentSlide}`}
                  className="text-lg md:text-xl text-gray-300 mb-8"
                >
                  {bannerData[currentSlide].subtitle}
                </motion.p>
              )}
            </>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4"
              >
                THE SEVENTH DAY
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 mb-8"
              >
                Written and Directed by Aleesha Rose / Ireland 2023
              </motion.p>
            </>
          )}
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

      {/* Newly Added Movies Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary via-red-500 to-primary bg-clip-text text-transparent"
          >
            Recommended
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto max-w-md"
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : newlyAddedMovies.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {newlyAddedMovies.map((movie, index) => {
              const shows = availabilityMap[movie._id] || [];
              return (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-dark-gray shadow-2xl border border-gray-800 hover:border-primary transition-all duration-300">
                    <Link
                      to={`/movies/${movie._id}`}
                      className="block cursor-pointer"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
                          alt={movie.title}
                          className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute inset-x-0 bottom-0 p-6"
                        >
                          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                            {movie.title}
                          </h3>
                          <p className="text-gray-200 text-sm line-clamp-2 drop-shadow-md">
                            {movie.description || 'No description available.'}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                            </span>
                            {movie.genre && movie.genre.length > 0 && (
                              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                                {movie.genre[0]}
                              </span>
                            )}
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileHover={{ scale: 1, rotate: 0 }}
                          className="absolute top-4 right-4 bg-primary text-white p-3 rounded-full shadow-xl"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </Link>
                    <div className="p-6 bg-dark-gray/50 backdrop-blur-sm">
                      {shows.length > 0 ? (
                        <button
                          onClick={() => handleBookTickets(movie, shows)}
                          className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Book Tickets Now
                        </button>
                      ) : (
                        <Link
                          to={`/movies/${movie._id}`}
                          className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 text-center"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-xl">
              No newly added movies yet. Check back soon!
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;

