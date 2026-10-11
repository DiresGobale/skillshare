import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/auth/verify-email?token=...&email=...
// Verifies the email using the token sent to the user's email
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ ok: false, error: "Verification token and email are required." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, message: "Email already verified.", alreadyVerified: true });
  }

  if (!user.verificationToken || user.verificationToken !== token) {
    return NextResponse.json({ ok: false, error: "Invalid verification token." }, { status: 400 });
  }

  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    return NextResponse.json({ ok: false, error: "Verification token has expired. Please request a new verification email." }, { status: 400 });
  }

  // Verify the email
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      status: "active",
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "Email verified",
      target: user.email,
      type: "auth",
      status: "success",
    },
  });

  return NextResponse.json({ ok: true, message: "Email verified successfully. You can now log in." });
}
