# Troubleshooting: Recommended Movies Not Showing

## Issue
The "Recommended Movies" slider on the home page is not displaying.

## Possible Causes & Solutions

### 1. **No Movies in Database**
**Symptom:** The section shows "No newly added movies yet. Check back soon!"
**Solution:** You need to add movies to your database using the admin dashboard.

**Steps to add movies:**
1. Login as admin (visit `/admin/login`)
2. Go to Admin Dashboard
3. Add at least 5 movies to the database
4. The recommended movies slider will appear on the home page

### 2. **Backend Server Not Running**
**Symptom:** Loading spinner appears but never shows movies
**Solution:** Make sure your backend server is running
```bash
cd server
npm start
```

### 3. **API Endpoint Error**
**Symptom:** Console shows errors when fetching movies
**Solution:** Check browser console (F12) for error messages

**To check:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for:
   - "Trending movies:" - should show array of TMDB movies
   - "DB movies:" - should show array of your database movies
   - "Newly added movies for slider:" - should show the 5 latest movies
   - Any error messages in red

### 4. **CORS Issues**
**Symptom:** Console shows CORS errors
**Solution:** Make sure your backend is configured to accept requests from the frontend

Check `server/.env`:
```
CLIENT_URL=http://localhost:3000
```

### 5. **MongoDB Connection Issue**
**Symptom:** "DB movies:" shows an empty array `[]`
**Solution:** 
1. Check if MongoDB is running
2. Verify `MONGO_URI` in `server/.env`
3. Check server console for connection errors

## Debug Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Refresh the Home page**
3. **Look for the debug logs:**
   - `Trending movies:` → Shows TMDB movies (should have data)
   - `DB movies:` → Shows database movies (if empty, no movies in DB)
   - `Newly added movies for slider:` → Shows the 5 latest (if empty, that's why slider doesn't show)
   - Any errors in red

4. **Check the Network tab:**
   - Look for the API call to `/api/movies`
   - Check if it's returning 200 OK
   - Look at the response data

## Quick Test

If you want to quickly add test movies to see if it works:
1. Login as admin
2. Use the admin dashboard to add 5 movies
3. Refresh the home page
4. The slider should now appear

## Expected Console Output (When Working)

```javascript
Trending movies: [{...}, {...}, ...] // Array of 10 TMDB movies
DB movies: [{...}, {...}, {...}, {...}, {...}] // Array of your movies
Theatres: [{...}, {...}] // Array of theatres
Newly added movies for slider: [{...}, {...}, {...}, {...}, {...}] // 5 movies
```

## If Still Not Working

Share the console output with me and I can help diagnose the specific issue!
