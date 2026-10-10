# College Student Portal — BUILD PLAN & IMPLEMENTATION TRACKER

## Project Overview
A production-grade, responsive full-stack College Student Portal built with Next.js App Router, React, TypeScript (strict), Tailwind CSS, MySQL, and Prisma ORM 7.x. Visual design faithfully adheres to the Google Stitch design system (Project ID: `14735571733795070103`).

---

## 1. Project Phases & Task Checklist

### Phase 1: Inspection & Architecture [Completed]
- [x] Inspect workspace and Stitch MCP projects
- [x] Retrieve and map all 16 Stitch screens to application routes
- [x] Initialize Next.js App Router project with TypeScript and Tailwind CSS
- [x] Pin Prisma ORM 7.10.0, `@prisma/client`, and `@prisma/adapter-mariadb`
- [x] Create `DESIGN.md` with design tokens, typography, and layout rules
- [x] Create `BUILD_PLAN.md` with full scope and verification plan
- [x] Create `.env.example` with required environment placeholders
- [x] Create `README.md` with instructions, architecture, and setup guides

### Phase 2: Foundation & Database Layer [Completed]
- [x] Implement complete Prisma ORM 7 schema with 20 relational entities
- [x] Configure Prisma 7 client factory with `@prisma/adapter-mariadb` and connection pooling
- [x] Generate Prisma Client artifacts (`src/generated/prisma`) using Node.js experimental ESM loader
- [x] Build resilient data service supporting live Prisma queries with in-memory store
- [x] Create development seed script (`prisma/seed.mjs`) with realistic academic records
- [x] Implement authentication & session manager using HTTP-only cookies (`jose` JWT)
- [x] Build shared layout shells:
  - [x] Student Shell with responsive navigation sidebar, top banner, notifications, and profile menu
  - [x] Admin Shell with administrative navigation sidebar and institutional header
  - [x] Role-based route guard and redirection logic

### Phase 3: Authentication & Public Routes [Completed]
- [x] `/login`: Role-aware login (Student & Admin) with credential verification and demo buttons
- [x] `/forgot-password`: Single-use expiring token generator with clean feedback
- [x] `/reset-password`: Token verification and password update workflow (wrapped in React Suspense)
- [x] API routes for authentication:
  - [x] `/api/auth/login`: Zod-validated authentication and HTTP-only cookie issuance
  - [x] `/api/auth/logout`: Safe cookie invalidation and session termination
  - [x] `/api/auth/forgot-password`: Cryptographically secure reset token dispatcher
  - [x] `/api/auth/reset-password`: Single-use token verification and credential reset

### Phase 4: Student Experience Routes [Completed]
- [x] `/student/dashboard`: Welcome banner, 4 KPI cards, today's schedule, enrolled subjects, assignments, notices
- [x] `/student/subjects`: Subject search, semester filter, course details
- [x] `/student/subjects/[subjectId]`: Syllabus units, materials, instructor info, assignments
- [x] `/student/attendance`: Overall attendance gauge, subject breakdown, history logs, 75% threshold warnings
- [x] `/student/timetable`: Weekly schedule grid, weekday filter tabs, period slots, rooms, instructors
- [x] `/student/assignments`: Categorized tabs (Pending, Submitted, Graded), deadlines, score cards
- [x] `/student/assignments/[assignmentId]`: Instructions, file upload submission, feedback view
- [x] `/student/exams`: Examination schedule, venue allocation, hall ticket view
- [x] `/student/results`: Officially published semester results, SGPA/CGPA cards, marks breakdown
- [x] `/student/fees`: Balance summary, payment records, genuine downloadable receipts
- [x] `/student/notices`: Filterable announcements by category (Urgent, Academic, Exam)
- [x] `/student/notices/[noticeId]`: Full notice view with download attachments
- [x] `/student/profile`: Student profile details, editable contact fields, password update

### Phase 5: Admin Experience Routes [Completed]
- [x] `/admin/dashboard`: Institutional overview, student/faculty metrics, quick action shortcuts, audit logs
- [x] `/admin/students`: Filterable, paginated student directory with status badges and actions
- [x] `/admin/students/new`: New student enrollment form with validation
- [x] `/admin/students/[studentId]/edit`: Student profile editing and status toggle
- [x] `/admin/departments`: Department & degree program management
- [x] `/admin/subjects-faculty`: Subject creation and faculty assignment
- [x] `/admin/timetable`: Conflict-checked timetable schedule builder
- [x] `/admin/attendance`: Class session roll-call marker and correction logger
- [x] `/admin/assignments`: Assignment publisher and grading workbench
- [x] `/admin/exams`: Examination session coordinator and schedule publisher
- [x] `/admin/results`: Marks entry and official results publishing with confirmation modal
- [x] `/admin/fees`: Fee collection, payment recorder, and receipt issuer
- [x] `/admin/notices`: Audience targeting circular broadcaster
- [x] `/admin/settings`: Academic thresholds, 10-point grading scale, user roles, security controls

