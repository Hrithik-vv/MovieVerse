const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { movieId, comment, rating } = req.body;

    if (!movieId || !comment || !rating) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const review = await Review.create({
      movieId,
      userId: req.user._id,
      comment,
      rating,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email');

    // Update movie rating
    const reviews = await Review.find({ movieId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Movie.findByIdAndUpdate(movieId, { rating: parseFloat(avgRating.toFixed(1)) });

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.comment = req.body.comment || review.comment;
    review.rating = req.body.rating || review.rating;
    await review.save();

    // Update movie rating
    const reviews = await Review.find({ movieId: review.movieId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Movie.findByIdAndUpdate(review.movieId, { rating: parseFloat(avgRating.toFixed(1)) });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email');

    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const movieId = review.movieId;
    await review.deleteOne();

    // Update movie rating
    const reviews = await Review.find({ movieId });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Movie.findByIdAndUpdate(movieId, { rating: parseFloat(avgRating.toFixed(1)) });
    } else {
      await Movie.findByIdAndUpdate(movieId, { rating: 0 });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMovieReviews,
  addReview,
  updateReview,
  deleteReview,
};

