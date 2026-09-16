import React, { useCallback, useEffect, useState } from "react";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { Dashboard } from "./pages/Dashboard";
import { JobsPage } from "./pages/JobsPage";
import { PipelinePage } from "./pages/PipelinePage";
import { UploadPage } from "./pages/UploadPage";
import { AuthPage } from "./pages/AuthPage";
import { api } from "./lib/api";
import { getToken, clearToken } from "./lib/auth";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  const [view, setView] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState({ message: "", tone: "success" });

  const notify = useCallback((message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast({ message: "", tone: "success" }), 3600);
  }, []);

  // On first load, see if a saved login token is still valid.
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      if (!getToken()) {
        setAuthChecked(true);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Once logged in, load the shared workspace data.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      try {
        const [jobsData, candidatesData] = await Promise.all([api.getJobs(), api.getCandidates()]);
        if (cancelled) return;
        setJobs(jobsData);
        setCandidates(candidatesData);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Couldn't reach the API server.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleLogout() {
    api.logout();
    setUser(null);
    setJobs([]);
    setCandidates([]);
    setView("dashboard");
  }

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen text-muted text-sm">Loading…</div>;
  }

  if (!user) {
    return <AuthPage onAuth={setUser} />;
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

  const isHost = user.role === "host";

  let page;
  if (view === "jobs") {
    page = <JobsPage jobs={jobs} setJobs={setJobs} candidates={candidates} notify={notify} isHost={isHost} />;
  } else if (view === "pipeline") {
    page = <PipelinePage jobs={jobs} candidates={candidates} setCandidates={setCandidates} notify={notify} isHost={isHost} />;
  } else if (view === "upload") {
    page = <UploadPage jobs={jobs} setCandidates={setCandidates} notify={notify} />;
  } else {
    page = <Dashboard jobs={jobs} candidates={candidates} setView={setView} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-paper text-inktext">
      <Sidebar
        view={view}
        setView={setView}
        jobCount={jobs.length}
        candidateCount={candidates.length}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-5 md:p-10 pb-20 md:pb-10">{page}</main>
      <MobileNav view={view} setView={setView} onLogout={handleLogout} />
      <Toast message={toast.message} tone={toast.tone} onClose={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
