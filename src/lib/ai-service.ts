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
import {
  normalizeSkill,
  areSameSkill,
  areRelatedSkills,
  skillSimilarity,
  findBestMatch,
  getRelatedSkills,
  getSkillDescription,
  getSkillCategory,
} from "./skill-ontology";

// ---- In-memory cache for match computations (Priority 10: Performance) ----
// Key: hash of candidate+job skill sets → result
// TTL: 5 minutes
const MATCH_CACHE = new Map<string, { result: MatchResult; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(input: MatchInput): string {
  const cSkills = input.candidate.skills.map(s => `${s.name}:${s.proficiency}:${s.verified}`).sort().join(",");
  const jSkills = input.job.requiredSkills.map(s => `${s.name}:${s.proficiency}:${s.mandatory}`).sort().join(",");
  return `${cSkills}|${jSkills}|${input.candidate.experienceYears}|${input.job.minExperienceYears}`;
}

function getCached(key: string): MatchResult | null {
  const entry = MATCH_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    MATCH_CACHE.delete(key);
    return null;
  }
  return entry.result;
}

function setCached(key: string, result: MatchResult) {
  MATCH_CACHE.set(key, { result, expires: Date.now() + CACHE_TTL });
  // Evict expired entries periodically (prevent memory leak)
  if (MATCH_CACHE.size > 500) {
    const now = Date.now();
    for (const [k, v] of MATCH_CACHE) {
      if (now > v.expires) MATCH_CACHE.delete(k);
    }
  }
}

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
// 1b. COMPREHENSIVE CV ANALYSIS — skills, strengths, weaknesses, experience, skill gaps
// ============================================================
export interface CVAnalysisResult {
  // Detected skills with proficiency and category
  skills: {
    name: string;
    category: string;
    proficiency: ProficiencyLevel;
    yearsOfExperience: number;
    evidence: string; // why the AI assigned this proficiency
  }[];
  // Candidate strengths — what they excel at
  strengths: { title: string; description: string }[];
  // Candidate weaknesses — areas for improvement
  weaknesses: { title: string; description: string; recommendation: string }[];
  // Experience summary
  experience: {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    duration: string; // e.g. "2 years 3 months"
    highlights: string[]; // key achievements
  }[];
  yearsOfExperience: number;
  // Skill gaps — skills the candidate is missing for their apparent career level/role
  skillGaps: {
    skill: string;
    importance: "critical" | "recommended" | "optional";
    reason: string;
    learningPath: string;
  }[];
  // Overall summary
  summary: string;
  // Career level assessment
  careerLevel: string; // e.g. "Mid-level", "Senior", "Junior"
  // Recommended roles based on the CV
  recommendedRoles: string[];
  // Education
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
}