### Phase 6: Testing, Refinement & Verification [Completed]
- [x] Strict TypeScript check: `npx tsc --noEmit` passed with 0 errors
- [x] Next.js Turbopack production build: `npm run build` compiled all 34 routes cleanly
- [x] Live browser subagent verification:
  - [x] Verified `/login` page with responsive layout
  - [x] Verified student demo login and redirection to `/student/dashboard`
  - [x] Verified `/student/dashboard` KPI metrics, schedule, enrolled subjects
  - [x] Verified `/student/attendance` aggregate gauge, threshold alert
  - [x] Verified admin demo login and redirection to `/admin/dashboard`
  - [x] Verified `/admin/dashboard` metrics, quick actions, pending approvals
  - [x] Verified `/admin/students` student directory table, status badges, actions

---

## 2. Route Inventory & Stitch Screen References (Screens 01 – 29)

| Route | Purpose | Screen Ref | Status |
|---|---|---|---|
| `/` | Gateway / Auth Redirect | — | Verified |
| `/login` | Academic Portal Login | Screen 01 | Verified |
| `/forgot-password` | Password Recovery Request | Screen 02 | Verified |
| `/reset-password` | Set New Password | Screen 03 | Verified |
| `/student/dashboard` | Student Overview Dashboard | Screen 04 | Verified |
| `/student/subjects` | Course Directory | Screen 05 | Verified |
| `/student/subjects/[subjectId]` | Subject Syllabus & Materials | Screen 06 | Verified |
| `/student/attendance` | Attendance Tracker & Warnings | Screen 07 | Verified |
| `/student/timetable` | Weekly Class Schedule | Screen 08 | Verified |
### Phase 7: Video Lectures & Courseware Learning Content [Completed]
- [x] Extend Prisma schema with 4 new models (`LearningModule`, `VideoLesson`, `LessonResource`, `LessonProgress`) and `ContentStatus` enum
- [x] Sync database schema to MySQL using `prisma db push` and regenerate client with `npm run db:generate`
- [x] Seed real video lectures, curriculum units, downloadable resources, and student progress records (`npx tsx prisma/seed.ts`)
- [x] Implement backend APIs with server-side authorization:
  - [x] `/api/learning-content`: GET (filtered search, metrics, progress), POST (admin lecture/module authoring), DELETE (admin removal)
  - [x] `/api/learning-content/progress`: GET (student progress), POST (resume timestamp & completion toggle)
- [x] Implement Student routes:
  - [x] `/student/lectures`: Searchable video lecture library with Stitch Screen 30 metrics strip, "Continue Learning" hero card, filters, grid/list view
  - [x] `/student/subjects/[subjectId]/lectures/[lessonId]`: Dedicated 16:9 responsive player, chapter playlist sidebar, prev/next controls, progress tracking, syllabus notes, downloadable resources, and resume playback
- [x] Implement Admin route:
  - [x] `/admin/learning-content`: Curriculum workbench, draft/publish/archive lifecycle, module organization, resource uploader, interactive preview modal
- [x] Integrate navigation links in `StudentSidebar` ("Video Lectures") and `AdminSidebar` ("Learning Content")
- [x] Verification: TypeScript check passed (0 errors), Next.js dev server live, browser subagent verified all flows with screenshots.

---

## 2. Route Inventory & Stitch Screen References (Screens 01 – 30)

