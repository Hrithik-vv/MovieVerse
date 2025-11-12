import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: '',
    poster: '',
    releaseDate: '',
    trailerURL: '',
  });

  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    location: '',
    screens: '',
  });

  const [activeShowsTheatreId, setActiveShowsTheatreId] = useState(null);
  const [showForm, setShowForm] = useState({
    movieId: '',
    showtime: '',
    screen: '',
    price: ''
  });

  React.useEffect(() => {
    if (activeTab === 'movies' || activeTab === 'theatres') fetchMovies();
    if (activeTab === 'theatres') fetchTheatres();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/movies`);
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/theatres`);
      setTheatres(res.data);
    } catch (error) {
      console.error('Error fetching theatres:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/bookings`);
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/movies/${id}`);
      fetchMovies();
    } catch (error) {
      alert('Error deleting movie');
    }
  };

  const openAddMovie = () => {
    setEditingMovie(null);
    setMovieForm({ title: '', description: '', genre: '', poster: '', releaseDate: '', trailerURL: '' });
    setShowMovieModal(true);
  };

  const openEditMovie = (m) => {
    setEditingMovie(m);
    setMovieForm({
      title: m.title || '',
      description: m.description || '',
      genre: (m.genre || []).join(', '),
      poster: m.poster || '',
      releaseDate: m.releaseDate ? m.releaseDate.substring(0,10) : '',
      trailerURL: m.trailerURL || ''
    });
    setShowMovieModal(true);
  };

  const submitMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: movieForm.title,
        description: movieForm.description,
        genre: movieForm.genre.split(',').map(g => g.trim()).filter(Boolean),
        poster: movieForm.poster,
        releaseDate: movieForm.releaseDate,
        trailerURL: movieForm.trailerURL,
      };
      if (editingMovie) {
        await axios.put(`${API_URL}/api/movies/${editingMovie._id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/movies`, payload);
      }
      setShowMovieModal(false);
      fetchMovies();
    } catch (error) {
      alert('Error saving movie');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/theatres/${id}`);
      fetchTheatres();
    } catch (error) {
      alert('Error deleting theatre');
    }
  };

  const openAddTheatre = () => {
    setEditingTheatre(null);
    setTheatreForm({ name: '', location: '', screens: '' });
    setShowTheatreModal(true);
  };

  const openEditTheatre = (t) => {
    setEditingTheatre(t);
    setTheatreForm({
      name: t.name || '',
      location: t.location || '',
      screens: (t.screens || []).join(', ')
    });
    setShowTheatreModal(true);
  };

  const submitTheatre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: theatreForm.name,
        location: theatreForm.location,
        screens: theatreForm.screens.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editingTheatre) {
        await axios.put(`${API_URL}/api/theatres/${editingTheatre._id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/theatres`, payload);
      }
      setShowTheatreModal(false);
      fetchTheatres();
    } catch (error) {
      alert('Error saving theatre');
    }
  };

  const addShow = async (theatreId) => {
    try {
      if (!showForm.movieId || !showForm.showtime || !showForm.screen || !showForm.price) {
        alert('Fill all show fields');
        return;
      }
      const payload = {
        movieId: showForm.movieId,
        showtime: new Date(showForm.showtime),
        screen: showForm.screen,
        price: Number(showForm.price)
      };
      await axios.post(`${API_URL}/api/theatres/${theatreId}/shows`, payload);
      setShowForm({ movieId: '', showtime: '', screen: '', price: '' });
      fetchTheatres();
    } catch (error) {
      alert('Error adding show');
    }
  };

  const getMovieTitle = (movie) => {
    if (!movie) return 'Unknown Movie';
    if (typeof movie === 'object') {
      return movie.title || 'Unknown Movie';
    }
    const found = movies.find((m) => m._id === movie);
    return found ? found.title : movie;
  };

  const updateShow = async (theatreId, show) => {
    try {
      const payload = {
        movieId: show.movieId?._id || show.movieId,
        showtime: show.showtime,
        screen: show.screen,
        price: show.price
      };
      await axios.put(`${API_URL}/api/theatres/${theatreId}/shows/${show._id}`, payload);
      fetchTheatres();
    } catch (error) {
      alert('Error updating show');
    }
  };

  const deleteShow = async (theatreId, showId) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await axios.delete(`${API_URL}/api/theatres/${theatreId}/shows/${showId}`);
      fetchTheatres();
    } catch (error) {
      alert('Error deleting show');
    }
  };

  const handleBlockUser = async (id) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}/block`);
      fetchUsers();
    } catch (error) {
      alert('Error blocking user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const tabs = ['movies', 'theatres', 'users', 'bookings'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'movies' && (
            <div className="space-y-4">
              <button
                onClick={openAddMovie}
                className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded mb-4"
              >
                Add Movie
              </button>
              {movies.map((movie) => (
                <div key={movie._id} className="bg-dark-gray p-4 rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">{movie.genre.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditMovie(movie)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'theatres' && (
            <div className="space-y-4">
              <button
                onClick={openAddTheatre}
                className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded mb-4"
              >
                Add Theatre
              </button>
              {theatres.map((theatre) => (
                <div key={theatre._id} className="bg-dark-gray p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{theatre.name}</h3>
                      <p className="text-gray-400 text-sm">{theatre.location}</p>
                      <p className="text-gray-500 text-xs">Screens: {(theatre.screens || []).join(', ')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditTheatre(theatre)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTheatre(theatre._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Shows Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveShowsTheatreId(activeShowsTheatreId === theatre._id ? null : theatre._id)}
                      className="text-primary hover:underline"
                    >
                      {activeShowsTheatreId === theatre._id ? 'Hide Shows' : 'Manage Shows'}
                    </button>

                    {activeShowsTheatreId === theatre._id && (
                      <div className="mt-4 space-y-3">
                        {(theatre.shows || []).map((show) => (
                          <div key={show._id} className="bg-black/20 p-3 rounded flex justify-between items-center">
                            <div className="text-sm text-gray-300">
                              <p className="font-semibold">{getMovieTitle(show.movieId)}</p>
                              <p>
                                {new Date(show.showtime).toLocaleString()} — Screen: {show.screen} — ₹{show.price}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateShow(theatre._id, show)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => deleteShow(theatre._id, show._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Show Form */}
                        <div className="bg-black/20 p-4 rounded">
                          <h4 className="font-semibold mb-2">Add Show</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              value={showForm.movieId}
                              onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                              className="px-3 py-2 rounded bg-dark text-white"
                            >
                              <option value="" disabled>
                                Select Movie
                              </option>
                              {movies.map((movie) => (
                                <option key={movie._id} value={movie._id}>
                                  {movie.title}
                                </option>
                              ))}
                            </select>
                            <input
                              type="datetime-local"
                              value={showForm.showtime}
                              onChange={(e) => setShowForm({ ...showForm, showtime: e.target.value })}
                              className="px-3 py-2 rounded bg-dark text-white"
                            />
                            <input
                              placeholder="Screen"
                              value={showForm.screen}
                              onChange={(e) => setShowForm({ ...showForm, screen: e.target.value })}
                              className="px-3 py-2 rounded bg-dark text-white"
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={showForm.price}
                              onChange={(e) => setShowForm({ ...showForm, price: e.target.value })}
                              className="px-3 py-2 rounded bg-dark text-white"
                            />
                          </div>
                          <button
                            onClick={() => addShow(theatre._id)}
                            className="mt-3 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded"
                          >
                            Add Show
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full bg-dark-gray rounded">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.role}</td>
                      <td className="p-4">
                        <span className={user.blocked ? 'text-red-400' : 'text-green-400'}>
                          {user.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBlockUser(user._id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {user.blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-dark-gray p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.movieId.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {booking.userId.name} - {booking.theatreId.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(booking.showtime).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">₹{booking.totalPrice}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded ${
                        booking.paymentStatus === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-gray p-6 rounded w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">{editingMovie ? 'Edit Movie' : 'Add Movie'}</h3>
            <form onSubmit={submitMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Title"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white"
                required
              />
              <input
                placeholder="Genres (comma-separated)"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white"
              />
              <input
                placeholder="Poster URL"
                value={movieForm.poster}
                onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white"
              />
              <input
                type="date"
                value={movieForm.releaseDate}
                onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white"
              />
              <input
                placeholder="Trailer URL (optional)"
                value={movieForm.trailerURL}
                onChange={(e) => setMovieForm({ ...movieForm, trailerURL: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white md:col-span-2"
              />
              <textarea
                placeholder="Description"
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                className="px-3 py-2 rounded bg-dark text-white md:col-span-2"
                rows={4}
                required
              />
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMovieModal(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary hover:bg-red-700 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theatre Modal */}
      {showTheatreModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-gray p-6 rounded w-full max-w-xl">
            <h3 className="text-xl font-semibold mb-4">{editingTheatre ? 'Edit Theatre' : 'Add Theatre'}</h3>
            <form onSubmit={submitTheatre} className="space-y-3">
              <input
                placeholder="Name"
                value={theatreForm.name}
                onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded bg-dark text-white"
                required
              />
              <input
                placeholder="Location"
                value={theatreForm.location}
                onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded bg-dark text-white"
                required
              />
              <input
                placeholder="Screens (comma-separated)"
                value={theatreForm.screens}
                onChange={(e) => setTheatreForm({ ...theatreForm, screens: e.target.value })}
                className="w-full px-3 py-2 rounded bg-dark text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowTheatreModal(false)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary hover:bg-red-700 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