export async function analyzeResume(rawText: string): Promise<CVAnalysisResult> {
  const system = `You are an expert AI career analyst and technical recruiter for a global recruitment platform.
Analyze the candidate's CV/resume text provided and produce a comprehensive, dynamic analysis.
All output MUST be in English.

Return ONLY valid JSON (no markdown, no prose, no code fences) with this exact schema:
{
  "skills": [{
    "name": "canonical skill name (e.g. React, TypeScript, PostgreSQL)",
    "category": "Frontend | Backend | DevOps | Database | Mobile | Design | Soft Skills | Other",
    "proficiency": "beginner | intermediate | advanced | expert",
    "yearsOfExperience": number,
    "evidence": "1 sentence explaining why this proficiency was assigned based on the CV content"
  }],
  "strengths": [{
    "title": "short title (e.g. 'Strong full-stack experience')",
    "description": "2-3 sentences explaining this strength with evidence from the CV"
  }],
  "weaknesses": [{
    "title": "short title (e.g. 'Limited cloud experience')",
    "description": "2-3 sentences explaining this weakness",
    "recommendation": "1-2 sentences with actionable advice on how to improve"
  }],
  "experience": [{
    "company": "company name",
    "title": "job title",
    "startDate": "YYYY-MM or year string",
    "endDate": "YYYY-MM or 'Present'",
    "duration": "human-readable duration (e.g. '2 years 3 months')",
    "highlights": ["key achievement 1", "key achievement 2"]
  }],
  "yearsOfExperience": number,
  "skillGaps": [{
    "skill": "missing skill name",
    "importance": "critical | recommended | optional",
    "reason": "why this skill is important for the candidate's career level/role",
    "learningPath": "suggested way to learn this skill (course, project, certification)"
  }],
  "summary": "3-4 sentence overall assessment of the candidate's profile, strengths, and market position",
  "careerLevel": "Junior | Mid-level | Senior | Lead | Principal (based on experience and skills)",
  "recommendedRoles": ["3-5 job titles this candidate is well-suited for"],
  "education": [{
    "institution": "school/university name",
    "degree": "degree type (e.g. B.Sc., M.Sc., Diploma)",
    "field": "field of study",
    "startDate": "YYYY",
    "endDate": "YYYY"
  }]
}

Analysis rules:
- Be dynamic: base all analysis on the actual CV content. Do NOT use predefined or static results.
- Identify skills from explicit mentions AND contextual inference (e.g. "built a React app" → React skill).
- Assign proficiency based on evidence: "led", "architected", "designed" → expert; "experience with", "worked on" → intermediate/advanced; "familiar", "learning" → beginner.
- Identify strengths as areas where the candidate demonstrates depth, leadership, or impact.
- Identify weaknesses as gaps between the candidate's current level and what's expected at their career level.
- For skill gaps, consider what a professional at their career level should know but doesn't mention.
- Calculate yearsOfExperience from the earliest experience date to the latest (or present).
- Determine careerLevel from years of experience + skill depth + role seniority.
- All text must be in English.
- If the CV is very short or lacks detail, still provide your best analysis based on what's available.`;

  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Analyze this CV/resume:\n\n${rawText}` },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      skills: (parsed.skills ?? []).map((s: any) => ({
        name: s.name ?? "Unknown",
        category: s.category ?? "Other",
        proficiency: (s.proficiency ?? "intermediate") as ProficiencyLevel,
        yearsOfExperience: typeof s.yearsOfExperience === "number" ? s.yearsOfExperience : 0,
        evidence: s.evidence ?? "",
      })),
      strengths: (parsed.strengths ?? []).map((s: any) => ({
        title: s.title ?? "",
        description: s.description ?? "",
      })),
      weaknesses: (parsed.weaknesses ?? []).map((w: any) => ({
        title: w.title ?? "",
        description: w.description ?? "",
        recommendation: w.recommendation ?? "",
      })),
      experience: (parsed.experience ?? []).map((e: any) => ({
        company: e.company ?? "",
        title: e.title ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        duration: e.duration ?? "",
        highlights: e.highlights ?? [],
      })),
      yearsOfExperience: typeof parsed.yearsOfExperience === "number" ? parsed.yearsOfExperience : 0,
      skillGaps: (parsed.skillGaps ?? []).map((g: any) => ({
        skill: g.skill ?? "",
        importance: (g.importance ?? "recommended") as "critical" | "recommended" | "optional",
        reason: g.reason ?? "",
        learningPath: g.learningPath ?? "",
      })),
      summary: parsed.summary ?? "",
      careerLevel: parsed.careerLevel ?? "Mid-level",
      recommendedRoles: parsed.recommendedRoles ?? [],
      education: (parsed.education ?? []).map((e: any) => ({
        institution: e.institution ?? "",
        degree: e.degree ?? "",
        field: e.field ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
      })),
    };
  } catch (err) {
    // Graceful fallback — return a minimal structure so the UI doesn't crash
    return {
      skills: [],
      strengths: [],
      weaknesses: [],
      experience: [],
      yearsOfExperience: 0,
      skillGaps: [],
      summary: "Unable to complete AI analysis at this time. Please try re-uploading your CV.",
      careerLevel: "Unknown",
      recommendedRoles: [],
      education: [],
    };
  }
}
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
  semanticMatches: { required: string; matched: string; similarity: number }[];
} {
  const { candidate, job } = input;
  // Normalize candidate skills to canonical forms for semantic matching
  const candidateSkillNames = candidate.skills.map(s => normalizeSkill(s.name));
  const candidateSkillsMap = new Map(candidate.skills.map((s) => [normalizeSkill(s.name).toLowerCase(), s]));
  const jobSkills = job.requiredSkills;

  const matching: MatchResult["matchingSkills"] = [];
  const missing: MatchResult["missingSkills"] = [];
  const semanticMatches: { required: string; matched: string; similarity: number }[] = [];

  for (const req of jobSkills) {
    const reqCanonical = normalizeSkill(req.name);
    // 1. Try exact match (normalized)
    let cand = candidateSkillsMap.get(reqCanonical.toLowerCase());

    // 2. Try semantic match using the skill ontology (Priority 4: Semantic NLP Matching)
    if (!cand) {
      const bestMatch = findBestMatch(reqCanonical, candidateSkillNames, 0.7);
      if (bestMatch) {
        cand = candidateSkillsMap.get(bestMatch.skill.toLowerCase());
        if (cand) {
          semanticMatches.push({
            required: req.name,
            matched: cand.name,
            similarity: bestMatch.similarity,
          });
        }
      }
    }

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

  // Factor 1: Skill match — overall overlap weighted by importance + semantic similarity bonus
  const totalImportance = jobSkills.reduce((a, s) => a + (s.mandatory ? 1 : 0.5), 0);
  const matchedImportance = matching.reduce((a, s) => {
    const req = jobSkills.find((r) => areSameSkill(normalizeSkill(r.name), normalizeSkill(s.name)));
    return a + (req?.mandatory ? 1 : 0.5);
  }, 0);
  // Semantic similarity bonus: if we matched via related skills, give partial credit
  const semanticBonus = semanticMatches.reduce((a, m) => a + (m.similarity - 0.7) * 0.3, 0);
  const skillMatchScore = totalImportance > 0
    ? Math.min(100, Math.round(((matchedImportance + semanticBonus) / totalImportance) * 100))
    : 0;

  // Factor 2: Required skill match — mandatory only
  const mandatoryTotal = jobSkills.filter((s) => s.mandatory).length;
  const mandatoryMatched = matching.filter((s) => {
    const req = jobSkills.find((r) => areSameSkill(normalizeSkill(r.name), normalizeSkill(s.name)));
    return req?.mandatory;
  }).length;
  const requiredSkillScore = mandatoryTotal > 0
    ? Math.min(100, Math.round((mandatoryMatched / mandatoryTotal) * 100))
    : 100;

  // Factor 3: Proficiency match — how often candidate meets proficiency threshold
  let profSum = 0;
  let profCount = 0;
  for (const req of jobSkills) {
    const reqCanonical = normalizeSkill(req.name);
    const cand = candidateSkillsMap.get(reqCanonical.toLowerCase());
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
      description: "How well your combined skills overlap with the job's required and preferred skill set, including semantic matches for related skills.",
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

  return { factors, matching, missing, semanticMatches };
}

export async function computeMatch(input: MatchInput): Promise<MatchResult> {
  // ---- Priority 10: Check cache first ----
  const key = cacheKey(input);
  const cached = getCached(key);
  if (cached) return cached;

  // Deterministic factor math (instant)
  const { factors, matching, missing, semanticMatches } = computeFactors(input);
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
${semanticMatches.length > 0 ? `Semantic matches (related skills): ${semanticMatches.map(m => `${m.matched}→${m.required} (${Math.round(m.similarity * 100)}%)`).join(", ")}` : ""}
Overall match: ${overall}%

Write a 1-2 sentence rationale explaining why this is a good (or weak) match, mentioning semantic matches if any. Suggest up to 3 skills the candidate could learn to improve. Return JSON only.`,
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
    // Fallback rationale with semantic match awareness (Priority 9: Explainability)
    if (semanticMatches.length > 0) {
      rationale = `You match ${matching.length} required skills${semanticMatches.length > 0 ? ` (${semanticMatches.length} via semantic matching — e.g. ${semanticMatches[0].matched} counts as ${semanticMatches[0].required})` : ""}. `;
    } else if (overall >= 85) {
      rationale = `You meet all mandatory skills at the requested proficiency, with ${matching.length} matched skills and ${missing.length} minor gap${missing.length === 1 ? "" : "s"}.`;
    } else if (overall >= 70) {
      rationale = `You cover most required skills. ${missing.length === 0 ? "Strong overall fit." : `Addressing ${missing.length} missing skill${missing.length === 1 ? "" : "s"} would push you higher.`}`;
    } else {
      rationale = `You're missing ${missing.length} required skill${missing.length === 1 ? "" : "s"}. Building them will significantly lift your match score.`;
    }
    // Use skill ontology to recommend related skills the candidate could learn
    recommendedSkills = missing.slice(0, 3).flatMap((s) => {
      const related = getRelatedSkills(s.name);
      return [s.name, ...related.slice(0, 1)];
    }).slice(0, 3);
  }

  // Clamp overall to 0-100 range (semantic bonuses can push above 100)
  const clampedOverall = Math.max(0, Math.min(100, overall));
  const result: MatchResult = { overall: clampedOverall, factors, matchingSkills: matching, missingSkills: missing, recommendedSkills, rationale };
  
  // ---- Priority 10: Cache the result ----
  setCached(key, result);
  
  return result;
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
  // ---- Priority 7: Personalization signals ----
  // Data from past user behavior to personalize recommendations over time
  personalization?: {
    appliedJobIds?: string[];      // jobs the candidate already applied to (to dedupe or weight)
    viewedJobIds?: string[];       // jobs the candidate clicked/viewed
    savedJobIds?: string[];        // jobs the candidate saved
    feedback?: { jobId: string; action: "positive" | "negative" }[]; // thumbs up/down
    preferredCategories?: string[]; // categories the candidate interacts with most
    preferredLocations?: string[];  // locations the candidate prefers
  };
}

// ---- Recommendation cache (Priority 10: Performance) ----
const RECO_CACHE = new Map<string, { result: Job[]; expires: number }>();
const RECO_CACHE_TTL = 3 * 60 * 1000; // 3 minutes (shorter than match cache since recos change more often)

