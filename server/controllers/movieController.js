const Movie = require('../models/Movie');
const Review = require('../models/Review');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre, rating } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      // Get average rating from reviews
      const reviews = await Review.find({ movieId: movie._id });
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        movie.rating = parseFloat(avgRating.toFixed(1));
        await movie.save();
      }
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      Object.assign(movie, req.body);
      await movie.save();
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      await movie.deleteOne();
      res.json({ message: 'Movie deleted successfully' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};

