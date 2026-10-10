import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let studentId = session.studentId;
    if (!studentId && session.userId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });
      if (student) studentId = student.id;
    }

    if (!studentId) {
      return NextResponse.json({ success: true, progress: [] });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (lessonId) {
      const record = await prisma.lessonProgress.findUnique({
        where: {
          studentId_lessonId: {
            studentId,
            lessonId,
          },
        },
      });
      return NextResponse.json({ success: true, progress: record });
    }

    const records = await prisma.lessonProgress.findMany({
      where: { studentId },
    });

    return NextResponse.json({ success: true, progress: records });
  } catch (err: any) {
    console.error("GET /api/learning-content/progress error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let studentId = session.studentId;
    if (!studentId && session.userId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });
      if (student) studentId = student.id;
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student profile not found for authenticated account" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { lessonId, watchedSeconds, isCompleted } = body;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: "lessonId is required." },
        { status: 400 }
      );
    }

    const progressRecord = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
      update: {
        watchedSeconds: typeof watchedSeconds === "number" ? Math.max(0, watchedSeconds) : undefined,
        isCompleted: typeof isCompleted === "boolean" ? isCompleted : undefined,
        completedAt: isCompleted ? new Date() : undefined,
        lastWatchedAt: new Date(),
      },
      create: {
        studentId,
        lessonId,
        watchedSeconds: typeof watchedSeconds === "number" ? Math.max(0, watchedSeconds) : 0,
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
        lastWatchedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, progress: progressRecord });
  } catch (err: any) {
    console.error("POST /api/learning-content/progress error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
