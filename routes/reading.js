const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET reading list page
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ status: 1, title: 1 });
    res.render('reading', { 
      title: 'Reading List',
      books: books,
      categories: ['Fiction', 'Non-Fiction', 'Business', 'Self-Improvement', 'Finance', 'Real Estate', 'Technology'],
      statuses: ['To Read', 'In Progress', 'Completed']
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
