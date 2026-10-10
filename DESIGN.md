# College Student Portal — Design System & Specification

Derived directly from Google Stitch designs (Project: `14735571733795070103` — Academic Portal System).
Total Screens: **29 Screens** (Screens 01–16: Student Portal & Auth; Screens 17–29: Admin Portal).

---

## 1. Brand Identity & Visual Aesthetic

The design embodies an authoritative, accessible, and modern digital academic campus hub. It prioritizes cognitive clarity, minimal cognitive load, calm efficiency, and effortless navigation through information-dense modules (attendance, timetables, grades, transcripts, assignments, fee ledgers).

- **Visual Style**: Clean Institutional Modernism with Corporate Utility.
- **Surface Balance**: Crisp white canvas with restrained slate/cool-white surfaces (`#FAF8FF`, `#F8FAFC`, `#F1F5F9`).
- **Primary Accent**: University Sovereign Navy (`#1E40AF`, `#00288E`) paired with interactive Royal Blue (`#2563EB`).
- **Destructive / Alert Accent**: Crimson (`#DC2626`, `#BA1A1A`) for overdue deadlines, low attendance warnings, or errors.
- **Elevation**: Structural hairline borders (`1px solid #E2E8F0`) and minimal subtle shadows (`0 1px 3px rgba(15, 23, 42, 0.04)`).

---

## 2. Design Tokens Extracted from Stitch (Screens 01 to 29)

### Color Palette Tokens

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `primary` | `#00288E` | High-contrast branding logos, primary navigation titles |
| `primary-container` | `#1E40AF` | Primary CTA buttons, active sidebar items, header accents |
| `on-primary` | `#FFFFFF` | Text on primary containers |
| `secondary` | `#0051D5` / `#2563EB` | Interactive highlights, links, focus rings, progress indicators |
| `secondary-container` | `#316BF3` / `#DBEAFE` | Selected items, badges, pill highlights |
| `background / canvas` | `#FAF8FF` | Page body background across student and admin screens |
| `surface-container-lowest`| `#FFFFFF` | White cards, modals, tables, input fields |
| `surface-container-low` | `#F2F3FF` / `#F8FAFC` | Table headers, secondary panels, card footers |
| `surface-container` | `#EAEDFF` | Subtle tag backgrounds, secondary controls |
| `surface-container-high` | `#E2E7FF` / `#E2E8F0` | Dividers, track backgrounds for progress bars |
| `outline / border` | `#E2E8F0` / `#CBD5E1` | 1px clean card and table hairline borders |
| `outline-variant` | `#C4C5D5` | De-emphasized borders and dividers |
| `on-surface` | `#131B2E` / `#0F172A` | High-contrast body text, headings |
| `on-surface-variant` | `#444653` / `#475569` | Subtitles, labels, metadata, inactive icons |
| `outline` | `#757684` / `#94A3B8` | Placeholders, disabled states, search icons |
| `error` | `#BA1A1A` / `#DC2626` | Critical alerts, validation errors, overdue fees |
| `error-container` | `#FFDAD6` / `#FEF2F2` | Error banner backgrounds |
| `success` | `#10B981` / `#009767` | Good standing, paid fees, attendance on-track |
| `success-container` | `#ECFDF5` | Success badge background |
| `warning` | `#D97706` / `#F59E0B` | Approaching deadlines, attendance warnings |
| `warning-container` | `#FFFBEB` | Warning badge background |

### Typography Tokens (Inter)

