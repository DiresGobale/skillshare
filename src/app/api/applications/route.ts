import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/applications — list applications
// - For seekers: their own applications (with job details)
// - For employers: applications to their jobs (with candidate details)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  if (user.role === "seeker") {
    const applications = await db.application.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json({ ok: true, applications });
  }

  if (user.role === "employer") {
    // All applications to jobs posted by this employer
    const jobs = await db.job.findMany({
      where: { employerId: user.id },
      include: { applications: { include: { user: { select: { id: true, name: true, email: true, title: true, avatarColor: true, initials: true, location: true } } } } },
    });
    const applications: any[] = [];
    for (const job of jobs) {
      for (const app of job.applications) {
        applications.push({
          id: app.id,
          status: app.status,
          matchScore: app.matchScore,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt,
          job: { id: job.id, title: job.title, company: job.company, companyLogo: job.companyLogo, location: job.location },
          candidate: app.user,
        });
      }
    }
    return NextResponse.json({ ok: true, applications });
  }

  return NextResponse.json({ ok: false, error: "Not supported for this role" }, { status: 403 });
}

// POST /api/applications — seeker applies to a job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "seeker") return NextResponse.json({ ok: false, error: "Seekers only" }, { status: 403 });
  try {
    const { jobId, matchScore } = await req.json();
    if (!jobId) return NextResponse.json({ ok: false, error: "Job ID is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    if (job.status !== "published") return NextResponse.json({ ok: false, error: "This job is no longer accepting applications." }, { status: 400 });

    // Check for duplicate
    const existing = await db.application.findFirst({ where: { userId: user.id, jobId } });
    if (existing) return NextResponse.json({ ok: false, error: "You've already applied to this job." }, { status: 409 });

    const application = await db.application.create({
      data: { userId: user.id, jobId, status: "submitted", matchScore: matchScore || null },
    });

    // Notify the employer
    await db.notification.create({
      data: {
        userId: job.employerId,
        type: "application",
        title: "New application received",
        message: `${user.name} applied to ${job.title}.`,
        read: false,
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Applied to", target: `${job.title} @ ${job.company}`, type: "application", status: "success" },
    });

    return NextResponse.json({ ok: true, application });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// PATCH /api/applications — employer updates application status (e.g. shortlist, reject)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { applicationId, status } = await req.json();
    if (!applicationId || !status) return NextResponse.json({ ok: false, error: "applicationId and status are required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });

    // Only the employer who owns the job can update the application
    if (user.role === "employer" && application.job.employerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }
    // Seekers can only withdraw their own
    if (user.role === "seeker" && application.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    const updated = await db.application.update({
      where: { id: applicationId },
      data: { status },
    });

    // Notify the seeker
    await db.notification.create({
      data: {
        userId: application.userId,
        type: "application",
        title: "Application status update",
        message: `Your application to ${application.job.title} moved to ${status}.`,
        read: false,
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: `Updated application to ${status}`, target: application.job.title, type: "application", status: "success" },
    });

    return NextResponse.json({ ok: true, application: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
