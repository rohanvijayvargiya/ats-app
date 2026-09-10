import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Sparkles, Loader2, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react";
import { ScoreRing, Pill } from "../components/ScoreRing";
import { scoreColor } from "../lib/constants";
import { api } from "../lib/api";

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1 text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-border"
      />
    </div>
  );
}

export function UploadPage({ jobs, setCandidates, notify }) {
  const [jobId, setJobId] = useState(jobs[0]?.id || "");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const fileInputRef = useRef(null);

  const job = jobs.find((j) => j.id === jobId);

  async function handleFiles(files) {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    setScoreResult(null);
    setParsing(true);
    try {
      const result = await api.parseResumeFile(file);
      setResumeText(result.resumeText);
      setParsed(result);
    } catch (err) {
      notify(err.message || "Couldn't read that file. Try pasting the resume text instead.", "error");
    } finally {
      setParsing(false);
    }
  }

  async function runParse() {
    if (!resumeText.trim()) {
      notify("Paste or upload a resume first.", "error");
      return;
    }
    setParsing(true);
    setScoreResult(null);
    try {
      const result = await api.parseResumeText(resumeText);
      setParsed(result);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setParsing(false);
    }
  }

  async function runScore() {
    if (!parsed || !job) return;
    setScoring(true);
    try {
      const result = await api.scoreResume(resumeText, job.id);
      setScoreResult(result);
      if (result.warning) notify(result.warning, "error");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setScoring(false);
    }
  }

  async function addToPipeline() {
    if (!parsed || !job) return;
    try {
      const candidate = await api.createCandidate({
        jobId: job.id,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        experienceYears: parsed.experienceYears,
        skills: parsed.skills,
        stage: "Applied",
        score: scoreResult ? scoreResult.score : 0,
        pros: scoreResult ? scoreResult.pros : [],
        cons: scoreResult ? scoreResult.cons : [],
        resumeText,
      });
      setCandidates((prev) => [candidate, ...prev]);
      notify(`${candidate.name} added to the ${job.title} pipeline.`);
      setResumeText("");
      setFileName("");
      setParsed(null);
      setScoreResult(null);
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold font-serif">Resume intake</h1>
        <p className="mt-1 text-muted">Upload a resume, extract candidate details, and score fit against a role.</p>
      </header>

      <div className="mb-5">
        <label className="text-xs font-medium block mb-1 text-muted">Target role</label>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full md:w-80 px-3 py-2 rounded-lg text-sm outline-none bg-white border border-border"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl p-8 text-center cursor-pointer mb-5"
        style={{
          border: `2px dashed ${isDragging ? "#0E7C7B" : "#E7E2D6"}`,
          background: isDragging ? "#0E7C7B0D" : "#FFFFFF",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.txt,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud size={28} color="#0E7C7B" className="mx-auto mb-3" />
        <div className="text-sm font-medium">
          {parsing ? "Reading resume…" : "Drag & drop a resume, or click to browse"}
        </div>
        <div className="text-xs mt-1 text-muted">Supports .pdf, .docx and .txt</div>
        {fileName && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#F1EDE3]">
            <FileText size={12} /> {fileName}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="text-xs font-medium block mb-1 text-muted">Resume text</label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste resume text here (or drop a file above)…"
          rows={7}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none bg-white border border-border"
        />
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={runParse}
          disabled={parsing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#F1EDE3] text-inktext disabled:opacity-50"
        >
          {parsing ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          Parse resume
        </button>
        <button
          onClick={runScore}
          disabled={!parsed || scoring}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 bg-tealdeep"
        >
          {scoring ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {scoring ? "Scoring…" : "AI score vs. job"}
        </button>
      </div>

      {parsed && (
        <div className="rounded-xl p-5 mb-6 bg-white border border-border">
          <div className="text-xs font-semibold mb-4 text-muted">EXTRACTED PROFILE</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Name" value={parsed.name} onChange={(v) => setParsed({ ...parsed, name: v })} />
            <Field label="Email" value={parsed.email} onChange={(v) => setParsed({ ...parsed, email: v })} />
            <Field label="Phone" value={parsed.phone} onChange={(v) => setParsed({ ...parsed, phone: v })} />
            <Field
              label="Experience (years)"
              value={String(parsed.experienceYears)}
              onChange={(v) => setParsed({ ...parsed, experienceYears: parseInt(v) || 0 })}
            />
          </div>
          <div>
            <div className="text-xs font-medium mb-1.5 text-muted">Detected skills</div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.skills.length ? (
                parsed.skills.map((s) => (
                  <Pill key={s} color="#0A5F5E">
                    {s}
                  </Pill>
                ))
              ) : (
                <span className="text-xs text-muted">None detected</span>
              )}
            </div>
          </div>
        </div>
      )}

      {scoreResult && (
        <div className="rounded-xl p-5 mb-6 bg-white border border-border">
          <div className="flex items-center gap-4 mb-4">
            <ScoreRing score={scoreResult.score} size={64} />
            <div>
              <div className="text-xs font-semibold text-muted">MATCH SCORE vs. {job?.title}</div>
              <div className="text-xl font-semibold font-serif" style={{ color: scoreColor(scoreResult.score) }}>
                {scoreResult.score}% fit
              </div>
            </div>
          </div>
          {scoreResult.warning && (
            <div className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "#C23A4D" }}>
              <AlertCircle size={12} /> {scoreResult.warning}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#0E8A5F" }}>
                <CheckCircle2 size={13} /> PROS
              </div>
              <ul className="space-y-1">
                {scoreResult.pros.map((p, i) => (
                  <li key={i} className="text-sm text-[#3A3F49]">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#C23A4D" }}>
                <XCircle size={13} /> CONS
              </div>
              <ul className="space-y-1">
                {scoreResult.cons.map((p, i) => (
                  <li key={i} className="text-sm text-[#3A3F49]">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {parsed && (
        <button onClick={addToPipeline} className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-teal">
          <Plus size={16} /> Add to pipeline
        </button>
      )}
    </div>
  );
}
