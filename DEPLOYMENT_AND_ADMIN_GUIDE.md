# College Student Portal — Production Setup, Admin Guide & Vercel Deployment

This comprehensive guide covers:
1. **How to Remove All Dummy Data** (CLI and UI methods)
2. **Step-by-Step Administrative Guide**: How to upload and manage courses, faculty, departments, students, timetables, and academic operations
3. **How to Deploy to Vercel with Cloud MySQL**: Complete step-by-step instructions for hosting the Next.js app and connecting a live cloud MySQL database

---

## 1. How to Remove All Dummy Data

The portal includes two easy methods to clear out test/sample records:

### Method A: Command-Line Interface (Clean Database Purge)
To wipe all sample records from the MySQL database while **preserving the active Administrator account**:

```bash
# In the college-portal directory:
npm run db:clear
```
- **What this does:**
  - Purges all sample students, enrolled subjects, faculty mappings, timetable slots, attendance sessions, assignments, exam schedules, results, invoices, and circular notices.
  - Deletes all non-admin user credentials.
  - Automatically verifies and preserves the primary Administrator account (`admin@college.edu` / `Admin@123456` or your configured `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`).

### Method B: Directly from the Admin Portal UI
1. Sign in to the portal as an Administrator (`/login`).
2. Navigate to **Settings & Users** (`/admin/settings`).
3. Click on the **Security & Maintenance** tab.
4. Scroll down to the **Administrative Danger Zone**.
5. Click the red **"Clear Dummy Data"** button.
6. Confirm the prompt. All in-memory and mock sample records are immediately wiped, resetting the portal to a clean, empty state ready for real academic data.

---

## 2. Administrator Guide: How to Upload Courses & Academic Data

