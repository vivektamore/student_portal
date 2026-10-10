import http from "node:http";

const BASE_URL = "http://localhost:3000";

let adminCookie = "";
let studentCookie = "";

const testResults = [];

function recordTest(category, name, passed, details = "") {
  testResults.push({ category, name, passed, details });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] ${category} :: ${name} ${details ? "- " + details : ""}`);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

async function runTests() {
  console.log("==================================================");
  console.log("STARTING LIVE QA AUTOMATION SUITE ON", BASE_URL);
  console.log("==================================================");

  // 1. Authentication Tests
  try {
    // 1.1 Empty credentials
    const emptyRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "", password: "" }),
    });
    recordTest("Authentication", "Rejects empty credentials with 400", emptyRes.status === 400);

    // 1.2 Invalid password
    const invalidRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "admin@college.edu", password: "WrongPassword999!" }),
    });
    recordTest("Authentication", "Rejects invalid credentials with 401", invalidRes.status === 401);

    // 1.3 Admin login
    const adminLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "admin@college.edu", password: "Admin@123456" }),
    });
    const adminJson = await adminLoginRes.json();
    const adminSetCookie = adminLoginRes.headers.get("set-cookie") || "";
    adminCookie = adminSetCookie.split(";")[0];
    recordTest("Authentication", "Admin login successful", adminJson.success && adminJson.role === "ADMIN", `Role: ${adminJson.role}`);

    // 1.4 Student login (using the created student Aarav Patel)
    const studentLoginRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "aarav.patel.0001@college.edu", password: "Student@123456" }),
    });
    const studentJson = await studentLoginRes.json();
    const studentSetCookie = studentLoginRes.headers.get("set-cookie") || "";
    studentCookie = studentSetCookie.split(";")[0];
    recordTest("Authentication", "Student login successful", studentJson.success && studentJson.role === "STUDENT", `Role: ${studentJson.role}`);
  } catch (err) {
    recordTest("Authentication", "Authentication suite execution", false, err.message);
  }

  // 2. Authorization & Middleware Route Protection
  try {
    // 2.1 Unauthenticated access to /admin/dashboard
    const unauthAdmin = await request("/admin/dashboard");
    const isRedirectLogin = unauthAdmin.status === 307 || unauthAdmin.status === 302;
    const location = unauthAdmin.headers.get("location") || "";
    recordTest("Authorization", "Unauthenticated request to /admin redirected to /login", isRedirectLogin && location.includes("/login"), `Status: ${unauthAdmin.status}, Loc: ${location}`);

    // 2.2 Unauthenticated access to /student/dashboard
    const unauthStudent = await request("/student/dashboard");
    const isStudentRedirectLogin = unauthStudent.status === 307 || unauthStudent.status === 302;
    const studentLoc = unauthStudent.headers.get("location") || "";
    recordTest("Authorization", "Unauthenticated request to /student redirected to /login", isStudentRedirectLogin && studentLoc.includes("/login"), `Status: ${unauthStudent.status}, Loc: ${studentLoc}`);

    // 2.3 Student attempting to access /admin/dashboard
    const studentAccessAdmin = await request("/admin/dashboard", {
      headers: { Cookie: studentCookie },
    });
    const studentBlockedFromAdmin = (studentAccessAdmin.status === 307 || studentAccessAdmin.status === 302) &&
      (studentAccessAdmin.headers.get("location") || "").includes("/student/dashboard");
    recordTest("Authorization", "Student forbidden from /admin and redirected to student dashboard", studentBlockedFromAdmin, `Status: ${studentAccessAdmin.status}`);

    // 2.4 Admin access to /admin/dashboard
    const adminAccessAdmin = await request("/admin/dashboard", {
      headers: { Cookie: adminCookie },
    });
    recordTest("Authorization", "Admin granted access to /admin/dashboard", adminAccessAdmin.status === 200);

    // 2.5 Student access to /student/dashboard
    const studentAccessStudent = await request("/student/dashboard", {
      headers: { Cookie: studentCookie },
    });
    recordTest("Authorization", "Student granted access to /student/dashboard", studentAccessStudent.status === 200);
  } catch (err) {
    recordTest("Authorization", "Authorization suite execution", false, err.message);
  }

  // 3. Roll Number Generation API
  try {
    const rollCseRes = await request("/api/students/generate-roll?department=Computer%20Science%20%26%20Engineering&program=B.Tech%20Computer%20Science&year=2024");
    const rollCseJson = await rollCseRes.json();
    recordTest("Roll Generation", "Auto-generates sequential CSE roll number", rollCseJson.success && rollCseJson.rollNumber.startsWith("VU-2024-CSE-"), `Roll: ${rollCseJson.rollNumber}`);

    const rollEceRes = await request("/api/students/generate-roll?department=Electronics%20%26%20Communication&program=B.Tech%20Electronics&year=2024");
    const rollEceJson = await rollEceRes.json();
    recordTest("Roll Generation", "Auto-generates ECE roll number with department code", rollEceJson.success && rollEceJson.rollNumber.startsWith("VU-2024-ECE-"), `Roll: ${rollEceJson.rollNumber}`);
  } catch (err) {
    recordTest("Roll Generation", "Roll generation API", false, err.message);
  }

  // 4. Student Directory API
  try {
    const studentsRes = await request("/api/students", {
      headers: { Cookie: adminCookie },
    });
    const studentsJson = await studentsRes.json();
    const hasStudents = studentsJson.success && Array.isArray(studentsJson.students) && studentsJson.students.length > 0;
    const foundAarav = studentsJson.students?.find(s => s.firstName === "Aarav");
    recordTest("Student Directory", "GET /api/students returns persistent student roster", hasStudents && !!foundAarav, `Found: ${foundAarav?.firstName} ${foundAarav?.lastName} (${foundAarav?.enrollmentNumber})`);
  } catch (err) {
    recordTest("Student Directory", "Student directory API", false, err.message);
  }

  // 5. Subjects API
  try {
    const catalogueRes = await request("/api/subjects?scope=catalogue", {
      headers: { Cookie: adminCookie },
    });
    const catalogueJson = await catalogueRes.json();
    recordTest("Subjects", "GET /api/subjects?scope=catalogue returns subject catalogue", catalogueJson.success && Array.isArray(catalogueJson.subjects));

    // Create a subject
    const createSubjRes = await request("/api/subjects", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        code: `CSE-QA-${Date.now().toString().slice(-4)}`,
        name: "Software Quality Assurance & Automation",
        credits: 4,
        semester: 1,
        type: "THEORY",
        departmentName: "Computer Science & Engineering",
        facultyName: "Dr. Eleanor Vance",
        facultyEmail: "eleanor.vance@college.edu",
      }),
    });
    const createSubjJson = await createSubjRes.json();
    recordTest("Subjects", "POST /api/subjects creates subject record in MySQL", createSubjJson.success);
  } catch (err) {
    recordTest("Subjects", "Subjects API", false, err.message);
  }

  // 6. Timetable API
  try {
    const timetableRes = await request("/api/timetable", {
      headers: { Cookie: studentCookie },
    });
    const timetableJson = await timetableRes.json();
    recordTest("Timetable", "GET /api/timetable returns slots array", timetableJson.success && Array.isArray(timetableJson.slots));
  } catch (err) {
    recordTest("Timetable", "Timetable API", false, err.message);
  }

  // 7. Attendance API
  try {
    const attendanceRes = await request("/api/attendance", {
      headers: { Cookie: studentCookie },
    });
    const attendanceJson = await attendanceRes.json();
    recordTest("Attendance", "GET /api/attendance returns attendance records", attendanceJson.success && Array.isArray(attendanceJson.attendance));
  } catch (err) {
    recordTest("Attendance", "Attendance API", false, err.message);
  }

  // 8. Assignments API
  try {
    const assignmentsRes = await request("/api/assignments", {
      headers: { Cookie: studentCookie },
    });
    const assignmentsJson = await assignmentsRes.json();
    recordTest("Assignments", "GET /api/assignments returns coursework assignments", assignmentsJson.success && Array.isArray(assignmentsJson.assignments));

    const createAssignRes = await request("/api/assignments", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        title: "E2E Automated Testing Suite Deliverable",
        description: "Submit test matrix and coverage results.",
        dueDate: "2025-05-30T23:59:00.000Z",
        maxMarks: 100,
        subjectCode: "CS101",
      }),
    });
    const createAssignJson = await createAssignRes.json();
    recordTest("Assignments", "POST /api/assignments persists coursework in MySQL", createAssignJson.success);
  } catch (err) {
    recordTest("Assignments", "Assignments API", false, err.message);
  }

  // 9. Exams & Results API
  try {
    const examsRes = await request("/api/exams", {
      headers: { Cookie: studentCookie },
    });
    const examsJson = await examsRes.json();
    recordTest("Exams", "GET /api/exams returns scheduled exam periods", examsJson.success && Array.isArray(examsJson.exams));

    const resultsRes = await request("/api/results", {
      headers: { Cookie: studentCookie },
    });
    const resultsJson = await resultsRes.json();
    recordTest("Results", "GET /api/results returns academic score records", resultsJson.success && Array.isArray(resultsJson.results));
  } catch (err) {
    recordTest("Exams & Results", "Exams & Results API", false, err.message);
  }

  // 10. Fees API
  try {
    const feesRes = await request("/api/fees", {
      headers: { Cookie: studentCookie },
    });
    const feesJson = await feesRes.json();
    recordTest("Fees", "GET /api/fees returns student fee ledger", feesJson.success && Array.isArray(feesJson.fees));
  } catch (err) {
    recordTest("Fees", "Fees API", false, err.message);
  }

  // 11. Notices API
  try {
    const noticesRes = await request("/api/notices", {
      headers: { Cookie: studentCookie },
    });
    const noticesJson = await noticesRes.json();
    recordTest("Notices", "GET /api/notices returns institutional circulars", noticesJson.success && Array.isArray(noticesJson.notices));

    const createNoticeRes = await request("/api/notices", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        title: "Campus Autonomous Vehicle & Robotics Showcase",
        content: "Annual innovation symposium will take place at the Technology Auditorium.",
        category: "ACADEMIC",
        priority: "NORMAL",
        publishedAt: new Date().toISOString(),
      }),
    });
    const createNoticeJson = await createNoticeRes.json();
    recordTest("Notices", "POST /api/notices publishes circular to MySQL", createNoticeJson.success);
  } catch (err) {
    recordTest("Notices", "Notices API", false, err.message);
  }

  // 12. Learning Content (Video Lectures) API
  try {
    const contentRes = await request("/api/learning-content");
    const contentJson = await contentRes.json();
    recordTest("Video Lectures", "GET /api/learning-content returns curriculum modules and video streams", contentJson.success && Array.isArray(contentJson.modules));

    const createLectureRes = await request("/api/learning-content", {
      method: "POST",
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        title: "Continuous Integration & Deployment Pipelines",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        durationSec: 1800,
        subjectCode: "CS101",
        moduleName: "Module 4: DevOps & Testing Automation",
      }),
    });
    const createLectureJson = await createLectureRes.json();
    recordTest("Video Lectures", "POST /api/learning-content creates video lesson in MySQL", createLectureJson.success);
  } catch (err) {
    recordTest("Video Lectures", "Video Lectures API", false, err.message);
  }

  // Summary
  console.log("\n==================================================");
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error("Fatal Test Suite Crash:", e);
  process.exit(1);
});
