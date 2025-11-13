export const mapShowsByMovie = (theatres) => {
  const now = Date.now();

  return (theatres || []).reduce((acc, theatre) => {
    (theatre.shows || []).forEach((show) => {
      const movieRef = show.movieId;
      const movieId =
        typeof movieRef === 'object' && movieRef !== null ? movieRef._id : movieRef;
      if (!movieId) return;

      const showtimeMs = new Date(show.showtime).getTime();
      if (Number.isNaN(showtimeMs) || showtimeMs < now) return;

      if (!acc[movieId]) acc[movieId] = [];
      acc[movieId].push({
        theatreId: theatre._id,
        theatreName: theatre.name,
        theatreLocation: theatre.location,
        showId: show._id,
        showtime: show.showtime,
        price: show.price,
      });
    });
    return acc;
  }, {});
};

export const pickNextShow = (shows = []) => {
  if (!Array.isArray(shows) || shows.length === 0) {
    return null;
  }

  const sortedShows = [...shows].sort(
    (a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime()
  );

  return sortedShows[0] || null;
};

