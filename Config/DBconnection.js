
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

<<<<<<< Updated upstream
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) console.error('Error closing DB connection pool:', err.message);
    else console.log('MySQL pool closed.');
    process.exit(0);
  });
=======
const DB_NAME = process.env.DB_NAME || 'healthpal';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const AUTO_CREATE_DB = (process.env.DB_AUTOCREATE ?? 'true').toLowerCase() !== 'false';

const baseConfig = {
   host: process.env.DB_HOST || '127.0.0.1',
   port: DB_PORT,
   user: process.env.DB_USER || 'root',
   password: process.env.DB_PASSWORD || '',
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
   //charset: 'utf8mb4_general_ci',
   charset: 'utf8mb4_unicode_ci',

};

// Create DB if not exists
if (AUTO_CREATE_DB) {
   try {
      const adminConn = await mysql.createConnection({ ...baseConfig });
      await adminConn.query(
         `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` 
          CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
      );
      await adminConn.end();
      console.log(`Database ensured: ${DB_NAME}`);
   } catch (err) {
      console.error('Error ensuring database exists:', err);
      throw err;
   }
}

const dbConfig = { ...baseConfig, database: DB_NAME };
const pool = mysql.createPool(dbConfig);

try {
   const connection = await pool.getConnection();
   console.log('Database connected successfully');
   connection.release();
} catch (err) {
   console.error('Error connecting to the database:', err);
   throw err;
}

// Graceful shutdown
process.on('SIGINT', async () => {
   try {
      await pool.end();
      console.log('MySQL pool closed.');
   } catch (err) {
      console.error('Error closing DB connection pool:', err);
   } finally {
      process.exit(0);
   }
>>>>>>> Stashed changes
});

export default pool;
