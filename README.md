# College Student Portal (Next.js + MySQL + Prisma ORM 7 + Google Stitch)

A comprehensive, responsive academic portal system built for higher education institutions. Implements both **Student** and **Admin** experiences based on the authoritative Google Stitch visual specifications.

---

## 1. Prerequisites

- **Node.js**: `v20.19+` or `v22.12+` (or `v22.9+` with `--experimental-require-module`)
- **Package Manager**: `npm` (v10+ or v11+)
- **Database**: MySQL 8.0+ running on `localhost:3306` (or compatible MariaDB)

---

## 2. Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma ORM 7.x (`@prisma/client`, `@prisma/adapter-mariadb`, `mariadb`)
- **Validation**: Zod
- **Icons**: Lucide React
- **Authentication**: Stateless, signed HTTP-only JWT sessions (`jose` + `bcryptjs`)

---

## 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your MySQL connection parameters in `.env`:
   ```env
   DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/college_portal"
   DATABASE_HOST="localhost"
   DATABASE_PORT="3306"
   DATABASE_USER="root"
   DATABASE_PASSWORD="your_mysql_password"
   DATABASE_NAME="college_portal"
   AUTH_SECRET="your-generated-random-secure-secret-key-at-least-32-characters"
   ```

---

## 4. Database Setup & Migrations

### Create Database in MySQL
```sql
CREATE DATABASE IF NOT EXISTS college_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Prisma Commands

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```
2. **Apply Development Migration**:
   ```bash
   npm run db:migrate
   ```
3. **Apply Production Migrations Safely**:
   ```bash
   npm run db:deploy
   ```
4. **Seed Development Database**:
   ```bash
   npm run db:seed
   ```

---

## 5. Development-Only Initial Administrator Setup

To establish the initial system administrator account securely without exposing public admin signup endpoints:

1. Configure `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD` in your private `.env`.
2. Run the seed script:
   ```bash
   npm run db:seed
   ```
3. The seed runner creates:
   - **Administrator Account**:
     - Email: `admin@college.edu`
     - Password: (Configured via `ADMIN_INITIAL_PASSWORD` or defaults to `Admin@123456`)
     - Role: `ADMIN`
   - **Sample Student Account**:
     - Email: `aarav.sharma@college.edu`
     - Student ID: `VU-2022-CSE-0142`
     - Password: `Student@123456`
     - Role: `STUDENT`

---

## 6. Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Check & Production Build
```bash
npx tsc --noEmit
npm run build
npm run start
```

---

## 7. Project Architecture & Screen Inventory

### Public Authentication Routes
- `/login` — Login screen for Students and Administrators with credentials toggle.
- `/forgot-password` — Password recovery workflow.
- `/reset-password` — Single-use expiring token password reset form.

### Student Portal Routes (`/student/*`)
- `/student/dashboard` — Overview banner, CGPA, KPI cards, timetable, assignments, notices.
- `/student/subjects` — Course catalog, semester filters, enrolled subjects.
- `/student/subjects/[subjectId]` — Subject details, syllabus, materials, instructor info.
- `/student/lectures` — Video Lectures Library (Screen 30) with metric chips, Continue Learning hero card, subject/semester filters, and grid/list modes.
- `/student/subjects/[subjectId]/lectures/[lessonId]` — Dedicated 16:9 Video Player with chapter playlist sidebar, prev/next controls, resume playback, completion toggle, syllabus notes, and downloadable PDF/code resources.
- `/student/attendance` — Overall attendance, subject-wise breakdown, attendance warning tracker.
- `/student/timetable` — Weekly lecture schedule with room allocations.
- `/student/assignments` — Pending, submitted, and graded assignments.
- `/student/assignments/[assignmentId]` — Instructions, file upload submission, feedback.
- `/student/exams` — Exam schedule, venues, and timings.
- `/student/results` — Officially published semester grades, internal marks, SGPA/CGPA cards.
- `/student/fees` — Tuition summary, payment history, genuine downloadable receipts.
- `/student/notices` — Searchable announcements with priority filtering.
- `/student/notices/[noticeId]` — Full notice content with attachment downloads.
- `/student/profile` — Student profile, contact preferences, and password change.

### Admin Portal Routes (`/admin/*`)
- `/admin/dashboard` — Administrative analytics, department metrics, pending actions.
- `/admin/students` — Student management directory with search and status filters.
- `/admin/students/new` — New student enrollment wizard.
- `/admin/students/[studentId]/edit` — Student record editor.
- `/admin/departments` — Department and degree program management.
- `/admin/subjects-faculty` — Course offerings and faculty allocations.
- `/admin/learning-content` — Video Lectures & Courseware management with lecture authoring modal, module grouping, drafts/publishing lifecycle, resource attachments, and interactive preview modal.
- `/admin/timetable` — Schedule builder with conflict detection.
- `/admin/attendance` — Daily class attendance marker.
- `/admin/assignments` — Course assignment publisher and grading workbench.
- `/admin/exams` — Exam schedule coordinator.
- `/admin/results` — Marks entry and official publishing workflow.
- `/admin/fees` — Fee records, payment collections, and receipt management.
- `/admin/notices` — Broadcast manager with audience targeting.
- `/admin/settings` — Academic rules, grading thresholds, and admin accounts.

---

## 8. Video Lectures & External Video Hosting Configuration

### Video Storage Architecture
In accordance with system design best practices:
- **MySQL Database**: Stores video metadata (`title`, `durationSec`, `videoUrl`, `thumbnailUrl`, `status`, `orderIndex`) and student progress timestamps (`watchedSeconds`, `isCompleted`, `lastWatchedAt`). Large raw video binaries are **never** stored directly in MySQL.
- **Supported Video Providers**:
  1. **YouTube Unlisted / Private Embeds**: Enter standard URLs (`https://www.youtube.com/watch?v=...` or `https://youtu.be/...`). The embedded player automatically supports `start={seconds}` parameter for resume playback.
  2. **Vimeo On Demand / Showcase**: Enter Vimeo URLs (`https://vimeo.com/...`). Supported with `#t={seconds}s` time hash for resume playback.
  3. **Object Storage / CDN (AWS S3, Cloudflare R2, Google Cloud Storage, Supabase Storage)**:
     - Upload raw `.mp4` or `.m3u8` (HLS) files to your private or CDN-accelerated bucket.
     - Store the public or pre-signed CDN URL in the Video Source URL field.
     - The dedicated HTML5 video player handles playback, full-screen, native scrubbing, and programmatic `currentTime` resume playback.

---

## 9. Security & Business Rules

1. **Student Data Isolation**: Server route handlers strictly scope queries to the authenticated student's own ID. Students access only their own progress and published videos.
2. **Access Control**: Administrative routes require verified `ADMIN` role session tokens.
3. **Content Lifecycle**: Video lectures can be saved as `DRAFT`, `PUBLISHED`, or `ARCHIVED`. Only `PUBLISHED` content is accessible to enrolled students.
4. **Result Publishing**: Draft examination marks are hidden from student views until explicitly marked `isPublished = true` by an administrator.
5. **Attendance Thresholds**: Automatically highlights courses below the 75% institutional attendance requirement.
6. **Fee Ledgers**: Balances are calculated from verified financial records; payments require explicit transaction references.
