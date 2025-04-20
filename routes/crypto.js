const express = require('express');
const router = express.Router();
const CryptoInvestment = require('../models/CryptoInvestment');

// GET crypto investments page
router.get('/', async (req, res) => {
  try {
    const investments = await CryptoInvestment.find().sort({ token: 1 });
    res.render('crypto', { 
      title: 'Crypto Investments',
      investments: investments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET crypto analytics page
router.get('/analytics', async (req, res) => {
  try {
    const investments = await CryptoInvestment.find();
    res.render('crypto-analytics', { 
      title: 'Crypto Analytics',
      investments: investments
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
