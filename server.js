import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import http from 'http';

import medicationRoutes from './Routes/medication.routes.js';
import equipmentRoutes from './Routes/equipment.js';
import userRoutes from './Routes/UsersRouter.js';
import alertsRoutes from './Routes/AlertsRouter.js';
import guidesRoutes from './Routes/GuidesRouter.js';

import mentalRouter from './Routes/MentalHealthRouter.js';
import AuthRouter from './Routes/AuthRouter.js';
import MissionRouter from './Routes/MissionRouter.js';

import initSchema from './Config/initSchema.js';
import errorHandler from './Middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.send('HealthPal API is running 🚀'));

app.use('/api/medications', medicationRoutes);
app.use('/api/equipment', equipmentRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/guides', guidesRoutes);

app.use('/api/v1/mental', mentalRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/mission', MissionRouter);

// Global error handler (must be AFTER routes)
app.use(errorHandler);

// Server + DB init
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  const shouldInitSchema =
    (process.env.SCHEMA_AUTOINIT ?? 'true').toLowerCase() !== 'false';

  const start = async () => {
    if (shouldInitSchema) {
      await initSchema();
    }

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  };

  start().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

export default app; // useful for tests
