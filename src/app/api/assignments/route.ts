import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const isStudent = session?.role === "STUDENT";

    let studentId = session?.studentId;
    if (isStudent && !studentId && session?.userId) {
      const studentRec = await prisma.student.findUnique({
        where: { userId: session.userId },
      });
      if (studentRec) studentId = studentRec.id;
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const whereClause: any = {};
    if (isStudent) {
      whereClause.isPublished = true;
    }
    if (subjectId) {
      whereClause.OR = [{ subjectId }, { subject: { code: subjectId } }];
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        subject: true,
        faculty: true,
        submissions: studentId
          ? {
              where: { studentId },
            }
          : true,
      },
      orderBy: { dueDate: "asc" },
    });

    const mapped = assignments.map((a) => {
      const userSubmission = studentId ? a.submissions[0] : null;
      let status: "PENDING" | "SUBMITTED" | "GRADED" = "PENDING";
      let marksObtained: number | undefined = undefined;
      let feedback: string | undefined = undefined;
      let submittedAt: string | undefined = undefined;
      let submissionFile: string | undefined = undefined;

      if (userSubmission) {
        status = userSubmission.status as "PENDING" | "SUBMITTED" | "GRADED";
        if (userSubmission.marksObtained !== null && userSubmission.marksObtained !== undefined) {
          marksObtained = Number(userSubmission.marksObtained);
        }
        feedback = userSubmission.feedback || undefined;
        submittedAt = userSubmission.submittedAt?.toISOString();
        submissionFile = userSubmission.fileUrl || undefined;
      }

      // Format human-friendly due date string
      const due = new Date(a.dueDate);
      const dueDateFormatted = due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: a.id,
        subjectCode: a.subject?.code || "GEN-101",
        subjectName: a.subject?.name || "General Course",
        title: a.title,
        description: a.description,
        dueDate: dueDateFormatted,
        dueDateRaw: a.dueDate.toISOString(),
        maxMarks: a.maxMarks,
        fileUrl: a.fileUrl || undefined,
        status,
        marksObtained,
        feedback,
        submittedAt,
        submissionFile,
        submissionsCount: a.submissions.length,
      };
    });

    return NextResponse.json({ success: true, assignments: mapped });
  } catch (err: any) {
    console.warn("GET /api/assignments query warning:", err.message);
    return NextResponse.json({ success: true, assignments: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session && session.role !== "ADMIN" && session.role !== "FACULTY" && process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subjectCode, title, description, dueDate, maxMarks, fileUrl } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Assignment title is required." },
        { status: 400 }
      );
    }

    // Find or create subject
    let subject = await prisma.subject.findFirst({
      where: {
        OR: [{ code: subjectCode }, { id: subjectCode }],
      },
    });

    if (!subject) {
      let dept = await prisma.department.findFirst();
      if (!dept) {
        dept = await prisma.department.create({
          data: { code: "CSE", name: "Computer Science & Engineering" },
        });
      }
      subject = await prisma.subject.create({
        data: {
          code: subjectCode || "CS-301",
          name: "Computer Science Course",
          credits: 4,
          semester: 6,
          departmentId: dept.id,
        },
      });
    }

    // Find or create faculty
    let faculty = await prisma.faculty.findFirst();
    if (!faculty) {
      let facultyUser = await prisma.user.findFirst({ where: { role: "FACULTY" } });
      if (!facultyUser) {
        facultyUser = await prisma.user.create({
          data: {
            email: "faculty@college.edu",
            passwordHash: "dummyHash",
            role: "FACULTY",
            status: "ACTIVE",
          },
        });
      }
      faculty = await prisma.faculty.create({
        data: {
          userId: facultyUser.id,
          employeeId: "FAC-001",
          firstName: "Academic",
          lastName: "Instructor",
          departmentId: subject.departmentId,
        },
      });
    }

    // Parse dueDate
    let parsedDueDate = new Date();
    if (dueDate) {
      const parsed = new Date(dueDate);
      if (!isNaN(parsed.getTime())) {
        parsedDueDate = parsed;
      } else {
        parsedDueDate.setDate(parsedDueDate.getDate() + 7);
      }
    } else {
      parsedDueDate.setDate(parsedDueDate.getDate() + 7);
    }

    const created = await prisma.assignment.create({
      data: {
        subjectId: subject.id,
        facultyId: faculty.id,
        title,
        description: description || "",
        dueDate: parsedDueDate,
        maxMarks: Number(maxMarks) || 100,
        fileUrl: fileUrl || null,
        isPublished: true,
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: created.id,
        subjectCode: created.subject.code,
        subjectName: created.subject.name,
        title: created.title,
        description: created.description,
        dueDate: created.dueDate.toLocaleDateString(),
        maxMarks: created.maxMarks,
        status: "PENDING",
      },
    });
  } catch (err: any) {
    console.error("POST /api/assignments error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
