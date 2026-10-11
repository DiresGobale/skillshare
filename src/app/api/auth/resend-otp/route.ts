import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { sendSms, generateOtpCode } from "@/lib/sms";

// POST /api/auth/resend-otp
// Body: { email }
// Generates a new OTP and resends it to the user's email and phone.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Don't leak whether the email exists
      return NextResponse.json({ ok: true, message: "If an account with that email exists, a new verification code has been sent." });
    }

    if (user.status === "active" && user.emailVerified && user.phoneVerified) {
      return NextResponse.json({ ok: false, error: "Account is already verified." }, { status: 400 });
    }

    // Generate a new OTP
    const otpCode = generateOtpCode();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        emailOtpCode: otpCode,
        emailOtpExpiry: otpExpiry,
      },
    });

    // Send OTP via email
    await sendOtpEmail(user.email, user.name, otpCode);

    // Send OTP via SMS
    const smsMessage = `SkillMatch AI: Your verification code is ${otpCode}. It expires in 10 minutes. Do not share this code with anyone.`;
    const smsResult = await sendSms(user.phone || "", smsMessage);

    return NextResponse.json({
      ok: true,
      message: "A new verification code has been sent to your email and phone.",
      devOtp: smsResult.devPreview ? otpCode : undefined,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to resend code." }, { status: 500 });
  }
}
