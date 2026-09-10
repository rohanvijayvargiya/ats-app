# Hireline — Applicant Tracking System (Full-Stack)

A real full-stack ATS: a Node/Express REST API backend with its own
persisted data store, and a React (Vite) frontend that talks to it over
HTTP. No third-party backend service required to run it locally.

```
ats-fullstack/
├── backend/     Express API — jobs, candidates, resume parsing, AI scoring
└── frontend/    React (Vite + Tailwind) UI
```

## Features

- **Job Management** — create, list, and delete open roles (title, department,
  location, type, description), stored server-side.
- **Candidate Pipeline** — a Kanban board (Applied → Screening → Interview →
  Offered → Rejected) with drag-and-drop; stage changes are saved via the API.
- **Resume Parser** — drag-and-drop upload of `.pdf`, `.docx`, or `.txt`
  resumes. The server extracts the raw text (via `pdf-parse` / `mammoth`) and
  pulls out name, email, phone, years of experience, and a skills list.
- **AI Scoring** — compares a resume against a job description using the
  Anthropic API (called server-side, so your API key never touches the
  browser) and returns a 0–100 match score with pros/cons. If no API key is
  configured, or the call fails, it automatically falls back to a transparent
  keyword-overlap heuristic so the feature always works.

## Prerequisites

- Node.js 18 or later (needed for native `fetch` in the backend)
- npm

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and, optionally, set:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at https://console.anthropic.com/settings/keys. Leaving it blank is
fine — AI scoring just uses the heuristic fallback instead.

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:4000`. It stores data in
`backend/data/db.json`, which is created automatically (with sample jobs and
candidates) on first run. Check it's alive:

```bash
curl http://localhost:4000/api/health
```

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

By default the frontend expects the API at `http://localhost:4000/api` —
change `VITE_API_URL` in `frontend/.env` if you run the backend elsewhere.

## API reference

| Method | Path                    | Description                              |
|--------|-------------------------|-------------------------------------------|
| GET    | /api/jobs                | List all jobs                            |
| POST   | /api/jobs                | Create a job                             |
| DELETE | /api/jobs/:id             | Delete a job                             |
| GET    | /api/candidates           | List candidates (`?jobId=&stage=&q=`)    |
| POST   | /api/candidates           | Add a candidate to a pipeline            |
| PATCH  | /api/candidates/:id        | Update a candidate (e.g. move stage)     |
| DELETE | /api/candidates/:id        | Remove a candidate                       |
| POST   | /api/resume/parse          | Extract fields from a resume file/text   |
| POST   | /api/resume/score          | AI (or heuristic) score vs. a job        |

## Notes on going to production

- **Database**: data currently lives in a single JSON file
  (`backend/src/db.js`) to keep setup dependency-free. For production, swap
  `readAll`/`writeAll` for a real database (Postgres via `pg`/Prisma, or
  MongoDB) — no other file needs to change since every route goes through
  that module.
- **Auth**: there's no login/authorization layer yet. Add a auth
  middleware (JWT/session-based) in front of the `/api` routes before
  exposing this beyond your own machine.
- **File storage**: resumes are parsed in memory and never written to disk.
  If you want to keep the original files (not just extracted text), add
  storage (local disk or S3) in `resume.routes.js`.
- **Deployment**: the backend is a standard Express app (deploy to Render,
  Railway, Fly.io, a VPS, etc.); the frontend is a standard Vite build
  (`npm run build` → static hosting on Vercel, Netlify, etc.), pointed at
  your deployed API via `VITE_API_URL`.
