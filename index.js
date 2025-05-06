
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
const signupRoute = require('./auth/signup');
const signinRoute = require('./auth/signin');
app.post('/signup', signupRoute);
app.post('/login', signinRoute);


// Serve static files from the public directory
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


// Optional: redirect root to /index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/user-check-in')
  .then(() => console.log('MongoDB connected port: 27017'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`test at: http://localhost:${PORT}/`);
});
