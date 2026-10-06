import { NextRequest, NextResponse } from "next/server";
import { extractResume } from "@/lib/ai-service";

// POST /api/ai/extract-resume
// Body: { text: string }
// Returns: ExtractedResume
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ ok: false, error: "Resume text is required." }, { status: 400 });
    }
    const result = await extractResume(text);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "AI extraction failed." },
      { status: 500 }
    );
  }
}
