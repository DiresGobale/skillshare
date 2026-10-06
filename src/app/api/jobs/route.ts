import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/jobs — list jobs
// - For employers: returns their own jobs
// - For seekers/public: returns all published jobs
export async function GET(req: NextRequest) {
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

  // Public/seeker — only published jobs
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
    const { title, category, type, location, remote, salaryMin, salaryMax, description, status, skills } = body;
    if (!title || !title.trim()) return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 });
    if (!description || !description.trim()) return NextResponse.json({ ok: false, error: "Description is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const job = await db.job.create({
      data: {
        employerId: user.id,
        title: title.trim(),
        company: user.company || user.name,
        companyLogo: (user.company || user.name).slice(0, 2).toUpperCase(),
        location: location?.trim() || "Remote",
        remote: remote || "remote",
        type: type || "full-time",
        category: category || "General",
        salaryMin: Number(salaryMin) || 0,
        salaryMax: Number(salaryMax) || 0,
        currency: "USD",
        salaryPeriod: "month",
        description: description.trim(),
        status: status || "draft",
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Created job", target: job.title, type: "job", status: "success" },
    });

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
