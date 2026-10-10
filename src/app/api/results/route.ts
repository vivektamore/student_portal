import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

function calculateGrade(totalMarks: number) {
  if (totalMarks >= 90) return { grade: "A+", points: 10.0 };
  if (totalMarks >= 80) return { grade: "A", points: 9.0 };
  if (totalMarks >= 70) return { grade: "B+", points: 8.0 };
  if (totalMarks >= 60) return { grade: "B", points: 7.0 };
  if (totalMarks >= 50) return { grade: "C", points: 6.0 };
  if (totalMarks >= 40) return { grade: "D", points: 5.0 };
  return { grade: "F", points: 0.0 };
}

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");

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
        return NextResponse.json({
          success: true,
          results: [],
          sgpa: "0.00",
          cgpa: "0.00",
          totalCredits: 0,
        });
      }

      const whereClause: any = {
        studentId: student.id,
        isPublished: true,
      };
      if (semester) {
        whereClause.subject = { semester: Number(semester) };
      }

      const results = await prisma.result.findMany({
        where: whereClause,
        include: {
          subject: true,
          exam: true,
        },
        orderBy: { subject: { code: "asc" } },
      });

      const mapped = results.map((r) => ({
        id: r.id,
        subjectCode: r.subject.code,
        subjectName: r.subject.name,
        credits: r.subject.credits,
        internalMarks: Number(r.internalMarks),
        examMarks: Number(r.examMarks),
        totalMarks: Number(r.totalMarks),
        grade: r.grade,
        gradePoints: Number(r.gradePoints),
        semester: r.subject.semester,
        isPublished: r.isPublished,
      }));

      const totalCredits = mapped.reduce((acc, r) => acc + r.credits, 0);
      const weightedPoints = mapped.reduce((acc, r) => acc + r.gradePoints * r.credits, 0);
      const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";
      const cgpa = Number(student.cgpa) > 0 ? Number(student.cgpa).toFixed(2) : sgpa;

      return NextResponse.json({
        success: true,
        results: mapped,
        sgpa,
        cgpa,
        totalCredits,
      });
    }

    // Admin view
    const examId = searchParams.get("examId");
    const whereClause: any = {};
    if (examId) whereClause.examId = examId;

    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        student: { include: { user: true } },
        subject: true,
        exam: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = results.map((r) => ({
      id: r.id,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      enrollmentNumber: r.student.enrollmentNumber,
      subjectCode: r.subject.code,
      subjectName: r.subject.name,
      examTitle: r.exam.title,
      internalMarks: Number(r.internalMarks),
      examMarks: Number(r.examMarks),
      totalMarks: Number(r.totalMarks),
      grade: r.grade,
      gradePoints: Number(r.gradePoints),
      isPublished: r.isPublished,
    }));

    return NextResponse.json({ success: true, results: mapped });
  } catch (err: any) {
    console.error("API GET /api/results error:", err);
    return NextResponse.json({ success: false, error: err.message, results: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN" && session?.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, subjectId, examId, internalMarks, examMarks, isPublished } = body;

    if (!studentId || !subjectId || !examId) {
      return NextResponse.json({ error: "Student, Subject, and Exam are required" }, { status: 400 });
    }

    const intMarks = Number(internalMarks) || 0;
    const exMarks = Number(examMarks) || 0;
    const totalMarks = intMarks + exMarks;
    const { grade, points } = calculateGrade(totalMarks);

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_examId: {
          studentId,
          subjectId,
          examId,
        },
      },
      update: {
        internalMarks: intMarks,
        examMarks: exMarks,
        totalMarks,
        grade,
        gradePoints: points,
        isPublished: isPublished ?? true,
        publishedAt: isPublished ? new Date() : null,
      },
      create: {
        studentId,
        subjectId,
        examId,
        internalMarks: intMarks,
        examMarks: exMarks,
        totalMarks,
        grade,
        gradePoints: points,
        isPublished: isPublished ?? true,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Academic marks recorded and published in MySQL",
      result,
    });
  } catch (err: any) {
    console.error("API POST /api/results error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
