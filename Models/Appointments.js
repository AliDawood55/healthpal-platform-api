const { initDB } = require('../Config/DBconnection');

module.exports = {
    async exists(id) {
        const db = await initDB();
        const [rows] = await db.query('SELECT 1 FROM appointments WHERE id = ? LIMIT 1', [id]);
        return rows.length > 0;
    }
};
