const db = require('../db');

// Get all trains
exports.getTrains = async (req, res) => {
    console.log('Getting all trains');
    const trains = await db.query('SELECT * FROM trains');
    res.status(200).json(trains.rows);
};

// Get train details and available tickets for a specific train
exports.getTrainDetails = async (req, res) => {
    
    const trainId = req.params.trainId;
    const trainDetails = await db.query('SELECT * FROM trains WHERE id = $1', [trainId]);

    if (trainDetails.rows.length > 0) {
        const tickets = await db.query('SELECT * FROM tickets WHERE train_id = $1 AND status = $2', [trainId, 'available']);
        res.status(200).json({
            train: trainDetails.rows[0],
            availableTickets: tickets.rows
        });
    } else {
        res.status(404).json({ message: 'Train not found' });
    }
};

exports.getSeatStatus = async (req, res) => {
    
    try {

        console.log('getSeatStatus');


        const { trainId, seatId } = req.body;
        
        // Query the database for the seat's availability
        const seat = await db.query(
            'SELECT * FROM tickets WHERE train_id = $1 AND seat_number = $2',
            [trainId, seatId]
        );

        if (seat.rows.length === 0) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        // Return the seat status (e.g., available or booked)
        res.status(200).json(seat.rows[0]); // Return the seat details, including its status
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seat status' });
    }
};
