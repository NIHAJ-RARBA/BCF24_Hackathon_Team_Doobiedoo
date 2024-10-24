const express = require('express');
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();
const port = process.env.PORT || 5002;

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Start the server
app.listen(port, () => {
  //console.log(`Booking service running on port ${port}`);
});

module.exports=app;