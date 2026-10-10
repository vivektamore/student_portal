// Seed data types and in-memory store for resilient UI operation
export interface StudentRecord {
  id: string;
  userId: string;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  program: string;
  currentSemester: number;
  academicYear: string;
  cgpa: number;
  avatarUrl: string;
}

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  type: string;
  facultyName: string;
  facultyEmail: string;
  description: string;
  attendancePercent: number;
  attendedSessions: number;
  totalSessions: number;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1-5 (Mon-Fri)
  dayName: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  room: string;
}

export interface AssignmentRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE";
  marksObtained?: number;
  submittedAt?: string;
  submissionFile?: string;
  feedback?: string;
}

export interface ExamRecord {
  id: string;
  title: string;
  type: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  maxMarks: number;
  status: "UPCOMING" | "COMPLETED";
}

export interface ResultRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  examMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  semester: number;
  isPublished: boolean;
}

export interface FeeItem {
  id: string;
  feeType: string;
  semester: number;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  transactionRef?: string;
  receiptNumber?: string;
  paidAt?: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  category: "URGENT" | "ACADEMIC" | "EXAM" | "EVENT" | "GENERAL";
  priority: "CRITICAL" | "IMPORTANT" | "NORMAL";
  publishedBy: string;
  publishedAt: string;
  attachmentName?: string;
  isPublished: boolean;
}

export interface LessonResourceRecord {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string;
}

export interface VideoLessonRecord {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester?: number;
  departmentName?: string;
  facultyName?: string;
  title: string;
  description: string;
  notes?: string;
  durationSec: number;
  videoUrl: string;
  thumbnailUrl?: string;
  orderIndex: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt?: string;
  resources: LessonResourceRecord[];
  progress?: {
    watchedSeconds: number;
    isCompleted: boolean;
    lastWatchedAt?: string;
  } | null;
}

export interface LearningModuleRecord {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester?: number;
  lessons: VideoLessonRecord[];
}

// In-Memory resilient stateful store
const inMemoryStore = {
  student: {
    id: "stud_empty",
    userId: "user_empty",
    enrollmentNumber: "NOT-ENROLLED",
    firstName: "Student",
    lastName: "",
    email: "student@college.edu",
    phone: "--",
    department: "General Academics",
    program: "Undergraduate Program",
    currentSemester: 1,
    academicYear: "2024–2025",
    cgpa: 0.0,
    avatarUrl: "",
  } as StudentRecord,

  subjects: [] as SubjectRecord[],

  timetable: [] as TimetableSlot[],
  assignments: [] as AssignmentRecord[],
  exams: [] as ExamRecord[],
  results: [] as ResultRecord[],
  fees: [] as FeeItem[],
  notices: [] as NoticeRecord[],
  allStudents: [] as any[],
  videoLessons: [] as VideoLessonRecord[],
};

