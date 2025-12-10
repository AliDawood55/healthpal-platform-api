// app.js
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Routers (v1)
import usersRouter from './Routes/UsersRouter.js';
import consultRouter from './Routes/ConsultRouter.js';
import sponsorshipRouter from './Routes/SponsorshipRouter.js';
import appointmentRouter from './Routes/AppointmentRouter.js';

// Routers (non-versioned / legacy)
import medicationRoutes from './Routes/medication.routes.js';
import equipmentRoutes from './Routes/equipment.js';
import alertsRoutes from './Routes/AlertsRouter.js';
import guidesRoutes from './Routes/GuidesRouter.js';

import mentalRouter from './Routes/MentalHealthRouter.js';
import AuthRouter from './Routes/AuthRouter.js';
import MissionRouter from './Routes/MissionRouter.js';
import openfdaRouter from './Routes/openfdaRouter.js';
import supportGroupsRouter from './Routes/SupportGroupsRouter.js';
import supportGroupMembersRouter from './Routes/SupportGroupMembersRouter.js';

// Middleware
import { notFound } from './Middleware/logger.js';
import errorHandler from './Middleware/errorHandler.js';
import authenticate from './Middleware/authenticate.js';
import auth from './Middleware/auth.js';

import './Config/DBconnection.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Swagger
const swaggerDocument = YAML.load('./docs/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health routes
app.get('/', (_req, res) => {
  res.json({ message: 'HealthPal API', version: '1.0' });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// Auth middlewares
app.use(authenticate.optional);
app.use(auth);

// V1 routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/consult', consultRouter);
app.use('/api/v1/sponsorship', sponsorshipRouter);
app.use('/api/v1/support-groups', supportGroupMembersRouter);

app.use('/api/v1/mental', mentalRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/mission', MissionRouter);

// Non-versioned routes
app.use('/api/medications', medicationRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/v1/medication/openfda', openfdaRouter);

// SupportGroups (non-versioned)
app.use('/api/support-groups', supportGroupsRouter);

// 404 + Error handler
app.use(notFound);
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;