import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import type { ProficiencyLevel } from "@/lib/types";

// POST /api/profile/save-extraction
// Persists AI-extracted skills (and optionally education/experience) to the
// logged-in user's profile in the database.
//
// Body: {
//   skills: [{ name, normalized, proficiency, source }],
//   education?: [{ institution, degree, field, startDate, endDate }],
//   experience?: [{ company, title, startDate, endDate, description }],
// }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    if (user.role !== "seeker") {
      return NextResponse.json({ ok: false, error: "Only job seekers can save extracted profile data." }, { status: 403 });
    }

    const body = await req.json();
    const skills = body.skills ?? [];
    const education = body.education ?? [];
    const experience = body.experience ?? [];

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ ok: false, error: "No skills to save." }, { status: 400 });
    }

    const validProficiency: ProficiencyLevel[] = ["beginner", "intermediate", "advanced", "expert"];

    // Use a transaction so partial failures don't leave the DB in a weird state
    const result = await db.$transaction(async (tx) => {
      let skillsSaved = 0;
      let skillsSkipped = 0;

      // Skills: upsert by (userId, name) — skip if already exists
      for (const s of skills) {
        const name = (s.normalized || s.name || "").trim();
        if (!name) continue;
        const proficiency = validProficiency.includes(s.proficiency) ? s.proficiency : "intermediate";
        // SQLite doesn't support mode: "insensitive" — fetch all and filter in JS
        const existingSkills = await tx.skill.findMany({ where: { userId: user.id } });
        const existing = existingSkills.find((es) => es.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          skillsSkipped++;
          continue;
        }
        await tx.skill.create({
          data: {
            userId: user.id,
            name,
            category: "AI Extracted",
            proficiency,
            verified: "pending",
            source: "ai_extraction",
          },
        });
        skillsSaved++;
      }

      // Education: create new entries (skip if institution+field already exists)
      let educationSaved = 0;
      for (const e of education) {
        if (!e.institution || !e.field) continue;
        const existing = await tx.education.findFirst({
          where: { userId: user.id, institution: e.institution, field: e.field },
        });
        if (existing) continue;
        await tx.education.create({
          data: {
            userId: user.id,
            institution: e.institution,
            degree: e.degree ?? "",
            field: e.field,
            startDate: e.startDate ?? "",
            endDate: e.endDate ?? "",
            verified: false,
          },
        });
        educationSaved++;
      }

      // Experience: create new entries (skip if company+title already exists)
      let experienceSaved = 0;
      for (const e of experience) {
        if (!e.company || !e.title) continue;
        const existing = await tx.experience.findFirst({
          where: { userId: user.id, company: e.company, title: e.title },
        });
        if (existing) continue;
        await tx.experience.create({
          data: {
            userId: user.id,
            company: e.company,
            title: e.title,
            startDate: e.startDate ?? "",
            endDate: e.endDate ?? "",
            description: e.description ?? "",
            current: (e.endDate ?? "").toLowerCase() === "present",
          },
        });
        experienceSaved++;
      }

      // Audit
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "Saved AI extraction to profile",
          target: `${skillsSaved} skills, ${educationSaved} education, ${experienceSaved} experience`,
          type: "ai",
          status: "success",
        },
      });

      return { skillsSaved, skillsSkipped, educationSaved, experienceSaved };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed." },
      { status: 500 }
    );
  }
}
