import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/verify-otp
// Body: { email, otpCode }
// Verifies the 6-digit OTP code sent during registration.
// On success: activates the account (status = "active", emailVerified = true, phoneVerified = true).
export async function POST(req: NextRequest) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ ok: false, error: "Email and verification code are required." }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json({ ok: false, error: "Verification code must be a 6-digit number." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (user.status === "active" && user.emailVerified && user.phoneVerified) {
      return NextResponse.json({ ok: true, message: "Account is already verified.", alreadyVerified: true });
    }

    if (!user.emailOtpCode || user.emailOtpCode !== otpCode) {
      return NextResponse.json({ ok: false, error: "Invalid verification code. Please check and try again." }, { status: 400 });
    }

    if (user.emailOtpExpiry && user.emailOtpExpiry < new Date()) {
      return NextResponse.json({ ok: false, error: "Verification code has expired. Please request a new code." }, { status: 400 });
    }

    // Activate the account
    await db.user.update({
      where: { id: user.id },
      data: {
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        emailOtpCode: null,
        emailOtpExpiry: null,
      },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "OTP verified — account activated",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, message: "Account verified successfully! You can now log in." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
