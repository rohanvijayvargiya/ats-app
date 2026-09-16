import React from "react";
import { LayoutDashboard, Briefcase, LayoutGrid, UploadCloud, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "jobs", label: "Job Openings", icon: Briefcase, badgeKey: "jobs" },
  { key: "pipeline", label: "Pipeline", icon: LayoutGrid, badgeKey: "candidates" },
  { key: "upload", label: "Resume Intake", icon: UploadCloud },
];

export function Sidebar({ view, setView, jobCount, candidateCount, user, onLogout }) {
  const badges = { jobs: jobCount, candidates: candidateCount };
  return (
    <div className="hidden md:flex flex-col shrink-0 w-64 h-screen sticky top-0 py-6 px-4 bg-ink text-white">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold bg-teal text-white font-serif">
          H
        </div>
        <div>
          <div className="text-lg font-semibold leading-none text-white font-serif">Hireline</div>
          <div className="text-[11px] tracking-wide text-[#8890A8]">Applicant Tracking</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon, badgeKey }) => {
          const active = view === key;
          const badge = badgeKey ? badges[badgeKey] : undefined;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
              style={{
                background: active ? "#1D2540" : "transparent",
                color: active ? "#fff" : "#B7BCCF",
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon size={17} color={active ? "#0E7C7B" : "#8890A8"} />
              <span className="flex-1">{label}</span>
              {typeof badge === "number" && (
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{ background: active ? "#0E7C7B" : "#2A3253", color: active ? "#fff" : "#A9AFC6" }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-[#262E4C] flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-[#2A3253] text-white shrink-0">
            {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="text-xs flex-1 min-w-0">
            <div className="text-white font-medium truncate">{user.name || user.email}</div>
            <div className="text-[#8890A8] capitalize">{user.role}</div>
          </div>
          <button onClick={onLogout} title="Log out" className="p-1.5 rounded-md hover:bg-black/20 shrink-0">
            <LogOut size={15} color="#8A8F9C" />
          </button>
        </div>
      )}
    </div>
  );
}

export function MobileNav({ view, setView, onLogout }) {
  const items = [
    { key: "dashboard", label: "Home", icon: LayoutDashboard },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "pipeline", label: "Pipeline", icon: LayoutGrid },
    { key: "upload", label: "Intake", icon: UploadCloud },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 border-t bg-ink border-[#262E4C]">
      {items.map(({ key, label, icon: Icon }) => {
        const active = view === key;
        return (
          <button key={key} onClick={() => setView(key)} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <Icon size={18} color={active ? "#0E7C7B" : "#8890A8"} />
            <span className="text-[10px]" style={{ color: active ? "#fff" : "#8890A8" }}>
              {label}
            </span>
          </button>
        );
      })}
      {onLogout && (
        <button onClick={onLogout} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <LogOut size={18} color="#8890A8" />
          <span className="text-[10px]" style={{ color: "#8890A8" }}>
            Logout
          </span>
        </button>
      )}
    </div>
  );
}
