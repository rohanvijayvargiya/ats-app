require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { requireAuth } = require("./middleware/auth");
const authRoutes = require("./routes/auth.routes");
const jobsRoutes = require("./routes/jobs.routes");
const candidatesRoutes = require("./routes/candidates.routes");
const resumeRoutes = require("./routes/resume.routes");

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// Signup/login are public. Everything else requires a valid session —
// job creation/editing/deletion additionally requires the "host" role
// (enforced inside jobs.routes.js itself).
app.use("/api/auth", authRoutes);
app.use("/api/jobs", requireAuth, jobsRoutes);
app.use("/api/candidates", requireAuth, candidatesRoutes);
app.use("/api/resume", requireAuth, resumeRoutes);

// Central error handler (e.g. multer file-type/size rejections, or any
// error forwarded by asyncHandler)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`ATS API listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — AI scoring will use the heuristic fallback.");
  }
  try {
    const { readAll } = require("./db");
    await readAll();
    console.log("Database check: OK — storage is reachable.");
  } catch (err) {
    console.error("Database check FAILED:", err.message);
    console.error(
      "If you're using Upstash, double-check UPSTASH_REDIS_REST_URL and " +
        "UPSTASH_REDIS_REST_TOKEN are correct and have no extra quotes or spaces."
    );
  }
});
