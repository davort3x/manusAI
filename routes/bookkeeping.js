const express = require('express');
const router = express.Router();
const Bookkeeping = require('../../models/Bookkeeping');

// GET bookkeeping page
router.get('/', async (req, res) => {
  try {
    // Get query parameters for filtering
    const businessCategory = req.query.businessCategory;
    const transactionType = req.query.transactionType;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Build filter object
    const filter = {};
    
    if (businessCategory) {
      filter.businessCategory = businessCategory;
    }
    
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Fetch entries with filter
    const entries = await Bookkeeping.find(filter).sort({ date: -1 });
    
    // Calculate summary
    let totalIncome = 0;
    let totalExpenses = 0;
    
    entries.forEach(entry => {
      if (entry.transactionType === 'Income') {
        totalIncome += entry.amount;
      } else {
        totalExpenses += entry.amount;
      }
    });
    
    const netProfit = totalIncome - totalExpenses;
    
    // Render page
    res.render('bookkeeping', { 
      title: 'Bookkeeping',
      entries: entries,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit
      },
      businessCategories: [
        'Business: Mealworms/BSFL',
        'Business: Flags',
        'Business: Rentals',
        'Crypto & Investments',
        'Personal'
      ],
      transactionTypes: ['Income', 'Expense']
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
