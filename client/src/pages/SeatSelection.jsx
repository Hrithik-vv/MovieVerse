import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SeatSelection = () => {
  const { movieId, theatreId, showId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movieRes, theatreRes] = await Promise.all([
        axios.get(`${API_URL}/api/movies/${movieId}`),
        axios.get(`${API_URL}/api/theatres/${theatreId}`),
      ]);
      setMovie(movieRes.data);
      setTheatre(theatreRes.data);
      const foundShow = theatreRes.data.shows.find((s) => s._id.toString() === showId);
      setShow(foundShow);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (row, col) => {
    const seatKey = `${row}-${col}`;
    if (show.seats[row] && show.seats[row][col]) {
      return; // Seat is already booked
    }

    setSelectedSeats((prev) => {
      const exists = prev.find(([r, c]) => r === row && c === col);
      if (exists) {
        return prev.filter(([r, c]) => !(r === row && c === col));
      } else {
        return [...prev, [row, col]];
      }
    });
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      const totalPrice = selectedSeats.length * show.price;
      const token = localStorage.getItem('token');
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const res = await axios.post(
        `${API_URL}/api/bookings`,
        {
          movieId,
          theatreId,
          showId,
          seats: selectedSeats,
          totalPrice,
          showtime: show.showtime,
        },
        { headers }
      );

      navigate(`/payment/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!show) {
    return <div className="container mx-auto px-4 py-8">Show not found</div>;
  }

  const rows = 10;
  const cols = 10;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Select Seats</h1>
      <div className="bg-dark-gray p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">{movie?.title}</h2>
        <p className="text-gray-400">
          {theatre?.name} - {new Date(show.showtime).toLocaleString()}
        </p>
        <p className="text-gray-400">Price per seat: ₹{show.price}</p>
      </div>

      <div className="bg-dark-gray p-6 rounded-lg mb-6">
        <div className="flex justify-center mb-4">
          <div className="text-center text-gray-400">Screen</div>
        </div>
        <div className="bg-gray-700 h-2 mb-8 rounded"></div>

        <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto">
          {Array.from({ length: rows }).map((_, row) =>
            Array.from({ length: cols }).map((_, col) => {
              const isBooked = show.seats[row] && show.seats[row][col];
              const isSelected = selectedSeats.some(([r, c]) => r === row && c === col);

              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => toggleSeat(row, col)}
                  disabled={isBooked}
                  className={`
                    w-8 h-8 rounded text-xs
                    ${isBooked
                      ? 'bg-red-600 cursor-not-allowed'
                      : isSelected
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }
                  `}
                >
                  {String.fromCharCode(65 + row)}
                  {col + 1}
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-sm text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-400">Booked</span>
          </div>
        </div>
      </div>

      <div className="bg-dark-gray p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-400">Selected Seats: {selectedSeats.length}</p>
            <p className="text-2xl font-bold">
              Total: ₹{selectedSeats.length * show.price}
            </p>
          </div>
          <button
            onClick={handleBook}
            disabled={selectedSeats.length === 0}
            className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
