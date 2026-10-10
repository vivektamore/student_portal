import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting development database seeding for College Student Portal...");

  const host = process.env.DATABASE_HOST || "localhost";
  const port = Number(process.env.DATABASE_PORT) || 3306;
  const user = process.env.DATABASE_USER || "root";
  const password = process.env.DATABASE_PASSWORD || "";
  const database = process.env.DATABASE_NAME || "college_portal";

  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456", 10);
    const studentPasswordHash = await bcrypt.hash("Student@123456", 10);
    const facultyPasswordHash = await bcrypt.hash("Faculty@123456", 10);

    // 1. Seed Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: process.env.ADMIN_INITIAL_EMAIL || "admin@college.edu" },
      update: {},
      create: {
        email: process.env.ADMIN_INITIAL_EMAIL || "admin@college.edu",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("✅ Seeded Admin User:", adminUser.email);

    // 2. Seed Department
    const cseDept = await prisma.department.upsert({
      where: { code: "CSE" },
      update: {},
      create: {
        code: "CSE",
        name: "Computer Science & Engineering",
      },
    });

    // 3. Seed Program
    const btechProgram = await prisma.program.upsert({
      where: { code: "BTECH-CSE" },
      update: {},
      create: {
        code: "BTECH-CSE",
        name: "Bachelor of Technology in Computer Science & Engineering",
        departmentId: cseDept.id,
        totalSemesters: 8,
        degreeType: "B.Tech",
      },
    });

    // 4. Seed Faculty Users
    const facultyUser = await prisma.user.upsert({
      where: { email: "rajesh.verma@college.edu" },
      update: {},
      create: {
        email: "rajesh.verma@college.edu",
        passwordHash: facultyPasswordHash,
        role: "FACULTY",
        status: "ACTIVE",
      },
    });

    const faculty = await prisma.faculty.upsert({
      where: { userId: facultyUser.id },
      update: {},
      create: {
        userId: facultyUser.id,
        employeeId: "FAC-CSE-0012",
        firstName: "Rajesh",
        lastName: "Verma",
        designation: "Professor & Head",
        departmentId: cseDept.id,
        phone: "+91 98765 11223",
        officeRoom: "Academic Block 4, Room 402",
      },
    });

    // 5. Seed Student User
    const studentUser = await prisma.user.upsert({
      where: { email: "aarav.sharma@college.edu" },
      update: {},
      create: {
        email: "aarav.sharma@college.edu",
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        enrollmentNumber: "VU-2022-CSE-0142",
        firstName: "Aarav",
        lastName: "Sharma",
        phone: "+91 98765 43210",
        departmentId: cseDept.id,
        programId: btechProgram.id,
        currentSemester: 6,
        academicYear: "2024-2025",
        cgpa: 8.92,
      },
    });
    console.log("✅ Seeded Student User:", studentUser.email, "Enrollment:", student.enrollmentNumber);

    // 6. Seed Subjects
    const subjects = [
      { code: "CS-301", name: "Design & Analysis of Algorithms", credits: 4, semester: 6, type: "Core Theory" },
      { code: "CS-302", name: "Database Management Systems", credits: 4, semester: 6, type: "Core Theory + Lab" },
      { code: "CS-303", name: "Operating Systems", credits: 4, semester: 6, type: "Core Theory" },
      { code: "CS-304", name: "Computer Networks", credits: 3, semester: 6, type: "Core Theory" },
      { code: "CS-305", name: "Software Engineering & DevOps", credits: 3, semester: 6, type: "Practical Lab" },
      { code: "CS-306", name: "Artificial Intelligence Fundamentals", credits: 4, semester: 6, type: "Elective" },
    ];

    for (const sub of subjects) {
      await prisma.subject.upsert({
        where: { code: sub.code },
        update: {},
        create: {
          code: sub.code,
          name: sub.name,
          departmentId: cseDept.id,
          credits: sub.credits,
          semester: sub.semester,
          type: sub.type,
        },
      });
    }

    // 7. Seed Notices
    await prisma.notice.create({
      data: {
        title: "Mid-Semester Examination Schedule Notification (Spring 2025)",
        content: "Mid-Semester Examinations commence on April 14, 2025. Verify your hall ticket desk allocations.",
        category: "EXAM",
        priority: "CRITICAL",
        publishedBy: "Office of the Controller of Examinations",
        isPublished: true,
      },
    });

    // 8. Seed Learning Modules & Video Lessons
    const cs301 = await prisma.subject.findUnique({ where: { code: "CS-301" } });
    const cs302 = await prisma.subject.findUnique({ where: { code: "CS-302" } });
    const cs303 = await prisma.subject.findUnique({ where: { code: "CS-303" } });

    if (cs301) {
      // Enroll Aarav in CS-301, CS-302, CS-303
      await prisma.subjectEnrollment.upsert({
        where: {
          studentId_subjectId_academicYear_semester: {
            studentId: student.id,
            subjectId: cs301.id,
            academicYear: "2024-2025",
            semester: 6,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          subjectId: cs301.id,
          academicYear: "2024-2025",
          semester: 6,
          status: "ENROLLED",
        },
      });

      if (cs302) {
        await prisma.subjectEnrollment.upsert({
          where: {
            studentId_subjectId_academicYear_semester: {
              studentId: student.id,
              subjectId: cs302.id,
              academicYear: "2024-2025",
              semester: 6,
            },
          },
          update: {},
          create: {
            studentId: student.id,
            subjectId: cs302.id,
            academicYear: "2024-2025",
            semester: 6,
            status: "ENROLLED",
          },
        });
      }

      // Check existing modules to avoid duplicates on re-seed
      const existingMod = await prisma.learningModule.findFirst({
        where: { subjectId: cs301.id, orderIndex: 1 }
      });

      if (!existingMod) {
        // Module 1: Graph Algorithms & MST
        const mod1 = await prisma.learningModule.create({
          data: {
            subjectId: cs301.id,
            title: "Unit 1: Advanced Graph Algorithms & Minimum Spanning Trees",
            description: "Graph representations, disjoint-set forest (Union-Find), Kruskal's greedy strategy, and Prim's algorithm.",
            orderIndex: 1,
          },
        });

        const lesson1 = await prisma.videoLesson.create({
          data: {
            moduleId: mod1.id,
            title: "Lec 01: Kruskal & Prim's Minimum Spanning Tree Algorithms",
            description: "Comprehensive breakdown of Greedy strategy on weighted undirected graphs, Cut Property proof, and amortized complexity using Disjoint Set Union (DSU) with path compression.",
            notes: "Key Takeaways:\n- Cut Property: For any cut of the graph, if an edge e is the strictly lightest edge crossing the cut, it belongs to all MSTs.\n- Kruskal's time complexity: O(E log E) or O(E log V).\n- Prim's time complexity: O((V + E) log V) with Binary Heap; O(E + V log V) with Fibonacci Heap.",
            durationSec: 2880, // 48 minutes
            videoUrl: "https://www.youtube.com/watch?v=4Zq2Ed642lk",
            thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
            orderIndex: 1,
            status: "PUBLISHED",
          },
        });

        const lesson2 = await prisma.videoLesson.create({
          data: {
            moduleId: mod1.id,
            title: "Lec 02: Dijkstra's Single-Source Shortest Path & Priority Queues",
            description: "Analysis of non-negative edge weight shortest path algorithms, edge relaxation condition, and binary min-heap implementation.",
            notes: "Prerequisites:\n- Adjacency list representation\n- Priority Queue operations (insert, extract-min, decrease-key)",
            durationSec: 3120, // 52 minutes
            videoUrl: "https://www.youtube.com/watch?v=EFg3u_E6eHU",
            thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
            orderIndex: 2,
            status: "PUBLISHED",
          },
        });

        const lesson3 = await prisma.videoLesson.create({
          data: {
            moduleId: mod1.id,
            title: "Lec 03: Bellman-Ford Algorithm and Arbitrage Detection",
            description: "Handling negative edge weights, detecting negative cycles, and financial currency exchange arbitrage modeling.",
            durationSec: 2520, // 42 minutes
            videoUrl: "https://www.youtube.com/watch?v=obWXjtg0L64",
            thumbnailUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
            orderIndex: 3,
            status: "PUBLISHED",
          },
        });

        // Resources for lesson 1
        await prisma.lessonResource.createMany({
          data: [
            {
              lessonId: lesson1.id,
              title: "Lecture Notes — Graph Cut Property & MST Proofs",
              fileUrl: "/resources/cs301/lec01-mst-notes.pdf",
              fileType: "pdf",
              fileSize: "2.4 MB",
            },
            {
              lessonId: lesson1.id,
              title: "Python 3 Implementation & Benchmark Notebook",
              fileUrl: "/resources/cs301/kruskal-prim.py",
              fileType: "code",
              fileSize: "18 KB",
            },
          ],
        });

        // Seed student progress (Lesson 1 in progress at 64%, Lesson 2 completed)
        await prisma.lessonProgress.upsert({
          where: {
            studentId_lessonId: {
              studentId: student.id,
              lessonId: lesson1.id,
            },
          },
          update: {
            watchedSeconds: 1840,
            isCompleted: false,
            lastWatchedAt: new Date(),
          },
          create: {
            studentId: student.id,
            lessonId: lesson1.id,
            watchedSeconds: 1840,
            isCompleted: false,
            lastWatchedAt: new Date(),
          },
        });

        await prisma.lessonProgress.upsert({
          where: {
            studentId_lessonId: {
              studentId: student.id,
              lessonId: lesson2.id,
            },
          },
          update: {
            watchedSeconds: 3120,
            isCompleted: true,
          },
          create: {
            studentId: student.id,
            lessonId: lesson2.id,
            watchedSeconds: 3120,
            isCompleted: true,
            completedAt: new Date(),
            lastWatchedAt: new Date(Date.now() - 86400000),
          },
        });

        // Module 2: Dynamic Programming
        const mod2 = await prisma.learningModule.create({
          data: {
            subjectId: cs301.id,
            title: "Unit 2: Dynamic Programming & Optimal Substructure",
            description: "Overlapping subproblems, Memoization vs Tabulation, LCS, and Matrix Chain Multiplication.",
            orderIndex: 2,
          },
        });

        await prisma.videoLesson.create({
          data: {
            moduleId: mod2.id,
            title: "Lec 04: Longest Common Subsequence & Diff Algorithms",
            description: "Recursive state formation, 2D table recurrence relation, and reconstructing the optimal sequence.",
            durationSec: 2700, // 45 minutes
            videoUrl: "https://www.youtube.com/watch?v=ASoaQq66foQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
            orderIndex: 1,
            status: "PUBLISHED",
          },
        });
      }
    }

    if (cs302) {
      const existingDbMod = await prisma.learningModule.findFirst({
        where: { subjectId: cs302.id, orderIndex: 1 }
      });
      if (!existingDbMod) {
        const dbMod1 = await prisma.learningModule.create({
          data: {
            subjectId: cs302.id,
            title: "Unit 1: Indexing & Storage Engine Architecture",
            description: "Disk storage, buffer pool management, B+ Tree index structures, and Range Query optimizations.",
            orderIndex: 1,
          },
        });

        await prisma.videoLesson.create({
          data: {
            moduleId: dbMod1.id,
            title: "Lec 01: B+ Tree Indexing & Disk Block I/O Performance",
            description: "Node split and merge operations, height invariants, clustered vs non-clustered index benchmarks.",
            durationSec: 3300, // 55 minutes
            videoUrl: "https://www.youtube.com/watch?v=aZjYr87r1b8",
            thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
            orderIndex: 1,
            status: "PUBLISHED",
          },
        });
      }
    }

    if (cs303) {
      const existingOsMod = await prisma.learningModule.findFirst({
        where: { subjectId: cs303.id, orderIndex: 1 }
      });
      if (!existingOsMod) {
        const osMod1 = await prisma.learningModule.create({
          data: {
            subjectId: cs303.id,
            title: "Unit 1: Concurrency, Semaphores & Deadlock Avoidance",
            description: "Race conditions, Peterson's algorithm, mutex locks, condition variables, and Banker's algorithm.",
            orderIndex: 1,
          },
        });

        await prisma.videoLesson.create({
          data: {
            moduleId: osMod1.id,
            title: "Lec 01: Critical Section Problem & POSIX Mutex Implementation",
            description: "Hardware atomic instructions (TestAndSet, CompareAndSwap) and synchronization primitives.",
            durationSec: 2760, // 46 minutes
            videoUrl: "https://www.youtube.com/watch?v=gT8c8Q5B5B8",
            thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
            orderIndex: 1,
            status: "PUBLISHED",
          },
        });
      }
    }

    console.log("🎉 Database seeding completed successfully with Video Lectures and Progress!");
  } catch (err: any) {
    console.warn("⚠️ Could not connect to live MySQL during seeding. Ensure MySQL server is running and credentials match:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
