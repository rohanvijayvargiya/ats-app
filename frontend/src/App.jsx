import React, { useCallback, useEffect, useState } from "react";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { Dashboard } from "./pages/Dashboard";
import { JobsPage } from "./pages/JobsPage";
import { PipelinePage } from "./pages/PipelinePage";
import { UploadPage } from "./pages/UploadPage";
import { api } from "./lib/api";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast({ message: "", tone: "success" }), 3600);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [jobsData, candidatesData] = await Promise.all([api.getJobs(), api.getCandidates()]);
        if (cancelled) return;
        setJobs(jobsData);
        setCandidates(candidatesData);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Couldn't reach the API server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted text-sm">
        Loading Hireline…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold font-serif mb-2">Can't reach the API</h1>
          <p className="text-sm text-muted mb-1">{loadError}</p>
          <p className="text-sm text-muted">
            Make sure the backend is running (<code>cd backend && npm run dev</code>) and that{" "}
            <code>VITE_API_URL</code> points to it.
          </p>
        </div>
      </div>
    );
  }

  let page;
  if (view === "jobs") {
    page = <JobsPage jobs={jobs} setJobs={setJobs} candidates={candidates} notify={notify} />;
  } else if (view === "pipeline") {
    page = <PipelinePage jobs={jobs} candidates={candidates} setCandidates={setCandidates} notify={notify} />;
  } else if (view === "upload") {
    page = <UploadPage jobs={jobs} setCandidates={setCandidates} notify={notify} />;
  } else {
    page = <Dashboard jobs={jobs} candidates={candidates} setView={setView} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-paper text-inktext">
      <Sidebar view={view} setView={setView} jobCount={jobs.length} candidateCount={candidates.length} />
      <main className="flex-1 p-5 md:p-10 pb-20 md:pb-10">{page}</main>
      <MobileNav view={view} setView={setView} />
      <Toast message={toast.message} tone={toast.tone} onClose={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
