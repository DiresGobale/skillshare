import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// POST /api/profile/photo — upload a profile photo (base64 data URL)
// Body: { photo: string } where photo is a data URL like "data:image/jpeg;base64,..."
// Max size: ~2MB (enforced by checking the base64 string length)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { photo } = await req.json();
    if (!photo || typeof photo !== "string") {
      return NextResponse.json({ ok: false, error: "No photo provided." }, { status: 400 });
    }

    // Validate it's a data URL with an image MIME type
    if (!photo.startsWith("data:image/")) {
      return NextResponse.json({ ok: false, error: "Invalid image format." }, { status: 400 });
    }

    // Check size — ~2MB max (base64 is ~33% larger than binary, so ~2.7M chars)
    if (photo.length > 2_700_000) {
      return NextResponse.json({ ok: false, error: "Image too large. Max 2MB." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    await db.user.update({
      where: { id: user.id },
      data: { profilePhoto: photo },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Updated profile photo", target: user.email, type: "admin", status: "success" },
    });

    return NextResponse.json({ ok: true, photo });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/photo — remove the profile photo
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    await db.user.update({
      where: { id: user.id },
      data: { profilePhoto: null },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
