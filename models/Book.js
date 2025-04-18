const mongoose = require('mongoose');

// Define Book schema for reading list
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    required: true,
    enum: ["High", "Medium", "Low"],
    default: "Medium"
  },
  status: {
    type: String,
    required: true,
    enum: ["To Read", "Currently Reading", "Completed"],
    default: "To Read"
  },
  startDate: {
    type: Date,
    required: false
  },
  completionDate: {
    type: Date,
    required: false
  },
  progress: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Book', bookSchema);
