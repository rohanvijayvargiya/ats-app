const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const SKILL_LIBRARY = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Ruby",
  "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "AWS", "Azure", "GCP",
  "Docker", "Kubernetes", "CI/CD", "Git", "GraphQL", "REST", "Machine Learning",
  "Data Analysis", "TensorFlow", "PyTorch", "Figma", "UI/UX", "Agile", "Scrum",
  "Product Management", "Leadership", "Communication", "Project Management",
  "HTML", "CSS", "Tailwind", "Swift", "Kotlin", "Excel", "Sales", "SEO",
];

/** Extract raw text from an uploaded file buffer based on its extension. */
async function extractTextFromFile(buffer, originalName) {
  const lower = originalName.toLowerCase();
  if (lower.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (lower.endsWith(".pdf")) {
    const { text } = await pdfParse(buffer);
    return text;
  }
  if (lower.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  throw new Error("Unsupported file type");
}

function extractEmail(text) {
  const m = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : "";
}

function extractPhone(text) {
  const m = text.match(/(\+?\d[\d\-\s()]{8,}\d)/);
  return m ? m[0].trim() : "";
}

function extractName(text) {
  const firstLine =
    text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) || "";
  const cleaned = firstLine.replace(/[-–—|:,].*$/, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 1 && words.length <= 5 && !/@/.test(cleaned)) {
    return cleaned;
  }
  return "Unnamed Candidate";
}

function extractExperience(text) {
  const m = text.match(/(\d+)\+?\s*years?/i);
  return m ? parseInt(m[1], 10) : 0;
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_LIBRARY.filter((s) => lower.includes(s.toLowerCase()));
}

/** Turn raw resume text into structured candidate fields. */
function parseResumeText(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    experienceYears: extractExperience(text),
    skills: extractSkills(text),
    resumeText: text,
  };
}

module.exports = {
  SKILL_LIBRARY,
  extractTextFromFile,
  extractSkills,
  parseResumeText,
};
