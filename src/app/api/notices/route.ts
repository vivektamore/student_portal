import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentSession();

    const whereClause: any = {};
    if (session?.role !== "ADMIN") {
      whereClause.isPublished = true;
    }

    const notices = await prisma.notice.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
    });

    const mapped = notices.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      category: n.category,
      priority: n.priority,
      publishedBy: n.publishedBy,
      publishedAt: new Date(n.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      attachment: n.attachment || undefined,
      isCritical: n.priority === "CRITICAL",
      isPublished: n.isPublished,
    }));

    return NextResponse.json({ success: true, notices: mapped });
  } catch (err: any) {
    console.error("API GET /api/notices error:", err);
    return NextResponse.json({ success: false, error: err.message, notices: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, category, priority, publishedBy, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category: category || "GENERAL",
        priority: priority || "NORMAL",
        publishedBy: publishedBy || session.name || "Dean of Academic Affairs",
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notice circular published in database",
      notice,
    });
  } catch (err: any) {
    console.error("API POST /api/notices error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
