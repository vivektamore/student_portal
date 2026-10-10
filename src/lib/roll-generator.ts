import { SITE_CONFIG } from "./site-config";

export function getDepartmentCode(departmentName: string): string {
  const normalized = departmentName.toLowerCase().trim();
  if (normalized.includes("commerce") || normalized.includes("b.com") || normalized.includes("bcom")) return "COMM";
  if (normalized.includes("arts") || normalized.includes("humanities")) return "ARTS";
  if (normalized.includes("computer application") || normalized.includes("bca")) return "BCA";
  if (normalized.includes("management") || normalized.includes("bms") || normalized.includes("business") || normalized.includes("mba")) return "BMS";
  if (normalized.includes("economics")) return "ECO";
  if (normalized.includes("psychology")) return "PSY";
  if (normalized.includes("computer science") || normalized.includes("cse")) return "CSE";
  if (normalized.includes("information technology") || normalized.includes(" it")) return "IT";
  if (normalized.includes("electronics") || normalized.includes("ece")) return "ECE";
  if (normalized.includes("mechanical")) return "ME";
  if (normalized.includes("civil")) return "CE";
  if (normalized.includes("electrical")) return "EE";
  
  // Fallback: extract initials of major words
  const initials = departmentName
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["and", "the", "for", "of"].includes(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");
  return initials.slice(0, 4) || "GEN";
}

export function getProgramCode(programName: string, deptCode: string): string {
  const normalized = programName.toLowerCase().trim();
  if (normalized.includes("b.com") || normalized.includes("commerce")) return "BCOM";
  if (normalized.includes("bms") || normalized.includes("management studies")) return "BMS";
  if (normalized.includes("bca") || normalized.includes("computer application")) return "BCA";
  if (normalized.includes("baf") || normalized.includes("accounting & finance")) return "BAF";
  if (normalized.includes("bbi") || normalized.includes("banking & insurance")) return "BBI";
  if (normalized.includes("bfm") || normalized.includes("financial markets")) return "BFM";
  if (normalized.includes("b.a") || normalized.includes("arts")) return "BA";
  if (normalized.includes("m.a") || normalized.includes("master of arts")) return "MA";
  if (normalized.includes("m.com")) return "MCOM";
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
