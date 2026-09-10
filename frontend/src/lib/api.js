const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch (_) {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => request("/health"),

  // Jobs
  getJobs: () => request("/jobs"),
  createJob: (job) => request("/jobs", { method: "POST", body: JSON.stringify(job) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),

  // Candidates
  getCandidates: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/candidates${qs ? `?${qs}` : ""}`);
  },
  createCandidate: (candidate) =>
    request("/candidates", { method: "POST", body: JSON.stringify(candidate) }),
  updateCandidate: (id, updates) =>
    request(`/candidates/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  deleteCandidate: (id) => request(`/candidates/${id}`, { method: "DELETE" }),

  // Resume parsing + AI scoring
  parseResumeFile: (file) => {
    const form = new FormData();
    form.append("resume", file);
    return request("/resume/parse", { method: "POST", body: form });
  },
  parseResumeText: (text) =>
    request("/resume/parse", { method: "POST", body: JSON.stringify({ text }) }),
  scoreResume: (resumeText, jobId) =>
    request("/resume/score", { method: "POST", body: JSON.stringify({ resumeText, jobId }) }),
};
