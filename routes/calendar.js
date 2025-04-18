const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar');

// GET monthly calendar page
router.get('/', async (req, res) => {
  try {
    const events = await Calendar.find().sort({ date: 1 });
    res.render('monthly-calendar', { 
      title: 'Monthly Calendar',
      events: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET weekly calendar page
router.get('/weekly', async (req, res) => {
  try {
    const events = await Calendar.find().sort({ date: 1 });
    res.render('weekly-calendar', { 
      title: 'Weekly Calendar',
      events: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
