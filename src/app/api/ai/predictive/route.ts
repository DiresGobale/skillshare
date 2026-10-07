import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { getPredictiveAnalytics } from "@/lib/ai-service";

// GET /api/ai/predictive
// Returns predictive employment analytics: job growth forecast, skill demand,
// salary trends, market insights, hiring seasonality.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "employer") {
    return NextResponse.json({ ok: false, error: "Admins and employers only" }, { status: 403 });
  }

  try {
    const [jobsByCategory, topSkills] = await Promise.all([
      db.job.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } } }),
      db.skill.groupBy({ by: ["name"], _count: { name: true }, orderBy: { _count: { name: "desc" } }, take: 10 }),
    ]);

    const result = await getPredictiveAnalytics(
      jobsByCategory.map(c => ({ category: c.category, count: c._count.category })),
      topSkills.map(s => ({ name: s.name, count: s._count.name })),
    );

    return NextResponse.json({ ok: true, analytics: result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Predictive analytics failed" },
      { status: 500 }
    );
  }
}
