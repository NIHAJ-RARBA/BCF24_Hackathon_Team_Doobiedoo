const express = require('express');
const { sendEmail } = require('../controllers/notificationController');
const router = express.Router();

// POST /send-email route
router.post('/send-email', sendEmail);

router.get('/health', (req, res) => {
    res.status(200).send('Notification service is up and running');
    });


module.exports = router;
