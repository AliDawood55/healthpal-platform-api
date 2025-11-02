
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthpalplatformapi_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10', 10),
  queueLimit: 0,
  charset: 'utf8mb4_general_ci',
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully.');
    connection.release();
  }
});

process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) console.error('Error closing DB connection pool:', err.message);
    else console.log('MySQL pool closed.');
    process.exit(0);
  });
});

export default pool;