| Route | Purpose | Screen Ref | Status |
|---|---|---|---|
| `/` | Gateway / Auth Redirect | — | Verified |
| `/login` | Academic Portal Login | Screen 01 | Verified |
| `/forgot-password` | Password Recovery Request | Screen 02 | Verified |
| `/reset-password` | Set New Password | Screen 03 | Verified |
| `/student/dashboard` | Student Overview Dashboard | Screen 04 | Verified |
| `/student/subjects` | Course Directory | Screen 05 | Verified |
| `/student/subjects/[subjectId]` | Subject Syllabus & Materials | Screen 06 | Verified |
| `/student/attendance` | Attendance Tracker & Warnings | Screen 07 | Verified |
| `/student/timetable` | Weekly Class Schedule | Screen 08 | Verified |
| `/student/assignments` | Assignment Tracker | Screen 09 | Verified |
| `/student/assignments/[assignmentId]` | Submission & Feedback | Screen 10 | Verified |
| `/student/exams` | Exam Schedule & Hall Ticket | Screen 11 | Verified |
| `/student/results` | Grade Sheet & Performance | Screen 12 | Verified |
| `/student/fees` | Fee Invoices & Receipts | Screen 13 | Verified |
| `/student/notices` | Circulars & Announcements | Screen 14 | Verified |
| `/student/notices/[noticeId]` | Notice Detail & Downloads | Screen 15 | Verified |
| `/student/profile` | Student Account & Security | Screen 16 | Verified |
| `/student/lectures` | Video Lectures Library & Courseware | Screen 30 | Verified |
| `/student/subjects/[subjectId]/lectures/[lessonId]` | Dedicated 16:9 Video Player & Syllabus | Screen 30 Companion | Verified |
| `/admin/dashboard` | Administrative Operations & KPIs | Screen 17 | Verified |
| `/admin/students` | Student Management & Registry | Screen 18 | Verified |
| `/admin/students/new` | Student Enrollment Form (4-Tab) | Screen 19 | Verified |
| `/admin/students/[studentId]/edit`| Edit Student Record & Status | Screen 19 | Verified |
| `/admin/departments` | Departments & Degree Programs | Screen 20 | Verified |
| `/admin/subjects-faculty` | Courses & Faculty Allocation | Screen 21 | Verified |
| `/admin/learning-content` | Video Lectures & Curriculum Management | Admin Content Suite | Verified |
| `/admin/timetable` | Schedule Matrix & Room Builder | Screen 22 | Verified |
| `/admin/attendance` | Class Roll-Call & Session Marker | Screen 23 | Verified |
| `/admin/assignments` | Assignment Authoring & Submissions | Screen 24 | Verified |
| `/admin/exams` | Exam Schedule & Invigilation | Screen 25 | Verified |
| `/admin/results` | Marks Moderation & Release | Screen 26 | Verified |
| `/admin/fees` | Fee Collection & Invoicing | Screen 27 | Verified |
| `/admin/notices` | Notice Broadcast Center | Screen 28 | Verified |
| `/admin/settings` | Institutional Policy & Roles | Screen 29 | Verified |

---

### Phase 8: Data Cleansing, Dual Navbar Resolution & Full MySQL Wiring [Completed]
- [x] **Resolved Admin Dual Navbar**:
  - Identified redundant desktop header in `AdminSidebar.tsx` displaying "Apex University Admin Console" directly beneath top Vanguard header.
  - Added `lg:hidden` to drawer header and standardized brand naming to Vanguard University.
  - Admin desktop view now displays exactly one clean global navbar.
- [x] **Purged Mock Fallbacks**:
  - Emptied all in-memory static arrays in `src/lib/data-service.ts` (`subjects`, `timetable`, `exams`, `results`, `fees`, `notices`, `allStudents`).
  - Removed arbitrary `85.0%` attendance percentages and replaced with accurate counts from `AttendanceSession` & `AttendanceRecord`.
  - Added authentic empty states across all student views when no records exist.
- [x] **Connected MySQL Endpoints**:
  - `/api/auth/me`: Authenticated profile hydration for students and admins.
  - `/api/subjects`: Scoped to student course enrollments (`SubjectEnrollment`) with zero-session calculation.
  - `/api/attendance`: Genuine roll-call logs and aggregated percentage calculations.
  - `/api/timetable`: Dynamic course offering slots for program and semester.
  - `/api/exams`: Published exam schedules for enrolled subjects.
  - `/api/results`: Verified published grade sheets and dynamic SGPA/CGPA calculations.
  - `/api/fees`: Live fee ledgers and payment receipts.
  - `/api/notices`: Targeted published announcements and circulars.
  - `/api/students/enroll`: Multi-course student enrollment operations.
- [x] **Verification**: Strict TypeScript check (`npx tsc --noEmit`) verified 0 errors. Browser subagent verified both admin and student views.

### Phase 9: Full Live QA Automation, Auto Roll Number Generation & Final Release [Verified]
- [x] **Auto Roll Number Generation**:
  - Implemented `src/lib/roll-generator.ts` and `/api/students/generate-roll`.
  - Automatically derives unique sequential Roll Numbers based on University Code, Cohort Year, Department, and Degree Program (e.g., `VU-2024-CSE-0001`).
  - Added real-time recalculation in `/admin/students/new` when department or program track changes.
  - Linked name inputs to auto-generate institutional Single Sign-On emails (`firstname.lastname.seq@college.edu`).
- [x] **Full E2E Testing Suite (`scripts/live-qa-test.mjs`)**:
  - 25 automated live tests covering Authentication, Route Protection Middleware, Auto Roll Generation, Subjects, Timetable, Attendance, Assignments, Exams, Results, Fees, Notices, and Learning Content.
  - **100% Pass Rate (25 / 25 passed)** against live development server and MySQL database.
- [x] **Live Browser Verification**:
  - Tested student registration, persistent database lookup, student login, dashboard greeting ("Good morning, Aarav"), and profile settings.
  - Resolved `charAt` TypeError on profile avatar with safe optional chaining.
  - Full portal live browser audit verified all 33 routes without runtime crashes or console errors.
- [x] **QA Artifacts**:
  - Generated [`QA_REPORT.md`](./QA_REPORT.md) and [`ROUTE_TEST_MATRIX.md`](./ROUTE_TEST_MATRIX.md).


