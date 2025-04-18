// Reminder system for task management application

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Task = require('./models/Task');
const mongoose = require('mongoose');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// User email configuration
const userEmail = process.env.USER_EMAIL || 'user@example.com';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskManager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for reminder system'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to send reminder email
const sendReminderEmail = async (tasks) => {
  if (tasks.length === 0) return;
  
  let taskList = '';
  tasks.forEach(task => {
    taskList += `- ${task.title} (${task.category}) - Due: ${new Date(task.dueDate).toLocaleDateString()}\n`;
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: userEmail,
    subject: 'Task Manager Reminders: Upcoming Tasks',
    text: `Hello,

Here are your upcoming tasks that require attention:

${taskList}

Access your task manager at: https://zyqowkkj.manus.space or http://localhost:3000 (when running locally)

This is an automated reminder from your Personal Task Manager.
`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">Task Manager Reminders</h2>
      <p>Hello,</p>
      <p>Here are your upcoming tasks that require attention:</p>
      <ul style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
        ${tasks.map(task => `<li style="margin-bottom: 10px;"><strong>${task.title}</strong> (${task.category}) - Due: ${new Date(task.dueDate).toLocaleDateString()} <span style="color: ${task.priority === 'High' ? '#e74c3c' : task.priority === 'Medium' ? '#f39c12' : '#2ecc71'}">${task.priority} Priority</span></li>`).join('')}
      </ul>
      <p>Access your task manager at: <a href="https://zyqowkkj.manus.space">https://zyqowkkj.manus.space</a> or <a href="http://localhost:3000">http://localhost:3000</a> (when running locally)</p>
      <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">This is an automated reminder from your Personal Task Manager.</p>
    </div>`
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

// Function to check for upcoming tasks
const checkUpcomingTasks = async () => {
  try {
    // Get current date
    const today = new Date();
    
    // Get date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Get date for next week
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Find high priority tasks due today
    const highPriorityToday = await Task.find({
      dueDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      },
      priority: 'High',
      status: { $ne: 'Completed' }
    });
    
    // Find all tasks due tomorrow
    const dueTomorrow = await Task.find({
      dueDate: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'Completed' }
    });
    
    // Find high priority tasks due within the next week
    const highPriorityWeek = await Task.find({
      dueDate: {
        $gte: new Date(tomorrow.setHours(23, 59, 59, 999)),
        $lt: new Date(nextWeek.setHours(23, 59, 59, 999))
      },
      priority: 'High',
      status: { $ne: 'Completed' }
    });
    
    // Combine all tasks that need reminders
    const tasksNeedingReminders = [
      ...highPriorityToday,
      ...dueTomorrow,
      ...highPriorityWeek
    ];
    
    // Sort by due date (ascending) and then by priority
    tasksNeedingReminders.sort((a, b) => {
      // First sort by due date
      const dateComparison = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, sort by priority (High > Medium > Low)
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Send reminder email if there are tasks needing attention
    if (tasksNeedingReminders.length > 0) {
      await sendReminderEmail(tasksNeedingReminders);
    }
  } catch (error) {
    console.error('Error checking for upcoming tasks:', error);
  }
};

// Schedule daily reminder check at 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('Running daily task reminder check...');
  checkUpcomingTasks();
});

// Also check for tasks when the reminder system starts
console.log('Initializing reminder system...');
checkUpcomingTasks();

module.exports = {
  checkUpcomingTasks,
  sendReminderEmail
};
