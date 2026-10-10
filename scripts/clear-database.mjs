import "dotenv/config";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🧹 Purging all dummy/demo data from College Student Portal MySQL database...");

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

    console.log(`🔌 Connected to MySQL [${user}@${host}:${port}/${database}]`);

    // Disable foreign keys for safe truncation
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

    const tablesToClear = [
      "LessonProgress",
      "LessonResource",
      "VideoLesson",
      "LearningModule",
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
      } catch (tableErr) {
        // If table doesn't exist yet, continue
      }
    }

    console.log("✅ Cleared operational, transactional, curriculum, and enrollment tables.");

    // Delete all non-admin users, keep or recreate admin
    try {
      await conn.query("DELETE FROM `User` WHERE `role` != 'ADMIN';");
    } catch {}

    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@college.edu";
    const existingAdmins = await conn.query("SELECT `id`, `email` FROM `User` WHERE `role` = 'ADMIN' LIMIT 1;");

    if (existingAdmins.length === 0) {
      const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456", 10);
      const adminId = "admin_" + Date.now();
      await conn.query(
        "INSERT INTO `User` (`id`, `email`, `passwordHash`, `role`, `status`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE', NOW(), NOW());",
        [adminId, adminEmail, adminPasswordHash]
      );
      console.log(`✅ Created clean initial Administrator account: ${adminEmail}`);
    } else {
      console.log(`✅ Preserved existing Administrator account: ${existingAdmins[0].email}`);
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n🎉 Database successfully cleaned! Ready for fresh production data.");
  } catch (err) {
    console.error("❌ Error connecting to MySQL or cleaning database:", err.message);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

main();
