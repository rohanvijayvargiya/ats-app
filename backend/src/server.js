require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

app.use("/api/jobs", jobsRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/resume", resumeRoutes);

// Central error handler (e.g. multer file-type/size rejections)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`ATS API listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — AI scoring will use the heuristic fallback.");
  }
});
