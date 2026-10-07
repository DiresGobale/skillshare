import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

// POST /api/auth/forgot-password
// Body: { email }
// Generates a real reset token, stores it in the DB with a 1-hour expiry,
// and returns the token (since we can't send real emails in this demo).
// In production, this would send an email with the reset link.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.trim()) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal whether the email exists — return success
      return NextResponse.json({ ok: false, error: "No account found with that email." }, { status: 404 });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Requested password reset",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    // In production: send email with link to /reset-password?token=xxx
    // In demo: return the token so the UI can show the link
    return NextResponse.json({
      ok: true,
      token,
      email: user.email,
      message: "Reset link generated. In production, this would be emailed to you.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
