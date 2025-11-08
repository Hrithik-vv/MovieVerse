import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      className="bg-dark-gray rounded-lg overflow-hidden shadow-lg cursor-pointer"
    >
      <Link to={`/movies/${movie._id || movie.id}`}>
        <div className="relative">
          <img
            src={movie.poster || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded">
            {movie.rating ? movie.rating.toFixed(1) : 'N/A'} ⭐
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 truncate">{movie.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {movie.description || movie.overview}
          </p>
          {movie.genre && (
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.genre.slice(0, 2).map((g, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;

