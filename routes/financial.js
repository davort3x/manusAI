const express = require('express');
const router = express.Router();
const FinancialAnalysis = require('../../models/FinancialAnalysis');

// GET financial analysis page
router.get('/', async (req, res) => {
  try {
    const financialData = await FinancialAnalysis.find().sort({ date: -1 });
    res.render('financial-analysis', { 
      title: 'Financial Analysis',
      financialData: financialData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
