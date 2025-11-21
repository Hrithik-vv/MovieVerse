# MovieVerse Setup Guide

## Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run install-all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

#### Server (.env in server/ directory)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/movieverse
JWT_SECRET=your_super_secret_jwt_key_change_this
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_RAZORPAY_KEY_SECRET
TMDB_API_KEY=your_tmdb_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

#### Client (.env in client/ directory)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

### 4. Run the Application

From the root directory:
```bash
npm run dev
```

This will start both server (port 5000) and client (port 3000) concurrently.

Or run separately:
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm start
```

## Getting API Keys

### TMDb API Key
1. Go to https://www.themoviedb.org/
2. Sign up for an account
3. Go to Settings > API
4. Request an API key
5. Copy the API key to your `.env` file

### Razorpay Keys
1. Go to https://razorpay.com/
2. Sign up and create an account
3. Go to Dashboard > Settings > API Keys
4. Generate test keys
5. Copy Key ID and Secret to your `.env` file

### Gmail App Password (for Email)
1. Go to your Google Account settings
2. Security > 2-Step Verification (enable if not enabled)
3. App passwords > Generate app password
4. Select "Mail" and "Other (Custom name)"
5. Copy the generated password to `EMAIL_PASS` in `.env`

## Creating Admin User

After registering a user, update their role in MongoDB:

```javascript
// Using MongoDB shell
use movieverse
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or using MongoDB Compass:
1. Connect to your database
2. Navigate to `users` collection
3. Find your user document
4. Edit the `role` field to `"admin"`

## Testing the Application

1. **Register a new user** at `/register`
2. **Create an admin user** (see above)
3. **Login as admin** at `/admin/login`
4. **Import movies** from TMDb using the admin dashboard
5. **Add theatres and shows** via admin panel
6. **Book tickets** as a regular user
7. **Test payment** using Razorpay test mode

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` is correct
- For MongoDB Atlas, use the connection string provided

### CORS Errors
- Ensure `FRONTEND_URL` in server `.env` matches your client URL
- Default is `http://localhost:3000`

### Email Not Sending
- Verify Gmail app password is correct
- Check that 2-Step Verification is enabled
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set correctly

### Payment Issues
- Use Razorpay test mode keys
- Ensure `REACT_APP_RAZORPAY_KEY_ID` is set in client `.env`
- Check Razorpay dashboard for test transactions

## Project Structure

```
MovieVerse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
└── README.md
```

## Next Steps

- Customize the UI theme
- Add more features (favorites, watchlist, etc.)
- Implement real-time notifications
- Add unit tests
- Deploy to production

