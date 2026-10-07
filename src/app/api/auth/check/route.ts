import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// POST /api/auth/check
// Pre-validates credentials and returns whether 2FA is needed.
// This lets the login page show the 2FA field BEFORE calling NextAuth signIn
// (NextAuth v4 doesn't forward custom error messages from authorize()).
//
// Body: { email, password }
// Returns: { ok: true, needs2FA: boolean, role: string } | { ok: false, error: string }
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ ok: false, error: "Account is " + user.status + ". Contact support." }, { status: 403 });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      needs2FA: user.twoFactorEnabled && !!user.twoFactorSecretHash,
      role: user.role,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
