const { Pool } = require('pg');

/**
 * Cliente compartido de PostgreSQL
 * Infraestructura compartida entre módulos
 */
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Crear un objeto que contenga tanto el pool como el método query
const postgresClient = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};

module.exports = postgresClient;
