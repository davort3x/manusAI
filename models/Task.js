const mongoose = require('mongoose');

// Define Task schema
const taskSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "Business: Mealworms/BSFL",
      "Business: Flags",
      "Business: Rentals",
      "Crypto & Investments",
      "Family & Kids",
      "Personal",
      "Misc / One-offs"
    ]
  },
  task: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ["High", "Medium", "Low"]
  },
  dueDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ["To Do", "In Progress", "Done", "Waiting"],
    default: "To Do"
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
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
