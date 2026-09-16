const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Not signed in." });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

// Use AFTER requireAuth on routes only "host" accounts may use (posting or
// deleting jobs). Regular "member" accounts can view everything but not
// create/remove job postings.
function requireHost(req, res, next) {
  if (req.userRole !== "host") {
    return res.status(403).json({ error: "Only host accounts can do that." });
  }
  next();
}

module.exports = { requireAuth, requireHost };
