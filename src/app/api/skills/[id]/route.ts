import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

const VALID_PROFICIENCY = ["beginner", "intermediate", "advanced", "expert"];

// PATCH /api/skills/[id] — update a skill (proficiency, verified, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const skill = await db.skill.findUnique({ where: { id } });
    if (!skill || skill.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Skill not found" }, { status: 404 });
    }

    const data: any = {};
    if (body.name) data.name = String(body.name).trim();
    if (body.category) data.category = String(body.category).trim();
    if (body.proficiency && VALID_PROFICIENCY.includes(body.proficiency)) data.proficiency = body.proficiency;
    if (body.yearsOfExperience !== undefined) data.yearsOfExperience = body.yearsOfExperience ? Number(body.yearsOfExperience) : null;

    const updated = await db.skill.update({ where: { id }, data });
    return NextResponse.json({ ok: true, skill: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Update failed" }, { status: 500 });
  }
}

// DELETE /api/skills/[id] — delete a skill
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const skill = await db.skill.findUnique({ where: { id } });
    if (!skill || skill.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Skill not found" }, { status: 404 });
    }

    await db.skill.delete({ where: { id } });
    await db.auditLog.create({
      data: { userId: user.id, action: "Deleted skill", target: skill.name, type: "admin", status: "success" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 });
  }
}
