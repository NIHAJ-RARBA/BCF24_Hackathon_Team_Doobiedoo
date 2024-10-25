const db = require('../db');
const axios = require('axios'); // To call the Train-Ticket Service



exports.bookTicket2 = async (req, res) => {
    const { userId, trainId, seatId, token } = req.body;

    try {
        console.log('before pool query,', token);

        // Validate the token with the auth-service
        const authResponse = await axios.post('http://auth-service:5050/validate', {}, {
            headers: { 
                'Authorization': `Bearer ${token}`  // Ensure Bearer prefix is added
            }
        });

        // If the token is invalid, return an error
        if (authResponse.status !== 200) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Extract the email (username) from the validated token
        const { username } = authResponse.data;

        console.log('before pool query');

        // Step 1: Call Train-Ticket Service to check seat availability via HTTP
        const ticketResponse = await axios.post('http://train-ticket-service:5001/api/trains/seats', {
            trainId,
            seatId
        });

        console.log('after pool query');

        // Step 2: Check the seat availability in the response from Train-Ticket Service
        const seat = ticketResponse.data;

        console.log('seat ->' + seat);

        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        if (seat.status !== 'available') {
            return res.status(400).json({ message: 'Seat is already booked' });
        }

        // Step 3: If the seat is available, proceed to update the shared database
        await db.query(
            'UPDATE tickets SET status = $1 WHERE train_id = $2 AND seat_number = $3',
            ['booked', trainId, seatId]
        );

        // Step 4: Insert the booking record into the bookings table
        const result = await db.query(
            'INSERT INTO bookings (user_id, train_id, seat_id, status, booking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, trainId, seat.id, 'booked', new Date()]
        );

        // Step 5: Send a booking confirmation email to the user's email (from the token)
        await axios.post('http://notification-service:6000/api/notifications/send-email', {
            email: username,  // Use the email extracted from the token
            subject: "Booking Confirmation", 
            message: `Your booking for train ${trainId}, seat ${seatId} has been confirmed.`
        });

        // Step 6: Respond with the booking confirmation
        res.status(201).json({ message: 'Booking successful', booking: result.rows[0] });
    } catch (error) {
        console.error('Error booking ticket:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


exports.bookTicket = async (req, res) => {
    const { userId, trainId, seatId } = req.body;

    try {
        // Check if the seat is available (example logic)
        //get all tickets and send to client
        
        console.log('before pool query');

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
