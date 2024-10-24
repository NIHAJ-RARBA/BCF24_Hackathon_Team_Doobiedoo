CREATE TABLE trains (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,                 -- Train name (TEXT instead of VARCHAR)
    coach TEXT NOT NULL,                -- Coach information (TEXT instead of VARCHAR)
    routes TEXT NOT NULL,               -- Routes the train follows (TEXT instead of VARCHAR)
    schedule TIMESTAMP NOT NULL         -- Schedule of the train
);
