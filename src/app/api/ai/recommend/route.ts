import { NextRequest, NextResponse } from "next/server";
import { recommendJobs, type RecommendInput } from "@/lib/ai-service";
import { recommendedJobs } from "@/lib/mock-data";

// POST /api/ai/recommend
// Body: RecommendInput (without jobs — we use the platform job pool)
// Returns: Job[]
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<RecommendInput, "jobs">;
    if (!body?.candidate) {
      return NextResponse.json({ ok: false, error: "candidate is required." }, { status: 400 });
    }
    const result = await recommendJobs({ ...body, jobs: recommendedJobs });
    return NextResponse.json({ ok: true, jobs: result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "AI recommendation failed." },
      { status: 500 }
    );
  }
}
