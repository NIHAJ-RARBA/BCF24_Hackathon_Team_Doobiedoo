const db = require('../db');
const axios = require('axios'); // To call the Train-Ticket Service



exports.bookTicket2 = async (req, res) => {
    const { userId, trainId, seatId } = req.body;

    // Fetch ticket info from Train-Ticket Service
    try {

        console.log('amit 1');
    
        const ticketResponse = await axios.get(`http://localhost:5001/api/trains/${trainId}`);

        console.log('amit 2');

        const seat = ticketResponse.data.availableTickets.find(ticket => ticket.id === seatId);

        console.log('amit 3');

        if (seat && seat.status === 'available') {
            // Update ticket status to booked and insert into bookings table
            await db.query('UPDATE tickets SET status = $1 WHERE id = $2', ['booked', seatId]);
            await db.query('INSERT INTO bookings (user_id, train_id, seat_id, status, booking_time) VALUES ($1, $2, $3, $4, NOW())',
                           [userId, trainId, seatId, 'confirmed']);
            res.status(201).json({ message: 'Booking successful' });
        } else {
            res.status(400).json({ message: 'Seat is already booked' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Errordsadssdfasd booking seat', error: error.message });
    }
};

exports.bookTicket = async (req, res) => {
    const { userId, trainId, seatId } = req.body;

    try {
        // Check if the seat is available (example logic)
        //get all tickets and send to client

        const allTickets = await db.query('SELECT * FROM tickets');

        // Send the retrieved tickets as a response
        res.status(200).json({ message: 'All tickets for the train', tickets: allTickets.rows });

        const seatCheck = await db.query(
            'SELECT * FROM tickets WHERE train_id = $1 AND seat_number = $2 AND status = $3',
            [trainId, seatId, 'available']
        );

        

        if (seatCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Seat not available' });
        }

        console.log('setcheck _>' +  seatCheck.rows);


        // Book the ticket (update status)
        await db.query(
            'UPDATE tickets SET status = $1 WHERE train_id = $2 AND seat_number = $3',
            ['booked', trainId, seatId]
        );

        console.log('after pool query');

        // Insert the booking record
        const result = await db.query(
            'INSERT INTO bookings (user_id, train_id, seat_id, status, booking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, trainId, seatCheck.rows[0].id, 'booked', new Date()]
        );

        console.log('after insert');    

        res.status(201).json({ message: 'Ticket booked successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error booking ticket:', error.message);

        res.status(500).json({ message: 'Internal Server Error'  });
    }
};
