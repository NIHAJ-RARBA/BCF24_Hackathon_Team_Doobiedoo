const express = require('express');
const app = express();
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config(); // Load environment variables

app.use(express.json()); // Parse incoming JSON

// Use the routes
app.use('/api/notifications', notificationRoutes);

// Start the server
const PORT =6000;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
