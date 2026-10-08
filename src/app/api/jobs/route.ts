import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import {
  validateJobTitle,
  validateLocation,
  validateNumber,
  validateRequired,
  validateExpirationDuration,
} from "@/lib/validation";

// Helper: auto-expire any jobs whose expiresAt has passed.
// Called on every GET so expiration is enforced by the backend, not just the frontend.
async function autoExpireJobs() {
  try {
    await db.job.updateMany({
      where: {
        status: { in: ["published", "paused"] },
        expiresAt: { lte: new Date() },
      },
      data: { status: "expired" },
    });
  } catch {
    /* non-blocking */
  }
}

// GET /api/jobs — list jobs
// - For employers: returns their own jobs
// - For seekers/public: returns all published + non-expired jobs
export async function GET(req: NextRequest) {
  // Auto-expire jobs whose time has come — backend enforcement
  await autoExpireJobs();

  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  if (session?.user?.role === "employer") {
    const user = await db.user.findUnique({ where: { email: session.user.email! }, include: { jobsPosted: { orderBy: { postedAt: "desc" } } } });
    if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    let jobs = user.jobsPosted;
    if (status && status !== "all") jobs = jobs.filter((j) => j.status === status);
    return NextResponse.json({ ok: true, jobs });
  }

  // Public/seeker — only published jobs that haven't expired
  const where: any = { status: "published" };
  const jobs = await db.job.findMany({ where, orderBy: { postedAt: "desc" } });
  return NextResponse.json({ ok: true, jobs });
}

// POST /api/jobs — employer creates a new job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer") return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });
  try {
    const body = await req.json();
    const { title, category, type, location, remote, salaryMin, salaryMax, description, status, skills, expirationDays } = body;

    // ---------- BACKEND VALIDATION ----------
    const titleCheck = validateJobTitle(title ?? "");
    if (!titleCheck.ok) return NextResponse.json({ ok: false, error: titleCheck.error }, { status: 400 });

    const locCheck = validateLocation(location ?? "");
    if (!locCheck.ok) return NextResponse.json({ ok: false, error: locCheck.error }, { status: 400 });

    const descCheck = validateRequired(description ?? "", "Job description", { minLength: 10, maxLength: 5000 });
    if (!descCheck.ok) return NextResponse.json({ ok: false, error: descCheck.error }, { status: 400 });

    const minCheck = validateNumber(salaryMin ?? "", "Salary minimum", { min: 0, max: 1000000 });
    if (!minCheck.ok) return NextResponse.json({ ok: false, error: minCheck.error }, { status: 400 });

    const maxCheck = validateNumber(salaryMax ?? "", "Salary maximum", { min: 0, max: 1000000 });
    if (!maxCheck.ok) return NextResponse.json({ ok: false, error: maxCheck.error }, { status: 400 });

    if (Number(salaryMin) >= Number(salaryMax)) {
      return NextResponse.json({ ok: false, error: "Salary maximum must be greater than the minimum." }, { status: 400 });
    }

    // Expiration validation — required when publishing
    let expiresAt: Date | null = null;
    if (status === "published") {
      // expirationDays must be explicitly provided — don't default to 30
      const expCheck = validateExpirationDuration(expirationDays ?? "");
      if (!expCheck.ok) return NextResponse.json({ ok: false, error: expCheck.error }, { status: 400 });
      const days = parseInt(String(expirationDays), 10);
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // ---------- SAVE TO DATABASE ----------
    const job = await db.job.create({
      data: {
        employerId: user.id,
        title: title.trim(),
        company: user.company || user.name,
        companyLogo: (user.company || user.name).slice(0, 2).toUpperCase(),
        location: location.trim(),
        remote: remote || "remote",
        type: type || "full-time",
        category: category || "General",
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        currency: "USD",
        salaryPeriod: "month",
        description: description.trim(),
        status: status || "draft",
        expiresAt,
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Created job", target: job.title, type: "job", status: "success" },
    });

    // ---------- NOTIFICATION FLOW ----------
    // When a job is published, notify all job seekers (relevant users) about the new job.
    if (status === "published") {
      const seekers = await db.user.findMany({
        where: { role: "seeker", status: "active" },
        select: { id: true },
      });
      if (seekers.length > 0) {
        await db.notification.createMany({
          data: seekers.map((s) => ({
            userId: s.id,
            type: "job",
            title: "New job posted",
            message: `${job.title} at ${job.company} — ${job.location}. Expires in ${expirationDays} days.`,
            read: false,
          })),
        });
      }
    }

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
