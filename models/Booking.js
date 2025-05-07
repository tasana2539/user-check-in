const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  user: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['checked', 'available'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);