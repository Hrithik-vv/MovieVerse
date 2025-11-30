import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [bookingsPage, setBookingsPage] = useState(1);
  const [moviesPage, setMoviesPage] = useState(1);
  const [theatresPage, setTheatresPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Movie/Theatre form states
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

  useEffect(() => {
    fetchMovies();
    fetchTheatres();
    fetchUsers();
    fetchBookings();
  }, []);

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
    try {
      const res = await axios.get(`${API_URL}/api/theatres`);
      setTheatres(res.data);
    } catch (error) {
      console.error('Error fetching theatres:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/bookings`);
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Analytics calculations
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingBookings = bookings.filter(b => b.paymentStatus === 'pending').length;
  const completedBookings = bookings.filter(b => b.paymentStatus === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.paymentStatus === 'cancelled').length;

  // Chart data
  const bookingStatusData = [
    { name: 'Completed', value: completedBookings, color: '#10b981' },
    { name: 'Pending', value: pendingBookings, color: '#eab308' },
    { name: 'Cancelled', value: cancelledBookings, color: '#ef4444' }
  ];

  // Revenue by movie (top 5)
  const revenueByMovie = movies.map(movie => {
    const movieBookings = bookings.filter(
      b => b.movieId?._id === movie._id && b.paymentStatus === 'completed'
    );
    const revenue = movieBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    return { name: movie.title, revenue };
  })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Recent bookings (last 10)
  const recentBookings = [...bookings].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 10);

  const tabs = [
    { id: 'overview', label: 'Analytics Overview' },
    { id: 'movies', label: 'Manage Movies' },
    { id: 'theatres', label: 'Manage Theaters' },
    { id: 'users', label: 'Manage Users' }
  ];

  // Movie CRUD operations
  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/movies/${id}`);
      fetchMovies();
      toast.success('Movie deleted successfully');
    } catch (error) {
      toast.error('Error deleting movie');
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
      releaseDate: m.releaseDate ? m.releaseDate.substring(0, 10) : '',
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
      toast.success(editingMovie ? 'Movie updated successfully' : 'Movie created successfully');
    } catch (error) {
      toast.error('Error saving movie');
    }
  };

  // Theatre CRUD operations (similar pattern - keeping existing logic)
  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/theatres/${id}`);
      fetchTheatres();
      toast.success('Theatre deleted successfully');
    } catch (error) {
      toast.error('Error deleting theatre');
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
      toast.success(editingTheatre ? 'Theatre updated successfully' : 'Theatre created successfully');
    } catch (error) {
      toast.error('Error saving theatre');
    }
  };

  const addShow = async (theatreId) => {
    try {
      if (!showForm.movieId || !showForm.showtime || !showForm.screen || !showForm.price) {
        toast.error('Please fill all show fields');
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
      toast.success('Show added successfully');
    } catch (error) {
      toast.error('Error adding show');
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

  const deleteShow = async (theatreId, showId) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await axios.delete(`${API_URL}/api/theatres/${theatreId}/shows/${showId}`);
      fetchTheatres();
      toast.success('Show deleted successfully');
    } catch (error) {
      toast.error('Error deleting show');
    }
  };

  const handleBlockUser = async (id) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}/block`);
      fetchUsers();
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Error blocking user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${id}`);
      fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  // Pagination Helper Component
  const Pagination = ({ currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full font-semibold transition-all ${currentPage === 1
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'glass border border-yellow-400/20 text-white hover:bg-yellow-400/10'
            }`}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`w-10 h-10 rounded-full font-semibold transition-all ${currentPage === pageNumber
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/30'
                  : 'glass border border-yellow-400/20 text-gray-300 hover:bg-yellow-400/10'
                  }`}
              >
                {pageNumber}
              </button>
            );
          } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
            return <span key={pageNumber} className="text-gray-600">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full font-semibold transition-all ${currentPage === totalPages
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'glass border border-yellow-400/20 text-white hover:bg-yellow-400/10'
            }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Pagination helpers
  const getPaginatedItems = (items, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Get paginated data
  const paginatedBookings = getPaginatedItems(recentBookings, bookingsPage);
  const paginatedMovies = getPaginatedItems(movies, moviesPage);
  const paginatedTheatres = getPaginatedItems(theatres, theatresPage);
  const paginatedUsers = getPaginatedItems(users, usersPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Admin Dashboard
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '200px' }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto"
          />
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-yellow-400/20 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && activeTab !== 'overview' ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 animate-spin" />
            </div>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB - Analytics Dashboard */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'from-green-500/20 to-emerald-500/20' },
                    { label: 'Total Bookings', value: bookings.length, color: 'from-blue-500/20 to-cyan-500/20' },
                    { label: 'Active Users', value: users.filter(u => !u.blocked).length, color: 'from-purple-500/20 to-pink-500/20' },
                    { label: 'Movies Listed', value: movies.length, color: 'from-yellow-500/20 to-orange-500/20' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass rounded-2xl p-6 border border-yellow-400/20 bg-gradient-to-br ${stat.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="text-5xl">{stat.icon}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Booking Status Pie Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-6 border border-yellow-400/20"
                  >
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Booking Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Top Movies by Revenue */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-6 border border-yellow-400/20"
                  >
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Top 5 Movies by Revenue
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByMovie}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc143c' }}
                          labelStyle={{ color: '#dc143c' }}
                        />
                        <Bar dataKey="revenue" fill="#dc143c" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Recent Bookings Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 border border-yellow-400/20"
                >
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Recent Bookings
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-yellow-400/20">
                          <th className="text-left p-3 text-gray-400">Movie</th>
                          <th className="text-left p-3 text-gray-400">User</th>
                          <th className="text-left p-3 text-gray-400">Theatre</th>
                          <th className="text-left p-3 text-gray-400">Amount</th>
                          <th className="text-left p-3 text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((booking) => (
                          <tr key={booking._id} className="border-b border-gray-800 hover:bg-white/5">
                            <td className="p-3 text-white">{booking.movieId?.title || 'N/A'}</td>
                            <td className="p-3 text-gray-300">{booking.userId?.name || 'N/A'}</td>
                            <td className="p-3 text-gray-300">{booking.theatreId?.name || 'N/A'}</td>
                            <td className="p-3 text-yellow-400 font-semibold">₹{booking.totalPrice}</td>
                            <td className="p-3">
                              <span className={`px-3 py-1 rounded-full text-xs ${booking.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                                booking.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                {booking.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={bookingsPage}
                    totalItems={recentBookings.length}
                    onPageChange={setBookingsPage}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* MOVIES TAB */}
            {activeTab === 'movies' && (
              <div className="space-y-4">
                <button
                  onClick={openAddMovie}
                  className="btn-classic"
                >
                  Add New Movie
                </button>
                {paginatedMovies.map((movie) => (
                  <div key={movie._id} className="glass rounded-xl p-6 border border-yellow-400/20 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                      <p className="text-gray-400 text-sm">{movie.genre.join(', ')}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditMovie(movie)}
                        className="px-6 py-2 rounded-full bg-yellow-600/20 border border-yellow-600/40 hover:bg-yellow-600 text-yellow-400 hover:text-white transition-all font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        className="px-6 py-2 rounded-full bg-red-600/20 border border-red-600/40 hover:bg-red-600 text-red-400 hover:text-white transition-all font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <Pagination
                  currentPage={moviesPage}
                  totalItems={movies.length}
                  onPageChange={setMoviesPage}
                />
              </div>
            )}

            {/* THEATRES TAB */}
            {activeTab === 'theatres' && (
              <div className="space-y-4">
                <button
                  onClick={openAddTheatre}
                  className="btn-classic"
                >
                  Add New Theatre
                </button>
                {paginatedTheatres.map((theatre) => (
                  <div key={theatre._id} className="glass rounded-xl p-6 border border-yellow-400/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{theatre.name}</h3>
                        <p className="text-gray-400 text-sm">{theatre.location}</p>
                        <p className="text-gray-500 text-xs">Screens: {(theatre.screens || []).join(', ')}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditTheatre(theatre)}
                          className="px-6 py-2 rounded-full bg-yellow-600/20 border border-yellow-600/40 hover:bg-yellow-600 text-yellow-400 hover:text-white transition-all font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTheatre(theatre._id)}
                          className="px-6 py-2 rounded-full bg-red-600/20 border border-red-600/40 hover:bg-red-600 text-red-400 hover:text-white transition-all font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Shows Section */}
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveShowsTheatreId(activeShowsTheatreId === theatre._id ? null : theatre._id)}
                        className="text-yellow-400 hover:underline"
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
                              <button
                                onClick={() => deleteShow(theatre._id, show._id)}
                                className="bg-red-600/20 border border-red-600/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          ))}

                          {/* Add Show Form */}
                          <div className="bg-black/20 p-4 rounded">
                            <h4 className="font-semibold mb-2 text-yellow-400">Add Show</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <select
                                value={showForm.movieId}
                                onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                                className="px-3 py-2 rounded bg-dark text-white border border-yellow-400/20"
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
                                className="px-3 py-2 rounded bg-dark text-white border border-yellow-400/20"
                              />
                              <input
                                placeholder="Screen"
                                value={showForm.screen}
                                onChange={(e) => setShowForm({ ...showForm, screen: e.target.value })}
                                className="px-3 py-2 rounded bg-dark text-white border border-yellow-400/20"
                              />
                              <input
                                type="number"
                                placeholder="Price"
                                value={showForm.price}
                                onChange={(e) => setShowForm({ ...showForm, price: e.target.value })}
                                className="px-3 py-2 rounded bg-dark text-white border border-yellow-400/20"
                              />
                            </div>
                            <button
                              onClick={() => addShow(theatre._id)}
                              className="mt-3 btn-classic"
                            >
                              Add Show
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Pagination
                  currentPage={theatresPage}
                  totalItems={theatres.length}
                  onPageChange={setTheatresPage}
                />
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="glass rounded-xl border border-yellow-400/20 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-yellow-400/20 bg-yellow-400/5">
                        <th className="p-4 text-left text-yellow-400">Name</th>
                        <th className="p-4 text-left text-yellow-400">Email</th>
                        <th className="p-4 text-left text-yellow-400">Role</th>
                        <th className="p-4 text-left text-yellow-400">Status</th>
                        <th className="p-4 text-left text-yellow-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user._id} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="p-4 text-white">{user.name}</td>
                          <td className="p-4 text-gray-300">{user.email}</td>
                          <td className="p-4 text-gray-300">{user.role}</td>
                          <td className="p-4">
                            <span className={user.blocked ? 'text-red-400' : 'text-green-400'}>
                              {user.blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleBlockUser(user._id)}
                                className="px-4 py-1 rounded-full bg-yellow-600/20 border border-yellow-600/40 hover:bg-yellow-600 text-yellow-400 hover:text-white text-sm"
                              >
                                {user.blocked ? 'Unblock' : 'Block'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="px-4 py-1 rounded-full bg-red-600/20 border border-red-600/40 hover:bg-red-600 text-red-400 hover:text-white text-sm"
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
                <Pagination
                  currentPage={usersPage}
                  totalItems={users.length}
                  onPageChange={setUsersPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-2xl border border-yellow-400/20">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif' }}>
              {editingMovie ? 'Edit Movie' : 'Add Movie'}
            </h3>
            <form onSubmit={submitMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Title"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
                required
              />
              <input
                placeholder="Genres (comma-separated)"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
              />
              <input
                placeholder="Poster URL"
                value={movieForm.poster}
                onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
              />
              <input
                type="date"
                value={movieForm.releaseDate}
                onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
              />
              <input
                placeholder="Trailer URL (optional)"
                value={movieForm.trailerURL}
                onChange={(e) => setMovieForm({ ...movieForm, trailerURL: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all md:col-span-2"
              />
              <textarea
                placeholder="Description"
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all md:col-span-2"
                rows={4}
                required
              />
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMovieModal(false)} className="px-6 py-2 rounded-full glass border border-gray-600 hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn-classic">
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theatre Modal */}
      {showTheatreModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-xl border border-yellow-400/20">
            <h3 className="text-2xl font-bold mb-6 text-yellow-400" style={{ fontFamily: 'Playfair Display, serif' }}>
              {editingTheatre ? 'Edit Theatre' : 'Add Theatre'}
            </h3>
            <form onSubmit={submitTheatre} className="space-y-4">
              <input
                placeholder="Name"
                value={theatreForm.name}
                onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
                required
              />
              <input
                placeholder="Location"
                value={theatreForm.location}
                onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
                required
              />
              <input
                placeholder="Screens (comma-separated)"
                value={theatreForm.screens}
                onChange={(e) => setTheatreForm({ ...theatreForm, screens: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 text-white border border-yellow-400/20 focus:border-yellow-400 transition-all"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTheatreModal(false)} className="px-6 py-2 rounded-full glass border border-gray-600 hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="btn-classic">
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
