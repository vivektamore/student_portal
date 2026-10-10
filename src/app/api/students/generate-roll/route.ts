import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDepartmentCode, getProgramCode, generateRollNumber } from "@/lib/roll-generator";
import { SITE_CONFIG } from "@/lib/site-config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department") || "Computer Science & Engineering";
    const program = searchParams.get("program") || "B.Tech Computer Science";
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    const prefix = SITE_CONFIG.universityShort || "VU";
    const deptCode = getDepartmentCode(department);
    const progCode = getProgramCode(program, deptCode);
    const patternPrefix = `${prefix}-${year}-${progCode}-`;

    let nextSequence = 1;

    try {
      // Find all students matching this pattern prefix in MySQL
      const existingStudents = await prisma.student.findMany({
        where: {
          enrollmentNumber: {
            startsWith: patternPrefix,
          },
        },
        select: {
          enrollmentNumber: true,
        },
      });

      if (existingStudents.length > 0) {
        // Extract sequence numbers and find maximum
        const seqNumbers = existingStudents
          .map((s) => {
            const parts = s.enrollmentNumber.split("-");
            const lastPart = parts[parts.length - 1];
            const parsed = parseInt(lastPart, 10);
            return isNaN(parsed) ? 0 : parsed;
          })
          .filter((n) => n > 0);

        if (seqNumbers.length > 0) {
          nextSequence = Math.max(...seqNumbers) + 1;
        } else {
          nextSequence = existingStudents.length + 1;
        }
      }
    } catch (dbErr) {
      console.warn("DB lookup in generate-roll failed, falling back to seq 1:", dbErr);
    }

    const rollNumber = generateRollNumber(department, program, year, nextSequence);

    return NextResponse.json({
      success: true,
      rollNumber,
      prefix: patternPrefix,
      sequence: nextSequence,
      departmentCode: deptCode,
      programCode: progCode,
    });
  } catch (error: any) {
    console.error("Error generating roll number:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate roll number",
        rollNumber: `VU-${new Date().getFullYear()}-CSE-0001`,
      },
      { status: 500 }
    );
  }
}
