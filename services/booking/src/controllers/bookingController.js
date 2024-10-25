const db = require('../db');  // Database connection
const axios = require('axios');  // To call the Auth and Train-Ticket Services
const Redlock = require('redlock');  // For distributed locking using Redis
const redis = require('redis');

// Create a Redis client using the environment variables for Redis connection
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

// Handle Redis client errors
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Connect to Redis
client.connect().catch(console.error);

// Example function where you use Redis locking mechanism (if using Redlock)
const Redlock = require('redlock');
const redlock = new Redlock([client], { retryCount: 3 });


exports.bookTicket2 = async (req, res) => {
    const { trainId, seatId, token } = req.body;

    try {
        console.log('Received request to book ticket with token:', token);

        // Step 1: Acquire a lock on the seat for booking (2 seconds timeout)
        const lock = await redlock.acquire([`locks:seat:${trainId}:${seatId}`], 2000);

        // Step 2: Validate the JWT token with the auth-service
        const authResponse = await axios.post('http://auth-service:5050/validate', {}, {
            headers: { 
                'Authorization': `Bearer ${token}`  // Ensure Bearer prefix is added for the token
            }
        });

        // If token validation fails, release the lock and return an error
        if (authResponse.status !== 200) {
            await lock.release();  // Ensure lock is released if validation fails
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Extract the email (username) from the validated token
        const { username } = authResponse.data;
        console.log('Token validated, booking for user:', username);

        // Step 3: Call the Train-Ticket Service to check seat availability
        const ticketResponse = await axios.post('http://train-ticket-service:5001/api/trains/seats', {
            trainId,
            seatId
        });

        // Check seat availability
        const seat = ticketResponse.data;
        if (!seat) {
            await lock.release();  // Release the lock if seat not found
            return res.status(404).json({ message: 'Seat not found' });
        }

        if (seat.status !== 'available') {
            await lock.release();  // Release the lock if seat already booked
            return res.status(400).json({ message: 'Seat is already booked' });
        }

        // Step 4: If the seat is available, update the seat status in the shared database
        await db.query(
            'UPDATE tickets SET status = $1 WHERE train_id = $2 AND seat_number = $3',
            ['booked', trainId, seatId]
        );

        // Step 5: Insert the booking record into the bookings table
        const result = await db.query(
            'INSERT INTO bookings (user_id, train_id, seat_id, status, booking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, trainId, seat.id, 'booked', new Date()]
        );

        // Step 6: Send a booking confirmation email to the user's email
        await axios.post('http://notification-service:6000/api/notifications/send-email', {
            email: username,  // Use the email extracted from the token
            subject: "Booking Confirmation", 
            message: `Your booking for train ${trainId}, seat ${seatId} has been confirmed.`
        });

        // Step 7: Release the lock after the booking is successfully completed
        await lock.release();

        // Step 8: Respond with the booking confirmation
        res.status(201).json({ message: 'Booking successful', booking: result.rows[0] });
    } catch (error) {
        console.error('Error booking ticket:', error.message);

        // Ensure the lock is released in case of an error
        if (error instanceof redlock.LockError) {
            console.error("Lock acquisition failed");
        }
        
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Optional fallback method for regular booking without seat locking
exports.bookTicket = async (req, res) => {
    const { userId, trainId, seatId } = req.body;

    try {
        console.log('Received request to book ticket without Redis lock.');

        // Step 1: Check seat availability in the shared database
        const seatCheck = await db.query(
            'SELECT * FROM tickets WHERE train_id = $1 AND seat_number = $2 AND status = $3',
            [trainId, seatId, 'available']
        );

        if (seatCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Seat not available' });
        }

        console.log('Seat check passed, proceeding with booking.');

        // Step 2: Book the seat by updating its status in the database
        await db.query(
            'UPDATE tickets SET status = $1 WHERE train_id = $2 AND seat_number = $3',
            ['booked', trainId, seatId]
        );

        // Step 3: Insert the booking record into the bookings table
        const result = await db.query(
            'INSERT INTO bookings (user_id, train_id, seat_id, status, booking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, trainId, seatId, 'booked', new Date()]
        );

        console.log('Booking successfully inserted into the database.');

        // Step 4: Respond with the booking confirmation
        res.status(201).json({ message: 'Ticket booked successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error booking ticket:', error.message);

        // Return error message to the client
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
