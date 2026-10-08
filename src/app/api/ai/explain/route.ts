import { NextRequest, NextResponse } from "next/server";
import { computeMatch, explainMatch } from "@/lib/ai-service";
import type { ProficiencyLevel } from "@/lib/types";

// POST /api/ai/explain — explain why a match score was computed
// Body: MatchInput (same as /api/ai/match)
// Returns: detailed explanation with score breakdown, semantic insights, recommendations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate, job } = body;

    if (!candidate || !job) {
      return NextResponse.json({ ok: false, error: "Candidate and job are required." }, { status: 400 });
    }

    // Compute the match
    const matchResult = await computeMatch({
      candidate: {
        name: candidate.name ?? "Candidate",
        title: candidate.title ?? "",
        skills: (candidate.skills ?? []).map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency as ProficiencyLevel,
          verified: s.verified ?? false,
        })),
        experienceYears: candidate.experienceYears ?? 0,
        education: candidate.education ?? "",
      },
      job: {
        title: job.title ?? "",
        requiredSkills: (job.requiredSkills ?? []).map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency as ProficiencyLevel,
          mandatory: s.mandatory ?? false,
        })),
        minExperienceYears: job.minExperienceYears ?? 0,
      },
    });

    // Generate the explanation
    const explanation = explainMatch(matchResult);

    return NextResponse.json({ ok: true, matchResult, explanation });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Explanation failed" },
      { status: 500 }
    );
  }
}
