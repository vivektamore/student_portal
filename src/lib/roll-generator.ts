import { SITE_CONFIG } from "./site-config";

export function getDepartmentCode(departmentName: string): string {
  const normalized = departmentName.toLowerCase().trim();
  if (normalized.includes("computer science") || normalized.includes("cse")) return "CSE";
  if (normalized.includes("electronics") || normalized.includes("ece")) return "ECE";
  if (normalized.includes("mechanical")) return "ME";
  if (normalized.includes("civil")) return "CE";
  if (normalized.includes("management") || normalized.includes("business") || normalized.includes("mba")) return "MBA";
  if (normalized.includes("information technology") || normalized.includes(" it")) return "IT";
  if (normalized.includes("electrical")) return "EE";
  
  // Fallback: extract initials of major words
  const initials = departmentName
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["and", "the", "for", "of"].includes(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");
  return initials.slice(0, 4) || "ENG";
}

export function getProgramCode(programName: string, deptCode: string): string {
  const normalized = programName.toLowerCase().trim();
  if (normalized.includes("artificial intelligence") || normalized.includes("ai")) return "AI";
  if (normalized.includes("data science")) return "DS";
  if (normalized.includes("software systems")) return "SE";
  if (normalized.includes("cyber security")) return "CS";
  if (normalized.includes("m.tech")) return `M${deptCode}`;
  if (normalized.includes("mba")) return "MBA";
  return deptCode;
}

export function generateRollNumber(
  departmentName: string,
  programName: string,
  year?: number | string,
  sequence: number = 1
): string {
  const prefix = SITE_CONFIG.universityShort || "VU";
  const cohortYear = year ? String(year).slice(-4) : new Date().getFullYear().toString();
  const deptCode = getDepartmentCode(departmentName);
  const progCode = getProgramCode(programName, deptCode);
  const seqPadded = String(sequence).padStart(4, "0");

  return `${prefix}-${cohortYear}-${progCode}-${seqPadded}`;
}
