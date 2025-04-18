const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Business: Mealworms/BSFL',
      'Business: Flags',
      'Business: Rentals',
      'Crypto & Investments',
      'Family & Kids',
      'Personal',
      'Misc / One-offs'
    ]
  },
  allDay: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  location: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Calendar', CalendarSchema);
