const mongoose = require('mongoose');

// Define Property schema for real estate portfolio
const propertySchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: false
  },
  tenant: {
    type: String,
    required: false
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  leaseExpiration: {
    type: Date,
    required: false
  },
  dueDate: {
    type: String,
    required: false
  },
  lateFee: {
    type: String,
    required: false
  },
  contactInfo: {
    type: String,
    required: false
  },
  paysUtilities: {
    type: Boolean,
    default: true
  },
  // Financial details
  mortgagePayment: {
    type: Number,
    required: false
  },
  hoaFee: {
    type: Number,
    required: false,
    default: 0
  },
  propertyTax: {
    type: Number,
    required: false,
    default: 0
  },
  mortgageBalance: {
    type: Number,
    required: false,
    default: 0
  },
  // Calculated fields will be virtual
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

// Virtual for monthly expenses
propertySchema.virtual('monthlyExpenses').get(function() {
  return this.mortgagePayment + (this.hoaFee || 0) + ((this.propertyTax || 0) / 12);
});

// Virtual for monthly net income
propertySchema.virtual('monthlyNet').get(function() {
  return this.monthlyRent - this.monthlyExpenses;
});

// Virtual for annual net income
propertySchema.virtual('annualNet').get(function() {
  return this.monthlyNet * 12;
});

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set toJSON and toObject options to include virtuals
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);
