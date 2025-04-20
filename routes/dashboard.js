const express = require('express');
const router = express.Router();

// GET dashboard page
router.get('/', (req, res) => {
  res.redirect('/tasks') { 
    title: 'Dashboard',
    username: 'User'
  });
});

module.exports = router;
