const express = require('express');
const router = express.Router();

// GET dashboard page
router.get('/', (req, res) => {
  res.redirect("/tasks");
});

module.exports = router;