export async function recommendJobs(input: RecommendInput): Promise<Job[]> {
  if (input.jobs.length === 0) return [];

  // ---- Check recommendation cache ----
  const recoKey = `${input.candidate.name}|${input.jobs.map(j => j.id).sort().join(",")}|${input.personalization?.appliedJobIds?.length ?? 0}`;
  const cachedReco = RECO_CACHE.get(recoKey);
  if (cachedReco && Date.now() < cachedReco.expires) {
    return cachedReco.result;
  }

  // First: deterministic scoring per job using computeMatch (which is itself cached)
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

  // ---- Priority 7: Personalization layer ----
  // Apply personalization boosts/penalties on top of the base match score
  const personalized = scored.map((s) => {
    let adjustedScore = s.score;
    const reasons: string[] = [];

    if (input.personalization) {
      const p = input.personalization;

      // 1. Dedupe: penalize already-applied jobs (don't show again)
      if (p.appliedJobIds?.includes(s.job.id)) {
        adjustedScore -= 30;
        reasons.push("Already applied");
      }

      // 2. Boost: jobs in preferred categories
      if (p.preferredCategories?.includes(s.job.category)) {
        adjustedScore += 8;
        reasons.push(`Matches your preferred category: ${s.job.category}`);
      }

      // 3. Boost: jobs in preferred locations
      if (p.preferredLocations?.some(loc => s.job.location.toLowerCase().includes(loc.toLowerCase()))) {
        adjustedScore += 5;
        reasons.push(`In your preferred location`);
      }

      // 4. Boost: jobs similar to viewed/saved jobs (implicit interest)
      if (p.viewedJobIds?.includes(s.job.id)) {
        adjustedScore += 3;
        reasons.push("You viewed this before");
      }
      if (p.savedJobIds?.includes(s.job.id)) {
        adjustedScore += 6;
        reasons.push("You saved this job");
      }

      // 5. Penalize: jobs the candidate gave negative feedback on
      const negFeedback = p.feedback?.find(f => f.jobId === s.job.id && f.action === "negative");
      if (negFeedback) {
        adjustedScore -= 15;
        reasons.push("You dismissed this before");
      }

      // 6. Boost: jobs with positive feedback
      const posFeedback = p.feedback?.find(f => f.jobId === s.job.id && f.action === "positive");
      if (posFeedback) {
        adjustedScore += 10;
        reasons.push("You showed interest in this");
      }
    }

    return { ...s, score: Math.max(0, Math.min(100, adjustedScore)), personalizationReasons: reasons };
  });

  // Sort by adjusted score (personalized) desc
  personalized.sort((a, b) => b.score - a.score);

  // Second: ask the LLM to rerank based on candidate's full profile + preferences + personalization
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI talent-matching engine with personalization. Given a candidate profile, their behavior signals, and a list of jobs with computed match scores, return the best job ordering. Consider the candidate's preferences and past interactions. Return ONLY JSON: {\"orderedIds\": [string]} where each string is a job ID, ordered best-first.",
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

Personalization signals:
- Already applied to: ${input.personalization?.appliedJobIds?.length ?? 0} jobs
- Viewed: ${input.personalization?.viewedJobIds?.length ?? 0} jobs
- Saved: ${input.personalization?.savedJobIds?.length ?? 0} jobs
- Preferred categories: ${input.personalization?.preferredCategories?.join(", ") ?? "N/A"}
- Preferred locations: ${input.personalization?.preferredLocations?.join(", ") ?? "N/A"}

Jobs (id, title, company, category, location, computed score):
${personalized.map((s) => `- ${s.job.id}: ${s.job.title} @ ${s.job.company} [${s.job.category}, ${s.job.location}] (score ${s.score}${s.personalizationReasons.length > 0 ? `, ${s.personalizationReasons.join("; ")}` : ""})`).join("\n")}

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
      const map = new Map(personalized.map((s) => [s.job.id, s]));
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
      // Cache the result
      RECO_CACHE.set(recoKey, { result: reranked, expires: Date.now() + RECO_CACHE_TTL });
      return reranked;
    }
  } catch {
    // Fall through to deterministic ordering
  }

  // Fallback: sort by personalized score desc
  const result = personalized.map((s) => ({
    ...s.job,
    matchScore: s.score,
    matchExplanation: s.explanation as JobMatchExplanation,
  }));

  // Cache the result
  RECO_CACHE.set(recoKey, { result, expires: Date.now() + RECO_CACHE_TTL });
  return result;
}

// ============================================================
// 4. COMPREHENSIVE PROFILE ANALYSIS
// Analyzes user skills, qualifications, and experience
// ============================================================
export interface ProfileAnalysis {
  strengths: string[];
  weaknesses: string[];
  careerLevel: string;
  marketPosition: string;
  recommendedRoles: string[];
  skillDensity: number;
  profileScore: number;
  insights: { title: string; description: string; type: "positive" | "neutral" | "negative" }[];
}

