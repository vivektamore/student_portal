import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentSession();

    // Student view
    if (session?.role === "STUDENT") {
      let student = null;
      if (session.studentId) {
        student = await prisma.student.findUnique({ where: { id: session.studentId } });
      }
      if (!student && session.userId) {
        student = await prisma.student.findUnique({ where: { userId: session.userId } });
      }

      if (!student) {
        return NextResponse.json({ success: true, exams: [] });
      }

      const enrollments = await prisma.subjectEnrollment.findMany({
        where: { studentId: student.id },
        select: { subjectId: true },
      });

      const subjectIds = enrollments.map((e) => e.subjectId);

      const exams = await prisma.exam.findMany({
        where: {
          isPublished: true,
          subjectId: { in: subjectIds },
        },
        include: { subject: true },
        orderBy: { examDate: "asc" },
      });

      const mapped = exams.map((ex) => ({
        id: ex.id,
        title: ex.title,
        type: ex.type,
        subjectCode: ex.subject.code,
        subjectName: ex.subject.name,
        date: new Date(ex.examDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        startTime: ex.startTime,
        endTime: ex.endTime,
        room: ex.room,
        maxMarks: ex.maxMarks,
        status: "UPCOMING",
      }));

      return NextResponse.json({ success: true, exams: mapped });
    }

    // Admin view
    const exams = await prisma.exam.findMany({
      include: {
        subject: true,
        results: { select: { id: true } },
      },
      orderBy: { examDate: "desc" },
    });

    const mapped = exams.map((ex) => ({
      id: ex.id,
      title: ex.title,
      type: ex.type,
      subjectCode: ex.subject.code,
      subjectName: ex.subject.name,
      date: new Date(ex.examDate).toISOString().split("T")[0],
      startTime: ex.startTime,
      endTime: ex.endTime,
      room: ex.room,
      maxMarks: ex.maxMarks,
      isPublished: ex.isPublished,
      resultsCount: ex.results.length,
    }));

    return NextResponse.json({ success: true, exams: mapped });
  } catch (err: any) {
    console.error("API GET /api/exams error:", err);
    return NextResponse.json({ success: false, error: err.message, exams: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, subjectId, examDate, startTime, endTime, room, maxMarks, isPublished } = body;

    if (!title || !subjectId || !examDate) {
      return NextResponse.json({ error: "Title, Subject, and Date are required" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        type: type || "MID_TERM",
        subjectId,
        examDate: new Date(examDate),
        startTime: startTime || "10:00 AM",
        endTime: endTime || "01:00 PM",
        room: room || "Examination Hall",
        maxMarks: Number(maxMarks) || 100,
        isPublished: isPublished ?? false,
      },
      include: { subject: true },
    });

    return NextResponse.json({
      success: true,
      message: "Examination schedule created in database",
      exam,
    });
  } catch (err: any) {
    console.error("API POST /api/exams error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