Follow this recommended sequential order when setting up a fresh academic term:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Departments & Programs  ──>  2. Faculty Members  ──>  3. Courses    │
│                                                                        │
│ 4. Student Enrollment      ──>  5. Timetable Slots  ──>  6. Operations │
└────────────────────────────────────────────────────────────────────────┘
```

### Step 1: Create Departments & Degree Programs
* **Location:** [`/admin/departments`](http://localhost:3000/admin/departments)
1. Click the **"+ Add Department"** button in the top right.
2. Enter:
   - **Department Code** (e.g., `CSE`, `ECE`, `MECH`, `MBA`)
   - **Department Name** (e.g., `Computer Science & Engineering`)
   - **Head of Department (HOD)** name and academic credentials
   - **Annual Student Intake Capacity** (e.g., `120`)
   - **Accreditation Status** (e.g., `NBA Tier-1 Accredited`, `NAAC A++`)
3. Switch to the **Degree Programs** tab to configure degrees (e.g., `B.Tech CSE`, `M.Tech Data Science`) and semester durations.

---

### Step 2: Add Faculty Members & Teachers
* **Location:** [`/admin/settings`](http://localhost:3000/admin/settings) (User Roles tab) or [`/admin/subjects-faculty`](http://localhost:3000/admin/subjects-faculty)
1. Go to **Settings & Users** -> **User Accounts & Roles**.
2. Click **"+ Add User Account"**.
3. Enter the faculty member's name, institutional email (e.g., `priya.nair@college.edu`), and select the role **`FACULTY`**.
4. The faculty profile is now available for teaching assignments across all curriculum subjects.

---

### Step 3: Create & Upload Courses / Subjects
* **Location:** [`/admin/subjects-faculty`](http://localhost:3000/admin/subjects-faculty)

#### Option 3A: Add Courses Individually (UI Form)
1. Click the blue **"+ Add Course"** button.
2. Complete the modal form:
   - **Course Code:** Official identifier (e.g., `CS-301`, `MATH-102`, `PHY-201`).
   - **Course Title:** Full title (e.g., `Design & Analysis of Algorithms`).
   - **Semester Level:** Target semester (e.g., `Semester 5`).
   - **Credits:** Numerical credit weight (e.g., `3` or `4`).
   - **Course Type:** Select `Theory Only` or `Laboratory / Practical`.
   - **Assigned Faculty Name & Email:** Select from department faculty.
   - **Description:** Syllabus outline and objectives.
3. Click **"Save & Publish Course"**. The course appears immediately in the directory and will update institutional metrics.

#### Option 3B: Bulk Upload Courses via CSV
1. Click the **"Upload CSV"** button.
2. In the text area, paste your course list formatted as comma-separated values:
   ```csv
   code,name,credits,semester,type,facultyName,facultyEmail
   CS-301,Algorithms & Complexity,4,5,THEORY,Dr. Rajesh Verma,rajesh@college.edu
   CS-302,Operating Systems Lab,2,5,PRACTICAL,Prof. Sneha Gupta,sneha@college.edu
   CS-303,Computer Networks,3,5,THEORY,Dr. Priya Nair,priya@college.edu
   CS-304,Database Systems,4,5,THEORY,Dr. Ramesh Sharma,ramesh@college.edu
   ```
3. Click **"Import All Courses"**. The system parses the records and populates the course catalog in bulk.

---

### Step 4: Enroll Students
* **Location:** [`/admin/students/new`](http://localhost:3000/admin/students/new)
1. Click **"+ Add Student"** from the student management directory.
2. Use the 4-tab enrollment workspace:
   - **Tab 1: Personal & Contact:** First name, last name, DOB, personal email, phone, blood group.
   - **Tab 2: Academic Enrollment:** Department, degree program, current semester, roll number, registration PRN.
   - **Tab 3: Guardian & Emergency:** Guardian name, relationship, emergency contact phone.
   - **Tab 4: Document Verification:** Mark original certificate checklist (10th/12th marksheet, transfer certificate).
3. Click **"Complete Enrollment"** to register the student.

---

### Step 5: Schedule Timetable Slots
* **Location:** [`/admin/timetable`](http://localhost:3000/admin/timetable)
1. Select the Academic Program and Semester.
2. Click on the desired weekday slot (Monday–Friday, 9:00 AM – 5:00 PM).
3. Assign the Course Code, Instructor, and Lecture Room / Lab Venue.
4. Save the entry. The schedule appears automatically on the student's timetable view.

---

### Step 6: Daily Attendance Roll-Call
* **Location:** [`/admin/attendance`](http://localhost:3000/admin/attendance)
1. Select the Course, Session Date, Period Slot, and Venue.
2. The enrolled student roster loads with real-time percentage indicators.
3. Toggle status per student (**P** = Present, **A** = Absent, **E** = Excused), or click **"Mark All Present"**.
4. The system updates student attendance percentages and flags students falling below the mandatory 75% threshold.

---

### Step 7: Assignments, Exams, Results, Fees & Notices
- **Assignments** ([`/admin/assignments`](http://localhost:3000/admin/assignments)): Click `+ Create Assignment`, set title, deadline, max marks, and grading guidelines.
- **Exams** ([`/admin/exams`](http://localhost:3000/admin/exams)): Schedule Mid-Term or End-Term exams, allocate halls, and generate hall tickets.
- **Results** ([`/admin/results`](http://localhost:3000/admin/results)): Enter internal marks and end-term exam marks, calculate SGPA/CGPA, and click `Publish Results`.
- **Fees** ([`/admin/fees`](http://localhost:3000/admin/fees)): Generate tuition invoices, record cash/cheque/NEFT payments, and issue receipts.
- **Notices** ([`/admin/notices`](http://localhost:3000/admin/notices)): Broadcast urgent campus alerts, exam schedules, or holiday circulars with audience filters.

---

## 3. How to Deploy on Vercel with Cloud MySQL

### Why Local MySQL Does NOT Work on Vercel
Vercel is a **serverless cloud hosting platform**. Serverless functions run in ephemeral containers across global data centers and **cannot connect to `localhost:3306`** on your personal laptop. You must host your MySQL database on a public cloud provider.

---

### Step A: Choose a Cloud MySQL Database Provider
Select any of the following reliable providers (most provide free tiers):

| Provider | Setup Time | Free Tier | Direct Connection String Example |
|---|---|---|---|
| **Railway** (Recommended) | ~2 minutes | Free trial credits | `mysql://root:pass@junction.proxy.rlwy.net:PORT/railway` |
| **Aiven for MySQL** | ~3 minutes | Free tier | `mysql://avnadmin:pass@mysql-xxx.aivencloud.com:PORT/defaultdb?sslmode=require` |
| **TiDB Cloud** | ~2 minutes | Free Serverless | `mysql://user.root:pass@gateway.tidbcloud.com:4000/college_portal?sslaccept=strict` |
| **AWS RDS / DigitalOcean** | ~5 minutes | Pay-as-you-go | `mysql://doadmin:pass@db-mysql-xxx.ondigitalocean.com:25060/defaultdb?sslmode=require` |

