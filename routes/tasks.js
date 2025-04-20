const express = require('express');
const router = express.Router();
const Task = require('../../models/Task');

// GET tasks page
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.render('tasks', { 
      title: 'Task Management',
      tasks: tasks,
      categories: [
        'Business: Mealworms/BSFL',
        'Business: Flags',
        'Business: Rentals',
        'Crypto & Investments',
        'Family & Kids',
        'Personal',
        'Misc / One-offs'
      ],
      priorities: ['High', 'Medium', 'Low'],
      statuses: ['To Do', 'In Progress', 'Done', 'Waiting']
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET edit task page
router.get('/edit/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send('Task not found');
    }
    
    res.render('edit-task', { 
      title: 'Edit Task',
      task: task,
      categories: [
        'Business: Mealworms/BSFL',
        'Business: Flags',
        'Business: Rentals',
        'Crypto & Investments',
        'Family & Kids',
        'Personal',
        'Misc / One-offs'
      ],
      priorities: ['High', 'Medium', 'Low'],
      statuses: ['To Do', 'In Progress', 'Done', 'Waiting']
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
