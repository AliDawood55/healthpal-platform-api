import mysql from 'mysql2/promise';

const DB_NAME = process.env.DB_NAME || 'healthpal_db';
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
   charset: 'utf8mb4_general_ci',
};

// Ensure database exists, then create a pool that uses it.
if (AUTO_CREATE_DB) {
   try {
      // Connect without database to create it if missing
      const adminConn = await mysql.createConnection({ ...baseConfig });
      await adminConn.query(
         `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
      );
      await adminConn.end();
      console.log(`Database ensured: ${DB_NAME}`);
   } catch (err) {
      console.error('Error ensuring database exists:', err);
      // for managed hosts without create privileges, fail loudly to surface misconfig
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

export default pool;
