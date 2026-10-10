import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    // Student View
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
          totalAttended: 0,
          totalConducted: 0,
          overallPercentage: 0,
          subjects: [],
          logs: [],
          isEligible: true,
        });
      }

      // Fetch enrolled subjects
      const enrollments = await prisma.subjectEnrollment.findMany({
        where: { studentId: student.id },
        include: {
          subject: {
            include: {
              attendanceSessions: {
                include: {
                  records: {
                    where: { studentId: student.id },
                  },
                },
                orderBy: { sessionDate: "desc" },
              },
            },
          },
        },
      });

      let totalAttended = 0;
      let totalConducted = 0;
      const subjectStats: any[] = [];
      const logs: any[] = [];

      for (const enr of enrollments) {
        const sub = enr.subject;
        const sessions = sub.attendanceSessions;
        const subTotal = sessions.length;
        let subAttended = 0;

        for (const sess of sessions) {
          const rec = sess.records[0];
          const isPresent = rec?.status === "PRESENT";
          if (isPresent) subAttended++;

          logs.push({
            id: rec?.id || sess.id,
            date: new Date(sess.sessionDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            time: sess.slotTime,
            code: sub.code,
            subject: sub.name,
            status: rec?.status || "NOT_MARKED",
            room: "Academic Block",
            topic: sess.topic || "Regular Lecture Session",
          });
        }

        totalAttended += subAttended;
        totalConducted += subTotal;

        const subPercentage =
          subTotal > 0 ? Number(((subAttended / subTotal) * 100).toFixed(1)) : 0;

        subjectStats.push({
          id: sub.id,
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          attendedSessions: subAttended,
          totalSessions: subTotal,
          attendancePercent: subPercentage,
          status: subPercentage < 75 && subTotal > 0 ? "WARNING" : "GOOD",
        });
      }

      // Sort logs by date descending
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const overallPercentage =
        totalConducted > 0
          ? Number(((totalAttended / totalConducted) * 100).toFixed(1))
          : 0;

      return NextResponse.json({
        success: true,
        totalAttended,
        totalConducted,
        overallPercentage,
        subjects: subjectStats,
        logs: logs.slice(0, 50),
        attendance: logs.slice(0, 50),
        isEligible: totalConducted === 0 || overallPercentage >= 75,
      });
    }

    // Admin / Faculty View
    const whereClause: any = {};
    if (subjectId) whereClause.subjectId = subjectId;

    const sessions = await prisma.attendanceSession.findMany({
      where: whereClause,
      include: {
        subject: true,
        faculty: true,
        records: {
          include: { student: true },
        },
      },
      orderBy: { sessionDate: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, sessions });
  } catch (err: any) {
    console.error("API GET /api/attendance error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN" && session?.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { subjectId, sessionDate, slotTime, topic, records } = body;

    if (!subjectId || !sessionDate || !slotTime) {
      return NextResponse.json({ error: "Missing required session fields" }, { status: 400 });
    }

    // Get a faculty id (first faculty or assigned faculty)
    let faculty = await prisma.faculty.findFirst({
      where: { facultySubjects: { some: { subjectId } } },
    });
    if (!faculty) {
      faculty = await prisma.faculty.findFirst();
    }
    if (!faculty) {
      // Create a default faculty member
      const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      faculty = await prisma.faculty.create({
        data: {
          userId: adminUser?.id || "admin_master",
          employeeId: "FAC-001",
          firstName: "Academic",
          lastName: "Faculty",
          departmentId: (await prisma.department.findFirst())?.id || "dept_cse",
        },
      });
    }

    const newSession = await prisma.attendanceSession.create({
      data: {
        subjectId,
        facultyId: faculty.id,
        sessionDate: new Date(sessionDate),
        slotTime,
        topic: topic || "Scheduled Lecture",
      },
    });

    if (Array.isArray(records) && records.length > 0) {
      await prisma.attendanceRecord.createMany({
        data: records.map((r: any) => ({
          sessionId: newSession.id,
          studentId: r.studentId,
          status: r.status || "PRESENT",
          remarks: r.remarks || null,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Attendance register saved to database",
      sessionId: newSession.id,
    });
  } catch (err: any) {
    console.error("API POST /api/attendance error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
