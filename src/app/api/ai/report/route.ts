import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { generateReport } from "@/lib/ai-service";

// POST /api/ai/report
// Generates an AI-powered report for employers or admins.
// Body: { type: "employer" | "admin" }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await req.json();
    if (!["employer", "admin"].includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid report type" }, { status: 400 });
    }

    if (type === "employer" && session.user.role !== "employer") {
      return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });
    }
    if (type === "admin" && session.user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
    }

    // Gather data
    let totalJobs = 0, totalApplications = 0, avgMatchScore = 0;
    let topSkills: { name: string; count: number }[] = [];
    let jobsByCategory: { category: string; count: number }[] = [];
    let applicationsByStatus: { status: string; count: number }[] = [];

    if (type === "employer") {
      const user = await db.user.findUnique({ where: { email: session.user.email }, include: { jobsPosted: { include: { applications: true } } } });
      if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

      totalJobs = user.jobsPosted.filter(j => j.status === "published").length;
      const allApps = user.jobsPosted.flatMap(j => j.applications);
      totalApplications = allApps.length;
      avgMatchScore = allApps.length > 0 ? Math.round(allApps.reduce((a, app) => a + (app.matchScore ?? 0), 0) / allApps.length) : 0;

      // Get skill distribution from applicants
      const applicantIds = [...new Set(allApps.map(a => a.userId))];
      const applicantSkills = await db.skill.groupBy({
        by: ["name"], _count: { name: true }, where: { userId: { in: applicantIds } }, orderBy: { _count: { name: "desc" } }, take: 10,
      });
      topSkills = applicantSkills.map(s => ({ name: s.name, count: s._count.name }));

      jobsByCategory = user.jobsPosted.reduce((acc, j) => {
        const existing = acc.find(x => x.category === j.category);
        if (existing) existing.count++;
        else acc.push({ category: j.category, count: 1 });
        return acc;
      }, [] as { category: string; count: number }[]);

      applicationsByStatus = allApps.reduce((acc, a) => {
        const existing = acc.find(x => x.status === a.status);
        if (existing) existing.count++;
        else acc.push({ status: a.status, count: 1 });
        return acc;
      }, [] as { status: string; count: number }[]);
    } else {
      // Admin
      totalJobs = await db.job.count({ where: { status: "published" } });
      totalApplications = await db.application.count();
      const apps = await db.application.findMany({ select: { matchScore: true } });
      avgMatchScore = apps.length > 0 ? Math.round(apps.reduce((a, app) => a + (app.matchScore ?? 0), 0) / apps.length) : 0;

      const skillCounts = await db.skill.groupBy({ by: ["name"], _count: { name: true }, orderBy: { _count: { name: "desc" } }, take: 10 });
      topSkills = skillCounts.map(s => ({ name: s.name, count: s._count.name }));

      const catCounts = await db.job.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } } });
      jobsByCategory = catCounts.map(c => ({ category: c.category, count: c._count.category }));

      const statusCounts = await db.application.groupBy({ by: ["status"], _count: { status: true } });
      applicationsByStatus = statusCounts.map(s => ({ status: s.status, count: s._count.status }));
    }

    const report = await generateReport({
      type,
      data: { totalJobs, totalApplications, avgMatchScore, topSkills, jobsByCategory, applicationsByStatus },
    });

    // Audit
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      await db.auditLog.create({
        data: { userId: user.id, action: `Generated ${type} AI report`, target: user.email, type: "ai", status: "success" },
      });
    }

    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
