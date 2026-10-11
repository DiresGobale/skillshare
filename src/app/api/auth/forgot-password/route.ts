import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

// POST /api/auth/forgot-password
// Body: { email }
// Generates a password reset token and sends a reset email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // For security, always return success (don't leak whether the email exists)
    if (!user) {
      return NextResponse.json({ ok: true, message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send the reset email
    await sendPasswordResetEmail(user.email, user.name, token);

    return NextResponse.json({ ok: true, message: "If an account with that email exists, a password reset link has been sent." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to process request." }, { status: 500 });
  }
}
