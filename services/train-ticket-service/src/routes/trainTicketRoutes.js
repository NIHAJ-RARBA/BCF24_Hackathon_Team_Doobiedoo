const express = require('express');
const { getTrains,getTrainDetails,getSeatStatus } = require('../controllers/trainController');
const router = express.Router();

// Route to book a ticket
router.get('/getTrains',getTrains );
router.get('/getTrainDetails',getTrainDetails );
router.post('/seats', getSeatStatus);

module.exports = router;
