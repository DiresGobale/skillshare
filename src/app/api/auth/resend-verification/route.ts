import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import crypto from "crypto";

// POST /api/auth/resend-verification
// Resends the email verification link to the authenticated user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: false, error: "Email is already verified." }, { status: 400 });
  }

  // Generate a new verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.user.update({
    where: { id: user.id },
    data: {
      verificationToken: token,
      verificationTokenExpiry: expiry,
    },
  });

  // Send the verification email
  await sendVerificationEmail(user.email, user.name, token);

  return NextResponse.json({ ok: true, message: "Verification email sent. Please check your inbox." });
}
