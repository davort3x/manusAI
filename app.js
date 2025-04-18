const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const tasksRoutes = require('./routes/tasks');
const readingRoutes = require('./routes/reading');
const inventoryRoutes = require('./routes/inventory');
const financialRoutes = require('./routes/financial');
const cryptoRoutes = require('./routes/crypto');
const bookkeepingRoutes = require('./routes/bookkeeping');
const realEstateRoutes = require('./routes/real-estate');

// Import API routes
const apiTasksRoutes = require('./routes/api/tasks');
const apiReadingRoutes = require('./routes/api/reading');
const apiInventoryRoutes = require('./routes/api/inventory');
const apiFinancialRoutes = require('./routes/api/financial');
const apiCryptoRoutes = require('./routes/api/crypto');
const apiBookkeepingRoutes = require('./routes/api/bookkeeping');
const apiPropertiesRoutes = require('./routes/api/properties');

const app = express();

// Set up MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskManager';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'task-manager-secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl: MONGODB_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}));

// Routes
app.use('/', dashboardRoutes);
app.use('/tasks', tasksRoutes);
app.use('/reading', readingRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/financial', financialRoutes);
app.use('/crypto', cryptoRoutes);
app.use('/bookkeeping', bookkeepingRoutes);
app.use('/real-estate', realEstateRoutes);

// API Routes
app.use('/api/tasks', apiTasksRoutes);
app.use('/api/reading', apiReadingRoutes);
app.use('/api/inventory', apiInventoryRoutes);
app.use('/api/financial', apiFinancialRoutes);
app.use('/api/crypto', apiCryptoRoutes);
app.use('/api/bookkeeping', apiBookkeepingRoutes);
app.use('/api/properties', apiPropertiesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
