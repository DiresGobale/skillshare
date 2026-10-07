import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/candidates?jobId=xxx
// Returns all applicants to a specific job, ranked by match score (desc).
// Each candidate includes their skills for the employer's review.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer") return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // If jobId provided, filter to that job; otherwise return all applicants across employer's jobs
  const where: any = {};
  if (jobId) {
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }
    where.jobId = jobId;
  } else {
    // All applications to employer's jobs
    const jobs = await db.job.findMany({ where: { employerId: user.id }, select: { id: true } });
    where.jobId = { in: jobs.map((j) => j.id) };
  }

  const applications = await db.application.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, title: true, avatarColor: true, initials: true, location: true, about: true, skills: true, experiences: true, educations: true } },
      job: { select: { id: true, title: true, company: true, companyLogo: true, location: true } },
    },
    orderBy: { matchScore: "desc" },
  });

  const candidates = applications.map((app) => ({
    id: app.user.id,
    applicationId: app.id,
    name: app.user.name,
    email: app.user.email,
    title: app.user.title,
    initials: app.user.initials ?? app.user.name.slice(0, 2).toUpperCase(),
    avatarColor: app.user.avatarColor,
    location: app.user.location,
    about: app.user.about,
    skills: app.user.skills,
    experiences: app.user.experiences,
    educations: app.user.educations,
    matchScore: app.matchScore ?? 0,
    applicationStatus: app.status,
    appliedAt: app.appliedAt,
    job: app.job,
  }));

  return NextResponse.json({ ok: true, candidates });
}
