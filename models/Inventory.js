const mongoose = require('mongoose');

// Define inventory item schema
const inventoryItemSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  asin: {
    type: String,
    required: true
  },
  inventory: {
    asdn: {
      type: Number,
      default: 0
    },
    fba: {
      type: Number,
      default: 0
    },
    inbound: {
      type: Number,
      default: 0
    },
    thirdParty: {
      type: Number,
      default: 0
    }
  },
  salesVelocity: {
    type: Number,
    default: 0
  },
  leadTime: {
    type: Number,
    default: 75
  },
  reorderPoint: {
    type: Number,
    default: 0
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
  sellingPrice: {
    amazon: {
      type: Number,
      default: 0
    },
    website: {
      type: Number,
      default: 0
    }
  },
  profitMargin: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
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

// Virtual for total inventory
inventoryItemSchema.virtual('totalInventory').get(function() {
  return this.inventory.asdn + this.inventory.fba + this.inventory.inbound + this.inventory.thirdParty;
});

// Virtual for landed cost
inventoryItemSchema.virtual('landedCost').get(function() {
  return this.costBreakdown.productCost + 
         this.costBreakdown.shipping + 
         this.costBreakdown.tariffs + 
         this.costBreakdown.amazonFees + 
         this.costBreakdown.otherFees;
});

// Update calculated fields before saving
inventoryItemSchema.pre('save', function(next) {
  // Calculate reorder point based on sales velocity and lead time
  if (this.salesVelocity > 0 && this.leadTime > 0) {
    this.reorderPoint = Math.ceil(this.salesVelocity * (this.leadTime / 30) * 1.5); // 1.5 safety factor
  }
  
  // Calculate profit margin for Amazon
  if (this.sellingPrice.amazon > 0) {
    const landedCost = this.costBreakdown.productCost + 
                      this.costBreakdown.shipping + 
                      this.costBreakdown.tariffs + 
                      this.costBreakdown.amazonFees + 
                      this.costBreakdown.otherFees;
    
    this.profitMargin = ((this.sellingPrice.amazon - landedCost) / this.sellingPrice.amazon) * 100;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Set toJSON and toObject options to include virtuals
inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

// Define business info schema
const businessInfoSchema = new mongoose.Schema({
  name: String,
  website: String,
  primaryChannel: String,
  secondaryChannel: String,
  supplierRegion: String,
  productionTime: String,
  shippingTime: String,
  shippingMethod: String,
  seasonalFactors: String
});

// Create models
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const BusinessInfo = mongoose.model('BusinessInfo', businessInfoSchema);

module.exports = { InventoryItem, BusinessInfo };
