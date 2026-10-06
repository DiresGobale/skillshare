import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// POST /api/auth/reset-password
// Body: { token, newPassword }
// Validates the token (must exist and not be expired), then updates the password.
export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !token.trim()) {
      return NextResponse.json({ ok: false, error: "Reset token is required." }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Find the user by token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid or expired reset token." }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the token
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
        action: "Password reset completed",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
