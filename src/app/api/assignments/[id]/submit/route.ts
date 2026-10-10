import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await request.json();
    const { fileName, comments, fileUrl } = body;

    let studentId = session.studentId;
    if (!studentId && session.userId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });
      if (student) studentId = student.id;
    }

    if (!studentId) {
      // Find or create default student for session
      const anyStudent = await prisma.student.findFirst();
      if (anyStudent) {
        studentId = anyStudent.id;
      } else {
        return NextResponse.json(
          { success: false, error: "Student profile not found" },
          { status: 404 }
        );
      }
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        fileUrl: fileUrl || fileName || "submitted_file.pdf",
        comments: comments || null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        fileUrl: fileUrl || fileName || "submitted_file.pdf",
        comments: comments || null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    console.error("POST /api/assignments/[id]/submit error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
