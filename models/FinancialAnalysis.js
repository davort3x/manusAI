const mongoose = require('mongoose');

// Define Financial Analysis schema
const financialAnalysisSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  costBreakdown: {
    productCost: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    tariffs: {
      type: Number,
      default: 0
    },
    amazonFees: {
      type: Number,
      default: 0
    },
    otherFees: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    amazon: {
      type: Number,
      default: 0
    },
    website: {
      type: Number,
      default: 0
    }
  },
  margins: {
    amazon: {
      type: Number,
      default: 0
    },
    website: {
      type: Number,
      default: 0
    }
  },
  tariffScenarios: [{
    rate: Number,
    impact: Number,
    newMargin: Number
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total landed cost
financialAnalysisSchema.virtual('landedCost').get(function() {
  return (
    this.costBreakdown.productCost +
    this.costBreakdown.shipping +
    this.costBreakdown.tariffs +
    this.costBreakdown.amazonFees +
    this.costBreakdown.otherFees
  );
});

// Update margins before saving
financialAnalysisSchema.pre('save', function(next) {
  const landedCost = this.costBreakdown.productCost +
    this.costBreakdown.shipping +
    this.costBreakdown.tariffs +
    this.costBreakdown.amazonFees +
    this.costBreakdown.otherFees;
  
  if (this.pricing.amazon > 0) {
    this.margins.amazon = ((this.pricing.amazon - landedCost) / this.pricing.amazon) * 100;
  }
  
  if (this.pricing.website > 0) {
    this.margins.website = ((this.pricing.website - landedCost) / this.pricing.website) * 100;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Set toJSON and toObject options to include virtuals
financialAnalysisSchema.set('toJSON', { virtuals: true });
financialAnalysisSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FinancialAnalysis', financialAnalysisSchema);
