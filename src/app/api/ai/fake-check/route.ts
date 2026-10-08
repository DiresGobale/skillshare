import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { detectFakeData } from "@/lib/ai-service";
import type { ProficiencyLevel } from "@/lib/types";

// POST /api/ai/fake-check — detect fake/misleading data in a job seeker's profile
// Body: { userId?: string } — if omitted, checks the current user's profile
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId ?? null;

    // Determine which user to check
    let userEmail = session.user.email;
    if (targetUserId && session.user.role === "admin") {
      // Admins can check any user
      const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      userEmail = targetUser.email;
    }

    // Fetch full profile
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Calculate years of experience from the earliest experience start date
    const expDates = user.experiences.map(e => {
      try { return new Date(e.startDate); } catch { return null; }
    }).filter((d): d is Date => d !== null);
    const earliestExp = expDates.length > 0 ? Math.min(...expDates.map(d => d.getTime())) : Date.now();
    const calculatedYears = Math.round((Date.now() - earliestExp) / (1000 * 60 * 60 * 24 * 365.25));

    const result = await detectFakeData({
      name: user.name,
      email: user.email,
      title: user.title ?? "",
      about: user.about ?? "",
      skills: user.skills.map(s => ({
        name: s.name,
        proficiency: s.proficiency as ProficiencyLevel,
        verified: s.verified === "verified",
      })),
      experience: user.experiences.map(e => ({
        company: e.company,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description ?? "",
      })),
      education: user.educations.map(e => ({
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        startDate: e.startDate,
        endDate: e.endDate,
      })),
      yearsOfExperience: calculatedYears,
    });

    // Audit the check
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: `Fake data check: ${result.isFake ? "FLAGGED" : "PASSED"} (confidence: ${Math.round(result.confidence * 100)}%)`,
        target: user.email,
        type: "ai",
        status: result.isFake ? "warning" : "success",
      },
    }).catch(() => { /* non-blocking */ });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Fake data check failed" },
      { status: 500 }
    );
  }
}
