import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
   path: path.resolve(__dirname, '../.env'),
});

console.log("ENV LOADED IN DB FILE:", {
   DB_NAME: process.env.DB_NAME,
   DB_USER: process.env.DB_USER,
   DB_HOST: process.env.DB_HOST,
});

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
    charset: 'utf8mb4_unicode_ci',
};

if (AUTO_CREATE_DB) {
   try {
      const adminConn = await mysql.createConnection({ ...baseConfig });
      await adminConn.query(
         `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` 
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
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

process.on('SIGINT', async () => {
   try {
      await pool.end();
      console.log('MySQL pool closed.');
   } catch (err) {
      console.error('Error closing DB connection pool:', err);
   } finally {
      process.exit(0);
   }

});

export default pool;
