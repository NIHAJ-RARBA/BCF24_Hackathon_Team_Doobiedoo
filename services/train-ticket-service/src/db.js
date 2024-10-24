const { Pool } = require('pg');
require('dotenv').config();  // Load environment variables from .env

// Create a connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,        // Username for the database
  host: process.env.DB_HOST,        // Hostname of the PostgreSQL database
  database: process.env.DB_NAME,    // Name of the shared database
  password: process.env.DB_PASSWORD,  // Password for the database
  port: process.env.DB_PORT || 5432,  // Default PostgreSQL port
});

// Export the pool for querying the database
module.exports = pool;
