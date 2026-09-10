const express = require("express");
const upload = require("../middleware/upload");
const { readAll } = require("../db");
const { extractTextFromFile, parseResumeText } = require("../utils/parseResume");
const { scoreResume } = require("../utils/aiScore");

const router = express.Router();

// POST /api/resume/parse
// Accepts EITHER a multipart file field named "resume" (pdf/docx/txt)
// OR a JSON body { "text": "..." } with already-pasted resume text.
router.post("/parse", upload.single("resume"), async (req, res) => {
  try {
    let text;
    if (req.file) {
      text = await extractTextFromFile(req.file.buffer, req.file.originalname);
    } else if (req.body && req.body.text) {
      text = req.body.text;
    } else {
      return res.status(400).json({ error: "Provide a 'resume' file or a 'text' field." });
    }
    if (!text || !text.trim()) {
      return res.status(422).json({ error: "No extractable text found in the resume." });
    }
    const parsed = parseResumeText(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to parse resume." });
  }
});

// POST /api/resume/score  { resumeText, jobId }
router.post("/score", async (req, res) => {
  const { resumeText, jobId } = req.body || {};
  if (!resumeText || !jobId) {
    return res.status(400).json({ error: "resumeText and jobId are required" });
  }
  const { jobs } = readAll();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const result = await scoreResume(resumeText, job);
  res.json(result);
});

module.exports = router;
