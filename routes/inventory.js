const express = require('express');
const router = express.Router();
// CORRECTED IMPORT: Destructure InventoryItem and BusinessInfo from the model
const { InventoryItem, BusinessInfo } = require('../models/Inventory');

// GET inventory page
router.get('/', async (req, res) => {
  try {
    // CORRECTED FIND CALL: Use the imported InventoryItem
    const inventory = await InventoryItem.find().sort({ category: 1, productName: 1 });
    
    // You might also need BusinessInfo if your 'inventory.ejs' template uses it.
    // If so, fetch it like this:
    // const businessInfo = await BusinessInfo.findOne();

    res.render('inventory', { 
      title: 'Inventory Management',
      inventory: inventory,
      // Pass businessInfo if you fetched it:
      // businessInfo: businessInfo,
      categories: ['Mealworms', 'BSFL', 'Flags', 'Other']
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).send('Server Error fetching inventory');
  }
});

module.exports = router;
