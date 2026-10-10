import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope"); // "catalogue" forces master list

    // 1. If student session and not explicitly requesting master catalogue, return student's enrolled courses only
    if (session?.role === "STUDENT" && scope !== "catalogue") {
      let student = null;
      if (session.studentId) {
        student = await prisma.student.findUnique({ where: { id: session.studentId } });
      }
      if (!student && session.userId) {
        student = await prisma.student.findUnique({ where: { userId: session.userId } });
      }

      if (!student) {
        // Student record not found in database -> return empty list (no fake data)
        return NextResponse.json({ success: true, subjects: [], isEnrolled: false });
      }

      const enrollments = await prisma.subjectEnrollment.findMany({
        where: { studentId: student.id },
        include: {
          subject: {
            include: {
              department: true,
              facultyAssignments: {
                include: { faculty: { include: { user: true } } },
              },
              attendanceSessions: {
                include: {
                  records: {
                    where: { studentId: student.id },
                  },
                },
              },
            },
          },
        },
        orderBy: { subject: { code: "asc" } },
      });

      const mapped = enrollments.map((enr) => {
        const s = enr.subject;
        const totalSessions = s.attendanceSessions.length;
        const attendedSessions = s.attendanceSessions.filter((sess) =>
          sess.records.some((rec) => rec.status === "PRESENT")
        ).length;
        const attendancePercent =
          totalSessions > 0
            ? Number(((attendedSessions / totalSessions) * 100).toFixed(1))
            : 0;

        const faculty = s.facultyAssignments[0]?.faculty;

        return {
          id: s.id,
          code: s.code,
          name: s.name,
          credits: s.credits,
          semester: s.semester,
          type: s.type,
          facultyName: faculty ? `${faculty.firstName} ${faculty.lastName}` : "Faculty Assigned",
          facultyEmail: faculty?.user?.email || "faculty@college.edu",
          description: s.description || "",
          attendancePercent,
          attendedSessions,
          totalSessions,
          enrollmentStatus: enr.status,
          academicYear: enr.academicYear,
        };
      });

      return NextResponse.json({
        success: true,
        subjects: mapped,
        isEnrolled: mapped.length > 0,
      });
    }

    // 2. Admin or general master course catalogue
    const subjects = await prisma.subject.findMany({
      include: {
        department: true,
        facultyAssignments: {
          include: {
            faculty: {
              include: { user: true },
            },
          },
        },
        enrollments: true,
        attendanceSessions: true,
      },
      orderBy: { code: "asc" },
    });

    const mapped = subjects.map((s) => {
      const faculty = s.facultyAssignments[0]?.faculty;
      const totalSessions = s.attendanceSessions.length;
      return {
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
        semester: s.semester,
        type: s.type,
        facultyName: faculty ? `${faculty.firstName} ${faculty.lastName}` : "Unassigned",
        facultyEmail: faculty?.user?.email || "",
        description: s.description || "",
        enrolledCount: s.enrollments.length,
        totalSessions,
        attendedSessions: 0,
        attendancePercent: 0,
      };
    });

    return NextResponse.json({ success: true, subjects: mapped });
  } catch (err: any) {
    console.warn("API GET /api/subjects error:", err.message);
    return NextResponse.json({ success: false, error: err.message, subjects: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    // Only Admin can add subjects
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await request.json();

    // Ensure default department exists in MySQL
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          code: "CSE",
          name: "Computer Science & Engineering",
        },
      });
    }

    // Check if bulk or single
    const items = Array.isArray(body) ? body : [body];
    const createdList = [];

    for (const item of items) {
      const code = item.code?.trim().toUpperCase();
      const name = item.name?.trim();
      if (!code || !name) continue;

      const credits = Number(item.credits) || 3;
      const semester = Number(item.semester) || 1;
      const type = item.type || "Core Theory";
      const description = item.description || "";

      // Upsert into MySQL database
      const subject = await prisma.subject.upsert({
        where: { code },
        update: {
          name,
          credits,
          semester,
          type,
          description,
        },
        create: {
          code,
          name,
          credits,
          semester,
          type,
          description,
          departmentId: dept.id,
        },
      });

      createdList.push({
        id: subject.id,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        semester: subject.semester,
        type: subject.type,
        facultyName: item.facultyName || "Unassigned",
        facultyEmail: item.facultyEmail || "",
        description: subject.description || "",
        attendancePercent: 0,
        attendedSessions: 0,
        totalSessions: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${createdList.length} course(s) to MySQL database college_portal.subject`,
      subjects: createdList,
    });
  } catch (err: any) {
    console.error("API POST /api/subjects error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Course removed from catalogue" });
  } catch (err: any) {
    console.error("API DELETE /api/subjects error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