// Data service functions connecting with Prisma / Resilient Store
export const DataService = {
  // Student Portal Queries
  async getStudentProfile(userId?: string): Promise<StudentRecord> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user) {
            return json.user;
          }
        }
      } catch (err) {
        console.warn("Client getStudentProfile error:", err);
      }
    }

    try {
      if (typeof window === "undefined") {
        const { prisma } = await import("./prisma");
        const student = await prisma.student.findFirst({
          where: userId ? { userId } : undefined,
          include: { user: true, program: { include: { department: true } } },
        });
        if (student) {
          return {
            id: student.id,
            userId: student.userId,
            enrollmentNumber: student.enrollmentNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.user.email,
            phone: student.phone || "--",
            department: student.program.department.name,
            program: student.program.name,
            currentSemester: student.currentSemester,
            academicYear: "2024-2025",
            cgpa: Number(student.cgpa) || 0.0,
            avatarUrl: "",
          };
        }
      }
    } catch {}

    return inMemoryStore.student;
  },

  async getSubjects(): Promise<SubjectRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.subjects)) {
            return json.subjects;
          }
        }
      } catch (err) {
        console.warn("Client getSubjects error:", err);
      }
      return [];
    }

    try {
      const { prisma } = await import("./prisma");
      const subjects = await prisma.subject.findMany({
        include: {
          department: true,
          facultyAssignments: { include: { faculty: true } },
          attendanceSessions: true,
        },
        orderBy: { code: "asc" },
      });
      return subjects.map((s: any) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        credits: s.credits,
        semester: s.semester,
        type: s.type,
        facultyName: s.facultyAssignments[0]?.faculty
          ? `${s.facultyAssignments[0].faculty.firstName} ${s.facultyAssignments[0].faculty.lastName}`
          : "Unassigned",
        facultyEmail: s.facultyAssignments[0]?.faculty?.email || "",
        description: s.description || "",
        attendancePercent: 0,
        attendedSessions: 0,
        totalSessions: s.attendanceSessions?.length || 0,
      }));
    } catch {
      return [];
    }
  },

  async getSubjectById(subjectId: string): Promise<SubjectRecord | null> {
    const subjects = await this.getSubjects();
    return subjects.find((s) => s.id === subjectId || s.code === subjectId) || subjects[0] || null;
  },

  async getTimetable(): Promise<TimetableSlot[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/timetable");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.timetable)) {
            return json.timetable;
          }
        }
      } catch (err) {
        console.warn("Client getTimetable error:", err);
      }
      return [];
    }
    return [];
  },

  async getAssignments(): Promise<AssignmentRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/assignments");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.assignments)) {
            return json.assignments;
          }
        }
      } catch (err) {
        console.warn("Client getAssignments error:", err);
      }
    }

    try {
      if (typeof window === "undefined") {
        const { prisma } = await import("./prisma");
        const list = await prisma.assignment.findMany({
          where: { isPublished: true },
          include: { subject: true, submissions: true },
          orderBy: { dueDate: "asc" },
        });
        return list.map((a: any) => ({
          id: a.id,
          subjectCode: a.subject?.code || "GEN-101",
          subjectName: a.subject?.name || "Course",
          title: a.title,
          description: a.description,
          dueDate: new Date(a.dueDate).toLocaleDateString(),
          maxMarks: a.maxMarks,
          status: "PENDING" as const,
        }));
      }
    } catch {}

    return inMemoryStore.assignments;
  },

  async getAssignmentById(assignmentId: string): Promise<AssignmentRecord | null> {
    const list = await this.getAssignments();
    return list.find((a) => a.id === assignmentId) || null;
  },

  async submitAssignment(assignmentId: string, fileName: string, comments?: string): Promise<boolean> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, comments }),
        });
        const json = await res.json();
        if (json.success) return true;
      } catch (err) {
        console.warn("submitAssignment backend error:", err);
      }
    }

    const asg = inMemoryStore.assignments.find((a) => a.id === assignmentId);
    if (asg) {
      asg.status = "SUBMITTED";
      asg.submittedAt = "Just now";
      asg.submissionFile = fileName;
      if (comments) asg.feedback = `Student comments: ${comments}`;
      return true;
    }
    return false;
  },

  async createAssignment(data: {
    subjectCode: string;
    title: string;
    description?: string;
    dueDate?: string;
    maxMarks?: number;
  }): Promise<AssignmentRecord | null> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success && json.assignment) {
          inMemoryStore.assignments = [json.assignment, ...inMemoryStore.assignments];
          return json.assignment;
        }
      } catch (err) {
        console.warn("createAssignment error:", err);
      }
    }
    const newAsg: AssignmentRecord = {
      id: `asg_${Date.now()}`,
      subjectCode: data.subjectCode,
      subjectName: data.subjectCode,
      title: data.title,
      description: data.description || "",
      dueDate: data.dueDate || "Next Week",
      maxMarks: Number(data.maxMarks) || 100,
      status: "PENDING",
    };
    inMemoryStore.assignments = [newAsg, ...inMemoryStore.assignments];
    return newAsg;
  },

  async getExams(): Promise<ExamRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.exams)) {
            return json.exams;
          }
        }
      } catch (err) {
        console.warn("Client getExams error:", err);
      }
      return [];
    }
    return [];
  },

  async getResults(): Promise<ResultRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/results");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.results)) {
            return json.results;
          }
        }
      } catch (err) {
        console.warn("Client getResults error:", err);
      }
      return [];
    }
    return [];
  },

  async getFees(): Promise<FeeItem[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/fees");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.fees)) {
            return json.fees;
          }
        }
      } catch (err) {
        console.warn("Client getFees error:", err);
      }
      return [];
    }
    return [];
  },

  async getNotices(): Promise<NoticeRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/notices");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.notices)) {
            return json.notices;
          }
        }
      } catch (err) {
        console.warn("Client getNotices error:", err);
      }
      return [];
    }
    return [];
  },

  async getNoticeById(noticeId: string): Promise<NoticeRecord | null> {
    const list = await this.getNotices();
    return list.find((n) => n.id === noticeId) || null;
  },

  async updateStudentContact(phone: string): Promise<boolean> {
    inMemoryStore.student.phone = phone;
    return true;
  },

  // Admin Portal Queries & Mutations
  async getAdminStudents() {
    if (typeof window !== "undefined") {
      try {
        const resp = await fetch("/api/students");
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && Array.isArray(json.students)) {
            return json.students;
          }
        }
      } catch (err) {
        console.warn("Client getAdminStudents error:", err);
      }
      return [];
    }
    return [];
  },

  async createStudent(data: { enrollmentNumber: string; firstName: string; lastName: string; email: string; department: string; program: string; semester: number }) {
    if (typeof window !== "undefined") {
      try {
        const resp = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await resp.json();
        if (json.success && json.student) {
          const stored = localStorage.getItem("portal_custom_students");
          const list = stored ? JSON.parse(stored) : [];
          list.push(json.student);
          localStorage.setItem("portal_custom_students", JSON.stringify(list));
          inMemoryStore.allStudents.push(json.student);
          return json.student;
        }
      } catch (err) {
        console.warn("Could not save student to MySQL endpoint:", err);
      }
    }

    const newStudent = {
      id: `stud_custom_${Date.now()}`,
      enrollmentNumber: data.enrollmentNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      department: data.department,
      program: data.program,
      semester: data.semester,
      cgpa: 0.0,
      status: "ACTIVE",
    };
    inMemoryStore.allStudents.push(newStudent);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("portal_custom_students");
        const list = stored ? JSON.parse(stored) : [];
        list.push(newStudent);
        localStorage.setItem("portal_custom_students", JSON.stringify(list));
      } catch {}
    }
    return newStudent;
  },

  async updateStudentStatus(id: string, status: "ACTIVE" | "SUSPENDED") {
    const s = inMemoryStore.allStudents.find((item) => item.id === id);
    if (s) {
      s.status = status;
      return true;
    }
    return false;
  },

  async publishNotice(title: string, content: string, category: NoticeRecord["category"], priority: NoticeRecord["priority"]) {
    const newNotice: NoticeRecord = {
      id: `not_${Date.now()}`,
      title,
      content,
      category,
      priority,
      publishedBy: "Academic Administration",
      publishedAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      isPublished: true,
    };
    inMemoryStore.notices.unshift(newNotice);
    return newNotice;
  },

  async addTimetableEntry(entry: Omit<TimetableSlot, "id">) {
    const newEntry: TimetableSlot = {
      id: `tt_${Date.now()}`,
      ...entry,
    };
    inMemoryStore.timetable.push(newEntry);
    return newEntry;
  },

  async recordAttendance(subjectCode: string, date: string, presentStudentIds: string[]) {
    // Record attendance log
    return { success: true, recordedCount: presentStudentIds.length, date, subjectCode };
  },

  async publishExamResults(semester: number) {
    inMemoryStore.results.forEach((r) => {
      if (r.semester === semester) r.isPublished = true;
    });
    return true;
  },

  async createSubject(data: {
    code: string;
    name: string;
    credits: number;
    semester: number;
    type: string;
    facultyName?: string;
    facultyEmail?: string;
    description?: string;
  }): Promise<SubjectRecord> {
    try {
      if (typeof window === "undefined") {
        const { prisma } = await import("./prisma");
        const dept = await prisma.department.findFirst();
        if (dept) {
          const created = await prisma.subject.create({
            data: {
              code: data.code,
              name: data.name,
              credits: Number(data.credits),
              semester: Number(data.semester),
              type: data.type || "THEORY",
              description: data.description || "",
              departmentId: dept.id,
            },
          });
          const rec: SubjectRecord = {
            id: created.id,
            code: created.code,
            name: created.name,
            credits: created.credits,
            semester: created.semester,
            type: created.type,
            facultyName: data.facultyName || "Unassigned",
            facultyEmail: data.facultyEmail || "",
            description: created.description || "",
            attendancePercent: 100,
            attendedSessions: 0,
            totalSessions: 0,
          };
          inMemoryStore.subjects.unshift(rec);
          return rec;
        }
      }
    } catch {}

    if (typeof window !== "undefined") {
      try {
        const resp = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await resp.json();
        if (json.success && Array.isArray(json.subjects) && json.subjects.length > 0) {
          const created = json.subjects[0];
          const stored = localStorage.getItem("portal_custom_subjects");
          const list = stored ? JSON.parse(stored) : [];
          list.unshift(created);
          localStorage.setItem("portal_custom_subjects", JSON.stringify(list));
          inMemoryStore.subjects.unshift(created);
          return created;
        }
      } catch (err) {
        console.warn("Could not save to /api/subjects MySQL endpoint:", err);
      }
    }

    const newRecord: SubjectRecord = {
      id: `sub_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: data.code,
      name: data.name,
      credits: Number(data.credits),
      semester: Number(data.semester),
      type: data.type || "THEORY",
      facultyName: data.facultyName || "Unassigned",
      facultyEmail: data.facultyEmail || "",
      description: data.description || "",
      attendancePercent: 100,
      attendedSessions: 0,
      totalSessions: 0,
    };
    inMemoryStore.subjects.unshift(newRecord);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("portal_custom_subjects");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newRecord);
        localStorage.setItem("portal_custom_subjects", JSON.stringify(list));
      } catch {}
    }
    return newRecord;
  },

  async bulkCreateSubjects(list: Array<{
    code: string;
    name: string;
    credits: number;
    semester: number;
    type: string;
    facultyName?: string;
    facultyEmail?: string;
    description?: string;
  }>): Promise<SubjectRecord[]> {
    if (typeof window !== "undefined") {
      try {
        const resp = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(list),
        });
        const json = await resp.json();
        if (json.success && Array.isArray(json.subjects) && json.subjects.length > 0) {
          const stored = localStorage.getItem("portal_custom_subjects");
          const curList = stored ? JSON.parse(stored) : [];
          const updated = [...json.subjects, ...curList];
          localStorage.setItem("portal_custom_subjects", JSON.stringify(updated));
          inMemoryStore.subjects = [...json.subjects, ...inMemoryStore.subjects];
          return json.subjects;
        }
      } catch (err) {
        console.warn("Could not save bulk subjects to MySQL:", err);
      }
    }

    const results: SubjectRecord[] = [];
    for (const item of list) {
      const res = await this.createSubject(item);
      results.push(res);
    }
    return results;
  },

  isCleared(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("portal_data_cleared") === "true";
    }
    return false;
  },

  async clearAllDummyData(): Promise<boolean> {
    if (typeof window !== "undefined") {
      localStorage.setItem("portal_data_cleared", "true");
      localStorage.removeItem("portal_custom_subjects");
      localStorage.removeItem("portal_custom_students");
      try {
        await fetch("/api/admin/clear-data", { method: "POST" });
      } catch (err) {
        console.warn("Backend clear data request failed:", err);
      }
    }
    inMemoryStore.subjects = [];
    inMemoryStore.allStudents = [];
    inMemoryStore.timetable = [];
    inMemoryStore.assignments = [];
    inMemoryStore.exams = [];
    inMemoryStore.results = [];
    inMemoryStore.fees = [];
    inMemoryStore.notices = [];
    return true;
  },

  async restoreSampleData(): Promise<boolean> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("portal_data_cleared");
    }
    return true;
  },

  async getLearningContent(params?: {
    subjectId?: string;
    semester?: string;
    status?: string;
    search?: string;
  }): Promise<{
    modules: LearningModuleRecord[];
    lessons: VideoLessonRecord[];
    metrics: {
      totalLectures: number;
      completedLectures: number;
      inProgressLectures: number;
      totalDurationHours: string;
      watchedDurationHours: string;
      completionRate: number;
    };
    continueLearning: VideoLessonRecord | null;
  }> {
    if (typeof window !== "undefined") {
      try {
        const query = new URLSearchParams();
        if (params?.subjectId && params.subjectId !== "ALL") query.set("subjectId", params.subjectId);
        if (params?.semester && params.semester !== "ALL") query.set("semester", params.semester);
        if (params?.status && params.status !== "ALL") query.set("status", params.status);
        if (params?.search) query.set("search", params.search);

        const res = await fetch(`/api/learning-content?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return {
              modules: data.modules || [],
              lessons: data.lessons || [],
              metrics: data.metrics || {
                totalLectures: 0,
                completedLectures: 0,
                inProgressLectures: 0,
                totalDurationHours: "0.0",
                watchedDurationHours: "0.0",
                completionRate: 0,
              },
              continueLearning: data.continueLearning || null,
            };
          }
        }
      } catch (err) {
        console.warn("Client fetch /api/learning-content error:", err);
      }
    }

    // Server-side direct MySQL fallback
    try {
      if (typeof window === "undefined") {
        const { prisma } = await import("./prisma");
        const modules = await prisma.learningModule.findMany({
          include: {
            subject: {
              include: { department: true, facultyAssignments: { include: { faculty: true } } },
            },
            lessons: {
              where: { status: "PUBLISHED" },
              include: { resources: true },
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        });

        const allLessons: VideoLessonRecord[] = [];
        const formattedMods: LearningModuleRecord[] = modules.map((m) => {
          const formattedLessons: VideoLessonRecord[] = m.lessons.map((l) => {
            const formatted: VideoLessonRecord = {
              id: l.id,
              moduleId: m.id,
              moduleTitle: m.title,
              subjectId: m.subject.id,
              subjectCode: m.subject.code,
              subjectName: m.subject.name,
              semester: m.subject.semester,
              departmentName: m.subject.department?.name,
              facultyName: m.subject.facultyAssignments[0]?.faculty
                ? `${m.subject.facultyAssignments[0].faculty.firstName} ${m.subject.facultyAssignments[0].faculty.lastName}`
                : "Faculty Instructor",
              title: l.title,
              description: l.description || "",
              notes: l.notes || "",
              durationSec: l.durationSec,
              videoUrl: l.videoUrl,
              thumbnailUrl: l.thumbnailUrl || undefined,
              orderIndex: l.orderIndex,
              status: l.status,
              resources: l.resources.map((r) => ({
                id: r.id,
                title: r.title,
                fileUrl: r.fileUrl,
                fileType: r.fileType,
                fileSize: r.fileSize || "1.5 MB",
              })),
              progress: null,
            };
            allLessons.push(formatted);
            return formatted;
          });

          return {
            id: m.id,
            title: m.title,
            description: m.description || "",
            orderIndex: m.orderIndex,
            subjectId: m.subject.id,
            subjectCode: m.subject.code,
            subjectName: m.subject.name,
            semester: m.subject.semester,
            lessons: formattedLessons,
          };
        });

        return {
          modules: formattedMods,
          lessons: allLessons,
          metrics: {
            totalLectures: allLessons.length,
            completedLectures: 0,
            inProgressLectures: 0,
            totalDurationHours: (allLessons.reduce((acc, c) => acc + c.durationSec, 0) / 3600).toFixed(1),
            watchedDurationHours: "0.0",
            completionRate: 0,
          },
          continueLearning: allLessons[0] || null,
        };
      }
    } catch {}

    return {
      modules: [],
      lessons: [],
      metrics: {
        totalLectures: 0,
        completedLectures: 0,
        inProgressLectures: 0,
        totalDurationHours: "0.0",
        watchedDurationHours: "0.0",
        completionRate: 0,
      },
      continueLearning: null,
    };
  },

  async getVideoLesson(
    subjectId: string,
    lessonId: string
  ): Promise<{
    lesson: VideoLessonRecord | null;
    playlist: VideoLessonRecord[];
    currentModule: LearningModuleRecord | null;
    prevLesson: VideoLessonRecord | null;
    nextLesson: VideoLessonRecord | null;
  }> {
    const data = await this.getLearningContent({ subjectId });
    const allSubjectLessons = data.lessons;
    const lessonIdx = allSubjectLessons.findIndex(
      (l) => l.id === lessonId || l.id === decodeURIComponent(lessonId)
    );
    const lesson = lessonIdx !== -1 ? allSubjectLessons[lessonIdx] : allSubjectLessons[0] || null;

    const currentModule = lesson
      ? data.modules.find((m) => m.id === lesson.moduleId) || null
      : null;

    const prevLesson = lessonIdx > 0 ? allSubjectLessons[lessonIdx - 1] : null;
    const nextLesson =
      lessonIdx !== -1 && lessonIdx < allSubjectLessons.length - 1
        ? allSubjectLessons[lessonIdx + 1]
        : null;

    return {
      lesson,
      playlist: allSubjectLessons,
      currentModule,
      prevLesson,
      nextLesson,
    };
  },

  async saveLessonProgress(
    lessonId: string,
    watchedSeconds: number,
    isCompleted?: boolean
  ): Promise<boolean> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/learning-content/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, watchedSeconds, isCompleted }),
        });
        const json = await res.json();
        return Boolean(json.success);
      } catch (err) {
        console.warn("Failed to persist lesson progress:", err);
      }
    }
    return false;
  },

  formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  },
};
