import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export default function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}


authenticate.optional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  let token;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (typeof authHeader === 'string') {
    token = authHeader.trim();
  }

  if (!token) return next();

  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    if (typeof console.debug === 'function') {
      console.debug('Optional Authorization header present but not a JWT; skipping verification');
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    if (typeof console.debug === 'function') {
      console.debug("Invalid optional token:", err.message);
    } else {
      console.log("Invalid optional token:", err.message);
    }
  }
  next();
};
