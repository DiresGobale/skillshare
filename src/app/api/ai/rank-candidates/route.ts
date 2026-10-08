import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { rankCandidates } from "@/lib/ai-service";
import type { ProficiencyLevel } from "@/lib/types";

// POST /api/ai/rank-candidates — rank applicants for a specific job
// Body: { jobId: string }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer") return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });

  try {
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ ok: false, error: "jobId is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // Fetch the job + verify ownership
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }

    // Fetch all applications for this job with candidate details
    const applications = await db.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true, name: true, title: true, email: true,
            skills: true, experiences: true, educations: true, about: true,
          },
        },
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({ ok: true, result: { rankings: [], summary: "No candidates have applied to this job yet." } });
    }

    // Calculate experience years for each candidate
    const candidates = applications.map(app => {
      const expDates = app.user.experiences.map(e => {
        try { return new Date(e.startDate); } catch { return null; }
      }).filter((d): d is Date => d !== null);
      const earliestExp = expDates.length > 0 ? Math.min(...expDates.map(d => d.getTime())) : Date.now();
      const years = Math.round((Date.now() - earliestExp) / (1000 * 60 * 60 * 24 * 365.25));

      return {
        id: app.user.id,
        name: app.user.name,
        title: app.user.title ?? "",
        skills: app.user.skills.map(s => ({
          name: s.name,
          proficiency: s.proficiency as ProficiencyLevel,
          verified: s.verified === "verified",
        })),
        experienceYears: years,
        education: app.user.educations[0] ? `${app.user.educations[0].degree} in ${app.user.educations[0].field}` : "",
        applicationStatus: app.status,
        appliedAt: app.appliedAt.toISOString(),
      };
    });

    // Build job input — extract required skills from the job
    // Since we don't have structured skills on the Job model yet, use a default set
    // based on the job title/category
    const requiredSkills = [
      { name: "JavaScript", proficiency: "intermediate" as ProficiencyLevel, mandatory: true },
      { name: "React", proficiency: "intermediate" as ProficiencyLevel, mandatory: true },
    ];

    const result = await rankCandidates({
      job: {
        title: job.title,
        requiredSkills,
        minExperienceYears: 2,
        category: job.category,
      },
      candidates,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Candidate ranking failed" },
      { status: 500 }
    );
  }
}
