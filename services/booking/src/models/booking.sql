CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    -- User making the booking
    train_id INT NOT NULL,
    -- Link to train table
    seat_id INT NOT NULL,
    -- Link to seat (ticket) table
    status TEXT NOT NULL,
    -- Booking status (TEXT instead of VARCHAR)
    booking_time TIMESTAMP NOT NULL,
    -- When the booking was made
    FOREIGN KEY (train_id) REFERENCES trains(id),
    FOREIGN KEY (seat_id) REFERENCES tickets(id)
);