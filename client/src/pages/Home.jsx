import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { mapShowsByMovie, pickNextShow } from '../utils/showHelpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Home = () => {
  const [dbMovies, setDbMovies] = useState([]);
  const [availableMovies, setAvailableMovies] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adminBanners, setAdminBanners] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Set page title
  useEffect(() => {
    document.title = 'Home - MovieVerse';
  }, []);

  // Fetch movies, availability, and set state
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [dbRes, theatresRes] = await Promise.all([
          axios.get(`${API_URL}/api/movies`),
          axios.get(`${API_URL}/api/theatres`),
        ]);
        setDbMovies(dbRes.data);
        const availability = mapShowsByMovie(theatresRes.data);
        setAvailabilityMap(availability);
        const moviesWithShows = dbRes.data.filter(movie => availability[movie._id]?.length);
        setAvailableMovies(moviesWithShows);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Load active banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/banners/active`);
        setAdminBanners(res.data || []);
      } catch (e) {
        console.error('Error loading banners:', e);
        setAdminBanners([]);
      }
    };
    loadBanners();
  }, []);

  // Determine movies to display
  const displayMovies =
    availableMovies.length > 0
      ? availableMovies
      : dbMovies;

  // Prepare banner data
  const bannerData = adminBanners.map(b => ({
    imageUrl: `${API_URL}${b.imageUrl}`,
    title: b.title,
    subtitle: b.subtitle,
  }));

  const slideshowImages = bannerData.map(b => b.imageUrl);

  // Reset slide when images change
  useEffect(() => {
    setCurrentSlide(0);
  }, [slideshowImages.length]);

  // Auto‑rotate slideshow (banner)
  useEffect(() => {
    if (slideshowImages.length < 2) return;
    const id = setInterval(() => {
      setCurrentSlide(s => (s + 1) % slideshowImages.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slideshowImages.length]);

  // Auto-scroll movie slider
  useEffect(() => {
    if (displayMovies.length <= 3) return;
    const id = setInterval(() => {
      setSliderIndex(prev => (prev + 1) % Math.max(1, displayMovies.length - 2));
    }, 5000);
    return () => clearInterval(id);
  }, [displayMovies.length]);

  // Book tickets helper
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

  // Slider navigation
  const handleSliderPrev = () => {
    setSliderIndex(prev => Math.max(0, prev - 1));
  };

  const handleSliderNext = () => {
    setSliderIndex(prev => Math.min(displayMovies.length - 3, prev + 1));
  };

  const canSliderGoPrev = sliderIndex > 0;
  const canSliderGoNext = sliderIndex < displayMovies.length - 3;

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section */}
      <section className="relative min-h-[600px] flex items-center bg-black overflow-hidden">
        <AnimatePresence mode="wait">
          {slideshowImages.length > 0 ? (
            slideshowImages.map((src, i) => (
              currentSlide === i && (
                <motion.img
                  key={`${src}-${i}`}
                  src={src}
                  alt="hero"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={e => { console.error('Failed to load banner image:', src); e.target.style.display = 'none'; }}
                />
              )
            ))
          ) : (
            <img
              src="/img/hero.jpg"
              alt="hero"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              onError={e => { e.currentTarget.src = '/img/placeholder.png'; }}
            />
          )}
        </AnimatePresence>

        {/* Gradient overlays for classic look */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {bannerData.length > 0 && bannerData[currentSlide] ? (
            <>
              {bannerData[currentSlide].title && (
                <motion.h1
                  key={`title-${currentSlide}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-2xl"
                >
                  {bannerData[currentSlide].title}
                </motion.h1>
              )}
              {bannerData[currentSlide].subtitle && (
                <motion.p
                  key={`subtitle-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-200 mb-8 font-light tracking-wide"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {bannerData[currentSlide].subtitle}
                </motion.p>
              )}
            </>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-2xl"
              >
                MovieVerse
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-200 mb-8 font-light tracking-wide"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Where Classic Cinema Meets Modern Elegance
              </motion.p>
            </>
          )}

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto"
          />
        </div>

        {/* Banner navigation dots */}
        {slideshowImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {slideshowImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide
                    ? 'bg-yellow-400 w-8'
                    : 'bg-white/40 hover:bg-white/60'
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Movies Slider Section */}
      <section className="relative py-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
              Featured Movies
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-transparent" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
              </div>
            </div>
          ) : displayMovies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-2xl font-light">No movies available at the moment.</p>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Slider Container */}
              <div className="overflow-hidden">
                <motion.div
                  ref={sliderRef}
                  className="flex gap-8"
                  animate={{ x: `-${sliderIndex * (100 / 3)}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {displayMovies.map((movie, index) => {
                    const shows = availabilityMap[movie._id] || [];
                    return (
                      <motion.div
                        key={movie._id}
                        className="min-w-[calc(33.33%-1.33rem)] md:min-w-[calc(33.33%-1.33rem)]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl border border-yellow-400/20 hover:border-yellow-400/60 transition-all duration-500 transform hover:scale-105 hover:shadow-yellow-400/30">
                          <Link to={`/movies/${movie._id}`} className="block">
                            <div className="relative overflow-hidden aspect-[2/3]">
                              <img
                                src={movie.poster || 'https://via.placeholder.com/400x600?text=No+Image'}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={e => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Movie info overlay */}
                              <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-2xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
                                  {movie.title}
                                </h3>
                                <p className="text-gray-200 text-sm line-clamp-2 mb-3">
                                  {movie.description || 'No description available.'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="bg-yellow-400/90 text-black px-3 py-1 rounded-full text-sm font-semibold">
                                    ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                  </span>
                                  {movie.genre && movie.genre.length > 0 && (
                                    <span className="glass text-white px-3 py-1 rounded-full text-xs">
                                      {movie.genre[0]}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Play icon */}
                              <div className="absolute top-4 right-4 bg-yellow-400/90 text-black p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </Link>

                          <div className="p-6 bg-gradient-to-b from-gray-900 to-black">
                            {shows.length > 0 ? (
                              <button
                                onClick={() => handleBookTickets(movie, shows)}
                                className="btn-classic w-full"
                              >
                                Book Tickets
                              </button>
                            ) : (
                              <Link
                                to={`/movies/${movie._id}`}
                                className="block w-full glass text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 text-center hover:bg-white/10"
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
              </div>

              {/* Navigation Buttons */}
              {displayMovies.length > 3 && (
                <>
                  <button
                    onClick={handleSliderPrev}
                    disabled={!canSliderGoPrev}
                    className="slider-button prev"
                    aria-label="Previous movies"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSliderNext}
                    disabled={!canSliderGoNext}
                    className="slider-button next"
                    aria-label="Next movies"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
