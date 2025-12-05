import dotenv from 'dotenv';
import initSchema from './Config/initSchema.js';
import app from './src/app.js';

dotenv.config();
// app is assembled in src/app.js

// Ensure DB schema is present before starting server (can be disabled with SCHEMA_AUTOINIT=false)
if ((process.env.SCHEMA_AUTOINIT ?? 'true').toLowerCase() !== 'false') {
	await initSchema();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
