import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/job-categories — list all job categories
// Public (anyone can read categories), but inactive ones require admin
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  let where: any = {};
  if (includeInactive) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
    }
  } else {
    where.isActive = true;
  }

  const categories = await db.jobCategory.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  // Also count jobs per category from the Job table
  const jobs = await db.job.findMany({ select: { category: true } });
  const jobCounts = new Map<string, number>();
  for (const j of jobs) {
    jobCounts.set(j.category, (jobCounts.get(j.category) ?? 0) + 1);
  }

  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    color: c.color,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    jobCount: jobCounts.get(c.name) ?? 0,
    createdAt: c.createdAt,
  }));

  return NextResponse.json({ ok: true, categories: result });
}

// POST /api/admin/job-categories — create a new job category (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ ok: false, error: "Category name is required." }, { status: 400 });
    }

    // Check for duplicate
    const existing = await db.jobCategory.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ ok: false, error: `A category named "${name.trim()}" already exists.` }, { status: 409 });
    }

    const category = await db.jobCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "bg-violet-500",
        sortOrder: 0,
        isActive: true,
      },
    });

    // Audit log
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Created job category: ${name.trim()}`,
        target: `Color: ${color || "bg-violet-500"}`,
        type: "admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to create category" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/job-categories — update a category (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Category id is required." }, { status: 400 });

    const data: any = {};
    if (updates.name !== undefined) data.name = String(updates.name).trim();
    if (updates.description !== undefined) data.description = updates.description?.trim() || null;
    if (updates.color !== undefined) data.color = String(updates.color);
    if (updates.isActive !== undefined) data.isActive = Boolean(updates.isActive);
    if (updates.sortOrder !== undefined) data.sortOrder = Number(updates.sortOrder);

    const category = await db.jobCategory.update({ where: { id }, data });

    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/job-categories?id=... — delete a category (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Category id is required." }, { status: 400 });

    const category = await db.jobCategory.delete({ where: { id } });

    // Audit log
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Deleted job category: ${category.name}`,
        target: `ID: ${id}`,
        type: "admin",
        status: "warning",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
