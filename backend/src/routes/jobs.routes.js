const express = require("express");
const { readAll, writeAll } = require("../db");
const { requireHost } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

// GET /api/jobs — any signed-in user (host or member) can view jobs
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { jobs } = await readAll();
    res.json(jobs.sort((a, b) => (a.postedDate < b.postedDate ? 1 : -1)));
  })
);

// GET /api/jobs/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { jobs } = await readAll();
    const job = jobs.find((j) => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  })
);

// POST /api/jobs — HOST ONLY
router.post(
  "/",
  requireHost,
  asyncHandler(async (req, res) => {
    const { title, department, location, type, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required" });
    }
    const db = await readAll();
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
    await writeAll(db);
    res.status(201).json(job);
  })
);

// PUT /api/jobs/:id — HOST ONLY
router.put(
  "/:id",
  requireHost,
  asyncHandler(async (req, res) => {
    const db = await readAll();
    const idx = db.jobs.findIndex((j) => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Job not found" });
    db.jobs[idx] = { ...db.jobs[idx], ...req.body, id: db.jobs[idx].id };
    await writeAll(db);
    res.json(db.jobs[idx]);
  })
);

// DELETE /api/jobs/:id — HOST ONLY
router.delete(
  "/:id",
  requireHost,
  asyncHandler(async (req, res) => {
    const db = await readAll();
    const exists = db.jobs.some((j) => j.id === req.params.id);
    if (!exists) return res.status(404).json({ error: "Job not found" });
    db.jobs = db.jobs.filter((j) => j.id !== req.params.id);
    await writeAll(db);
    res.status(204).end();
  })
);

module.exports = router;
