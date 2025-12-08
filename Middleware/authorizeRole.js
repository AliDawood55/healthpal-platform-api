/**
 * @param {Array} allowedRoles - associated roles allowed to access the route
 */
export default function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.user.role) {
        return res.status(403).json({ error: "Role not assigned" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      console.error("authorizeRole error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
