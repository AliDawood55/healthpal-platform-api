require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usersRouter = require('./Routes/UsersRouter');
const consultRouter = require('./Routes/ConsultRouter');

const { notFound, errorHandler } = require('./Middleware/logger');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/consult', consultRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});

module.exports = app;
