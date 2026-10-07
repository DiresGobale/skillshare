import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/notifications — list current user's notifications
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { notifications: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, notifications: user.notifications });
}

// PATCH /api/notifications — mark all as read, or mark one as read/unread
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id, markAllRead, read } = await req.json();
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    if (markAllRead) {
      await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
      return NextResponse.json({ ok: true });
    }
    if (id) {
      const notif = await db.notification.findUnique({ where: { id } });
      if (!notif || notif.userId !== user.id) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
      await db.notification.update({ where: { id }, data: { read: read ?? !notif.read } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Provide id or markAllRead" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
