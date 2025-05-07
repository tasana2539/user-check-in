const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User'); // import model

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
const signinRoute = require('./controller/auth/signin');
const itemRoute = require('./controller/item');
const bookingRoute = require('./controller/booking');
app.post('/login', signinRoute);
app.use('/item', itemRoute);
app.use('/booking', bookingRoute);

// Serve static files from the views directory
const path = require('path');
app.use(express.static(path.join(__dirname, 'views')));


// Optional: redirect root to /index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

async function createDefaultAdmin() {
  const existingAdmin = await User.findOne({ userlevel: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrator',
      phone: '0000000000',
      userlevel: 'admin'
    });
    console.log('✅ Default admin created');
  } else {
    console.log('ℹ️ Admin already exists');
  }
}

mongoose.connect('mongodb://localhost:27017/your_db_name', {
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // create default admin user if not exists
  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const admin = new User({
      email: 'admin@example.com',
      password: 'admin123', // password hash
      name: 'Administrator',
      phone: '0000000000',
      userlevel: 'admin'
    });
    await admin.save();
    console.log('✅ Default admin created');
  } else {
    console.log('ℹ️ Admin already exists');
  }

  const PORT = process.env.PORT || 3000;
  // express server start
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });

})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
