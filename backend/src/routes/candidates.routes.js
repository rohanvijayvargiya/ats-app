const express = require("express");
const { readAll, writeAll } = require("../db");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();
const STAGES = ["Applied", "Screening", "Interview", "Offered", "Rejected"];

// GET /api/candidates?jobId=&stage=&q=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { candidates } = await readAll();
    const { jobId, stage, q } = req.query;
    let result = candidates;
    if (jobId) result = result.filter((c) => c.jobId === jobId);
    if (stage) result = result.filter((c) => c.stage === stage);
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(String(q).toLowerCase()));
    res.json(result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  })
);

// POST /api/candidates
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { jobId, name, email, phone, experienceYears, skills, resumeText, score, pros, cons, stage } =
      req.body || {};
    if (!jobId || !name) {
      return res.status(400).json({ error: "jobId and name are required" });
    }
    const db = await readAll();
    if (!db.jobs.some((j) => j.id === jobId)) {
      return res.status(400).json({ error: "jobId does not match an existing job" });
    }
    const candidate = {
      id: `c${Date.now()}`,
      jobId,
      name,
      email: email || "",
      phone: phone || "",
      experienceYears: experienceYears || 0,
      skills: Array.isArray(skills) ? skills : [],
      stage: STAGES.includes(stage) ? stage : "Applied",
      score: typeof score === "number" ? score : 0,
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      resumeText: resumeText || "",
      createdAt: new Date().toISOString(),
    };
    db.candidates.unshift(candidate);
    await writeAll(db);
    res.status(201).json(candidate);
  })
);

// PATCH /api/candidates/:id  (partial update — used for stage moves on the Kanban board)
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readAll();
    const idx = db.candidates.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Candidate not found" });

    const updates = { ...req.body };
    if (updates.stage && !STAGES.includes(updates.stage)) {
      return res.status(400).json({ error: `stage must be one of: ${STAGES.join(", ")}` });
    }
    db.candidates[idx] = { ...db.candidates[idx], ...updates, id: db.candidates[idx].id };
    await writeAll(db);
    res.json(db.candidates[idx]);
  })
);

// DELETE /api/candidates/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = await readAll();
    const exists = db.candidates.some((c) => c.id === req.params.id);
    if (!exists) return res.status(404).json({ error: "Candidate not found" });
    db.candidates = db.candidates.filter((c) => c.id !== req.params.id);
    await writeAll(db);
    res.status(204).end();
  })
);

module.exports = router;
