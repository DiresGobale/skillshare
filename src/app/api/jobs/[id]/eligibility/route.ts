import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/jobs/[id]/eligibility — check if the current seeker is eligible to apply
// Compares the applicant's CV/skills/education/experience against the job's requirements.
// Returns { eligible: boolean, reasons: string[], checks: { criteria, passed, detail }[] }
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "seeker") return NextResponse.json({ ok: false, error: "Seekers only" }, { status: 403 });

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      skills: true,
      experiences: true,
      educations: true,
      resumes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const job = await db.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });

  // Parse JSON fields from the job
  const parseArr = (s: string | null | undefined) => {
    if (!s) return [];
    try { return JSON.parse(s); } catch { return []; }
  };
  const requiredSkills: { name: string; mandatory?: boolean }[] = parseArr(job.requiredSkills);

  const checks: { criteria: string; passed: boolean; detail: string }[] = [];
  const reasons: string[] = [];

  // ===== CHECK 1: CV uploaded =====
  const hasCV = user.resumes.length > 0;
  checks.push({
    criteria: "CV uploaded",
    passed: hasCV,
    detail: hasCV ? "CV on file" : "No CV uploaded — upload your CV in Resume & AI Analysis",
  });
  if (!hasCV) reasons.push("You must upload your CV before applying.");

  // ===== CHECK 2: Field of study (mandatory) =====
  if (job.fieldOfStudy && job.fieldOfStudyMandatory) {
    const requiredField = job.fieldOfStudy.toLowerCase().trim();
    // Check if the applicant has any education with a matching field
    const matchingEdu = user.educations.find((e) =>
      e.field?.toLowerCase().includes(requiredField) || requiredField.includes(e.field?.toLowerCase() ?? "")
    );
    // Also check the CV analysis for education field
    let cvFieldMatch = false;
    if (user.resumes[0]) {
      try {
        const analysis = JSON.parse(user.resumes[0].analysis || "{}");
        cvFieldMatch = (analysis.education ?? []).some((e: any) =>
          e.field?.toLowerCase().includes(requiredField) || requiredField.includes(e.field?.toLowerCase() ?? "")
        );
      } catch { /* ignore */ }
    }
    const passed = !!matchingEdu || cvFieldMatch;
    checks.push({
      criteria: `Field of study: ${job.fieldOfStudy}`,
      passed,
      detail: passed
        ? "Your education matches the required field of study"
        : `This position requires a background in "${job.fieldOfStudy}". Your education field does not match this requirement.`,
    });
    if (!passed) {
      reasons.push(`Your field of study does not match the required field: "${job.fieldOfStudy}".`);
    }
  }

  // ===== CHECK 3: Minimum education level =====
  if (job.minEducationLevel && job.minEducationLevel !== "any") {
    const levelOrder: Record<string, number> = { "high-school": 1, diploma: 2, bachelor: 3, master: 4, phd: 5 };
    const requiredLevel = levelOrder[job.minEducationLevel] ?? 0;
    // Find the applicant's highest education level
    let applicantLevel = 0;
    for (const edu of user.educations) {
      const deg = (edu.degree || "").toLowerCase();
      if (deg.includes("phd") || deg.includes("doctor")) applicantLevel = Math.max(applicantLevel, 5);
      else if (deg.includes("master") || deg.includes("m.sc") || deg.includes("msc") || deg.includes("m.a")) applicantLevel = Math.max(applicantLevel, 4);
      else if (deg.includes("bachelor") || deg.includes("b.sc") || deg.includes("bsc") || deg.includes("b.a") || deg.includes("b.eng") || deg.includes("b.tech")) applicantLevel = Math.max(applicantLevel, 3);
      else if (deg.includes("diploma") || deg.includes("associate")) applicantLevel = Math.max(applicantLevel, 2);
      else if (deg.includes("high school") || deg.includes("secondary")) applicantLevel = Math.max(applicantLevel, 1);
    }
    // Also check CV analysis
    if (user.resumes[0]) {
      try {
        const analysis = JSON.parse(user.resumes[0].analysis || "{}");
        for (const edu of analysis.education ?? []) {
          const deg = (edu.degree || "").toLowerCase();
          if (deg.includes("phd") || deg.includes("doctor")) applicantLevel = Math.max(applicantLevel, 5);
          else if (deg.includes("master") || deg.includes("m.sc") || deg.includes("msc")) applicantLevel = Math.max(applicantLevel, 4);
          else if (deg.includes("bachelor") || deg.includes("b.sc") || deg.includes("bsc")) applicantLevel = Math.max(applicantLevel, 3);
          else if (deg.includes("diploma") || deg.includes("associate")) applicantLevel = Math.max(applicantLevel, 2);
          else if (deg.includes("high school") || deg.includes("secondary")) applicantLevel = Math.max(applicantLevel, 1);
        }
      } catch { /* ignore */ }
    }
    const passed = applicantLevel >= requiredLevel;
    const levelName = job.minEducationLevel.charAt(0).toUpperCase() + job.minEducationLevel.slice(1);
    checks.push({
      criteria: `Minimum education: ${levelName}`,
      passed,
      detail: passed
        ? "Your education level meets the minimum requirement"
        : `This position requires at least a ${levelName} level education.`,
    });
    if (!passed) {
      reasons.push(`Your education level does not meet the minimum requirement: ${levelName}.`);
    }
  }

  // ===== CHECK 4: Minimum years of experience =====
  if (job.minExperienceYears > 0) {
    // Calculate from experience entries or use the CV analysis yearsOfExperience
    let applicantYears = 0;
    if (user.resumes[0]) {
      try {
        const analysis = JSON.parse(user.resumes[0].analysis || "{}");
        applicantYears = analysis.yearsOfExperience ?? 0;
      } catch { /* ignore */ }
    }
    // If CV didn't give us years, estimate from experience entries
    if (applicantYears === 0 && user.experiences.length > 0) {
      // Rough estimate: count experience entries
      applicantYears = user.experiences.length * 2;
    }
    const passed = applicantYears >= job.minExperienceYears;
    checks.push({
      criteria: `Minimum experience: ${job.minExperienceYears} year(s)`,
      passed,
      detail: passed
        ? `You have ${applicantYears} years of experience (required: ${job.minExperienceYears})`
        : `You have ${applicantYears} years of experience, but this position requires at least ${job.minExperienceYears} year(s).`,
    });
    if (!passed) {
      reasons.push(`You need at least ${job.minExperienceYears} year(s) of experience. You have ${applicantYears}.`);
    }
  }

  // ===== CHECK 5: Mandatory required skills =====
  const mandatorySkills = requiredSkills.filter((s) => s.mandatory);
  if (mandatorySkills.length > 0) {
    // Collect all applicant skill names (from Skill table + CV analysis)
    const applicantSkillNames = new Set(
      user.skills.map((s) => s.name.toLowerCase())
    );
    // Add skills from CV analysis
    if (user.resumes[0]) {
      try {
        const analysis = JSON.parse(user.resumes[0].analysis || "{}");
        for (const s of analysis.skills ?? []) {
          applicantSkillNames.add(s.name.toLowerCase());
        }
      } catch { /* ignore */ }
    }
    // Check each mandatory skill
    const missingSkills: string[] = [];
    for (const ms of mandatorySkills) {
      // Check exact match or partial match
      const hasSkill = Array.from(applicantSkillNames).some((name) =>
        name === ms.name.toLowerCase() ||
        name.includes(ms.name.toLowerCase()) ||
        ms.name.toLowerCase().includes(name)
      );
      if (!hasSkill) missingSkills.push(ms.name);
    }
    const passed = missingSkills.length === 0;
    checks.push({
      criteria: `Mandatory skills (${mandatorySkills.length})`,
      passed,
      detail: passed
        ? "You have all the mandatory skills required for this position"
        : `You are missing the following mandatory skills: ${missingSkills.join(", ")}`,
    });
    if (!passed) {
      reasons.push(`You are missing mandatory skills: ${missingSkills.join(", ")}.`);
    }
  }

  const eligible = checks.every((c) => c.passed);

  return NextResponse.json({
    ok: true,
    eligible,
    reasons,
    checks,
    message: eligible
      ? "You are eligible to apply for this position."
      : "You are not eligible to apply for this position because your qualifications do not meet the required criteria.",
  });
}