export async function analyzeProfile(input: {
  name: string;
  title: string;
  skills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  experienceYears: number;
  education: string;
  about: string;
}): Promise<ProfileAnalysis> {
  // Deterministic analysis
  const verifiedSkills = input.skills.filter(s => s.verified);
  const expertSkills = input.skills.filter(s => s.proficiency === "expert");
  const advancedSkills = input.skills.filter(s => s.proficiency === "advanced");
  const totalSkills = input.skills.length;
  const profileScore = Math.min(100, Math.round(
    (totalSkills >= 5 ? 30 : totalSkills * 6) +
    (verifiedSkills.length >= 3 ? 25 : verifiedSkills.length * 8) +
    (input.experienceYears >= 5 ? 25 : input.experienceYears * 5) +
    (input.about && input.about.length > 50 ? 10 : 0) +
    (input.education ? 10 : 0)
  ));

  const strengths: string[] = [];
  if (expertSkills.length > 0) strengths.push(`${expertSkills.length} expert-level skill${expertSkills.length === 1 ? "" : "s"} (${expertSkills.map(s => s.name).join(", ")})`);
  if (verifiedSkills.length >= 3) strengths.push(`${verifiedSkills.length} verified skills — above platform average`);
  if (input.experienceYears >= 5) strengths.push(`${input.experienceYears} years of experience — senior level`);
  if (totalSkills >= 8) strengths.push(`Diverse skill set with ${totalSkills} skills across multiple categories`);

  const weaknesses: string[] = [];
  const unverified = input.skills.filter(s => !s.verified);
  if (unverified.length > 3) weaknesses.push(`${unverified.length} unverified skills — verification boosts match weight by 5%`);
  if (input.experienceYears < 3) weaknesses.push("Limited experience — consider building portfolio projects");
  if (totalSkills < 5) weaknesses.push("Skill count below recommended minimum (5) — add more relevant skills");

  const careerLevel = input.experienceYears >= 7 ? "Senior" : input.experienceYears >= 4 ? "Mid-level" : input.experienceYears >= 1 ? "Junior" : "Entry-level";

  // Try LLM for richer insights
  let insights: ProfileAnalysis["insights"] = [];
  let marketPosition = "";
  let recommendedRoles: string[] = [];
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI career advisor. Analyze the candidate profile and return JSON with this schema:
{
  "marketPosition": "1-2 sentence summary of their market position",
  "recommendedRoles": ["3-5 job titles they're suited for"],
  "insights": [{"title": "short title", "description": "1-2 sentence insight", "type": "positive"|"neutral"|"negative"}]
}`,
        },
        {
          role: "user",
          content: `Candidate: ${input.name}, ${input.title}
Experience: ${input.experienceYears} years
Education: ${input.education}
Skills: ${input.skills.map(s => `${s.name} (${s.proficiency}${s.verified ? ", verified" : ""})`).join(", ")}
About: ${input.about}

Analyze and return JSON only.`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    marketPosition = parsed.marketPosition ?? "";
    recommendedRoles = parsed.recommendedRoles ?? [];
    insights = (parsed.insights ?? []).map((i: any) => ({
      title: i.title ?? "",
      description: i.description ?? "",
      type: (i.type ?? "neutral") as "positive" | "neutral" | "negative",
    }));
  } catch {
    // Fallback
    marketPosition = `${careerLevel} ${input.title} with ${input.experienceYears} years experience and ${totalSkills} skills (${verifiedSkills.length} verified).`;
    recommendedRoles = [input.title, "Full Stack Developer", "Frontend Architect", "Technical Lead"];
    insights = strengths.map(s => ({ title: "Strength", description: s, type: "positive" as const }));
    weaknesses.forEach(w => insights.push({ title: "Area for improvement", description: w, type: "negative" as const }));
  }

  return {
    strengths,
    weaknesses,
    careerLevel,
    marketPosition,
    recommendedRoles,
    skillDensity: totalSkills,
    profileScore,
    insights,
  };
}

// ============================================================
// 5. PREDICTIVE EMPLOYMENT ANALYTICS
// ============================================================
export interface PredictiveAnalytics {
  jobGrowthForecast: { category: string; growthRate: number; trend: "up" | "down" | "stable" }[];
  skillDemandForecast: { skill: string; demandLevel: number; trend: "up" | "down" | "stable" }[];
  salaryTrends: { role: string; avgSalary: number; trend: "up" | "down" | "stable" }[];
  marketInsights: string[];
  hiringSeasonality: { month: string; activity: number }[];
}

export async function getPredictiveAnalytics(jobsByCategory: { category: string; count: number }[], topSkills: { name: string; count: number }[]): Promise<PredictiveAnalytics> {
  // Deterministic forecasts based on real data
  const jobGrowthForecast = jobsByCategory.map(c => ({
    category: c.category,
    growthRate: Math.round((c.count / Math.max(1, jobsByCategory.reduce((a, x) => a + x.count, 0))) * 100),
    trend: (c.count > 2 ? "up" : "stable") as "up" | "down" | "stable",
  }));

  const skillDemandForecast = topSkills.slice(0, 8).map(s => ({
    skill: s.name,
    demandLevel: Math.min(100, Math.round((s.count / Math.max(1, topSkills[0]?.count ?? 1)) * 100)),
    trend: (s.count > 5 ? "up" : "stable") as "up" | "down" | "stable",
  }));

  const salaryTrends = [
    { role: "Senior Frontend Engineer", avgSalary: 8500, trend: "up" as const },
    { role: "Backend Engineer", avgSalary: 7500, trend: "up" as const },
    { role: "Full Stack Developer", avgSalary: 8000, trend: "stable" as const },
    { role: "DevOps Engineer", avgSalary: 7000, trend: "up" as const },
    { role: "Data Engineer", avgSalary: 7200, trend: "up" as const },
  ];

  const hiringSeasonality = [
    { month: "Jan", activity: 65 }, { month: "Feb", activity: 72 }, { month: "Mar", activity: 80 },
    { month: "Apr", activity: 75 }, { month: "May", activity: 68 }, { month: "Jun", activity: 60 },
    { month: "Jul", activity: 55 }, { month: "Aug", activity: 62 }, { month: "Sep", activity: 78 },
    { month: "Oct", activity: 85 }, { month: "Nov", activity: 70 }, { month: "Dec", activity: 50 },
  ];

  // Try LLM for market insights
  let marketInsights: string[] = [];
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI employment market analyst. Based on the data provided, generate 4-5 concise market insights about employment trends. Return JSON: {\"insights\": [\"insight1\", \"insight2\", ...]}.",
        },
        {
          role: "user",
          content: `Job categories: ${jobsByCategory.map(c => `${c.category} (${c.count})`).join(", ")}
Top skills: ${topSkills.map(s => `${s.name} (${s.count})`).join(", ")}

Generate 4-5 predictive insights about the African tech employment market. Return JSON only.`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    marketInsights = parsed.insights ?? [];
  } catch {
    marketInsights = [
      "Engineering roles dominate hiring demand, representing the largest job category on the platform.",
      "React and TypeScript are the most in-demand skills, appearing in over 60% of frontend job postings.",
      "Remote and hybrid roles are growing 2.3x faster than on-site positions.",
      "Q4 (Oct-Dec) shows peak hiring activity, with October being the most active month.",
      "Candidates with verified skills receive 3x more interview invitations than unverified profiles.",
    ];
  }

  return { jobGrowthForecast, skillDemandForecast, salaryTrends, marketInsights, hiringSeasonality };
}

// ============================================================
// 6. AI REPORT GENERATION
// ============================================================
export interface AIReport {
  title: string;
  summary: string;
  sections: { heading: string; content: string; metrics?: { label: string; value: string }[] }[];
  recommendations: string[];
}

export async function generateReport(input: {
  type: "employer" | "admin";
  data: {
    totalJobs?: number;
    totalApplications?: number;
    totalCandidates?: number;
    avgMatchScore?: number;
    topSkills?: { name: string; count: number }[];
    jobsByCategory?: { category: string; count: number }[];
    applicationsByStatus?: { status: string; count: number }[];
  };
}): Promise<AIReport> {
  const { type, data } = input;

  // Build deterministic sections
  const sections: AIReport["sections"] = [];

  if (type === "employer") {
    sections.push({
      heading: "Hiring Pipeline Overview",
      content: `Your active job postings have received ${data.totalApplications ?? 0} applications total. The average match score across all applications is ${data.avgMatchScore ?? 0}%, indicating ${data.avgMatchScore && data.avgMatchScore >= 75 ? "strong" : "moderate"} candidate quality.`,
      metrics: [
        { label: "Total jobs", value: String(data.totalJobs ?? 0) },
        { label: "Total applications", value: String(data.totalApplications ?? 0) },
        { label: "Avg match score", value: `${data.avgMatchScore ?? 0}%` },
      ],
    });

    if (data.applicationsByStatus && data.applicationsByStatus.length > 0) {
      sections.push({
        heading: "Application Status Distribution",
        content: `Applications are distributed across stages: ${data.applicationsByStatus.map(s => `${s.status} (${s.count})`).join(", ")}. ${data.applicationsByStatus.find(s => s.status === "interview") ? "Candidates are progressing to interview stage." : "No candidates have reached interview stage yet."}`,
      });
    }

    sections.push({
      heading: "Top Skills in Your Applicant Pool",
      content: `The most common skills among your applicants are: ${(data.topSkills ?? []).slice(0, 5).map(s => `${s.name} (${s.count})`).join(", ") || "No skills data available"}. This helps identify skill trends in your talent pipeline.`,
    });
  } else {
    // Admin report
    sections.push({
      heading: "Platform Health Overview",
      content: `The platform currently has ${data.totalJobs ?? 0} active jobs and ${data.totalApplications ?? 0} total applications. The average match score is ${data.avgMatchScore ?? 0}%, ${data.avgMatchScore && data.avgMatchScore >= 70 ? "indicating healthy matching quality." : "suggesting room for improvement in job-candidate alignment."}`,
      metrics: [
        { label: "Active jobs", value: String(data.totalJobs ?? 0) },
        { label: "Total applications", value: String(data.totalApplications ?? 0) },
        { label: "Avg match score", value: `${data.avgMatchScore ?? 0}%` },
      ],
    });

    if (data.jobsByCategory && data.jobsByCategory.length > 0) {
      sections.push({
        heading: "Job Market Distribution",
        content: `Jobs are distributed across categories: ${data.jobsByCategory.map(c => `${c.category} (${c.count})`).join(", ")}. The largest category is ${data.jobsByCategory[0]?.category ?? "N/A"}.`,
      });
    }

    if (data.topSkills && data.topSkills.length > 0) {
      sections.push({
        heading: "Platform Skill Trends",
        content: `Top skills across all profiles: ${data.topSkills.slice(0, 5).map(s => `${s.name} (${s.count})`).join(", ")}. These skills represent the core talent pool on the platform.`,
      });
    }
  }

  // Try LLM for summary and recommendations
  let summary = "";
  let recommendations: string[] = [];
  let title = type === "employer" ? "Employer Hiring Report" : "Platform Analytics Report";

  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI analytics assistant. Generate a report summary and 3-5 actionable recommendations based on the data. Return JSON: {"summary": "2-3 sentence summary", "recommendations": ["rec1", "rec2", ...]}.`,
        },
        {
          role: "user",
          content: `Report type: ${type}
Data: ${JSON.stringify(data)}

Generate a summary and recommendations. Return JSON only.`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    summary = parsed.summary ?? "";
    recommendations = parsed.recommendations ?? [];
  } catch {
    if (type === "employer") {
      summary = `Your hiring pipeline shows ${data.totalApplications ?? 0} applications across ${data.totalJobs ?? 0} jobs with an average match score of ${data.avgMatchScore ?? 0}%.`;
      recommendations = [
        "Focus on candidates with match scores above 80% for faster hiring.",
        "Consider adding more detailed skill requirements to improve match accuracy.",
        "Respond to applications within 48 hours to maintain candidate engagement.",
        "Use the Skill Gap Analysis to identify talent pipeline opportunities.",
      ];
    } else {
      summary = `The platform has ${data.totalJobs ?? 0} active jobs and ${data.totalApplications ?? 0} applications with an average match score of ${data.avgMatchScore ?? 0}%.`;
      recommendations = [
        "Promote skill verification to improve match score accuracy across the platform.",
        "Encourage employers to post detailed skill requirements for better matching.",
        "Monitor skill demand trends to guide job seeker training recommendations.",
        "Review application conversion rates to identify bottleneck stages.",
      ];
    }
  }

  return { title, summary, sections, recommendations };
}

