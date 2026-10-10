import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, subjectIds, semester, academicYear } = body;

    if (!studentId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return NextResponse.json(
        { error: "Student ID and at least one Subject ID are required" },
        { status: 400 }
      );
    }

    const year = academicYear || "2024-2025";
    const sem = Number(semester) || 1;

    const enrollments = [];
    for (const subjectId of subjectIds) {
      const enr = await prisma.subjectEnrollment.upsert({
        where: {
          studentId_subjectId_academicYear_semester: {
            studentId,
            subjectId,
            academicYear: year,
            semester: sem,
          },
        },
        update: { status: "ENROLLED" },
        create: {
          studentId,
          subjectId,
          academicYear: year,
          semester: sem,
          status: "ENROLLED",
        },
      });
      enrollments.push(enr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled student in ${enrollments.length} course(s)`,
      enrollments,
    });
  } catch (err: any) {
    console.error("API POST /api/students/enroll error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
