import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { getServerSession } from "next-auth";

// POST /api/auth/verify-otp
// Body: { email, otp }
// Validates the OTP against the database (must match + not be expired).
// If valid, clears the OTP and returns success so the admin gate can unlock.
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ ok: false, error: "Email and OTP are required." }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "OTP verification is for admin accounts only." }, { status: 403 });
    }

    // Check if OTP exists and is not expired
    if (!user.emailOtpCode || !user.emailOtpExpiry) {
      return NextResponse.json({ ok: false, error: "No OTP has been generated. Please request a new OTP." }, { status: 400 });
    }

    if (new Date() > user.emailOtpExpiry) {
      // Clear expired OTP
      await db.user.update({
        where: { id: user.id },
        data: { emailOtpCode: null, emailOtpExpiry: null },
      });
      return NextResponse.json({ ok: false, error: "OTP has expired. Please request a new OTP." }, { status: 400 });
    }

    // Validate the OTP
    if (user.emailOtpCode !== otp.trim()) {
      return NextResponse.json({ ok: false, error: "Invalid OTP. Please check and try again." }, { status: 400 });
    }

    // OTP is valid — clear it from the database
    await db.user.update({
      where: { id: user.id },
      data: { emailOtpCode: null, emailOtpExpiry: null },
    });

    // Audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Email OTP verified successfully",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "OTP verified successfully. Access granted.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "OTP verification failed" },
      { status: 500 }
    );
  }
}