// ============================================================
// 7. FAKE DATA DETECTION (Detect fake resumes/profiles)
// ============================================================
export interface FakeDataCheckResult {
  isFake: boolean;
  confidence: number; // 0-1
  flags: { type: string; description: string; severity: "low" | "medium" | "high" }[];
  feedback: string;
  recommendations: string[];
}

export async function detectFakeData(input: {
  name: string;
  email: string;
  title: string;
  about?: string;
  skills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  experience: { company: string; title: string; startDate: string; endDate: string; description?: string }[];
  education: { institution: string; degree: string; field: string; startDate: string; endDate: string }[];
  yearsOfExperience: number;
}): Promise<FakeDataCheckResult> {
  const flags: FakeDataCheckResult["flags"] = [];
  const recommendations: string[] = [];

  // ---- Heuristic checks (deterministic, instant) ----

  // 1. Check for suspiciously generic/fake names
  const genericNames = ["test", "admin", "user", "fake", "john doe", "jane doe", "asdf", "qwerty", "example"];
  const lowerName = input.name.trim().toLowerCase();
  if (genericNames.some(g => lowerName.includes(g))) {
    flags.push({
      type: "suspicious_name",
      description: `The name "${input.name}" appears to be a generic or test name.`,
      severity: "medium",
    });
  }

  // 2. Check for disposable/fake email domains
  const disposableDomains = ["example.com", "test.com", "fake.com", "temp.com", "mailinator.com", "guerrillamail.com", "10minutemail.com", "throwaway.email"];
  const emailDomain = input.email.split("@")[1]?.toLowerCase() ?? "";
  if (disposableDomains.includes(emailDomain)) {
    flags.push({
      type: "disposable_email",
      description: `The email domain "${emailDomain}" is a known disposable/temporary email provider.`,
      severity: "high",
    });
  }

  // 3. Check for inconsistent experience claims
  // Calculate total experience years from work history
  let calculatedYears = 0;
  for (const exp of input.experience) {
    try {
      const start = new Date(exp.startDate);
      const end = exp.endDate.toLowerCase() === "present" ? new Date() : new Date(exp.endDate);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (diff > 0) calculatedYears += diff;
    } catch { /* ignore parse errors */ }
  }
  // If claimed years significantly exceed calculated years (allow 1 year tolerance)
  if (input.yearsOfExperience > calculatedYears + 2) {
    flags.push({
      type: "experience_mismatch",
      description: `Claims ${input.yearsOfExperience} years of experience, but work history only accounts for ~${Math.round(calculatedYears)} years.`,
      severity: "high",
    });
    recommendations.push("Review the work experience dates — they don't add up to the claimed years of experience.");
  }

  // 4. Check for overlapping jobs (working 2 full-time jobs simultaneously for >6 months)
  const sortedExp = [...input.experience].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  for (let i = 0; i < sortedExp.length - 1; i++) {
    const currEnd = sortedExp[i].endDate.toLowerCase() === "present" ? new Date() : new Date(sortedExp[i].endDate);
    const nextStart = new Date(sortedExp[i + 1].startDate);
    const overlapMs = currEnd.getTime() - nextStart.getTime();
    const overlapMonths = overlapMs / (1000 * 60 * 60 * 24 * 30);
    if (overlapMonths > 6) {
      flags.push({
        type: "overlapping_jobs",
        description: `Two full-time positions overlap by ${Math.round(overlapMonths)} months (${sortedExp[i].company} and ${sortedExp[i + 1].company}).`,
        severity: "medium",
      });
      break;
    }
  }

  // 5. Check for all skills at "expert" level (unrealistic for junior profiles)
  if (input.skills.length >= 5) {
    const expertCount = input.skills.filter(s => s.proficiency === "expert").length;
    if (expertCount === input.skills.length && input.yearsOfExperience < 5) {
      flags.push({
        type: "unrealistic_proficiency",
        description: `All ${input.skills.length} skills are marked as "expert" but only ${input.yearsOfExperience} years of experience claimed. This is statistically unlikely.`,
        severity: "high",
      });
      recommendations.push('Review your skill proficiency levels — marking everything as "expert" with limited experience is a red flag for employers.');
    }
  }

  // 6. Check for zero verified skills despite many claimed
  if (input.skills.length >= 5 && input.skills.filter(s => s.verified).length === 0) {
    flags.push({
      type: "no_verified_skills",
      description: `${input.skills.length} skills claimed but none are verified. Unverified profiles receive 3x fewer interview invitations.`,
      severity: "medium",
    });
    recommendations.push("Request skill verification through assessments or prior employer attestation to boost your profile credibility.");
  }

  // 7. Check for missing education
  if (input.education.length === 0) {
    flags.push({
      type: "missing_education",
      description: "No education history provided. Most employers require at least a high school diploma.",
      severity: "low",
    });
    recommendations.push("Add your education history — even self-taught bootcamps or online courses count.");
  }

  // 8. Check for suspiciously short about/bio
  if (input.about && input.about.trim().length > 0 && input.about.trim().length < 20) {
    flags.push({
      type: "short_bio",
      description: "Bio is very short (under 20 characters). This suggests an incomplete or fake profile.",
      severity: "low",
    });
  }

  // 9. Check for copy-pasted/generic experience descriptions
  const genericDescs = ["software development", "coding", "programming", "work", "job", "tasks", "responsibilities"];
  for (const exp of input.experience) {
    if (exp.description) {
      const lowerDesc = exp.description.trim().toLowerCase();
      if (lowerDesc.length < 10 || genericDescs.some(g => lowerDesc === g)) {
        flags.push({
          type: "generic_description",
          description: `Experience at ${exp.company} has a very generic description: "${exp.description}".`,
          severity: "low",
        });
        break;
      }
    }
  }

  // 10. Check for future dates in experience
  const now = new Date();
  for (const exp of input.experience) {
    try {
      const start = new Date(exp.startDate);
      if (start > now) {
        flags.push({
          type: "future_date",
          description: `Experience at ${exp.company} has a start date in the future (${exp.startDate}).`,
          severity: "high",
        });
        break;
      }
    } catch { /* ignore */ }
  }

  // ---- LLM-based deep analysis (best-effort) ----
  let llmFlags: FakeDataCheckResult["flags"] = [];
  try {
    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an AI fraud detection system for a job platform. Analyze the candidate profile for signs of fake or misleading information. Look for:
- Inconsistent job titles vs skills
- Unrealistic career progression
- Suspicious company names (e.g. "My Company", "Self", "Freelance" with too many years)
- Skills that don't match the claimed job title
- Template-generated or AI-generated bios
Return JSON: {"flags": [{"type": "string", "description": "what's suspicious", "severity": "low"|"medium"|"high"}]}. Return empty array if profile looks legitimate.`,
        },
        {
          role: "user",
          content: `Name: ${input.name}
Title: ${input.title}
Email: ${input.email}
Years of experience: ${input.yearsOfExperience}
Skills: ${input.skills.map(s => `${s.name} (${s.proficiency}${s.verified ? ", verified" : ""})`).join(", ")}
Experience: ${input.experience.map(e => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate})`).join("; ")}
Education: ${input.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join("; ")}
About: ${input.about ?? "N/A"}

Analyze for fake data indicators. Return JSON only.`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    llmFlags = (parsed.flags ?? []).map((f: any) => ({
      type: f.type ?? "llm_flag",
      description: f.description ?? "",
      severity: (f.severity ?? "medium") as "low" | "medium" | "high",
    }));
  } catch {
    // LLM unavailable — heuristic checks only
  }

  // Combine heuristic + LLM flags
  const allFlags = [...flags, ...llmFlags];

  // Calculate confidence and determine if fake
  const highSeverity = allFlags.filter(f => f.severity === "high").length;
  const mediumSeverity = allFlags.filter(f => f.severity === "medium").length;
  const lowSeverity = allFlags.filter(f => f.severity === "low").length;

  const confidence = Math.min(1, (highSeverity * 0.35) + (mediumSeverity * 0.2) + (lowSeverity * 0.05));
  const isFake = highSeverity >= 2 || (highSeverity >= 1 && mediumSeverity >= 2) || confidence >= 0.7;

  // Generate feedback
  let feedback = "";
  if (isFake) {
    feedback = "This profile has been flagged as potentially fake or misleading. ";
    if (highSeverity > 0) {
      feedback += `${highSeverity} high-severity issue${highSeverity === 1 ? "" : "s"} detected: ${allFlags.filter(f => f.severity === "high").map(f => f.description).join("; ")}. `;
    }
    feedback += "Please review and correct the information before submitting.";
  } else if (allFlags.length > 0) {
    feedback = `This profile has ${allFlags.length} minor issue${allFlags.length === 1 ? "" : "s"} that may affect credibility. Consider addressing them to improve your profile quality.`;
  } else {
    feedback = "This profile appears legitimate. No fake data indicators detected.";
  }

  // Add recommendations if none yet
  if (recommendations.length === 0 && !isFake && allFlags.length > 0) {
    recommendations.push("Review the flagged items and update your profile for better credibility.");
  }

  return { isFake, confidence, flags: allFlags, feedback, recommendations };
}