#### Quickest Setup with Railway (Example):
1. Sign up at [railway.com](https://railway.com).
2. Click **"New Project"** -> **"Provision MySQL"**.
3. Click on the MySQL card -> Go to the **Variables** or **Connect** tab.
4. Copy the **`DATABASE_URL`** (or public connection string).

---

### Step B: Push the Database Schema to Cloud MySQL
Before deploying to Vercel, run Prisma to create the tables in your cloud database:

1. In your local terminal, temporarily point to your cloud MySQL:
   ```bash
   # In college-portal/.env:
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict"
   ```
2. Push your Prisma schema to create all 20 relational tables:
   ```bash
   node --experimental-require-module ./node_modules/prisma/build/index.js db push
   ```
3. Initialize the superuser account on your cloud database:
   ```bash
   node --experimental-require-module prisma/seed.mjs
   ```

---

### Step C: Push Your Code to a GitHub Repository
1. In the project root, make sure your code is committed:
   ```bash
   git init
   git add .
   git commit -m "Production release: College Student Portal"
   ```
2. Create a new repository on [GitHub](https://github.com).
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/college-portal.git
   git branch -M main
   git push -u origin main
   ```

---

### Step D: Import Project into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Connect your GitHub account and click **"Import"** next to your repository.
4. If your Next.js project is located in a subfolder (e.g., `college-portal`), set the **Root Directory** to `college-portal`. Otherwise, leave as `./`.

---

### Step E: Configure Environment Variables in Vercel
In the Vercel **Environment Variables** section, add the following key-value pairs:

| Variable Name | Value Description | Example Value |
|---|---|---|
| `DATABASE_URL` | Your Cloud MySQL Connection URI | `mysql://root:pass@host:port/database?sslaccept=strict` |
| `DATABASE_HOST` | Hostname of your cloud DB | `junction.proxy.rlwy.net` |
| `DATABASE_PORT` | Port of your cloud DB | `45678` |
| `DATABASE_USER` | MySQL Username | `root` |
| `DATABASE_PASSWORD`| MySQL Password | `yourSecretPassword123` |
| `DATABASE_NAME` | MySQL Database Name | `railway` or `college_portal` |
| `JWT_SECRET` | 32+ character random secret | `vanguard_super_secure_jwt_token_2026` |
| `NEXT_PUBLIC_APP_URL` | Your production Vercel URL | `https://your-portal-name.vercel.app` |
| `ADMIN_INITIAL_EMAIL` | Default Administrator login | `admin@college.edu` |
| `ADMIN_INITIAL_PASSWORD`| Default Administrator password | `Admin@123456` |

---

### Step F: Deploy & Verify
1. Click the blue **"Deploy"** button.
2. Vercel will install dependencies, compile Tailwind CSS v4, build the Next.js routes, and deploy the application globally.
3. Once the build finishes, click **"Continue to Dashboard"** or **"Visit"**.
4. Open your live URL (e.g. `https://your-portal.vercel.app/login`).
5. Log in with your Admin credentials:
   - **Email:** `admin@college.edu`
   - **Password:** `Admin@123456`
6. You now have a fully functioning, cloud-hosted College Student Portal with live MySQL database persistence!
