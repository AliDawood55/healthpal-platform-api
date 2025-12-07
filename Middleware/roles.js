export default function requireRole(allowed = []) {
  const set = new Set(Array.isArray(allowed) ? allowed : [allowed]);
  return (req, res, next) => {
    // Simple header-based role for dev: X-Role: admin|ngo|user
    const role = (req.headers['x-role'] || 'user').toString();
    if (!set.size || set.has(role)) return next();
    return res.status(403).json({ error: 'Forbidden: insufficient role', required: [...set], got: role });
  };
}