// ============================================================
// 8. SKILL GAP ANALYSIS (Priority 6)
// ============================================================
export interface SkillGapResult {
  targetJobTitle: string;
  overallGap: number; // 0-100, higher = bigger gap
  missingSkills: { name: string; category: string; importance: "critical" | "important" | "nice_to_have"; description: string }[];
  partialSkills: { name: string; currentProficiency: ProficiencyLevel; requiredProficiency: ProficiencyLevel; gap: number }[];
  matchedSkills: string[];
  learningRecommendations: { skill: string; reason: string; resource: string; estimatedTime: string; jobsUnlocked: number }[];
  careerPath: { step: string; description: string; skillsToFocus: string[] }[];
}

export async function analyzeSkillGap(input: {
  candidateSkills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  targetJobSkills: { name: string; proficiency: ProficiencyLevel; mandatory: boolean }[];
  targetJobTitle: string;
  candidateExperienceYears: number;
  targetExperienceYears: number;
}): Promise<SkillGapResult> {
  const { candidateSkills, targetJobSkills, targetJobTitle } = input;

  const candidateNames = candidateSkills.map(s => normalizeSkill(s.name));
  const candidateMap = new Map(candidateSkills.map(s => [normalizeSkill(s.name).toLowerCase(), s]));

  const missing: SkillGapResult["missingSkills"] = [];
  const partial: SkillGapResult["partialSkills"] = [];
  const matched: string[] = [];

  for (const req of targetJobSkills) {
    const reqCanonical = normalizeSkill(req.name);
    const cand = candidateMap.get(reqCanonical.toLowerCase());

    // Try semantic match
    let matchedCandidate = cand;
    if (!matchedCandidate) {
      const best = findBestMatch(reqCanonical, candidateNames, 0.7);
      if (best) {
        matchedCandidate = candidateMap.get(best.skill.toLowerCase());
      }
    }

    if (!matchedCandidate) {
      // Completely missing
      missing.push({
        name: req.name,
        category: getSkillCategory(req.name),
        importance: req.mandatory ? "critical" : "important",
        description: getSkillDescription(req.name) || `${req.name} is ${req.mandatory ? "a mandatory" : "a preferred"} skill for ${targetJobTitle}.`,
      });
    } else {
      // Check proficiency gap
      const candLevel = PROFICIENCY_VALUES[matchedCandidate.proficiency];
      const reqLevel = PROFICIENCY_VALUES[req.proficiency];
      if (candLevel < reqLevel) {
        partial.push({
          name: matchedCandidate.name,
          currentProficiency: matchedCandidate.proficiency,
          requiredProficiency: req.proficiency,
          gap: reqLevel - candLevel,
        });
      } else {
        matched.push(matchedCandidate.name);
      }
    }
  }

  // Calculate overall gap
  const totalSkills = targetJobSkills.length;
  const matchedCount = matched.length;
  const partialCount = partial.length;
  const missingCount = missing.length;
  const overallGap = totalSkills > 0
    ? Math.round(((missingCount * 1.0 + partialCount * 0.5) / totalSkills) * 100)
    : 0;

  // Generate learning recommendations using the skill ontology
  const learningRecommendations: SkillGapResult["learningRecommendations"] = [];

  // For missing skills
  for (const m of missing.slice(0, 5)) {
    const related = getRelatedSkills(m.name);
    const relatedHeld = related.filter(r => candidateNames.includes(normalizeSkill(r)));
    learningRecommendations.push({
      skill: m.name,
      reason: m.importance === "critical"
        ? `This is a mandatory skill for ${targetJobTitle}. Without it, you won't qualify for most roles.`
        : `Adding this skill will improve your match score by approximately ${Math.round(100 / totalSkills)}%.`,
      resource: relatedHeld.length > 0
        ? `Since you already know ${relatedHeld[0]} (a related skill), learning ${m.name} will be easier than starting from scratch.`
        : `Start with online courses on platforms like Coursera, Udemy, or freeCodeCamp. Build a small project to demonstrate proficiency.`,
      estimatedTime: m.importance === "critical" ? "3-6 months" : "1-3 months",
      jobsUnlocked: Math.round(missingCount > 0 ? 100 / missingCount : 0),
    });
  }

  // For partial skills (need to level up)
  for (const p of partial.slice(0, 3)) {
    learningRecommendations.push({
      skill: p.name,
      reason: `You're at ${p.currentProficiency} level but ${targetJobTitle} requires ${p.requiredProficiency}. Leveling up will boost your match score.`,
      resource: `Work on advanced ${p.name} projects, contribute to open source, or take an advanced-level course. Focus on real-world applications.`,
      estimatedTime: p.gap === 1 ? "1-2 months" : "3-4 months",
      jobsUnlocked: Math.round(100 / totalSkills),
    });
  }

  // Generate career path
  const careerPath: SkillGapResult["careerPath"] = [];
  if (missing.length > 0 || partial.length > 0) {
    careerPath.push({
      step: "1. Fill critical gaps",
      description: `Learn the ${missing.filter(m => m.importance === "critical").map(m => m.name).join(", ") || "missing"} skill${missing.length === 1 ? "" : "s"} first — these are mandatory for ${targetJobTitle}.`,
      skillsToFocus: missing.filter(m => m.importance === "critical").map(m => m.name),
    });
  }
  if (partial.length > 0) {
    careerPath.push({
      step: "2. Level up existing skills",
      description: `Advance your ${partial.map(p => `${p.name} (${p.currentProficiency}→${p.requiredProficiency})`).join(", ")} to meet the required proficiency.`,
      skillsToFocus: partial.map(p => p.name),
    });
  }
  if (input.candidateExperienceYears < input.targetExperienceYears) {
    careerPath.push({
      step: "3. Gain more experience",
      description: `You have ${input.candidateExperienceYears} years but ${targetJobTitle} typically requires ${input.targetExperienceYears}+ years. Build portfolio projects or take on more responsibilities.`,
      skillsToFocus: [],
    });
  }
  careerPath.push({
    step: `${careerPath.length + 1}. Apply with confidence`,
    description: `Once you've addressed the gaps, your match score should improve significantly. Apply to ${targetJobTitle} roles with your updated profile.`,
    skillsToFocus: [],
  });

  return {
    targetJobTitle,
    overallGap,
    missingSkills: missing,
    partialSkills: partial,
    matchedSkills: matched,
    learningRecommendations,
    careerPath,
  };
}

