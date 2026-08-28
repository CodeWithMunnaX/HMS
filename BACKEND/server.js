const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const seedData = require('./seeders/seedData');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then((connected) => {
  if (connected) {
    seedData();
  }
});

const app = express();

// Middlewares
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CarePulse Hospital Management System API',
    time: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/beds', require('./routes/bedRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`  🏥 CarePulse HMS Backend Server Running on port ${PORT}`);
  console.log(`  🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server Error]: ${err.message}`);
});

module.exports = app;
