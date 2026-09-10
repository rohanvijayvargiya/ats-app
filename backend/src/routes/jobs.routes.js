const express = require("express");
const { readAll, writeAll } = require("../db");

const router = express.Router();

// GET /api/jobs
router.get("/", (req, res) => {
  const { jobs } = readAll();
  res.json(jobs.sort((a, b) => (a.postedDate < b.postedDate ? 1 : -1)));
});

// GET /api/jobs/:id
router.get("/:id", (req, res) => {
  const { jobs } = readAll();
  const job = jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// POST /api/jobs
router.post("/", (req, res) => {
  const { title, department, location, type, description } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ error: "title and description are required" });
  }
  const db = readAll();
  const job = {
    id: `j${Date.now()}`,
    title,
    department: department || "",
    location: location || "",
    type: type || "Full-time",
    description,
    postedDate: new Date().toISOString().slice(0, 10),
  };
  db.jobs.unshift(job);
  writeAll(db);
  res.status(201).json(job);
});

// PUT /api/jobs/:id
router.put("/:id", (req, res) => {
  const db = readAll();
  const idx = db.jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Job not found" });
  db.jobs[idx] = { ...db.jobs[idx], ...req.body, id: db.jobs[idx].id };
  writeAll(db);
  res.json(db.jobs[idx]);
});

// DELETE /api/jobs/:id
router.delete("/:id", (req, res) => {
  const db = readAll();
  const exists = db.jobs.some((j) => j.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Job not found" });
  db.jobs = db.jobs.filter((j) => j.id !== req.params.id);
  // Cascade: also drop candidates tied only to this job's pipeline view.
  // (Kept simple — candidates rows are left intact so history isn't lost,
  // but you can uncomment the line below to hard-delete them too.)
  // db.candidates = db.candidates.filter((c) => c.jobId !== req.params.id);
  writeAll(db);
  res.status(204).end();
});

module.exports = router;
