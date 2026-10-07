import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { analyzeProfile } from "@/lib/ai-service";

// POST /api/ai/analyze
// Analyzes the logged-in user's skills, qualifications, and experience.
// Returns strengths, weaknesses, career level, market position, recommended roles, insights.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const experienceYears = user.experiences.length > 0
      ? Math.max(1, new Date().getFullYear() - new Date(user.experiences[0].startDate).getFullYear())
      : 0;

    const education = user.educations.length > 0
      ? `${user.educations[0].degree} in ${user.educations[0].field} from ${user.educations[0].institution}`
      : "";

    const result = await analyzeProfile({
      name: user.name,
      title: user.title ?? "",
      skills: user.skills.map(s => ({
        name: s.name,
        proficiency: s.proficiency as any,
        verified: s.verified === "verified",
      })),
      experienceYears,
      education,
      about: user.about ?? "",
    });

    // Audit
    await db.auditLog.create({
      data: { userId: user.id, action: "AI profile analysis", target: user.email, type: "ai", status: "success" },
    });

    return NextResponse.json({ ok: true, analysis: result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
