import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const semester = searchParams.get("semester");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const session = await getCurrentSession();
    const isStudent = session?.role === "STUDENT";
    const isAdmin = session?.role === "ADMIN";

    // If student, find enrolled student ID to attach progress
    let studentId = session?.studentId;
    if (isStudent && !studentId && session?.userId) {
      const studentRec = await prisma.student.findUnique({
        where: { userId: session.userId },
      });
      if (studentRec) studentId = studentRec.id;
    }

    // Build subject query filter
    const subjectWhere: any = {};
    if (isStudent) {
      if (!studentId) {
        return NextResponse.json({
          success: true,
          modules: [],
          lessons: [],
          metrics: { totalLectures: 0, completedLectures: 0, inProgressLectures: 0, totalDurationHours: "0.0", watchedDurationHours: "0.0", completionRate: 0 },
          continueLearning: null,
        });
      }
      const enrollments = await prisma.subjectEnrollment.findMany({
        where: { studentId },
        select: { subjectId: true },
      });
      const enrolledSubjectIds = enrollments.map((e) => e.subjectId);
      if (enrolledSubjectIds.length === 0) {
        return NextResponse.json({
          success: true,
          modules: [],
          lessons: [],
          metrics: { totalLectures: 0, completedLectures: 0, inProgressLectures: 0, totalDurationHours: "0.0", watchedDurationHours: "0.0", completionRate: 0 },
          continueLearning: null,
        });
      }
      if (subjectId) {
        subjectWhere.AND = [
          { id: { in: enrolledSubjectIds } },
          { OR: [{ id: subjectId }, { code: subjectId }] },
        ];
      } else {
        subjectWhere.id = { in: enrolledSubjectIds };
      }
    } else {
      if (subjectId) {
        subjectWhere.OR = [{ id: subjectId }, { code: subjectId }];
      }
    }

    if (semester && semester !== "ALL") {
      subjectWhere.semester = Number(semester);
    }

    // Status filter: students can ONLY view PUBLISHED content
    const lessonStatusFilter = isStudent
      ? { status: "PUBLISHED" as const }
      : status && status !== "ALL"
      ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
      : undefined;

    // Fetch learning modules with lessons and resources
    const modules = await prisma.learningModule.findMany({
      where: {
        subject: subjectWhere,
      },
      include: {
        subject: {
          include: {
            department: true,
            facultyAssignments: {
              include: { faculty: true },
            },
          },
        },
        lessons: {
          where: lessonStatusFilter,
          orderBy: { orderIndex: "asc" },
          include: {
            resources: true,
            ...(studentId
              ? {
                  progress: {
                    where: { studentId },
                  },
                }
              : {}),
          },
        },
      },
      orderBy: [{ subject: { code: "asc" } }, { orderIndex: "asc" }],
    });

    // Flatten & format for client consumption
    let allLessons: any[] = [];
    let formattedModules = modules.map((mod) => {
      const formattedLessons = mod.lessons.map((lesson) => {
        const studentProgress = lesson.progress?.[0] || null;
        const formatted = {
          id: lesson.id,
          moduleId: mod.id,
          moduleTitle: mod.title,
          subjectId: mod.subject.id,
          subjectCode: mod.subject.code,
          subjectName: mod.subject.name,
          semester: mod.subject.semester,
          departmentName: mod.subject.department?.name || "Engineering",
          facultyName: mod.subject.facultyAssignments[0]?.faculty
            ? `${mod.subject.facultyAssignments[0].faculty.firstName} ${mod.subject.facultyAssignments[0].faculty.lastName}`
            : "Faculty Instructor",
          title: lesson.title,
          description: lesson.description || "",
          notes: lesson.notes || "",
          durationSec: lesson.durationSec,
          videoUrl: lesson.videoUrl,
          thumbnailUrl:
            lesson.thumbnailUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
          orderIndex: lesson.orderIndex,
          status: lesson.status,
          createdAt: lesson.createdAt.toISOString(),
          resources: lesson.resources.map((r) => ({
            id: r.id,
            title: r.title,
            fileUrl: r.fileUrl,
            fileType: r.fileType,
            fileSize: r.fileSize || "1.5 MB",
          })),
          progress: studentProgress
            ? {
                watchedSeconds: studentProgress.watchedSeconds,
                isCompleted: studentProgress.isCompleted,
                lastWatchedAt: studentProgress.lastWatchedAt.toISOString(),
              }
            : null,
        };
        allLessons.push(formatted);
        return formatted;
      });

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
        subjectId: mod.subject.id,
        subjectCode: mod.subject.code,
        subjectName: mod.subject.name,
        semester: mod.subject.semester,
        lessons: formattedLessons,
      };
    });

    // Filter by search query if provided
    if (search) {
      allLessons = allLessons.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.description.toLowerCase().includes(search) ||
          l.subjectName.toLowerCase().includes(search) ||
          l.subjectCode.toLowerCase().includes(search) ||
          l.moduleTitle.toLowerCase().includes(search)
      );
    }

    // Calculate metrics
    const totalLectures = allLessons.length;
    const completedLectures = allLessons.filter((l) => l.progress?.isCompleted).length;
    const inProgressLectures = allLessons.filter(
      (l) => l.progress && !l.progress.isCompleted && l.progress.watchedSeconds > 0
    ).length;
    const totalDurationSec = allLessons.reduce((acc, cur) => acc + (cur.durationSec || 0), 0);
    const watchedDurationSec = allLessons.reduce(
      (acc, cur) => acc + (cur.progress?.watchedSeconds || 0),
      0
    );

    // Identify Continue Learning lesson (most recently watched incomplete lesson, or first available)
    const inProgressItems = allLessons
      .filter((l) => l.progress && !l.progress.isCompleted && l.progress.watchedSeconds > 0)
      .sort((a, b) => {
        const timeA = new Date(a.progress.lastWatchedAt).getTime();
        const timeB = new Date(b.progress.lastWatchedAt).getTime();
        return timeB - timeA;
      });

    const continueLearning = inProgressItems[0] || (allLessons.length > 0 ? allLessons[0] : null);

    return NextResponse.json({
      success: true,
      modules: formattedModules,
      lessons: allLessons,
      metrics: {
        totalLectures,
        completedLectures,
        inProgressLectures,
        totalDurationHours: (totalDurationSec / 3600).toFixed(1),
        watchedDurationHours: (watchedDurationSec / 3600).toFixed(1),
        completionRate: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
      },
      continueLearning,
    });
  } catch (err: any) {
    console.error("GET /api/learning-content error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch learning content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, moduleData, lessonData, resourceData } = body;

    // 1. Create or update Learning Module
    if (action === "save_module") {
      const { id, subjectId, title, description, orderIndex } = moduleData;

      if (!subjectId || !title) {
        return NextResponse.json(
          { success: false, error: "Subject and Title are required for modules." },
          { status: 400 }
        );
      }

      let modRecord;
      if (id && !id.startsWith("new_")) {
        modRecord = await prisma.learningModule.update({
          where: { id },
          data: {
            title,
            description: description || null,
            orderIndex: Number(orderIndex) || 1,
            subjectId,
          },
        });
      } else {
        modRecord = await prisma.learningModule.create({
          data: {
            subjectId,
            title,
            description: description || null,
            orderIndex: Number(orderIndex) || 1,
          },
        });
      }

      return NextResponse.json({ success: true, module: modRecord });
    }

    // 2. Create or update Video Lesson
    if (action === "save_lesson" || !action) {
      const payload = lessonData || body;
      const {
        id,
        moduleId,
        subjectId,
        title,
        description,
        notes,
        durationSec,
        videoUrl,
        thumbnailUrl,
        orderIndex,
        status,
        resources,
      } = payload;

      if (!title || !videoUrl) {
        return NextResponse.json(
          { success: false, error: "Lesson Title and Video URL are required." },
          { status: 400 }
        );
      }

      // Determine module ID
      let targetModuleId = moduleId;
      if (!targetModuleId || targetModuleId === "new") {
        let finalSubjectId = subjectId;
        if (!finalSubjectId && payload.subjectCode) {
          const matchedSubject = await prisma.subject.findFirst({
            where: { OR: [{ code: payload.subjectCode }, { id: payload.subjectCode }] },
          });
          if (matchedSubject) finalSubjectId = matchedSubject.id;
        }
        if (!finalSubjectId) {
          const firstSubj = await prisma.subject.findFirst();
          if (firstSubj) finalSubjectId = firstSubj.id;
        }

        if (!finalSubjectId) {
          return NextResponse.json(
            { success: false, error: "Subject is required if no module is selected." },
            { status: 400 }
          );
        }
        // Create a default module for this subject
        const newMod = await prisma.learningModule.create({
          data: {
            subjectId: finalSubjectId,
            title: `Unit: ${title.split(":")[0] || "General Modules"}`,
            description: "Default curriculum unit",
            orderIndex: 1,
          },
        });
        targetModuleId = newMod.id;
      }

      let lessonRecord;
      if (id && !id.startsWith("new_")) {
        lessonRecord = await prisma.videoLesson.update({
          where: { id },
          data: {
            moduleId: targetModuleId,
            title,
            description: description || null,
            notes: notes || null,
            durationSec: Number(durationSec) || 0,
            videoUrl,
            thumbnailUrl: thumbnailUrl || null,
            orderIndex: Number(orderIndex) || 1,
            status: status || "PUBLISHED",
          },
        });
      } else {
        lessonRecord = await prisma.videoLesson.create({
          data: {
            moduleId: targetModuleId,
            title,
            description: description || null,
            notes: notes || null,
            durationSec: Number(durationSec) || 0,
            videoUrl,
            thumbnailUrl: thumbnailUrl || null,
            orderIndex: Number(orderIndex) || 1,
            status: status || "PUBLISHED",
          },
        });
      }

      // Handle attached resources if provided
      if (Array.isArray(resources) && resources.length > 0) {
        for (const res of resources) {
          if (!res.title || !res.fileUrl) continue;
          if (res.id && !res.id.startsWith("new_")) {
            await prisma.lessonResource.update({
              where: { id: res.id },
              data: {
                title: res.title,
                fileUrl: res.fileUrl,
                fileType: res.fileType || "pdf",
                fileSize: res.fileSize || "1.0 MB",
              },
            });
          } else {
            await prisma.lessonResource.create({
              data: {
                lessonId: lessonRecord.id,
                title: res.title,
                fileUrl: res.fileUrl,
                fileType: res.fileType || "pdf",
                fileSize: res.fileSize || "1.0 MB",
              },
            });
          }
        }
      }

      // Log administrative audit action safely
      if (session.userId) {
        try {
          await prisma.auditLog.create({
            data: {
              actorId: session.userId,
              action: id ? "UPDATE_VIDEO_LESSON" : "CREATE_VIDEO_LESSON",
              targetType: "VideoLesson",
              targetId: lessonRecord.id,
              details: `Admin ${session.email} saved video lecture "${lessonRecord.title}" [Status: ${lessonRecord.status}]`,
            },
          });
        } catch (auditErr) {
          console.warn("Non-fatal audit log warning:", auditErr);
        }
      }

      return NextResponse.json({ success: true, lesson: lessonRecord });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/learning-content error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save learning content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const moduleId = searchParams.get("moduleId");

    if (lessonId) {
      await prisma.videoLesson.delete({ where: { id: lessonId } });
      return NextResponse.json({ success: true, message: "Lesson deleted successfully" });
    }

    if (moduleId) {
      await prisma.learningModule.delete({ where: { id: moduleId } });
      return NextResponse.json({ success: true, message: "Module deleted successfully" });
    }

    return NextResponse.json(
      { success: false, error: "lessonId or moduleId is required." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("DELETE /api/learning-content error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
