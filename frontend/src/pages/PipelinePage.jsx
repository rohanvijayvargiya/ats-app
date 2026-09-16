import React, { useRef, useState } from "react";
import { Search, GripVertical } from "lucide-react";
import { CandidateDrawer } from "../components/CandidateDrawer";
import { STAGES, STAGE_COLOR, scoreColor } from "../lib/constants";
import { api } from "../lib/api";

export function PipelinePage({ jobs, candidates, setCandidates, notify, isHost }) {
  const [jobFilter, setJobFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const dragIdRef = useRef(null);

  const filtered = candidates.filter((c) => {
    const matchesJob = jobFilter === "all" || c.jobId === jobFilter;
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    return matchesJob && matchesQuery;
  });

  function jobFor(id) {
    return jobs.find((j) => j.id === id);
  }

  async function moveToStage(id, stage) {
    if (!isHost) {
      notify("Only host accounts can change a candidate's pipeline stage.", "error");
      return;
    }
    // Optimistic update so the board feels instant, then persist.
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    setSelected((s) => (s && s.id === id ? { ...s, stage } : s));
    try {
      await api.updateCandidate(id, { stage });
    } catch (err) {
      notify(`Couldn't save the stage change: ${err.message}`, "error");
    }
  }

  function handleDrop(stage) {
    setDragOverStage(null);
    if (!isHost) return;
    const id = dragIdRef.current;
    if (!id) return;
    moveToStage(id, stage);
  }

  async function removeCandidate(id) {
    try {
      await api.deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      notify("Candidate removed.");
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <div className="max-w-none">
      <header className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold font-serif">Candidate pipeline</h1>
          <p className="mt-1 text-muted">
            {isHost
              ? "Drag cards across stages as candidates progress."
              : "Click a candidate to view details. Only host accounts can move candidates between stages."}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates"
              className="pl-8 pr-3 py-2 rounded-lg text-sm outline-none bg-white border border-border"
            />
          </div>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none bg-white border border-border"
          >
            <option value="all">All roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = filtered.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                if (!isHost) return;
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage);
              }}
              className="w-72 shrink-0 rounded-xl p-3"
              style={{
                background: dragOverStage === stage ? "#0E7C7B0F" : "#F1EDE3",
                border: dragOverStage === stage ? "1.5px dashed #0E7C7B" : "1.5px solid transparent",
                minHeight: 420,
              }}
            >
              <div className="flex items-center gap-2 px-1 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLOR[stage] }} />
                <span className="text-sm font-semibold">{stage}</span>
                <span className="ml-auto text-xs font-medium text-muted">{stageCandidates.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {stageCandidates.map((c) => (
                  <div
                    key={c.id}
                    draggable={isHost}
                    onDragStart={() => {
                      dragIdRef.current = c.id;
                    }}
                    onClick={() => setSelected(c)}
                    className={`rounded-lg p-3 bg-white border border-border ${isHost ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-medium text-sm leading-tight">{c.name}</div>
                      {isHost && <GripVertical size={13} color="#C7C1B2" className="shrink-0 mt-0.5" />}
                    </div>
                    <div className="text-[11px] mb-2 text-muted">{jobFor(c.jobId)?.title || "—"}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(c.skills || []).slice(0, 2).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F1EDE3] text-[#3A3F49]">
                            {s}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: scoreColor(c.score || 0) }}>
                        {c.score || 0}%
                      </span>
                    </div>
                  </div>
                ))}
                {stageCandidates.length === 0 && (
                  <div className="text-xs text-center py-6 text-[#A8A296]">Drop a candidate here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CandidateDrawer
        candidate={selected}
        job={selected ? jobFor(selected.jobId) : null}
        onClose={() => setSelected(null)}
        onStageChange={moveToStage}
        onDelete={removeCandidate}
        isHost={isHost}
      />
    </div>
  );
}
