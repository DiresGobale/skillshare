import { NextRequest, NextResponse } from "next/server";
import { extractResume } from "@/lib/ai-service";

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

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx");

      if (isPdf) {
        try {
          text = await extractTextFromPdf(buffer);
        } catch (pdfErr) {
          console.error("PDF parse error:", pdfErr);
          return NextResponse.json(
            {
              ok: false,
              error:
                "Could not parse PDF. The file may be scanned, encrypted, or corrupted. Try a text-readable PDF or upload a .txt file.",
            },
            { status: 422 }
          );
        }
      } else if (isDocx) {
        return NextResponse.json(
          {
            ok: false,
            error:
              ".docx files are not supported yet. Please upload a PDF or .txt file, or use 'Try with sample resume'.",
          },
          { status: 422 }
        );
      } else {
        // Treat as text (.txt, .md, etc.)
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
    return NextResponse.json({ ok: true, result, fileName });
  } catch (e) {
    console.error("Resume extraction error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "AI extraction failed." },
      { status: 500 }
    );
  }
}

// Extract text from a PDF buffer using pdfjs-dist directly.
// We use the legacy build which is more compatible with different PDF formats
// and doesn't require a separate worker file.
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Dynamic import of pdfjs-dist legacy build
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable worker — run inline (slower but no worker file needed)
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
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    textParts.push(pageText);
  }

  await pdfDocument.destroy();
  return textParts.join("\n\n");
}
