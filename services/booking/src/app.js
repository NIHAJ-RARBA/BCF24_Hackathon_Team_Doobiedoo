const express = require('express');
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();
const port = process.env.PORT || 5002;

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Export the app for testing
module.exports = app;

// Start the server
app.listen(port, () => {
  console.log(`Booking service running on port ${port}`);
});

// Start the server only when this script is run directly (not during tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Booking service running on port ${port}`);
  });
}
