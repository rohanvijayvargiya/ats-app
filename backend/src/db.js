/**
 * Persistent data store.
 *
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set, everything
 * is stored in a free Upstash Redis database (one JSON blob under the key
 * "ats-db") — this survives server restarts, which matters because
 * Render's free tier wipes its local disk every time the service spins
 * down from inactivity and back up. Without this, seed data and any
 * deletions you make keep reverting every time the server restarts.
 *
 * If those env vars aren't set, we fall back to a local JSON file so the
 * app still runs for local development without extra signup — but this
 * fallback does NOT persist reliably once deployed to Render's free tier.
 */
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

if (!useUpstash) {
  console.warn(
    "WARNING: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. " +
      "Falling back to a local JSON file, which does NOT persist on Render's " +
      "free tier across restarts — jobs, candidates, and accounts will " +
      "periodically reset to the seed data. Set up a free Upstash Redis " +
      "database (see README) to fix this permanently."
  );
}

const seedJobs = [
  {
    id: "j1",
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Bengaluru, IN (Hybrid)",
    type: "Full-time",
    description:
      "We're looking for a Frontend Engineer with 3+ years of experience in React, TypeScript and modern CSS. You'll build customer-facing dashboards, collaborate with design on UI/UX, and help scale our component library. Experience with GraphQL and Tailwind is a plus. Strong communication and Agile experience required.",
    postedDate: "2026-08-12",
  },
  {
    id: "j2",
    title: "Backend Engineer (Python)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Seeking a Backend Engineer skilled in Python, Django or Flask, PostgreSQL and AWS. You'll own core services, design REST and GraphQL APIs, and improve CI/CD pipelines. Docker and Kubernetes experience preferred. 2+ years experience.",
    postedDate: "2026-08-20",
  },
  {
    id: "j3",
    title: "Product Designer",
    department: "Design",
    location: "Jaipur, IN (On-site)",
    type: "Full-time",
    description:
      "Product Designer to lead end-to-end UI/UX for our platform. Figma expertise required, along with a strong portfolio, collaboration with Product Management, and comfort working in an Agile/Scrum environment.",
    postedDate: "2026-08-28",
  },
];

const seedCandidates = [
  {
    id: "c1", jobId: "j1", name: "Ananya Sharma", email: "ananya.sharma@example.com",
    phone: "+91 98765 43210", experienceYears: 4,
    skills: ["React", "TypeScript", "Tailwind", "GraphQL", "Git"],
    stage: "Interview", score: 88,
    pros: ["Strong React & TypeScript background", "Has shipped production design systems", "Good communication signals in resume"],
    cons: ["No direct GraphQL production experience mentioned"],
    resumeText: "Ananya Sharma — Frontend Engineer with 4 years experience in React, TypeScript, Tailwind and Git. Built component libraries and dashboards.",
    createdAt: "2026-08-14T09:00:00.000Z",
  },
  {
    id: "c2", jobId: "j1", name: "Rohit Verma", email: "rohit.verma@example.com",
    phone: "+91 90000 11122", experienceYears: 2,
    skills: ["JavaScript", "React", "CSS"],
    stage: "Applied", score: 61,
    pros: ["Solid React fundamentals"], cons: ["Below preferred 3+ years experience", "No TypeScript listed"],
    resumeText: "Rohit Verma, 2 years experience with JavaScript, React and CSS building small business websites.",
    createdAt: "2026-08-30T09:00:00.000Z",
  },
  {
    id: "c3", jobId: "j2", name: "Kabir Malhotra", email: "kabir.m@example.com",
    phone: "+91 99887 76655", experienceYears: 5,
    skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
    stage: "Screening", score: 91,
    pros: ["Excellent match on core stack", "5 years backend experience", "AWS + Docker production experience"],
    cons: ["Kubernetes not explicitly mentioned"],
    resumeText: "Kabir Malhotra — Backend Engineer, 5 years, Python, Django, PostgreSQL, AWS, Docker. Led API design for fintech platform.",
    createdAt: "2026-08-22T09:00:00.000Z",
  },
  {
    id: "c4", jobId: "j3", name: "Meera Iyer", email: "meera.iyer@example.com",
    phone: "+91 91234 56789", experienceYears: 3,
    skills: ["Figma", "UI/UX", "Product Management"],
    stage: "Offered", score: 84,
    pros: ["Strong Figma portfolio", "Cross-functional PM collaboration experience"],
    cons: ["Limited Scrum ceremony experience mentioned"],
    resumeText: "Meera Iyer, Product Designer, 3 years, expert in Figma and UI/UX, worked closely with Product Management teams.",
    createdAt: "2026-08-29T09:00:00.000Z",
  },
];

function normalize(data) {
  if (!data || typeof data !== "object") data = {};
  if (!Array.isArray(data.jobs)) data.jobs = seedJobs;
  if (!Array.isArray(data.candidates)) data.candidates = seedCandidates;
  if (!Array.isArray(data.users)) data.users = [];
  return data;
}

function ensureLocalDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ jobs: seedJobs, candidates: seedCandidates, users: [] }, null, 2)
    );
  }
}

async function readAll() {
  if (useUpstash) {
    const res = await fetch(`${UPSTASH_URL}/get/ats-db`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Upstash read failed (${res.status})`);
    const json = await res.json();
    if (!json.result) return { jobs: seedJobs, candidates: seedCandidates, users: [] };
    try {
      return normalize(JSON.parse(json.result));
    } catch {
      return { jobs: seedJobs, candidates: seedCandidates, users: [] };
    }
  }
  ensureLocalDB();
  return normalize(JSON.parse(fs.readFileSync(DB_PATH, "utf-8")));
}

async function writeAll(data) {
  if (useUpstash) {
    const res = await fetch(`${UPSTASH_URL}/set/ats-db`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Upstash write failed (${res.status})`);
    return;
  }
  ensureLocalDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readAll, writeAll };
