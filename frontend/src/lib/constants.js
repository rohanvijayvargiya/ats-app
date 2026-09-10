export const STAGES = ["Applied", "Screening", "Interview", "Offered", "Rejected"];

export const STAGE_COLOR = {
  Applied: "#64748B",
  Screening: "#2563A8",
  Interview: "#7C4DBE",
  Offered: "#0E8A5F",
  Rejected: "#C23A4D",
};

export function scoreColor(score) {
  if (score >= 80) return "#0E8A5F";
  if (score >= 60) return "#C98A2C";
  return "#C23A4D";
}
