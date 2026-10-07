import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/stats — platform-wide stats for the admin dashboard
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  const [
    totalUsers,
    jobSeekers,
    employers,
    pendingEmployers,
    activeJobs,
    totalApplications,
    verifiedSkills,
    auditCount,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "seeker" } }),
    db.user.count({ where: { role: "employer" } }),
    db.user.count({ where: { role: "employer", status: "pending" } }),
    db.job.count({ where: { status: "published" } }),
    db.application.count(),
    db.skill.count({ where: { verified: "verified" } }),
    db.auditLog.count(),
  ]);

  // Top skills by usage
  const topSkillsRaw = await db.skill.groupBy({
    by: ["name"],
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
    take: 8,
  });
  const topSkills = topSkillsRaw.map((s) => ({ name: s.name, count: s._count.name }));

  // Recent activity (last 5)
  const recentLogs = await db.auditLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const recentActivity = recentLogs.map((l) => ({
    id: l.id,
    user: l.user?.name ?? "System",
    action: l.action,
    target: l.target,
    type: l.type,
    status: l.status,
    time: l.createdAt.toISOString().replace("T", " ").slice(0, 16),
  }));

  return NextResponse.json({
    ok: true,
    stats: {
      totalUsers,
      jobSeekers,
      employers,
      pendingEmployers,
      activeJobs,
      totalApplications,
      verifiedSkills,
      auditCount,
    },
    topSkills,
    recentActivity,
  });
}