- **Display**: `36px` / `line-height: 44px`, `font-weight: 700`, `letter-spacing: -0.025em`
- **Headline Large**: `30px` / `line-height: 38px`, `font-weight: 600`, `letter-spacing: -0.02em`
- **Headline Medium**: `20px` / `line-height: 28px`, `font-weight: 600`, `letter-spacing: -0.015em`
- **Headline Small**: `16px` / `line-height: 24px`, `font-weight: 600`, `letter-spacing: -0.01em`
- **Body Large**: `16px` / `line-height: 24px`, `font-weight: 400`
- **Body Medium (Default)**: `14px` / `line-height: 20px`, `font-weight: 400`
- **Body Small**: `12px` / `line-height: 16px`, `font-weight: 400`
- **Label Medium**: `14px` / `line-height: 20px`, `font-weight: 500`
- **Label Small**: `12px` / `line-height: 16px`, `font-weight: 500`
- **Label Extra Small**: `11px` / `line-height: 14px`, `font-weight: 600`, `letter-spacing: 0.025em`
- **Tabular Figures**: `font-variant-numeric: tabular-nums` enforced for GPA, percentages, financial amounts, and timetables.

---

## 3. Screen Inventory & Route Mapping (All 29 Stitch Screens)

### Part 1: Authentication & Student Experience (Screens 01–16)

| Screen ID | Stitch Screen Name | Application Route | Target User Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `9fb4779a...` | Screen 01 — Login Page | `/login` | Public / All | Split credentials form, student & admin demo logins, HTTP-only cookies |
| `2c7e14fe...` | Screen 02 — Forgot Password | `/forgot-password` | Public / All | Reset request by institutional email, secure expiring token |
| `0d390517...` | Screen 03 — Reset Password | `/reset-password` | Public / All | Password confirmation form with strength meter (Suspense-wrapped) |
| `d0dcdeaa...` | Screen 04 — Student Dashboard | `/student/dashboard` | Student | 4 KPI cards (Attendance, CGPA, Pending Tasks, Dues), schedule, notices |
| `8dfe07bf...` | Screen 05 — My Subjects | `/student/subjects` | Student | Search, semester filter, subject cards with faculty, syllabus & credits |
| `18f4e6bf...` | Screen 06 — Subject Details | `/student/subjects/[subjectId]` | Student | Instructor info, module units, study material downloads, assignments |
| `d217ae69...` | Screen 07 — Attendance | `/student/attendance` | Student | Overall gauge, subject-wise attendance stats, warning indicator, logs |
| `22f9d116...` | Screen 08 — Student Timetable | `/student/timetable` | Student | Weekly schedule grid, room allocation, faculty badge, weekday selector |
| `13a652c6...` | Screen 09 — Assignments | `/student/assignments` | Student | Status tabs (Pending, Submitted, Graded), due dates, submissions |
| `cc250776...` | Screen 10 — Assignment Details & Submission | `/student/assignments/[assignmentId]`| Student | Instructions, authorized uploads, confirmation timestamp, feedback |
| `166e0635...` | Screen 11 — Exam Schedule | `/student/exams` | Student | Date sheet, room seating, hall ticket info, start times |
| `2e7ecb76...` | Screen 12 — Exams & Results | `/student/results` | Student | Internal marks, semester exam marks, credit points, SGPA / CGPA card |
| `72b80ef2...` | Screen 13 — Fees & Payments | `/student/fees` | Student | Due balance summary, semester fee breakdown, payment history, receipts |
| `59f228b2...` | Screen 14 — Notices & Announcements | `/student/notices` | Student | Category filters (Urgent, Academic, Exam), search, priority tags |
| `380f2e41...` | Screen 15 — Notice Details | `/student/notices/[noticeId]` | Student | Full publication text, publisher signature, downloadable PDF attachment |
| `05941b1efa...`| Screen 16 — My Profile & Settings | `/student/profile` | Student | Personal info, emergency contacts, profile photo, password update |

### Part 2: Admin Portal Experience (Screens 17–29)

