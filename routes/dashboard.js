const express = require("express");
const router = express.Router();

// GET dashboard page - Redirects to /tasks
router.get("/", (req, res) => {
  res.redirect("/tasks"); // This line redirects to the tasks page
});

module.exports = router;
