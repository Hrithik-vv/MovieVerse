import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, availableShows = [], onBook }) => {
  const isBookable = availableShows.length > 0;
  const movieLink = `/movies/${movie._id || movie.id}`;

  const handleBookClick = () => {
    if (!isBookable) return;
    if (onBook) {
      onBook(movie, availableShows);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative rounded-xl overflow-hidden bg-dark-gray shadow-lg"
    >
      <Link to={movieLink} className="block cursor-pointer">
        <div className="relative">
          <img
            src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
            alt={movie.title}
            className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-xl font-semibold">{movie.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-2">
              {movie.description || 'No description available.'}
            </p>
          </div>
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded">
            {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
          </div>
        </div>
      </Link>
      <div className="p-4 border-t border-dark">
        {isBookable ? (
          onBook ? (
            <button
              onClick={handleBookClick}
              className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors w-full"
            >
              Book Tickets
            </button>
          ) : (
            <Link
              to={movieLink}
              className="inline-block bg-primary hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Book Tickets
            </Link>
          )
        ) : (
          <span className="text-sm text-gray-400">Coming soon</span>
        )}
      </div>
    </motion.div>
  );
};

export default MovieCard;

