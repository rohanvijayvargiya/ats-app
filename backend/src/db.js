/**
 * Lightweight JSON-file data store.
 *
 * This keeps the project dependency-free for persistence (no native
 * bindings to compile, nothing extra to install) while still giving you
 * a real server-side source of truth that survives restarts.
 *
 * Swapping this for Postgres/MySQL/MongoDB later only means rewriting the
 * functions below (readAll/writeAll) — every route calls through this
 * module, never the file system directly.
 */
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

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

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ jobs: seedJobs, candidates: seedCandidates }, null, 2)
    );
  }
}

function readAll() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readAll, writeAll };
