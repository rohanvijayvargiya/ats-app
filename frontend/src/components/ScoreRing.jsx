import React from "react";
import { scoreColor } from "../lib/constants";

export function ScoreRing({ score, size = 56 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EDE9DF" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.28,
          fontWeight: 700,
          color: "#20242C",
        }}
      >
        {score}
      </div>
    </div>
  );
}

export function Pill({ children, color }) {
  return (
    <span
      style={{
        background: color ? `${color}1A` : "#F1EDE3",
        color: color || "#6B7280",
        border: `1px solid ${color ? color + "40" : "#E7E2D6"}`,
      }}
      className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      {children}
    </span>
  );
}
