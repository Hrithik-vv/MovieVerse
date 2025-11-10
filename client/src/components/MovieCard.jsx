import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative rounded-xl overflow-hidden bg-dark-gray shadow-lg cursor-pointer"
    >
      <Link to={`/movies/${movie._id || movie.id}`}>
        <div className="relative">
          <img
            src={movie.poster || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-xl font-semibold">{movie.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-2">
              {movie.description || movie.overview}
            </p>
          </div>
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded">
            {movie.rating ? movie.rating.toFixed(1) : 'N/A'} ⭐
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;

