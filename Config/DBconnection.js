const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'HealthpalPlatformApi_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4_general_ci',
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
     if (err) {
        console.error('Error connecting to the database:', err);
     }else {
        console.log('Database connected successfully');
        connection.release();
     }
});

module.exports = pool;
