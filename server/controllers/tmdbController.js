const axios = require('axios');
const Movie = require('../models/Movie');

// @desc    Fetch trending movies from TMDb
// @route   GET /api/tmdb/trending
// @access  Public
const getTrendingMovies = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search movies from TMDb
// @route   GET /api/tmdb/search
// @access  Public
const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movie details from TMDb
// @route   GET /api/tmdb/movie/:id
// @access  Public
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import movie from TMDb to database
// @route   POST /api/tmdb/import
// @access  Private/Admin
const importMovie = async (req, res) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) {
      return res.status(400).json({ message: 'Please provide TMDb ID' });
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ tmdbId });
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie already exists in database' });
    }

    // Fetch movie details from TMDb
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos`
    );
    const tmdbMovie = response.data;

    // Extract trailer URL
    let trailerURL = '';
    if (tmdbMovie.videos && tmdbMovie.videos.results) {
      const trailer = tmdbMovie.videos.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        trailerURL = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }

    // Create movie in database
    const movie = await Movie.create({
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      genre: tmdbMovie.genres.map((g) => g.name),
      poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
      rating: tmdbMovie.vote_average / 2, // Convert 10 scale to 5 scale
      cast: [], // Can be fetched separately if needed
      releaseDate: tmdbMovie.release_date,
      trailerURL,
      tmdbId: tmdbMovie.id,
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  importMovie,
};

