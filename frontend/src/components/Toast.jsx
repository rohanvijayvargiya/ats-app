import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function Toast({ message, tone = "success", onClose }) {
  if (!message) return null;
  const isErr = tone === "error";
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white"
      style={{ background: isErr ? "#C23A4D" : "#0A5F5E" }}
    >
      {isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
