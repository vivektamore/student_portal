import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getDepartmentCode, getProgramCode, generateRollNumber } from "@/lib/roll-generator";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        program: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = students.map((s) => ({
      id: s.id,
      userId: s.userId,
      enrollmentNumber: s.enrollmentNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.user.email,
      phone: s.phone || "",
      department: s.program?.department?.name || "Computer Science & Engineering",
      program: s.program?.name || "B.Tech Computer Science",
      semester: s.currentSemester,
      cgpa: Number(s.cgpa) || 0.0,
      status: s.user.status,
    }));

    return NextResponse.json({ success: true, students: mapped });
  } catch (err: any) {
    console.warn("API GET /api/students warning:", err.message);
    return NextResponse.json({ success: false, students: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deptName = body.department || "Computer Science & Engineering";
    const progName = body.program || "B.Tech Computer Science";
    const deptCode = getDepartmentCode(deptName);
    const progCode = getProgramCode(progName, deptCode);
    const semester = Number(body.semester) || 1;
    const firstName = body.firstName || "Student";
    const lastName = body.lastName || "";

    // 1. Find or create exact Department
    let dept = await prisma.department.findFirst({
      where: {
        OR: [
          { name: deptName },
          { code: deptCode },
        ],
      },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: {
          code: deptCode,
          name: deptName,
        },
      });
    }

    // 2. Find or create exact Program
    let program = await prisma.program.findFirst({
      where: {
        OR: [
          { name: progName },
          { code: `${progCode}-${dept.code}` },
        ],
      },
    });

    if (!program) {
      program = await prisma.program.create({
        data: {
          code: `${progCode}-${dept.code}`,
          name: progName,
          departmentId: dept.id,
          degreeType: progName.startsWith("M.") ? "M.Tech" : progName.startsWith("MBA") ? "MBA" : "B.Tech",
          totalSemesters: progName.startsWith("M.") || progName.startsWith("MBA") ? 4 : 8,
        },
      });
    }

    // 3. Auto-generate Roll Number if missing or default dummy placeholder
    let enrollmentNumber = body.enrollmentNumber;
    if (
      !enrollmentNumber ||
      enrollmentNumber === "VU-2024-CSE-0310" ||
      enrollmentNumber.trim() === "" ||
      enrollmentNumber.startsWith("AUTO")
    ) {
      const existingCount = await prisma.student.count({
        where: { departmentId: dept.id },
      });
      enrollmentNumber = generateRollNumber(deptName, progName, 2024, existingCount + 1);
    }

    // 4. Generate clean institutional email if missing or dummy
    let email = body.email;
    if (
      !email ||
      email === "student.2024@apex.edu" ||
      email.includes("new.student@apex.edu") ||
      email.trim() === ""
    ) {
      const sanitizedFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sanitizedLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const rollSuffix = enrollmentNumber.split("-").pop() || Date.now().toString().slice(-4);
      email = sanitizedLast
        ? `${sanitizedFirst}.${sanitizedLast}.${rollSuffix}@college.edu`
        : `${sanitizedFirst}.${rollSuffix}@college.edu`;
    }

    const passwordHash = await bcrypt.hash("Student@123456", 10);

    // 5. Create or reuse User account in MySQL
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "STUDENT",
          status: "ACTIVE",
        },
      });
    }

    // 6. Create Student profile in MySQL
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        enrollmentNumber,
        firstName,
        lastName,
        phone: body.phone || "+91 98765 43210",
        departmentId: dept.id,
        programId: program.id,
        currentSemester: semester,
        academicYear: body.academicYear || "2024-2025",
        cgpa: 0.0,
      },
      include: {
        user: true,
        program: {
          include: {
            department: true,
          },
        },
      },
    });

    // 7. Auto-enroll student into active subjects of this department/semester if any exist
    try {
      const availableSubjects = await prisma.subject.findMany({
        where: {
          OR: [
            { departmentId: dept.id, semester: semester },
            { departmentId: dept.id },
          ],
        },
        take: 6,
      });

      for (const subj of availableSubjects) {
        await prisma.subjectEnrollment.create({
          data: {
            studentId: student.id,
            subjectId: subj.id,
            semester: semester,
            academicYear: "2024-2025",
            status: "ENROLLED",
          },
        });
      }
    } catch {
      // Non-fatal if no subjects exist yet
    }

    const formatted = {
      id: student.id,
      userId: student.userId,
      enrollmentNumber: student.enrollmentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      department: student.program.department.name,
      program: student.program.name,
      semester: student.currentSemester,
      cgpa: Number(student.cgpa) || 0.0,
      status: student.user.status,
    };

    return NextResponse.json({
      success: true,
      message: `Enrolled student saved to MySQL database college_portal.student`,
      student: formatted,
    });
  } catch (err: any) {
    console.error("API POST /api/students error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
