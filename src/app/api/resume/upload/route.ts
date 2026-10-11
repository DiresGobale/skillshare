import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { analyzeResume } from "@/lib/ai-service";

// POST /api/resume/upload — upload a CV, extract text, run AI analysis, save to DB
// Accepts multipart/form-data with a "file" field (PDF, TXT, MD)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "seeker") return NextResponse.json({ ok: false, error: "Only job seekers can upload CVs" }, { status: 403 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file uploaded. Please select your CV file." }, { status: 400 });

    // Validate file type
    const fileName = file.name;
    const isPdf = file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
    const isText = file.type === "text/plain" || fileName.toLowerCase().endsWith(".txt") || fileName.toLowerCase().endsWith(".md");
    if (!isPdf && !isText) {
      return NextResponse.json({
        ok: false,
        error: "Unsupported file format. Please upload a PDF, TXT, or MD file.",
      }, { status: 422 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ ok: false, error: "File too large. Maximum size is 5MB." }, { status: 422 });
    }

    // Extract text from the file
    let rawText = "";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isPdf) {
      try {
        rawText = await extractTextFromPdf(buffer);
      } catch (e) {
        return NextResponse.json({
          ok: false,
          error: "Could not extract text from this PDF. It may be scanned/image-based. Please upload a text-based PDF.",
        }, { status: 422 });
      }
    } else {
      rawText = buffer.toString("utf-8");
    }

    // Clean and validate text
    rawText = rawText.trim();
    if (rawText.length < 30) {
      return NextResponse.json({
        ok: false,
        error: "The extracted text from your CV is too short. Please ensure your CV contains enough content for analysis.",
      }, { status: 422 });
    }

    // Run AI analysis using the Gemini-powered z-ai SDK
    const analysis = await analyzeResume(rawText);

    // Save to DB — create a new Resume record (keeps history of all uploads)
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        fileName,
        rawText,
        fileSize: file.size,
        mimeType: isPdf ? "application/pdf" : "text/plain",
        analysis: JSON.stringify(analysis),
        analyzedAt: new Date(),
      },
    });

    // Also update the user's skills with AI-extracted skills (merge with existing)
    // Only add skills that don't already exist
    const existingSkills = await db.skill.findMany({ where: { userId: user.id } });
    const existingSkillNames = new Set(existingSkills.map(s => s.name.toLowerCase()));

    const newSkills = analysis.skills.filter(s => !existingSkillNames.has(s.name.toLowerCase()));
    if (newSkills.length > 0) {
      await db.skill.createMany({
        data: newSkills.map(s => ({
          userId: user.id,
          name: s.name,
          category: s.category,
          proficiency: s.proficiency,
          verified: "pending",
          source: "ai_extraction",
          yearsOfExperience: s.yearsOfExperience || null,
        })),
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: `Uploaded CV: ${fileName} (${newSkills.length} new skills extracted)`,
        target: fileName,
        type: "ai",
        status: "success",
      },
    });

    // Notify the user
    await db.notification.create({
      data: {
        userId: user.id,
        type: "system",
        title: "CV analysis complete",
        message: `Your CV "${fileName}" has been analyzed by AI. ${analysis.skills.length} skills detected, ${analysis.strengths.length} strengths, ${analysis.weaknesses.length} areas for improvement, and ${analysis.skillGaps.length} skill gaps identified.`,
        read: false,
      },
    });

    return NextResponse.json({
      ok: true,
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        analysis,
        analyzedAt: resume.analyzedAt,
        createdAt: resume.createdAt,
      },
      skillsAdded: newSkills.length,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : "Failed to upload and analyze CV",
    }, { status: 500 });
  }
}

// Extract text from a PDF buffer using pdfjs-dist
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const textParts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    textParts.push(pageText);
  }
  await pdfDocument.destroy();
  return textParts.join("\n\n");
}
