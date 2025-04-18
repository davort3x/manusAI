const express = require('express');
const router = express.Router();

// GET dashboard page
router.get('/', (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard',
    username: 'User'
  });
});

module.exports = router;
