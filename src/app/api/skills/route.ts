import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

const VALID_PROFICIENCY = ["beginner", "intermediate", "advanced", "expert"];
const VALID_VERIFIED = ["verified", "pending", "unverified"];

// POST /api/skills — add a skill to the current user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, category, proficiency, verified, yearsOfExperience } = body;
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ ok: false, error: "Skill name is required." }, { status: 400 });
    }
    if (proficiency && !VALID_PROFICIENCY.includes(proficiency)) {
      return NextResponse.json({ ok: false, error: "Invalid proficiency level." }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    if (user.role !== "seeker") {
      return NextResponse.json({ ok: false, error: "Only job seekers can add skills." }, { status: 403 });
    }

    // Check for duplicate (case-insensitive)
    const existing = await db.skill.findMany({ where: { userId: user.id } });
    if (existing.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json({ ok: false, error: "You already have this skill." }, { status: 409 });
    }

    const skill = await db.skill.create({
      data: {
        userId: user.id,
        name: name.trim(),
        category: (category || "General").trim(),
        proficiency: proficiency || "intermediate",
        verified: verified || "unverified",
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : null,
        source: "manual",
      },
    });
    await db.auditLog.create({
      data: { userId: user.id, action: "Added skill", target: skill.name, type: "admin", status: "success" },
    });
    return NextResponse.json({ ok: true, skill });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// GET /api/skills — list current user's skills
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { skills: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, skills: user.skills });
}
