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

// GET /api/jobs/[id] — get a single job with applications count
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Auto-expire before returning so the status is always accurate
  await autoExpireJobs();

  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    include: { applications: true, employer: { select: { name: true, company: true, avatarColor: true, initials: true } } },
  });
  if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    job: {
      ...job,
      applicants: job.applications.length,
    },
  });
}

// PATCH /api/jobs/[id] — update a job (employer only, must own it)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer") return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.employerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }

    // ---------- BACKEND VALIDATION (if fields are being updated) ----------
    if (body.title !== undefined) {
      const c = validateJobTitle(body.title);
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
    }
    if (body.location !== undefined) {
      const c = validateLocation(body.location);
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
    }
    if (body.description !== undefined) {
      const c = validateRequired(body.description, "Job description", { minLength: 10, maxLength: 5000 });
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
    }
    if (body.salaryMin !== undefined) {
      const c = validateNumber(body.salaryMin, "Salary minimum", { min: 0, max: 1000000 });
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
    }
    if (body.salaryMax !== undefined) {
      const c = validateNumber(body.salaryMax, "Salary maximum", { min: 0, max: 1000000 });
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
    }
    if (body.salaryMin !== undefined && body.salaryMax !== undefined && Number(body.salaryMin) >= Number(body.salaryMax)) {
      return NextResponse.json({ ok: false, error: "Salary maximum must be greater than the minimum." }, { status: 400 });
    }

    const data: any = {};
    for (const field of ["title", "category", "type", "location", "remote", "description", "status"]) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.salaryMin !== undefined) data.salaryMin = Number(body.salaryMin);
    if (body.salaryMax !== undefined) data.salaryMax = Number(body.salaryMax);

    // Handle expiration — when publishing a draft, require/set expiration
    if (body.status === "published" && body.expirationDays !== undefined) {
      const c = validateExpirationDuration(body.expirationDays);
      if (!c.ok) return NextResponse.json({ ok: false, error: c.error }, { status: 400 });
      const days = parseInt(String(body.expirationDays), 10);
      data.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const updated = await db.job.update({ where: { id }, data });
    await db.auditLog.create({
      data: { userId: user.id, action: "Updated job", target: updated.title, type: "job", status: "success" },
    });

    // If the job was just published, notify all seekers
    if (body.status === "published" && job.status !== "published") {
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
            message: `${updated.title} at ${updated.company} — ${updated.location}.`,
            read: false,
          })),
        });
      }
    }

    return NextResponse.json({ ok: true, job: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Update failed" }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] — delete a job (employer only, must own it)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer") return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });
  try {
    const { id } = await params;
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.employerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }

    await db.job.delete({ where: { id } });
    await db.auditLog.create({
      data: { userId: user.id, action: "Deleted job", target: job.title, type: "job", status: "warning" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 });
  }
}
