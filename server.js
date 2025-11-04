import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import medicationRoutes from './Routes/medication.routes.js';
import initSchema from './Config/initSchema.js';
import equipmentRoutes from './Routes/equipment.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/medications', medicationRoutes);
app.use('/api/equipment', equipmentRoutes);

app.get('/', (req, res) => res.send('HealthPal API is running 🚀'));

// Ensure DB schema is present before starting server (can be disabled with SCHEMA_AUTOINIT=false)
if ((process.env.SCHEMA_AUTOINIT ?? 'true').toLowerCase() !== 'false') {
	await initSchema();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
