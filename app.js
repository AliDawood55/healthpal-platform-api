import dotenv from 'dotenv';
dotenv.config();
console.log("DEBUG ENV CHECK =", process.env.DB_NAME, process.env.DB_USER);


import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import usersRouter from './Routes/UsersRouter.js';
import consultRouter from './Routes/ConsultRouter.js';
import sponsorshipRouter from './Routes/SponsorshipRouter.js';

import { notFound, errorHandler } from './Middleware/logger.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/consult', consultRouter);
app.use('/api/v1/sponsorship', sponsorshipRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});

export default app;
