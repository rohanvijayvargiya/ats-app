import React from "react";
import { Mail, Phone, Clock, X, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { ScoreRing, Pill } from "./ScoreRing";
import { STAGES, STAGE_COLOR, scoreColor } from "../lib/constants";

export function CandidateDrawer({ candidate, job, onClose, onStageChange, onDelete, isHost }) {
  if (!candidate) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(18,24,43,0.35)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full overflow-y-auto p-6 bg-paper"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold font-serif">{candidate.name}</h2>
            <div className="text-xs mt-1 text-muted">Applying for {job ? job.title : "Unknown role"}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6 rounded-xl p-4 bg-white border border-border">
          <ScoreRing score={candidate.score || 0} size={64} />
          <div>
            <div className="text-xs font-medium text-muted">AI Match Score</div>
            <div className="text-xl font-semibold font-serif" style={{ color: scoreColor(candidate.score || 0) }}>
              {candidate.score || 0}% fit
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-muted" /> {candidate.email || "—"}
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-muted" /> {candidate.phone || "—"}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted" /> {candidate.experienceYears || 0} years experience
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold mb-2 text-muted">SKILLS</div>
          <div className="flex flex-wrap gap-1.5">
            {(candidate.skills || []).map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
            {(!candidate.skills || candidate.skills.length === 0) && (
              <span className="text-xs text-muted">No skills detected</span>
            )}
          </div>
        </div>

        {candidate.pros && candidate.pros.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#0E8A5F" }}>
              <CheckCircle2 size={13} /> STRENGTHS
            </div>
            <ul className="space-y-1.5">
              {candidate.pros.map((p, i) => (
                <li key={i} className="text-sm flex gap-2 text-[#3A3F49]">
                  <span style={{ color: "#0E8A5F" }}>•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.cons && candidate.cons.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#C23A4D" }}>
              <XCircle size={13} /> GAPS TO PROBE
            </div>
            <ul className="space-y-1.5">
              {candidate.cons.map((p, i) => (
                <li key={i} className="text-sm flex gap-2 text-[#3A3F49]">
                  <span style={{ color: "#C23A4D" }}>•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <div className="text-xs font-semibold mb-2 text-muted">
            {isHost ? "MOVE TO STAGE" : "PIPELINE STAGE"}
          </div>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => isHost && onStageChange(candidate.id, s)}
                disabled={!isHost}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: candidate.stage === s ? STAGE_COLOR[s] : "#F1EDE3",
                  color: candidate.stage === s ? "#fff" : "#3A3F49",
                  cursor: isHost ? "pointer" : "default",
                  opacity: isHost || candidate.stage === s ? 1 : 0.5,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {!isHost && (
            <p className="text-[11px] mt-2 text-muted">Only host accounts can change pipeline stage.</p>
          )}
        </div>

        <details className="mb-6 rounded-xl p-3 bg-white border border-border">
          <summary className="text-xs font-semibold cursor-pointer text-muted">RESUME TEXT</summary>
          <p className="text-xs mt-2 leading-relaxed whitespace-pre-wrap text-[#3A3F49]">{candidate.resumeText}</p>
        </details>

        <button
          onClick={() => {
            onDelete(candidate.id);
            onClose();
          }}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "#C23A4D" }}
        >
          <Trash2 size={13} /> Remove candidate
        </button>
      </div>
    </div>
  );
}
