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
        return NextResponse.json({
          success: true,
          fees: [],
          totalPaid: 0,
          totalDue: 0,
        });
      }

      const records = await prisma.feeRecord.findMany({
        where: { studentId: student.id },
        include: { payments: { orderBy: { paidAt: "desc" } } },
        orderBy: { dueDate: "desc" },
      });

      const mapped = records.map((r) => {
        const latestPayment = r.payments[0];
        return {
          id: r.id,
          feeType: r.feeType,
          semester: r.semester,
          academicYear: r.academicYear,
          totalAmount: Number(r.totalAmount),
          paidAmount: Number(r.paidAmount),
          dueAmount: Number(r.dueAmount),
          dueDate: new Date(r.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          status: r.status,
          transactionRef: latestPayment?.transactionRef || "--",
          receiptNumber: latestPayment?.receiptNumber || "--",
          paidAt: latestPayment
            ? new Date(latestPayment.paidAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "--",
        };
      });

      const totalPaid = mapped.reduce((acc, f) => acc + f.paidAmount, 0);
      const totalDue = mapped.reduce((acc, f) => acc + f.dueAmount, 0);

      return NextResponse.json({
        success: true,
        fees: mapped,
        totalPaid,
        totalDue,
      });
    }

    // Admin view
    const records = await prisma.feeRecord.findMany({
      include: {
        student: { include: { user: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = records.map((r) => ({
      id: r.id,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      enrollmentNumber: r.student.enrollmentNumber,
      feeType: r.feeType,
      semester: r.semester,
      academicYear: r.academicYear,
      totalAmount: Number(r.totalAmount),
      paidAmount: Number(r.paidAmount),
      dueAmount: Number(r.dueAmount),
      dueDate: new Date(r.dueDate).toISOString().split("T")[0],
      status: r.status,
      paymentsCount: r.payments.length,
    }));

    return NextResponse.json({ success: true, fees: mapped });
  } catch (err: any) {
    console.error("API GET /api/fees error:", err);
    return NextResponse.json({ success: false, error: err.message, fees: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, semester, academicYear, feeType, totalAmount, dueDate } = body;

    if (!studentId || !totalAmount || !dueDate) {
      return NextResponse.json({ error: "Missing required fee details" }, { status: 400 });
    }

    const amount = Number(totalAmount);
    const feeRecord = await prisma.feeRecord.create({
      data: {
        studentId,
        semester: Number(semester) || 1,
        academicYear: academicYear || "2025-2026",
        feeType: feeType || "Semester Tuition & Lab Fee",
        totalAmount: amount,
        paidAmount: 0.0,
        dueAmount: amount,
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fee ledger record generated",
      feeRecord,
    });
  } catch (err: any) {
    console.error("API POST /api/fees error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
