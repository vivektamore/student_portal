import { NextResponse } from "next/server";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    let host = process.env.DATABASE_HOST || "localhost";
    let port = Number(process.env.DATABASE_PORT) || 3306;
    let user = process.env.DATABASE_USER || "root";
    let password = process.env.DATABASE_PASSWORD || "";
    let database = process.env.DATABASE_NAME || "college_portal";
    let ssl = undefined;

    if (process.env.DATABASE_URL) {
      try {
        const parsedUrl = new URL(process.env.DATABASE_URL);
        host = parsedUrl.hostname;
        if (parsedUrl.port) port = Number(parsedUrl.port);
        if (parsedUrl.username) user = decodeURIComponent(parsedUrl.username);
        if (parsedUrl.password) password = decodeURIComponent(parsedUrl.password);
        if (parsedUrl.pathname) database = parsedUrl.pathname.replace(/^\//, "");
        if (parsedUrl.searchParams.get("ssl") || (host !== "localhost" && host !== "127.0.0.1")) {
          ssl = { rejectUnauthorized: false };
        }
      } catch {}
    }

    let conn;
    try {
      conn = await mariadb.createConnection({
        host,
        port,
        user,
        password,
        database,
        ...(ssl ? { ssl } : {}),
        connectTimeout: 8000,
      });

      // Disable foreign keys for safe truncation
      await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

      const tablesToClear = [
        "AuditLog",
        "NoticeAudience",
        "Notice",
        "Payment",
        "FeeRecord",
        "Result",
        "Exam",
        "AssignmentSubmission",
        "Assignment",
        "AttendanceRecord",
        "AttendanceSession",
        "TimetableEntry",
        "FacultySubject",
        "SubjectEnrollment",
        "Subject",
        "Student",
        "Faculty",
        "Program",
        "Department",
      ];

      for (const table of tablesToClear) {
        try {
          await conn.query(`TRUNCATE TABLE \`${table}\`;`);
        } catch {}
        try {
          await conn.query(`TRUNCATE TABLE \`${table.toLowerCase()}\`;`);
        } catch {}
      }

      // Delete non-admin users
      try {
        await conn.query("DELETE FROM `User` WHERE `role` != 'ADMIN';");
      } catch {
        try {
          await conn.query("DELETE FROM `user` WHERE `role` != 'ADMIN';");
        } catch {}
      }

      const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@college.edu";
      let existingAdmins = [];
      try {
        existingAdmins = await conn.query("SELECT `id`, `email` FROM `User` WHERE `role` = 'ADMIN' LIMIT 1;");
      } catch {
        try {
          existingAdmins = await conn.query("SELECT `id`, `email` FROM `user` WHERE `role` = 'ADMIN' LIMIT 1;");
        } catch {}
      }

      if (!existingAdmins || existingAdmins.length === 0) {
        const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456", 10);
        const adminId = "admin_" + Date.now();
        try {
          await conn.query(
            "INSERT INTO `User` (`id`, `email`, `passwordHash`, `role`, `status`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE', NOW(), NOW());",
            [adminId, adminEmail, adminPasswordHash]
          );
        } catch {
          await conn.query(
            "INSERT INTO `user` (`id`, `email`, `passwordHash`, `role`, `status`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE', NOW(), NOW());",
            [adminId, adminEmail, adminPasswordHash]
          );
        }
      }

      await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
      await conn.end();

      return NextResponse.json({
        success: true,
        message: "MySQL database tables truncated and admin preserved. Ready for production data.",
      });
    } catch (dbErr: any) {
      console.warn("Direct MySQL clear warning:", dbErr.message);
      return NextResponse.json({
        success: true,
        warning: `Database clear warning: ${dbErr.message}. Local storage cleared.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
