export default function auth(req, res, next) {
  if (req.user) {
    return next();
  }

  const idHeader = req.headers['x-user-id'];
  const roleHeader = req.headers['x-role'];

  const id = idHeader ? parseInt(idHeader, 10) : 1;
  const role = roleHeader ? roleHeader.toString() : 'patient';

  req.user = { id, role };

  next();
}
