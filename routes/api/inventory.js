const express = require('express');
const router = express.Router();
const { InventoryItem, BusinessInfo } = require('../../models/Inventory');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    const businessInfo = await BusinessInfo.findOne() || {};
    res.json({ items, businessInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const newItem = new InventoryItem({
      sku: req.body.sku,
      name: req.body.name,
      asin: req.body.asin,
      inventory: {
        asdn: req.body.inventory.asdn || 0,
        fba: req.body.inventory.fba || 0,
        inbound: req.body.inventory.inbound || 0,
        thirdParty: req.body.inventory.thirdParty || 0
      },
      salesVelocity: req.body.salesVelocity || 0,
      leadTime: req.body.leadTime || 75,
      costBreakdown: {
        productCost: req.body.costBreakdown.productCost || 0,
        shipping: req.body.costBreakdown.shipping || 0,
        tariffs: req.body.costBreakdown.tariffs || 0,
        amazonFees: req.body.costBreakdown.amazonFees || 0,
        otherFees: req.body.costBreakdown.otherFees || 0
      },
      sellingPrice: {
        amazon: req.body.sellingPrice.amazon || 0,
        website: req.body.sellingPrice.website || 0
      },
      notes: req.body.notes
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    item.sku = req.body.sku || item.sku;
    item.name = req.body.name || item.name;
    item.asin = req.body.asin || item.asin;
    
    if (req.body.inventory) {
      item.inventory.asdn = req.body.inventory.asdn !== undefined ? req.body.inventory.asdn : item.inventory.asdn;
      item.inventory.fba = req.body.inventory.fba !== undefined ? req.body.inventory.fba : item.inventory.fba;
      item.inventory.inbound = req.body.inventory.inbound !== undefined ? req.body.inventory.inbound : item.inventory.inbound;
      item.inventory.thirdParty = req.body.inventory.thirdParty !== undefined ? req.body.inventory.thirdParty : item.inventory.thirdParty;
    }
    
    item.salesVelocity = req.body.salesVelocity !== undefined ? req.body.salesVelocity : item.salesVelocity;
    item.leadTime = req.body.leadTime !== undefined ? req.body.leadTime : item.leadTime;
    
    if (req.body.costBreakdown) {
      item.costBreakdown.productCost = req.body.costBreakdown.productCost !== undefined ? req.body.costBreakdown.productCost : item.costBreakdown.productCost;
      item.costBreakdown.shipping = req.body.costBreakdown.shipping !== undefined ? req.body.costBreakdown.shipping : item.costBreakdown.shipping;
      item.costBreakdown.tariffs = req.body.costBreakdown.tariffs !== undefined ? req.body.costBreakdown.tariffs : item.costBreakdown.tariffs;
      item.costBreakdown.amazonFees = req.body.costBreakdown.amazonFees !== undefined ? req.body.costBreakdown.amazonFees : item.costBreakdown.amazonFees;
      item.costBreakdown.otherFees = req.body.costBreakdown.otherFees !== undefined ? req.body.costBreakdown.otherFees : item.costBreakdown.otherFees;
    }
    
    if (req.body.sellingPrice) {
      item.sellingPrice.amazon = req.body.sellingPrice.amazon !== undefined ? req.body.sellingPrice.amazon : item.sellingPrice.amazon;
      item.sellingPrice.website = req.body.sellingPrice.website !== undefined ? req.body.sellingPrice.website : item.sellingPrice.website;
    }
    
    item.notes = req.body.notes !== undefined ? req.body.notes : item.notes;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await item.remove();
    res.json({ message: 'Inventory item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update business info
router.put('/business-info', async (req, res) => {
  try {
    let businessInfo = await BusinessInfo.findOne();
    
    if (!businessInfo) {
      // Create new business info if it doesn't exist
      businessInfo = new BusinessInfo({
        name: req.body.name,
        website: req.body.website,
        primaryChannel: req.body.primaryChannel,
        secondaryChannel: req.body.secondaryChannel,
        supplierRegion: req.body.supplierRegion,
        productionTime: req.body.productionTime,
        shippingTime: req.body.shippingTime,
        shippingMethod: req.body.shippingMethod,
        seasonalFactors: req.body.seasonalFactors
      });
    } else {
      // Update existing business info
      businessInfo.name = req.body.name || businessInfo.name;
      businessInfo.website = req.body.website || businessInfo.website;
      businessInfo.primaryChannel = req.body.primaryChannel || businessInfo.primaryChannel;
      businessInfo.secondaryChannel = req.body.secondaryChannel || businessInfo.secondaryChannel;
      businessInfo.supplierRegion = req.body.supplierRegion || businessInfo.supplierRegion;
      businessInfo.productionTime = req.body.productionTime || businessInfo.productionTime;
      businessInfo.shippingTime = req.body.shippingTime || businessInfo.shippingTime;
      businessInfo.shippingMethod = req.body.shippingMethod || businessInfo.shippingMethod;
      businessInfo.seasonalFactors = req.body.seasonalFactors || businessInfo.seasonalFactors;
    }

    const updatedInfo = await businessInfo.save();
    res.json(updatedInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
