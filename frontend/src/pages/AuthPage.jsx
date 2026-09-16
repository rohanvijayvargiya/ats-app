import React, { useState } from "react";
import { Briefcase } from "lucide-react";
import { api } from "../lib/api";

export function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user =
        mode === "login" ? await api.login(email, password) : await api.signup(email, password, name, role);
      onAuth(user);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAF8F4" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "#0A5F5E" }}
          >
            <Briefcase size={20} color="white" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
            Hireline
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {mode === "login" ? "Log in to your workspace" : "Create your workspace account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: "1px solid #E7E2D6" }}
        >
          {mode === "signup" && (
            <>
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
                  Name (optional)
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ border: "1px solid #E7E2D6" }}
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium block mb-2" style={{ color: "#6B7280" }}>
                  Account type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("host")}
                    className="text-left px-3 py-2.5 rounded-lg text-xs"
                    style={{
                      border: `1.5px solid ${role === "host" ? "#0A5F5E" : "#E7E2D6"}`,
                      background: role === "host" ? "#0A5F5E14" : "white",
                    }}
                  >
                    <div className="font-semibold mb-0.5">Host</div>
                    <div style={{ color: "#6B7280" }}>Can post & manage jobs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("member")}
                    className="text-left px-3 py-2.5 rounded-lg text-xs"
                    style={{
                      border: `1.5px solid ${role === "member" ? "#0A5F5E" : "#E7E2D6"}`,
                      background: role === "member" ? "#0A5F5E14" : "white",
                    }}
                  >
                    <div className="font-semibold mb-0.5">Team member</div>
                    <div style={{ color: "#6B7280" }}>View & manage pipeline</div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: "1px solid #E7E2D6" }}
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: "1px solid #E7E2D6" }}
            />
          </div>

          {error && <div className="text-xs text-red-600 mb-4">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#0A5F5E" }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "#6B7280" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="font-medium underline"
            style={{ color: "#0A5F5E" }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
