import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/news — public, returns published news
// Query: ?includeDrafts=true (admin only), ?limit=10, ?category=Update
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeDrafts = url.searchParams.get("includeDrafts") === "true";
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const category = url.searchParams.get("category");

  let where: any = {};
  if (includeDrafts) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user.role !== "admin" && session.user.role !== "employer")) {
      return NextResponse.json({ ok: false, error: "Authorized users only" }, { status: 403 });
    }
  } else {
    where.status = "published";
  }
  if (category && category !== "all") {
    where.category = category;
  }

  const news = await db.news.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: {
      author: { select: { name: true, avatarColor: true, initials: true } },
    },
  });

  const result = news.map((n) => {
    let attachments: any[] = [];
    try { attachments = JSON.parse(n.attachments || "[]"); } catch { /* ignore */ }
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      excerpt: n.excerpt,
      category: n.category,
      imageUrl: n.imageUrl,
      attachments,
      status: n.status,
      pinned: n.pinned,
      publishedAt: n.publishedAt.toISOString(),
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      author: n.author?.name ?? "Admin",
      authorInitials: n.author?.initials ?? "AD",
      authorColor: n.author?.avatarColor ?? "oklch(0.65 0.2 330)",
    };
  });

  return NextResponse.json({ ok: true, news: result });
}

// POST /api/news — create news (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "employer")
    return NextResponse.json({ ok: false, error: "Only authorized users (admins/employers) can publish news" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, content, excerpt, category, imageUrl, attachments, status, pinned } = body;

    if (!title?.trim()) return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ ok: false, error: "Content is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });

    const news = await db.news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        category: category || "Update",
        imageUrl: imageUrl || null,
        attachments: JSON.stringify(attachments ?? []),
        status: status || "published",
        pinned: Boolean(pinned),
        authorId: user?.id,
        publishedAt: new Date(),
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Published news: ${title.trim()}`,
        target: `Category: ${category || "Update"}`,
        type: "admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, news });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to create news" },
      { status: 500 }
    );
  }
}

// PATCH /api/news — update news (admin or employer)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "employer")
    return NextResponse.json({ ok: false, error: "Only authorized users (admins/employers) can edit news" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ ok: false, error: "News id is required." }, { status: 400 });

    const data: any = {};
    if (updates.title !== undefined) data.title = String(updates.title).trim();
    if (updates.content !== undefined) data.content = String(updates.content).trim();
    if (updates.excerpt !== undefined) data.excerpt = updates.excerpt?.trim() || null;
    if (updates.category !== undefined) data.category = String(updates.category);
    if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl || null;
    if (updates.attachments !== undefined) data.attachments = JSON.stringify(updates.attachments ?? []);
    if (updates.status !== undefined) data.status = String(updates.status);
    if (updates.pinned !== undefined) data.pinned = Boolean(updates.pinned);

    const news = await db.news.update({ where: { id }, data });

    return NextResponse.json({ ok: true, news });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/news?id=... — delete news (admin or employer)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "employer")
    return NextResponse.json({ ok: false, error: "Only authorized users (admins/employers) can delete news" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "News id is required." }, { status: 400 });

    const news = await db.news.delete({ where: { id } });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Deleted news: ${news.title}`,
        target: `ID: ${id}`,
        type: "admin",
        status: "warning",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
