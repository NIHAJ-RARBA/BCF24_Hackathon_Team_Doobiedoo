const express = require('express');
const { sendEmail } = require('../controllers/notificationController');
const router = express.Router();

// POST /send-email route
router.post('/send-email', sendEmail);

module.exports = router;
