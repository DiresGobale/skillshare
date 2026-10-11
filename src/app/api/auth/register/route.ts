import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { validateName, validateEmail, validatePassword, validateEthiopianPhone, normalizeEthiopianPhone } from "@/lib/validation";
import { sendOtpEmail } from "@/lib/email";
import { sendSms, generateOtpCode } from "@/lib/sms";

// POST /api/auth/register
// Body: { name, email, password, role, phone }
// Generates a 6-digit OTP, sends it to both email and phone (SMS).
// User must verify the OTP before their account is activated.
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone } = await req.json();

    // ---------- BACKEND VALIDATION ----------
    const nameCheck = validateName(name ?? "", "Name");
    if (!nameCheck.ok) return NextResponse.json({ ok: false, error: nameCheck.error }, { status: 400 });

    const emailCheck = validateEmail(email ?? "");
    if (!emailCheck.ok) return NextResponse.json({ ok: false, error: emailCheck.error }, { status: 400 });

    const passCheck = validatePassword(password ?? "");
    if (!passCheck.ok) return NextResponse.json({ ok: false, error: passCheck.error }, { status: 400 });

    // Ethiopian phone number validation (required)
    const phoneCheck = validateEthiopianPhone(phone ?? "");
    if (!phoneCheck.ok) return NextResponse.json({ ok: false, error: phoneCheck.error }, { status: 400 });

    if (!["seeker", "employer"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role. Only seeker or employer can self-register." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
    }

    // Check for duplicate phone number
    const normalizedPhone = normalizeEthiopianPhone(phone);
    const existingPhone = await db.user.findFirst({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      return NextResponse.json({ ok: false, error: "An account with this phone number already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanName = name.trim();
    const initials = cleanName.split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
    const avatarColor = role === "employer" ? "oklch(0.6 0.18 240)" : "oklch(0.55 0.22 285)";

    // Generate a 6-digit OTP code for phone/email verification
    const otpCode = generateOtpCode();
    const otpExpiry = new Date(Date.now() + 60 * 1000); // 1 minute

    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: cleanName,
        passwordHash,
        role,
        title: role === "employer" ? "Employer" : "Job Seeker",
        avatarColor,
        initials,
        status: "pending", // pending until OTP is verified
        phone: normalizedPhone,
        emailVerified: false,
        phoneVerified: false,
        emailOtpCode: otpCode,
        emailOtpExpiry: otpExpiry,
      },
    });

    // Send OTP via email
    await sendOtpEmail(user.email, user.name, otpCode);

    // Send OTP via SMS to the phone number
    const smsMessage = `SkillMatch AI: Your verification code is ${otpCode}. It expires in 1 minute. Do not share this code with anyone.`;
    const smsResult = await sendSms(normalizedPhone, smsMessage);

    // Audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Registered (pending OTP verification)",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      phone: normalizedPhone,
      message: "Account created. A 6-digit verification code has been sent to your email and phone. Please enter it to activate your account.",
      // In dev mode (no SMS/email configured), return the OTP so the UI can display it
      devOtp: smsResult.devPreview ? otpCode : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Registration failed." },
      { status: 500 }
    );
  }
}
