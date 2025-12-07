import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import usersRouter from './Routes/UsersRouter.js';
import consultRouter from './Routes/ConsultRouter.js';
import sponsorshipRouter from './Routes/SponsorshipRouter.js';

import mentalRouter from './Routes/MentalHealthRouter.js';
import AuthRouter from './Routes/AuthRouter.js';
import MissionRouter from './Routes/MissionRouter.js';

import { notFound } from './Middleware/logger.js';
import errorHandler from './Middleware/errorHandler.js';

dotenv.config();
console.log('DEBUG ENV CHECK =', process.env.DB_NAME, process.env.DB_USER);

const app = express();

const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({ message: 'HealthPal API', version: '1.0' });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/consult', consultRouter);
app.use('/api/v1/sponsorship', sponsorshipRouter);

app.use('/api/v1/mental', mentalRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/mission', MissionRouter);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
