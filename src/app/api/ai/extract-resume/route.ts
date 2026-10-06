import { NextRequest, NextResponse } from "next/server";
import { extractResume } from "@/lib/ai-service";
import { db } from "@/lib/db";

// POST /api/ai/extract-resume
// Body (JSON): { text: string }
// Body (multipart/form-data): { file: File }
// Returns: ExtractedResume
export async function POST(req: NextRequest) {
  try {
    let text = "";
    let fileName = "resume";

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ ok: false, error: "No file uploaded." }, { status: 400 });
      }
      fileName = file.name;

      // Try to extract text from the file.
      // For .txt / .md / unknown text files: read as text.
      // For .pdf: use pdf-parse to extract text from the binary stream.
      // For .docx: not supported in this demo (would need mammoth).
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        try {
          // Dynamic import — pdf-parse is server-only and somewhat heavy
          const pdfParse = (await import("pdf-parse")).default;
          const pdfData = await pdfParse(buffer);
          text = pdfData.text || "";
        } catch (pdfErr) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Could not parse PDF. The file may be scanned, encrypted, or corrupted. Try a text-readable PDF or upload a .txt file.",
            },
            { status: 422 }
          );
        }
      } else {
        // Treat as text
        text = buffer.toString("utf-8");
      }

      if (!text || text.trim().length < 30) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Could not extract enough text from the file. If it's a scanned PDF, upload a text-readable version or a .txt file.",
          },
          { status: 422 }
        );
      }
    } else {
      // JSON body with pre-extracted text
      const body = await req.json();
      text = body.text;
      if (!text || typeof text !== "string") {
        return NextResponse.json({ ok: false, error: "Resume text is required." }, { status: 400 });
      }
    }

    const result = await extractResume(text);

    // Try to associate the extraction with the logged-in user (best-effort audit)
    try {
      // We can't easily get the session here without importing getServerSession,
      // but we can leave the audit log to a follow-up call if needed.
      void fileName;
    } catch {
      /* ignore */
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "AI extraction failed." },
      { status: 500 }
    );
  }
}
