const express = require('express');
const { bookTicket,bookTicket2 } = require('../controllers/bookingController');
const router = express.Router();

// Route to book a ticket
router.post('/book-ticket', bookTicket2);

router.get('/health', (req, res) => {
    res.status(200).send('Booking service is up and running');
    });


module.exports = router;
