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
  const [currentSlide, setCurrentSlide] = useState(0);

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

      {/* Movies Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-10">
          Movie Now Playing
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

