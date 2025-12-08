// scripts/generateDonorToken.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super_long_random_secret_change_me'; // نفس الموجود في .env

const payload = {
  id: 3,          
  role: 'donor'   
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

console.log('DONOR TEST TOKEN:\n', token);
