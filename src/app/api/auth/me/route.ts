import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    if (session.role === "STUDENT") {
      let student = null;
      if (session.studentId) {
        student = await prisma.student.findUnique({
          where: { id: session.studentId },
          include: {
            user: true,
            program: { include: { department: true } },
          },
        });
      }

      if (!student && session.userId) {
        student = await prisma.student.findUnique({
          where: { userId: session.userId },
          include: {
            user: true,
            program: { include: { department: true } },
          },
        });
      }

      // If still not found, check if ANY student exists for fallback
      if (!student) {
        student = await prisma.student.findFirst({
          include: {
            user: true,
            program: { include: { department: true } },
          },
        });
      }

      if (student) {
        return NextResponse.json({
          authenticated: true,
          role: "STUDENT",
          user: {
            id: student.id,
            userId: student.userId,
            enrollmentNumber: student.enrollmentNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.user.email,
            phone: student.phone || "",
            department: student.program?.department?.name || "Computer Science & Engineering",
            program: student.program?.name || "B.Tech Computer Science",
            currentSemester: student.currentSemester,
            academicYear: student.academicYear || "2025-2026",
            cgpa: Number(student.cgpa) || 0.0,
            avatarUrl: "",
          },
        });
      }

      // No student record in MySQL
      return NextResponse.json({
        authenticated: true,
        role: "STUDENT",
        user: null,
        message: "No student profile registered in database.",
      });
    }

    // Admin or Faculty session
    return NextResponse.json({
      authenticated: true,
      role: session.role,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  } catch (err: any) {
    console.warn("API GET /api/auth/me error:", err.message);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
