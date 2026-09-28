const hasRole = (user, role) => user?.role === role || user?.role?.name === role;

const requireApiLogin = () => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  return next();
};

const requirePageLogin = () => (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
  }

  return next();
};

const requireApiRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!hasRole(req.user, role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
};

const requirePageRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
  }

  if (!hasRole(req.user, role)) {
    return res.status(403).render('errors/403', { title: 'Forbidden' });
  }

  return next();
};

export { requireApiLogin, requireApiRole, requirePageLogin, requirePageRole };