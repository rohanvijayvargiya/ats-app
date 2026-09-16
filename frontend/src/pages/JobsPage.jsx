import React, { useState } from "react";
import { Plus, Building2, MapPin, Trash2 } from "lucide-react";
import { Pill } from "../components/ScoreRing";
import { api } from "../lib/api";

const EMPTY_FORM = { title: "", department: "", location: "", type: "Full-time", description: "" };

export function JobsPage({ jobs, setJobs, candidates, notify, isHost }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      notify("Add at least a title and description.", "error");
      return;
    }
    setSaving(true);
    try {
      const job = await api.createJob(form);
      setJobs((prev) => [job, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      notify(`"${job.title}" posted.`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await api.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      notify("Job removed.");
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <div className="max-w-6xl">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold font-serif">Job openings</h1>
          <p className="mt-1 text-muted">
            {isHost
              ? "Create and manage the roles you're hiring for."
              : "Browse open roles. Only host accounts can post or remove jobs."}
          </p>
        </div>
        {isHost && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-tealdeep"
          >
            <Plus size={16} /> New job
          </button>
        )}
      </header>

      {isHost && showForm && (
        <form onSubmit={submit} className="rounded-xl p-5 mb-8 bg-white border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Job title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Remote / Jaipur, IN"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1 text-muted">Employment type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-white border border-border"
              >
                {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium block mb-1 text-muted">Job description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Responsibilities, required skills, experience level..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none border border-border"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-tealdeep disabled:opacity-50">
              {saving ? "Posting…" : "Post job"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((j) => {
          const applicants = candidates.filter((c) => c.jobId === j.id).length;
          return (
            <div key={j.id} className="rounded-xl p-5 flex flex-col gap-3 bg-white border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold font-serif">{j.title}</h3>
                  <div className="flex items-center gap-3 text-xs mt-1 text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} /> {j.department || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {j.location || "—"}
                    </span>
                  </div>
                </div>
                {isHost && (
                  <button onClick={() => remove(j.id)} className="p-1.5 rounded-md hover:bg-red-50">
                    <Trash2 size={15} color="#C23A4D" />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-[#3A3F49]">
                {j.description.length > 180 ? j.description.slice(0, 180) + "…" : j.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Pill color="#0A5F5E">{j.type}</Pill>
                <span className="text-xs font-medium text-muted">
                  {applicants} applicant{applicants !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
        {jobs.length === 0 && (
          <div className="col-span-2 text-center py-16 rounded-xl border border-dashed border-border text-muted">
            {isHost
              ? "No open roles yet. Post your first job to start receiving candidates."
              : "No open roles yet. Check back once a host posts one."}
          </div>
        )}
      </div>
    </div>
  );
}
