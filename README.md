# MovieVerse - Movie Review and Ticket Booking Platform

A full-stack MERN application for movie reviews and ticket booking with admin panel.

## Features

- 🎬 Browse and search movies (TMDb API integration)
- ⭐ Rate and review movies
- 🎫 Book tickets with seat selection
- 💳 Online payment integration (Razorpay)
- 👤 User authentication (JWT)
- 🛡️ Admin panel for managing movies, theatres, users, and bookings
- 📧 Email confirmation for bookings
- 🎨 Modern dark theme UI with animations

## Tech Stack

### Frontend
- React.js
- React Router
- Context API
- Axios
- Framer Motion
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- PayU (Payment)
- Nodemailer (Email)

## Project Structure

```
MovieVerse/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── server/          # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── utils/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- TMDb API key
- Razorpay account (for payments)
- Gmail account (for email service)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movieverse
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_RAZORPAY_KEY_SECRET
TMDB_API_KEY=your_tmdb_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. Start the React app:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)

### Reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Add review (Auth)
- `PUT /api/reviews/:id` - Update review (Auth)
- `DELETE /api/reviews/:id` - Delete review (Auth)

### Theatres
- `GET /api/theatres` - Get all theatres
- `POST /api/theatres` - Create theatre (Admin)
- `PUT /api/theatres/:id` - Update theatre (Admin)
- `DELETE /api/theatres/:id` - Delete theatre (Admin)

### Bookings
- `POST /api/bookings` - Create booking (Auth)
- `GET /api/bookings/mybookings` - Get user bookings (Auth)
- `GET /api/bookings` - Get all bookings (Admin)
- `PUT /api/bookings/:id/payment` - Update payment status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### TMDb
- `GET /api/tmdb/trending` - Get trending movies
- `GET /api/tmdb/search?query=...` - Search movies
- `GET /api/tmdb/movie/:id` - Get movie details
- `POST /api/tmdb/import` - Import movie from TMDb (Admin)

## Creating Admin User

To create an admin user, you can either:

1. Use MongoDB directly:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or register normally and update via MongoDB Compass/CLI

## Features in Detail

### User Features
- Browse and search movies
- View movie details with reviews
- Add/edit/delete reviews
- Book tickets with seat selection
- Make payments via Razorpay
- View booking history
- Cancel bookings

### Admin Features
- Manage movies (CRUD)
- Manage theatres and shows
- Manage users (block/unblock, delete)
- View all bookings
- Import movies from TMDb

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes
- CORS configuration
- Helmet.js for security headers

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


