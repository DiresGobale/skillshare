import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/resume — fetch the current user's latest resume + AI analysis
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // Get the most recent resume for this user
  const resume = await db.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!resume) {
    return NextResponse.json({ ok: true, resume: null });
  }

  // Parse the analysis JSON
  let analysis = null;
  try {
    analysis = JSON.parse(resume.analysis);
  } catch {
    analysis = null;
  }

  return NextResponse.json({
    ok: true,
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      rawText: resume.rawText,
      analysis,
      analyzedAt: resume.analyzedAt,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    },
  });
}
