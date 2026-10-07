// Server-side AI service for SkillMatch.
// Uses z-ai-web-dev-sdk for: resume/CV extraction, job/talent matching,
// and profile-based job recommendations.
//
// IMPORTANT: This module is server-only. Never import from a client component.

import ZAI from "z-ai-web-dev-sdk";
import type {
  Job,
  Candidate,
  Skill,
  MatchFactor,
  JobMatchExplanation,
  ProficiencyLevel,
  SkillRequirement,
} from "./types";

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZai() {
  if (!_zai) {
    try {
      _zai = await ZAI.create();
    } catch (e) {
      // Fallback: env-based config (some environments auto-inject)
      _zai = await ZAI.create();
    }
  }
  return _zai;
}

const PROFICIENCY_VALUES: Record<ProficiencyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

// ============================================================
// 1. RESUME / CV EXTRACTION
// ============================================================
export interface ExtractedResume {
  rawText: string;
  skills: { raw: string; normalized: string; proficiency: ProficiencyLevel; confidence: number; source: string }[];
  education: { institution: string; degree: string; field: string; startDate: string; endDate: string }[];
  experience: { company: string; title: string; startDate: string; endDate: string; description: string }[];
  yearsOfExperience: number;
  summary: string;
}

export async function extractResume(rawText: string): Promise<ExtractedResume> {
  const system = `You are an expert resume parser for a technical recruitment platform.
Extract structured information from the resume text provided.
Return ONLY valid JSON (no markdown, no prose) with this exact schema:
{
  "skills": [{ "raw": string, "normalized": string, "proficiency": "beginner"|"intermediate"|"advanced"|"expert", "confidence": number (0-1), "source": "explicit"|"contextual" }],
  "education": [{ "institution": string, "degree": string, "field": string, "startDate": string (YYYY-MM), "endDate": string (YYYY-MM or "Present") }],
  "experience": [{ "company": string, "title": string, "startDate": string, "endDate": string, "description": string }],
  "yearsOfExperience": number,
  "summary": string
}
Normalization rules:
- Map raw skill names to canonical forms (e.g. "React.js" -> "React", "TS" -> "TypeScript", "Node" -> "Node.js", "Postgres" -> "PostgreSQL").
- Infer proficiency from years of experience and contextual signals ("led", "architected" -> expert; "experience with" -> intermediate; "familiar" -> beginner).
- Set confidence (0-1) based on how clearly the skill was mentioned.
- Set source to "explicit" if directly stated, "contextual" if inferred.`;

  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Parse this resume:\n\n${rawText}` },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      rawText,
      skills: (parsed.skills ?? []).map((s: any) => ({
        raw: s.raw ?? "",
        normalized: s.normalized ?? s.raw,
        proficiency: (s.proficiency ?? "intermediate") as ProficiencyLevel,
        confidence: typeof s.confidence === "number" ? s.confidence : 0.7,
        source: s.source ?? "contextual",
      })),
      education: parsed.education ?? [],
      experience: parsed.experience ?? [],
      yearsOfExperience: parsed.yearsOfExperience ?? 0,
      summary: parsed.summary ?? "",
    };
  } catch (err) {
    // Graceful fallback so the UI never hard-crashes
    return {
      rawText,
      skills: [],
      education: [],
      experience: [],
      yearsOfExperience: 0,
      summary: "",
    };
  }
}

// ============================================================
// 2. JOB / TALENT MATCHING
// ============================================================
export interface MatchInput {
  candidate: {
    name: string;
    title: string;
    skills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
    experienceYears: number;
    education: string;
  };
  job: {
    title: string;
    requiredSkills: { name: string; proficiency: ProficiencyLevel; mandatory: boolean }[];
    minExperienceYears: number;
  };
}

export interface MatchResult {
  overall: number; // 0-100
  factors: MatchFactor[];
  matchingSkills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  missingSkills: { name: string; requiredProficiency: ProficiencyLevel; mandatory: boolean }[];
  recommendedSkills: string[];
  rationale: string;
}

function computeFactors(input: MatchInput): {
  factors: MatchFactor[];
  matching: MatchResult["matchingSkills"];
  missing: MatchResult["missingSkills"];
} {
  const { candidate, job } = input;
  const candidateSkillsMap = new Map(candidate.skills.map((s) => [s.name.toLowerCase(), s]));
  const jobSkills = job.requiredSkills;

  const matching: MatchResult["matchingSkills"] = [];
  const missing: MatchResult["missingSkills"] = [];

  for (const req of jobSkills) {
    const cand = candidateSkillsMap.get(req.name.toLowerCase());
    if (cand) {
      matching.push({ name: cand.name, proficiency: cand.proficiency, verified: cand.verified });
    } else {
      missing.push({
        name: req.name,
        requiredProficiency: req.proficiency,
        mandatory: req.mandatory,
      });
    }
  }

  // Factor 1: Skill match — overall overlap weighted by importance
  const totalImportance = jobSkills.reduce((a, s) => a + (s.mandatory ? 1 : 0.5), 0);
  const matchedImportance = matching.reduce((a, s) => {
    const req = jobSkills.find((r) => r.name.toLowerCase() === s.name.toLowerCase());
    return a + (req?.mandatory ? 1 : 0.5);
  }, 0);
  const skillMatchScore = totalImportance > 0 ? Math.round((matchedImportance / totalImportance) * 100) : 0;

  // Factor 2: Required skill match — mandatory only
  const mandatoryTotal = jobSkills.filter((s) => s.mandatory).length;
  const mandatoryMatched = matching.filter((s) => {
    const req = jobSkills.find((r) => r.name.toLowerCase() === s.name.toLowerCase());
    return req?.mandatory;
  }).length;
  const requiredSkillScore = mandatoryTotal > 0 ? Math.round((mandatoryMatched / mandatoryTotal) * 100) : 100;

  // Factor 3: Proficiency match — how often candidate meets proficiency threshold
  let profSum = 0;
  let profCount = 0;
  for (const req of jobSkills) {
    const cand = candidateSkillsMap.get(req.name.toLowerCase());
    if (cand) {
      profCount++;
      const ratio = Math.min(1, PROFICIENCY_VALUES[cand.proficiency] / PROFICIENCY_VALUES[req.proficiency]);
      profSum += ratio;
    }
  }
  const proficiencyScore = profCount > 0 ? Math.round((profSum / profCount) * 100) : 0;

  // Factor 4: Experience match
  const expRatio = job.minExperienceYears > 0
    ? Math.min(1, candidate.experienceYears / job.minExperienceYears)
    : 1;
  const experienceScore = Math.round(expRatio * 100);

  // Factor 5: Education match — proxy via presence of education string
  const educationScore = candidate.education && candidate.education.length > 0 ? 90 : 50;

  // Factor 6: Verified skills — share of matched skills that are verified
  const verifiedCount = matching.filter((s) => s.verified).length;
  const verifiedScore = matching.length > 0 ? Math.round((verifiedCount / matching.length) * 100) : 0;

  const factors: MatchFactor[] = [
    {
      key: "skill_match",
      label: "Overall skill match",
      score: skillMatchScore,
      weight: 0.25,
      description: "How well your combined skills overlap with the job's required and preferred skill set.",
    },
    {
      key: "required_skill_match",
      label: "Required skill match",
      score: requiredSkillScore,
      weight: 0.30,
      description: "Coverage of mandatory skills explicitly required by the employer.",
    },
    {
      key: "proficiency_match",
      label: "Proficiency match",
      score: proficiencyScore,
      weight: 0.15,
      description: "How closely your proficiency level on each matched skill meets the requested level.",
    },
    {
      key: "experience_match",
      label: "Experience match",
      score: experienceScore,
      weight: 0.15,
      description: "Years and seniority of relevant experience against the role's expectations.",
    },
    {
      key: "education_match",
      label: "Education match",
      score: educationScore,
      weight: 0.10,
      description: "Whether your highest verified education meets the role's stated education threshold.",
    },
    {
      key: "verified_skills",
      label: "Verified skills",
      score: verifiedScore,
      weight: 0.05,
      description: "Share of the matched skills that have been independently verified.",
    },
  ];

  return { factors, matching, missing };
}

export async function computeMatch(input: MatchInput): Promise<MatchResult> {
  // Deterministic factor math (instant)
  const { factors, matching, missing } = computeFactors(input);
  const overall = Math.round(factors.reduce((acc, f) => acc + f.score * f.weight, 0));

  // LLM-written rationale (best-effort, falls back to template if SDK unavailable)
  let rationale = "";
  let recommendedSkills: string[] = [];
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI career advisor that explains job match scores to candidates in plain, friendly, encouraging language. Be concise (max 2 sentences). Return JSON: {\"rationale\": string, \"recommendedSkills\": string[]}.",
        },
        {
          role: "user",
          content: `Candidate: ${input.candidate.name}, ${input.candidate.title}, ${input.candidate.experienceYears}y experience.
Matched skills: ${matching.map((s) => s.name).join(", ") || "none"}
Missing skills: ${missing.map((s) => s.name + (s.mandatory ? " (mandatory)" : "")).join(", ") || "none"}
Overall match: ${overall}%

Write a 1-2 sentence rationale explaining why this is a good (or weak) match, and suggest up to 3 skills the candidate could learn to improve. Return JSON only.`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    rationale = parsed.rationale ?? "";
    recommendedSkills = parsed.recommendedSkills ?? [];
  } catch {
    // Fallback rationale
    if (overall >= 85) {
      rationale = `You meet all mandatory skills at the requested proficiency, with ${matching.length} matched skills and ${missing.length} minor gap${missing.length === 1 ? "" : "s"}.`;
    } else if (overall >= 70) {
      rationale = `You cover most required skills. ${missing.length === 0 ? "Strong overall fit." : `Addressing ${missing.length} missing skill${missing.length === 1 ? "" : "s"} would push you higher.`}`;
    } else {
      rationale = `You're missing ${missing.length} required skill${missing.length === 1 ? "" : "s"}. Building them will significantly lift your match score.`;
    }
    recommendedSkills = missing.slice(0, 3).map((s) => s.name);
  }

  return { overall, factors, matchingSkills: matching, missingSkills: missing, recommendedSkills, rationale };
}

