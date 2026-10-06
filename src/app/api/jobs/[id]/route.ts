import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/jobs/[id] — get a single job with applications count
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const data: any = {};
    for (const field of ["title", "category", "type", "location", "remote", "description", "status"]) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.salaryMin !== undefined) data.salaryMin = Number(body.salaryMin);
    if (body.salaryMax !== undefined) data.salaryMax = Number(body.salaryMax);

    const updated = await db.job.update({ where: { id }, data });
    await db.auditLog.create({
      data: { userId: user.id, action: "Updated job", target: updated.title, type: "job", status: "success" },
    });
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
