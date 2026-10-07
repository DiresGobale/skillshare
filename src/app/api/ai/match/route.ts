import { NextRequest, NextResponse } from "next/server";
import { computeMatch, type MatchInput } from "@/lib/ai-service";

// POST /api/ai/match
// Body: MatchInput
// Returns: MatchResult
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MatchInput;
    if (!body?.candidate || !body?.job) {
      return NextResponse.json({ ok: false, error: "candidate and job are required." }, { status: 400 });
    }
    const result = await computeMatch(body);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "AI match failed." },
      { status: 500 }
    );
  }
}