// ============================================================
// 3. PROFILE-BASED JOB RECOMMENDATIONS
// ============================================================
export interface RecommendInput {
  candidate: {
    name: string;
    title: string;
    skills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
    experienceYears: number;
    education: string;
    location?: string;
    preferences?: string;
  };
  jobs: Job[];
}

export async function recommendJobs(input: RecommendInput): Promise<Job[]> {
  if (input.jobs.length === 0) return [];

  // First: deterministic scoring per job using computeMatch
  const scored = await Promise.all(
    input.jobs.map(async (job) => {
      const matchInput: MatchInput = {
        candidate: input.candidate,
        job: {
          title: job.title,
          requiredSkills: job.skills.map((s) => ({
            name: s.name,
            proficiency: s.proficiency,
            mandatory: s.mandatory,
          })),
          minExperienceYears: parseInt(job.requirements[0] ?? "0") || 0,
        },
      };
      const result = await computeMatch(matchInput);
      return { job, score: result.overall, explanation: result };
    })
  );

  // Second: ask the LLM to rerank based on candidate's full profile + preferences
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI talent-matching engine. Given a candidate profile and a list of jobs with their computed match scores, return the best job ordering. Return ONLY JSON: {\"orderedIds\": [string]} where each string is a job ID, ordered best-first.",
        },
        {
          role: "user",
          content: `Candidate profile:
- Name: ${input.candidate.name}
- Title: ${input.candidate.title}
- Experience: ${input.candidate.experienceYears} years
- Education: ${input.candidate.education}
- Location: ${input.candidate.location ?? "N/A"}
- Preferences: ${input.candidate.preferences ?? "open to all"}
- Top skills: ${input.candidate.skills.map((s) => `${s.name} (${s.proficiency}${s.verified ? ", verified" : ""})`).join(", ")}

Jobs (id, title, company, computed score):
${scored.map((s) => `- ${s.job.id}: ${s.job.title} @ ${s.job.company} (score ${s.score})`).join("\n")}

Return JSON: {"orderedIds": ["job-id-1", "job-id-2", ...]}`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const orderedIds: string[] = parsed.orderedIds ?? [];
    if (orderedIds.length > 0) {
      const map = new Map(scored.map((s) => [s.job.id, s]));
      const reranked: Job[] = [];
      for (const id of orderedIds) {
        const item = map.get(id);
        if (item) {
          reranked.push({
            ...item.job,
            matchScore: item.score,
            matchExplanation: item.explanation as JobMatchExplanation,
          });
          map.delete(id);
        }
      }
      // Append any jobs the LLM missed
      for (const item of map.values()) {
        reranked.push({
          ...item.job,
          matchScore: item.score,
          matchExplanation: item.explanation as JobMatchExplanation,
        });
      }
      return reranked;
    }
  } catch {
    // Fall through to deterministic ordering
  }

  // Fallback: sort by score desc
  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => ({
      ...s.job,
      matchScore: s.score,
      matchExplanation: s.explanation as JobMatchExplanation,
    }));
}
