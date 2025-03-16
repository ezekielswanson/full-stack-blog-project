//Load environment variables from .env file
require('dotenv').config();

//setting connection string to database
const dbURI = process.env.MONGODB_URI;


//Loading libraries
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const blogRoutes = require('./routes/blogRoutes');

// express app
const app = express();


// Register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next(); 
});

// routes
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// blog routes
app.use('/blogs', blogRoutes);

// 404 page handler
app.use((req, res) => {
  // Check if this is a direct request to a non-existent route
  if (req.path !== '/' && req.path !== '/blogs') {
    // This is a genuine 404 situation - render the 404 view if it exists
    try {
      res.status(404).render('404', { title: '404' });
    } catch (err) {
      // If the 404 view doesn't exist or there's an error rendering it,
      // fall back to redirecting to the home page
      console.error('Error rendering 404 page:', err);
      res.redirect('/');
    }
  } else {
    // For root or /blogs paths, just redirect to home
    res.redirect('/');
  }
});

// Connect to MongoDB first, then start the server
const PORT = process.env.PORT || 3000;

mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => {
  // Start server after successful database connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Connected to MongoDB');
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // For Vercel, we should still start the server even if DB connection fails
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without database connection)`);
  });
});

/*
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));
*/