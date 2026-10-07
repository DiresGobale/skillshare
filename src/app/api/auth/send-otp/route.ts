import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

// POST /api/auth/send-otp
// Body: { email }
// Generates a unique 6-digit OTP, stores it in the database with a 5-minute expiry,
// and returns the OTP (since we can't send real emails in this demo — in production
// this would use nodemailer/SendGrid to email the OTP to the admin).
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.trim()) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    // Validate email format
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "No account found with this email address." }, { status: 404 });
    }

    // Only admins need OTP
    if (user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "OTP verification is required only for admin accounts." }, { status: 403 });
    }

    // Check account status
    if (user.status !== "active") {
      return NextResponse.json({ ok: false, error: `Account is ${user.status}. Contact support.` }, { status: 403 });
    }

    // Generate a unique 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the OTP in the database
    await db.user.update({
      where: { id: user.id },
      data: {
        emailOtpCode: otp,
        emailOtpExpiry: expiry,
      },
    });

    // Audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "OTP generated and sent to email",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    // In production: send the OTP via email using nodemailer/SendGrid
    // For demo: return the OTP so the UI can display it (since we can't send real emails)
    return NextResponse.json({
      ok: true,
      otp, // In production, this would NOT be returned — it would be emailed
      email: user.email,
      name: user.name,
      expiresIn: 300, // 5 minutes in seconds
      message: "OTP generated. In production, this would be emailed to the admin's registered email address.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to send OTP" },
      { status: 500 }
    );
  }
}
