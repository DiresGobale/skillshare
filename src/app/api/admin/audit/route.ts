import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/audit — list all audit logs (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q");

  const where: any = {};
  if (type && type !== "all") where.type = type;
  if (q) {
    where.OR = [
      { action: { contains: q } },
      { target: { contains: q } },
      { user: { name: { contains: q } } },
    ];
  }

  const logs = await db.auditLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const formatted = logs.map((l) => ({
    id: l.id,
    user: l.user?.name ?? "System",
    action: l.action,
    target: l.target,
    type: l.type,
    ip: l.ip ?? "—",
    status: l.status,
    time: l.createdAt.toISOString().replace("T", " ").slice(0, 16),
  }));

  return NextResponse.json({ ok: true, logs: formatted });
}

// POST /api/admin/audit — create a new audit log entry (admin only)
// Body: { action, target, type?, status? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const body = await req.json();
    const { action, target, type = "admin", status = "success" } = body;

    if (!action || !target) {
      return NextResponse.json({ ok: false, error: "Action and target are required." }, { status: 400 });
    }

    // Look up the admin user to attach the audit log to
    const user = await db.user.findUnique({ where: { email: session.user.email } });

    const log = await db.auditLog.create({
      data: {
        userId: user?.id,
        action: String(action).slice(0, 500),
        target: String(target).slice(0, 500),
        type: String(type),
        status: String(status),
      },
    });

    return NextResponse.json({ ok: true, id: log.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to create audit log" },
      { status: 500 }
    );
  }
}
