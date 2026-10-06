import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/users — list all users (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");

  const where: any = {};
  if (role && role !== "all") where.role = role;
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const users = await db.user.findMany({
    where,
    select: {
      id: true, name: true, email: true, role: true, status: true,
      title: true, company: true, avatarColor: true, initials: true,
      createdAt: true, updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Format dates as strings
  const formatted = users.map((u) => ({
    ...u,
    joinedAt: u.createdAt.toISOString().slice(0, 10),
    lastActive: u.updatedAt.toISOString().slice(0, 10),
  }));

  return NextResponse.json({ ok: true, users: formatted, total: formatted.length });
}
