const express = require('express');
const trainTicketRoutes = require('./routes/trainTicketRoutes');
const app = express();
const port = process.env.PORT || 5001;

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/trains', trainTicketRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Train Ticket Service running on port ${port}`);
});
