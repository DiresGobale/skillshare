import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// POST /api/auth/reset-password
// Body: { token, email, password }
// Resets the password using the token sent to the user's email
export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ ok: false, error: "Token, email, and new password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid or expired reset token." }, { status: 400 });
    }

    if (!user.resetToken || user.resetToken !== token) {
      return NextResponse.json({ ok: false, error: "Invalid or expired reset token." }, { status: 400 });
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ ok: false, error: "Reset token has expired. Please request a new password reset." }, { status: 400 });
    }

    // Hash the new password and update the user
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Password reset",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, message: "Password reset successfully. You can now log in with your new password." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to reset password." }, { status: 500 });
  }
}
