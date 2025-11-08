const Theatre = require('../models/Theatre');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({}).populate('shows.movieId', 'title poster');
    res.json(theatres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('shows.movieId', 'title poster');
    if (theatre) {
      res.json(theatre);
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (theatre) {
      Object.assign(theatre, req.body);
      await theatre.save();
      res.json(theatre);
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (theatre) {
      await theatre.deleteOne();
      res.json({ message: 'Theatre deleted successfully' });
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add show to theatre
// @route   POST /api/theatres/:id/shows
// @access  Private/Admin
const addShow = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (theatre) {
      theatre.shows.push(req.body);
      await theatre.save();
      res.status(201).json(theatre);
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update show in theatre
// @route   PUT /api/theatres/:id/shows/:showId
// @access  Private/Admin
const updateShow = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (theatre) {
      const show = theatre.shows.id(req.params.showId);
      if (show) {
        Object.assign(show, req.body);
        await theatre.save();
        res.json(theatre);
      } else {
        res.status(404).json({ message: 'Show not found' });
      }
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete show from theatre
// @route   DELETE /api/theatres/:id/shows/:showId
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (theatre) {
      theatre.shows.id(req.params.showId).deleteOne();
      await theatre.save();
      res.json({ message: 'Show deleted successfully' });
    } else {
      res.status(404).json({ message: 'Theatre not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  addShow,
  updateShow,
  deleteShow,
};

