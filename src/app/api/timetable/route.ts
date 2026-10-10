import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

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
        return NextResponse.json({ success: true, timetable: [] });
      }

      const whereClause: any = {
        programId: student.programId,
        semester: student.currentSemester,
      };
      if (day) whereClause.dayOfWeek = Number(day);

      const entries = await prisma.timetableEntry.findMany({
        where: whereClause,
        include: {
          subject: true,
          faculty: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });

      const mapped = entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        subjectCode: e.subject.code,
        subjectName: e.subject.name,
        facultyName: `${e.faculty.firstName} ${e.faculty.lastName}`,
        room: e.room,
      }));

      return NextResponse.json({ success: true, timetable: mapped, slots: mapped });
    }

    // Admin view
    const programId = searchParams.get("programId");
    const semester = searchParams.get("semester");
    const whereClause: any = {};
    if (programId) whereClause.programId = programId;
    if (semester) whereClause.semester = Number(semester);
    if (day) whereClause.dayOfWeek = Number(day);

    const entries = await prisma.timetableEntry.findMany({
      where: whereClause,
      include: {
        subject: true,
        faculty: true,
        program: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const mapped = entries.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
      subjectCode: e.subject.code,
      subjectName: e.subject.name,
      facultyName: `${e.faculty.firstName} ${e.faculty.lastName}`,
      room: e.room,
      programName: e.program.name,
      semester: e.semester,
    }));

    return NextResponse.json({ success: true, timetable: mapped });
  } catch (err: any) {
    console.error("API GET /api/timetable error:", err);
    return NextResponse.json({ success: false, error: err.message, timetable: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];

    const program = await prisma.program.findFirst();
    let faculty = await prisma.faculty.findFirst();
    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: {
          userId: session.userId || "admin_master",
          employeeId: "FAC-001",
          firstName: "Course",
          lastName: "Faculty",
          departmentId: (await prisma.department.findFirst())?.id || "dept_cse",
        },
      });
    }

    const created = [];
    for (const item of items) {
      if (!item.subjectId || !item.dayOfWeek || !item.startTime || !item.endTime) continue;

      const entry = await prisma.timetableEntry.create({
        data: {
          programId: item.programId || program?.id || "prog_btech",
          semester: Number(item.semester) || 1,
          dayOfWeek: Number(item.dayOfWeek),
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room || "Hall B-204",
          subjectId: item.subjectId,
          facultyId: item.facultyId || faculty.id,
          academicYear: item.academicYear || "2024-2025",
        },
      });
      created.push(entry);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} timetable slot(s)`,
      count: created.length,
    });
  } catch (err: any) {
    console.error("API POST /api/timetable error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
