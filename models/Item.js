const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  number : { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

itemSchema.virtual('booking', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'item',
  justOne: true // ถ้ามีแค่หนึ่ง booking ต่อที่นั่ง
});

itemSchema.set('toObject', { virtuals: true });
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
// Compare this snippet from models/Item.js: