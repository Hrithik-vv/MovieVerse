const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  addShow,
  updateShow,
  deleteShow,
} = require('../controllers/theatreController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, admin, createTheatre);
router.put('/:id', protect, admin, updateTheatre);
router.delete('/:id', protect, admin, deleteTheatre);
router.post('/:id/shows', protect, admin, addShow);
router.put('/:id/shows/:showId', protect, admin, updateShow);
router.delete('/:id/shows/:showId', protect, admin, deleteShow);

module.exports = router;