| Screen ID | Stitch Screen Name | Application Route | Target User Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ddbfcfe9...` | Screen 17 — Admin Dashboard | `/admin/dashboard` | Administrator | Governance overview, 4 KPI cards, pending task approvals, audit trail |
| `2489f9f7...` | Screen 18 — Student Management | `/admin/students` | Administrator | 5 KPI metrics strip, student directory, status toggle, import/export CSV |
| `d661088a...` | Screen 19 — Add / Edit Student | `/admin/students/new`, `[id]/edit` | Administrator | Multi-tab candidate registration form & document verification checklist |
| `fbc0e270...` | Screen 20 — Departments & Programs | `/admin/departments` | Administrator | Departments (8), Programs (24), Sessions (4), tree & table view |
| `879d65b8...` | Screen 21 — Subjects & Faculty Management | `/admin/subjects-faculty` | Administrator | Course directory, credit meters, faculty reassignment drawer |
| `8b3520d9...` | Screen 22 — Admin Timetable Management | `/admin/timetable` | Administrator | Master weekly schedule matrix, room collision & faculty conflict engine |
| `68aba4ac...` | Screen 23 — Admin Attendance Management | `/admin/attendance` | Administrator | Class roll-call marker (Present/Absent/Excused), shortage audit log |
| `c53b43ae...` | Screen 24 — Assignment Management | `/admin/assignments` | Administrator | Coursework publisher, submission review table, grading drawer |
| `089a611c...` | Screen 25 — Exam Management | `/admin/exams` | Administrator | Exam slots coordinator, examination halls allocation, hall tickets |
| `877c4625...` | Screen 26 — Results & Marks Management | `/admin/results` | Administrator | Marks moderation sheet, GPA computation, 2-step official publishing modal |
| `3c5b4d0d...` | Screen 27 — Fees & Payments Management | `/admin/fees` | Administrator | Fee structures, payment recorder with txn verification, receipts |
| `42f9b384...` | Screen 28 — Notices Management | `/admin/notices` | Administrator | Campus broadcast circulars, cohort audience targeting, scheduler |
| `982c254c...` | Screen 29 — Settings & User Roles | `/admin/settings` | Administrator | Attendance thresholds (75%), 10-pt grading scale, admin accounts, danger zone |
| `146aaa1d...` | Screen 30 — Video Lectures Library | `/student/lectures` | Student | Searchable video courseware, metric chips, Continue Learning hero card, subject/semester filters |
| `custom` | Screen 30 Companion — Video Player | `/student/subjects/[id]/lectures/[id]` | Student | Dedicated 16:9 player, chapter playlist sidebar, prev/next controls, resume timestamp, notes & resource tabs |
| `custom` | Admin Learning Content Workbench | `/admin/learning-content` | Administrator | Courseware lecture authoring, module organization, draft/publish controls, video player preview modal |

---

## 4. Shared Layout & Component Conventions

1. **Top Header**:
   - Institutional branding & crest
   - Dynamic Breadcrumbs matching Stitch
   - Academic Year indicator badge (`AY 2024–2025 • Active Term`)
   - Notification Bell with unread counter badge & popup drawer
   - User Profile avatar with role badge & logout
2. **Sidebars**:
   - Student Sidebar: Academic navigation (Dashboard, Subjects, Video Lectures, Timetable, Attendance, Assignments, Exams, Results, Fees, Notices, Profile)
   - Admin Sidebar: Stitch categorized groups (Core Modules, Academic Operations including Learning Content, Administration & Access)
3. **Data Tables & Forms**:
   - Tabular figures (`tabular-nums`) for numbers, dates, GPAs, percentages
   - High-contrast badges (`ACTIVE`, `SUSPENDED`, `PRESENT`, `ABSENT`, `URGENT`, `PUBLISHED`, `DRAFT`)
   - Clean pagination controls (`Showing X of Y students`, previous/next)
4. **Video Player & Media Components (Screen 30)**:
   - 16:9 aspect ratio standard player container with provider iframe / HTML5 fallback
   - Duration badge overlay: Semi-transparent black pill (`bg-black/75 text-white`)
   - Resume playback indicator: Automatic timestamp storage and restart option
   - Progress bar: Gradient indicator reflecting exact watched seconds against total duration

