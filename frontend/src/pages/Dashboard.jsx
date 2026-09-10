import React from "react";
import { Briefcase, Users, Clock, TrendingUp, ChevronRight, Building2, MapPin } from "lucide-react";
import { Pill } from "../components/ScoreRing";
import { STAGES, STAGE_COLOR } from "../lib/constants";

export function Dashboard({ jobs, candidates, setView }) {
  const avgScore = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + (c.score || 0), 0) / candidates.length)
    : 0;
  const inInterview = candidates.filter((c) => c.stage === "Interview").length;
  const stageCounts = STAGES.map((s) => ({
    stage: s,
    count: candidates.filter((c) => c.stage === s).length,
  }));
  const maxCount = Math.max(1, ...stageCounts.map((s) => s.count));

  const stats = [
    { label: "Open Roles", value: jobs.length, icon: Briefcase },
    { label: "Total Candidates", value: candidates.length, icon: Users },
    { label: "In Interview", value: inInterview, icon: Clock },
    { label: "Avg. Match Score", value: `${avgScore}%`, icon: TrendingUp },
  ];

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold font-serif">Good to see you back.</h1>
        <p className="mt-1 text-muted">Here's where hiring stands across your open roles today.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4 bg-white border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#0E7C7B14" }}>
                <Icon size={17} color="#0E7C7B" />
              </div>
            </div>
            <div className="text-2xl font-semibold font-serif">{value}</div>
            <div className="text-xs mt-0.5 text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl p-5 bg-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Candidates by stage</h2>
            <button onClick={() => setView("pipeline")} className="text-xs flex items-center gap-1 font-medium text-tealdeep">
              View pipeline <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-20 text-xs shrink-0 text-muted">{stage}</div>
                <div className="flex-1 h-2.5 rounded-full" style={{ background: "#F1EDE3" }}>
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%`, background: STAGE_COLOR[stage], transition: "width 0.5s ease" }}
                  />
                </div>
                <div className="w-6 text-xs text-right font-medium">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl p-5 bg-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Open roles</h2>
            <button onClick={() => setView("jobs")} className="text-xs flex items-center gap-1 font-medium text-tealdeep">
              Manage <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 4).map((j) => (
              <div key={j.id} className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{j.title}</div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Building2 size={11} /> {j.department} <MapPin size={11} className="ml-1" /> {j.location}
                  </div>
                </div>
                <Pill color="#0A5F5E">{candidates.filter((c) => c.jobId === j.id).length} applicants</Pill>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-xs text-muted">No open roles yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
