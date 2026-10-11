import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/news/[id] — fetch a single news article by id
// Public if the news is published; drafts only visible to admin/employer
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "News id is required." }, { status: 400 });
  }

  const news = await db.news.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, avatarColor: true, initials: true } },
    },
  });

  if (!news) {
    return NextResponse.json({ ok: false, error: "News article not found." }, { status: 404 });
  }

  // If it's a draft, only admins/employers can view
  if (news.status !== "published") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user.role !== "admin" && session.user.role !== "employer")) {
      return NextResponse.json({ ok: false, error: "News article not found." }, { status: 404 });
    }
  }

  return NextResponse.json({
    ok: true,
    news: {
      id: news.id,
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      category: news.category,
      imageUrl: news.imageUrl,
      status: news.status,
      pinned: news.pinned,
      publishedAt: news.publishedAt.toISOString(),
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      author: news.author?.name ?? "Admin",
      authorInitials: news.author?.initials ?? "AD",
      authorColor: news.author?.avatarColor ?? "oklch(0.65 0.2 330)",
    },
  });
}
