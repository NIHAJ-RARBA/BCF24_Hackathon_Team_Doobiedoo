CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    train_id INT NOT NULL,              -- Link to train table
    seat_number TEXT,                   -- Seat number (TEXT instead of VARCHAR)
    status TEXT DEFAULT 'available',    -- Status of the ticket (TEXT instead of VARCHAR)
    FOREIGN KEY (train_id) REFERENCES trains(id)
);
