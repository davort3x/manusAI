const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ priority: -1 });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,
      author: req.body.author,
      priority: req.body.priority,
      status: req.body.status || 'To Read',
      startDate: req.body.startDate,
      completionDate: req.body.completionDate,
      progress: req.body.progress || 0,
      notes: req.body.notes
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update fields
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.priority = req.body.priority || book.priority;
    book.status = req.body.status || book.status;
    book.startDate = req.body.startDate || book.startDate;
    book.completionDate = req.body.completionDate || book.completionDate;
    book.progress = req.body.progress !== undefined ? req.body.progress : book.progress;
    book.notes = req.body.notes || book.notes;

    // If status changed to "Currently Reading" and no start date, set it
    if (book.status === 'Currently Reading' && !book.startDate) {
      book.startDate = new Date();
    }
    
    // If status changed to "Completed" and no completion date, set it
    if (book.status === 'Completed' && !book.completionDate) {
      book.completionDate = new Date();
      book.progress = 100;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.remove();
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update reading progress
router.patch('/:id/progress', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update progress
    book.progress = req.body.progress;
    
    // If progress is 100%, mark as completed
    if (book.progress === 100 && book.status !== 'Completed') {
      book.status = 'Completed';
      book.completionDate = new Date();
    }
    
    // If progress is > 0% but < 100% and not currently reading, update status
    if (book.progress > 0 && book.progress < 100 && book.status !== 'Currently Reading') {
      book.status = 'Currently Reading';
      if (!book.startDate) {
        book.startDate = new Date();
      }
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
