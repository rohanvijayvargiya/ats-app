const { verifyToken } = require("../utils/jwt");
const { readAll } = require("../db");

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
// deleting jobs). Checks the CURRENT role stored in the database, not the
// role baked into the login token when it was issued — this way, a role
// change (or a token issued during an earlier version of this app) can
// never leave someone with stale, incorrect permissions.
async function requireHost(req, res, next) {
  try {
    const { users } = await readAll();
    const user = users.find((u) => u.id === req.userId);
    if (!user || user.role !== "host") {
      return res.status(403).json({ error: "Only host accounts can do that." });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, requireHost };
