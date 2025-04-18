const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET real estate page
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().sort({ address: 1 });
    res.render('real-estate', { 
      title: 'Real Estate Portfolio',
      properties: properties
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
