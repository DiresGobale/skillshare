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
