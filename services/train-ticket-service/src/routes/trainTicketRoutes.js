const express = require('express');
const { getTrains,getTrainDetails } = require('../controllers/trainController');
const router = express.Router();

// Route to book a ticket
router.get('/getTrains',getTrains );
router.get('/getTrainDetails',getTrainDetails );

module.exports = router;
