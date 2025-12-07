// /Middleware/auth.js
export default function auth(req, res, next) {
  // Temporary fake auth (for testing)
  // In real use, you'd verify a JWT or session
  req.user = { id: 1, name: 'Test User' };
  next();
}
