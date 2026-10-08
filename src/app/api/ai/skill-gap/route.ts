import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { analyzeSkillGap } from "@/lib/ai-service";
import type { ProficiencyLevel } from "@/lib/types";

// POST /api/ai/skill-gap — analyze skill gaps between a candidate and a target job
// Body: { jobId: string } or { targetSkills: [{ name, proficiency, mandatory }] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Fetch the candidate's profile
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { skills: true, experiences: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Calculate experience years
    const expDates = user.experiences.map(e => {
      try { return new Date(e.startDate); } catch { return null; }
    }).filter((d): d is Date => d !== null);
    const earliestExp = expDates.length > 0 ? Math.min(...expDates.map(d => d.getTime())) : Date.now();
    const candidateYears = Math.round((Date.now() - earliestExp) / (1000 * 60 * 60 * 24 * 365.25));

    let targetJobTitle = body.targetJobTitle ?? "Target Role";
    let targetSkills: { name: string; proficiency: ProficiencyLevel; mandatory: boolean }[] = [];
    let targetYears = 0;

    // Option 1: target a specific job by ID
    if (body.jobId) {
      const job = await db.job.findUnique({ where: { id: body.jobId } });
      if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
      targetJobTitle = job.title;
      targetYears = 3; // default assumption
      // If the job has skills in the DB, use them; otherwise extract from description
      // For now, use a default set based on the job category
      targetSkills = [
        { name: "JavaScript", proficiency: "intermediate", mandatory: true },
        { name: "React", proficiency: "intermediate", mandatory: true },
        { name: "Node.js", proficiency: "intermediate", mandatory: false },
      ];
    } else if (body.targetSkills) {
      // Option 2: target skills provided directly
      targetSkills = body.targetSkills;
      targetYears = body.targetExperienceYears ?? 3;
    } else {
      return NextResponse.json({ ok: false, error: "Provide either jobId or targetSkills in the request body." }, { status: 400 });
    }

    const result = await analyzeSkillGap({
      candidateSkills: user.skills.map(s => ({
        name: s.name,
        proficiency: s.proficiency as ProficiencyLevel,
        verified: s.verified === "verified",
      })),
      targetJobSkills: targetSkills,
      targetJobTitle,
      candidateExperienceYears: candidateYears,
      targetExperienceYears: targetYears,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Skill gap analysis failed" },
      { status: 500 }
    );
  }
}
