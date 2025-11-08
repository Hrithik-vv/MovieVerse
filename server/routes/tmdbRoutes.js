const express = require('express');
const router = express.Router();
const {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  importMovie,
} = require('../controllers/tmdbController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/trending', getTrendingMovies);
router.get('/search', searchMovies);
router.get('/movie/:id', getMovieDetails);
router.post('/import', protect, admin, importMovie);

module.exports = router;

