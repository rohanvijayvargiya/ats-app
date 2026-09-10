const { extractSkills } = require("./parseResume");

function scoreColorBand(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "moderate";
  return "weak";
}

/** Deterministic keyword-overlap score, used when no API key is set or the AI call fails. */
function heuristicScore(resumeSkills, job) {
  const jdSkills = extractSkills(job.description);
  const overlap = resumeSkills.filter((s) => jdSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s));
  const pct = jdSkills.length ? Math.round((overlap.length / jdSkills.length) * 100) : 50;
  const score = Math.max(15, Math.min(97, pct));
  return {
    score,
    pros: overlap.length
      ? [`Matches ${overlap.length} of ${jdSkills.length} key skills: ${overlap.slice(0, 4).join(", ")}`]
      : ["Some general relevance to the role"],
    cons: missing.length
      ? [`Missing skills mentioned in the JD: ${missing.slice(0, 4).join(", ")}`]
      : ["No major gaps detected against listed skills"],
    summary: "Keyword-match estimate (AI scoring was not used).",
    source: "heuristic",
    band: scoreColorBand(score),
  };
}

/** Calls the Anthropic Messages API directly from the server. */
async function callClaude(resumeText, job) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("ANTHROPIC_API_KEY is not configured");
    err.code = "NO_API_KEY";
    throw err;
  }

  const prompt =
    `Job title: ${job.title}\nJob description:\n${job.description}\n\n` +
    `Candidate resume:\n${resumeText}\n\n` +
    `Compare the resume to the job description. Respond with ONLY valid JSON ` +
    `(no markdown fences, no commentary), exactly in this shape:\n` +
    `{"score": <integer 0-100>, "pros": [<2-3 short strings>], "cons": [<2-3 short strings>], "summary": "<one sentence>"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Anthropic API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  const parsed = JSON.parse(text);
  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  return {
    score,
    pros: Array.isArray(parsed.pros) ? parsed.pros : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons : [],
    summary: parsed.summary || "",
    source: "ai",
    band: scoreColorBand(score),
  };
}

/**
 * Scores a resume against a job. Tries the real AI call first; if the API
 * key is missing or the call fails for any reason, falls back to a
 * transparent keyword-overlap heuristic so the feature never hard-fails.
 */
async function scoreResume(resumeText, job) {
  const resumeSkills = extractSkills(resumeText);
  try {
    return await callClaude(resumeText, job);
  } catch (err) {
    const fallback = heuristicScore(resumeSkills, job);
    fallback.warning =
      err.code === "NO_API_KEY"
        ? "Set ANTHROPIC_API_KEY in backend/.env to enable real AI scoring."
        : `AI scoring failed (${err.message}); showing a heuristic estimate.`;
    return fallback;
  }
}

module.exports = { scoreResume, heuristicScore };
