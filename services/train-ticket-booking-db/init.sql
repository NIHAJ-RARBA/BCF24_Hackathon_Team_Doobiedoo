CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    coach TEXT NOT NULL,
    routes TEXT NOT NULL,
    schedule TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    train_id INT NOT NULL,
    seat_number TEXT,
    status TEXT DEFAULT 'available',
    FOREIGN KEY (train_id) REFERENCES trains(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    train_id INT NOT NULL,
    seat_id INT NOT NULL,
    status TEXT NOT NULL,
    booking_time TIMESTAMP NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id),
    FOREIGN KEY (seat_id) REFERENCES tickets(id)
);

-- Insert dummy data for trains
INSERT INTO
    trains (name, coach, routes, schedule)
VALUES
    (
        'Express Train 1',
        'A1',
        'City1-City2',
        '2024-10-01 10:00:00'
    ),
    (
        'Express Train 2',
        'B1',
        'City3-City4',
        '2024-10-01 15:00:00'
    );

-- Insert dummy data for tickets
INSERT INTO
    tickets (train_id, seat_number, status)
VALUES
    (1, 'A1-01', 'available'),
    (1, 'A1-02', 'available'),
    (2, 'B1-01', 'available'),
    (2, 'B1-02', 'available');