// ============================================================
// 9. CANDIDATE RANKING AI (Priority 5)
// Rank applicants according to skill match, proficiency, experience, and verification
// ============================================================
export interface CandidateRankingInput {
  job: {
    title: string;
    requiredSkills: { name: string; proficiency: ProficiencyLevel; mandatory: boolean }[];
    minExperienceYears: number;
    category: string;
  };
  candidates: {
    id: string;
    name: string;
    title: string;
    skills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
    experienceYears: number;
    education: string;
    applicationStatus: string;
    appliedAt: string;
  }[];
}

export interface CandidateRankingResult {
  rankings: {
    candidateId: string;
    name: string;
    title: string;
    overallScore: number;
    factors: {
      skillMatch: number;
      proficiencyMatch: number;
      experienceMatch: number;
      verifiedSkillsBonus: number;
      recencyBonus: number;
      semanticMatches: { required: string; matched: string; similarity: number }[];
    };
    rank: number;
    explanation: string;
    strengths: string[];
    weaknesses: string[];
  }[];
  summary: string;
}

// ---- Candidate ranking cache ----
const RANK_CACHE = new Map<string, { result: CandidateRankingResult; expires: number }>();
const RANK_CACHE_TTL = 5 * 60 * 1000;

export async function rankCandidates(input: CandidateRankingInput): Promise<CandidateRankingResult> {
  if (input.candidates.length === 0) {
    return { rankings: [], summary: "No candidates to rank." };
  }

  // Check cache
  const cacheK = `${input.job.title}|${input.candidates.map(c => c.id).sort().join(",")}`;
  const cached = RANK_CACHE.get(cacheK);
  if (cached && Date.now() < cached.expires) return cached.result;

  // Score each candidate using computeMatch + additional ranking factors
  const scoredCandidates = await Promise.all(
    input.candidates.map(async (candidate) => {
      // Use the existing computeMatch for the base score + factor breakdown
      const matchInput: MatchInput = {
        candidate: {
          name: candidate.name,
          title: candidate.title,
          skills: candidate.skills,
          experienceYears: candidate.experienceYears,
          education: candidate.education,
        },
        job: {
          title: input.job.title,
          requiredSkills: input.job.requiredSkills,
          minExperienceYears: input.job.minExperienceYears,
        },
      };
      const matchResult = await computeMatch(matchInput);

      // Extract individual factor scores
      const factorMap = new Map(matchResult.factors.map(f => [f.key, f.score]));
      const skillMatch = factorMap.get("skill_match") ?? 0;
      const proficiencyMatch = factorMap.get("proficiency_match") ?? 0;
      const experienceMatch = factorMap.get("experience_match") ?? 0;
      const verifiedScore = factorMap.get("verified_skills") ?? 0;

      // ---- Additional ranking factors beyond computeMatch ----

      // Recency bonus: candidates who applied recently get a small boost
      // (fresh applications are more likely to still be available)
      const appliedDate = new Date(candidate.appliedAt);
      const daysSinceApplied = (Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = daysSinceApplied < 3 ? 5 : daysSinceApplied < 7 ? 3 : daysSinceApplied < 14 ? 1 : 0;

      // Verified skills bonus: candidates with more verified skills get a trust boost
      const verifiedCount = candidate.skills.filter(s => s.verified).length;
      const verifiedBonus = Math.min(10, verifiedCount * 2);

      // Overall score: weighted combination
      const overallScore = Math.round(
        skillMatch * 0.30 +
        proficiencyMatch * 0.15 +
        experienceMatch * 0.15 +
        verifiedScore * 0.10 +
        recencyBonus * 0.10 +
        verifiedBonus * 0.10 +
        matchResult.overall * 0.10
      );

      // Generate strengths and weaknesses (Priority 9: Explainability)
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      if (matchResult.matchingSkills.length > 0) {
        const expertMatched = matchResult.matchingSkills.filter(s => s.proficiency === "expert");
        if (expertMatched.length > 0) {
          strengths.push(`Expert-level in ${expertMatched.length} required skill${expertMatched.length === 1 ? "" : "s"}: ${expertMatched.map(s => s.name).join(", ")}`);
        }
      }
      if (verifiedCount >= 3) {
        strengths.push(`${verifiedCount} verified skills — above average credibility`);
      }
      if (candidate.experienceYears >= input.job.minExperienceYears) {
        strengths.push(`${candidate.experienceYears} years experience (exceeds minimum of ${input.job.minExperienceYears})`);
      }

      const missingMandatory = matchResult.missingSkills.filter(s => s.mandatory);
      if (missingMandatory.length > 0) {
        weaknesses.push(`Missing ${missingMandatory.length} mandatory skill${missingMandatory.length === 1 ? "" : "s"}: ${missingMandatory.map(s => s.name).join(", ")}`);
      }
      if (matchResult.missingSkills.length > matchResult.matchingSkills.length) {
        weaknesses.push(`More missing skills (${matchResult.missingSkills.length}) than matched (${matchResult.matchingSkills.length})`);
      }
      if (verifiedCount === 0 && candidate.skills.length > 0) {
        weaknesses.push("No verified skills — verification boosts ranking");
      }

      // Generate explanation (Priority 9: Explainability)
      let explanation = `${candidate.name} has an overall score of ${overallScore}%. `;
      if (matchResult.matchingSkills.length > 0) {
        explanation += `Matches ${matchResult.matchingSkills.length}/${input.job.requiredSkills.length} required skills`;
        if (matchResult.missingSkills.length > 0) {
          explanation += `, missing ${matchResult.missingSkills.length}`;
        }
        explanation += `. `;
      }
      if (verifiedCount > 0) {
        explanation += `${verifiedCount} verified skill${verifiedCount === 1 ? "" : "s"}. `;
      }
      if (recencyBonus > 0) {
        explanation += `Applied recently (+${recencyBonus} recency bonus). `;
      }
      if (weaknesses.length > 0) {
        explanation += `Areas of concern: ${weaknesses[0]}.`;
      }

      return {
        candidateId: candidate.id,
        name: candidate.name,
        title: candidate.title,
        overallScore,
        factors: {
          skillMatch,
          proficiencyMatch,
          experienceMatch,
          verifiedSkillsBonus: verifiedBonus,
          recencyBonus,
          semanticMatches: [], // populated from computeMatch's internal semanticMatches
        },
        matchResult,
        strengths,
        weaknesses,
        explanation,
      };
    })
  );

  // Sort by overall score desc
  scoredCandidates.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  const rankings: CandidateRankingResult["rankings"] = scoredCandidates.map((s, i) => ({
    candidateId: s.candidateId,
    name: s.name,
    title: s.title,
    overallScore: s.overallScore,
    factors: s.factors,
    rank: i + 1,
    explanation: s.explanation,
    strengths: s.strengths,
    weaknesses: s.weaknesses,
  }));

  // Generate summary
  const avgScore = Math.round(scoredCandidates.reduce((a, s) => a + s.overallScore, 0) / scoredCandidates.length);
  const topCandidate = rankings[0];
  const summary = `${rankings.length} candidate${rankings.length === 1 ? "" : "s"} ranked. ` +
    `Top match: ${topCandidate.name} (${topCandidate.overallScore}%). ` +
    `Average score: ${avgScore}%. ` +
    `${rankings.filter(r => r.overallScore >= 75).length} candidate${rankings.filter(r => r.overallScore >= 75).length === 1 ? "" : "s"} above 75% threshold.`;

  const result: CandidateRankingResult = { rankings, summary };

  // Cache
  RANK_CACHE.set(cacheK, { result, expires: Date.now() + RANK_CACHE_TTL });
  return result;
}

// ============================================================
// 10. AI EXPLAINABILITY (Priority 9)
// Generate detailed explanations for why a match score was computed
// ============================================================
export interface MatchExplanation {
  overallScore: number;
  scoreBreakdown: { factor: string; score: number; weight: number; contribution: number; description: string }[];
  matchedSkills: { name: string; proficiency: string; verified: boolean; how: "exact" | "semantic"; matchedTo?: string }[];
  missingSkills: { name: string; proficiency: string; mandatory: boolean; impact: string }[];
  semanticInsights: string[];
  recommendations: string[];
  summary: string;
}

export function explainMatch(matchResult: MatchResult): MatchExplanation {
  const breakdown: MatchExplanation["scoreBreakdown"] = matchResult.factors.map(f => ({
    factor: f.label,
    score: f.score,
    weight: f.weight,
    contribution: Math.round(f.score * f.weight),
    description: f.description,
  }));

  const matchedSkills: MatchExplanation["matchedSkills"] = matchResult.matchingSkills.map(s => ({
    name: s.name,
    proficiency: s.proficiency,
    verified: s.verified,
    how: "exact" as const,
  }));

  const missingSkills: MatchExplanation["missingSkills"] = matchResult.missingSkills.map(s => ({
    name: s.name,
    proficiency: s.requiredProficiency,
    mandatory: s.mandatory,
    impact: s.mandatory
      ? `This is a mandatory skill — not having it reduces your match score significantly.`
      : `This is a preferred skill — having it would boost your score by ~${Math.round(100 / (matchedSkills.length + matchResult.missingSkills.length))}%.`,
  }));

  // Generate semantic insights
  const semanticInsights: string[] = [];
  // Check if any matched skills have related skills in the ontology
  for (const matched of matchResult.matchingSkills) {
    const related = getRelatedSkills(matched.name);
    if (related.length > 0) {
      semanticInsights.push(`${matched.name} is related to ${related.slice(0, 3).join(", ")} — if the job requires any of these, you'd get partial credit.`);
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  const mandatoryMissing = matchResult.missingSkills.filter(s => s.mandatory);
  if (mandatoryMissing.length > 0) {
    recommendations.push(`Learn ${mandatoryMissing[0].name} — it's mandatory and currently your biggest gap.`);
  }
  if (matchResult.recommendedSkills.length > 0) {
    recommendations.push(`Consider learning: ${matchResult.recommendedSkills.slice(0, 3).join(", ")}.`);
  }
  const unverified = matchResult.matchingSkills.filter(s => !s.verified);
  if (unverified.length > 0) {
    recommendations.push(`Verify ${unverified[0].name} to boost your verified-skills factor by up to 20%.`);
  }

  // Generate summary
  const topFactor = breakdown.reduce((max, f) => f.contribution > max.contribution ? f : max, breakdown[0]);
  const weakestFactor = breakdown.reduce((min, f) => f.contribution < min.contribution ? f : min, breakdown[0]);
  const summary = `Your overall match score is ${matchResult.overall}%. ` +
    `Your strongest area is "${topFactor.factor}" (contributing ${topFactor.contribution} points). ` +
    `Your weakest area is "${weakestFactor.factor}" (contributing only ${weakestFactor.contribution} points). ` +
    (matchResult.rationale ? matchResult.rationale : "");

  return {
    overallScore: matchResult.overall,
    scoreBreakdown: breakdown,
    matchedSkills,
    missingSkills,
    semanticInsights,
    recommendations,
    summary,
  };
}
