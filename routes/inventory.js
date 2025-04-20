const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// GET inventory page
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ category: 1, productName: 1 });
    res.render('inventory', { 
      title: 'Inventory Management',
      inventory: inventory,
      categories: ['Mealworms', 'BSFL', 'Flags', 'Other']
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
