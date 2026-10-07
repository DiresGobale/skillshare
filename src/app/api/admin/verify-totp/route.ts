import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// POST /api/admin/verify-totp
// Verifies a TOTP code against the logged-in admin's secret.
// Used by the client-side 2FA gate (since otplib can't run in the browser).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, error: "Token is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { twoFactorSecretHash: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecretHash) {
      return NextResponse.json({ ok: false, error: "2FA not configured" }, { status: 400 });
    }

    const ok = authenticator.verify({
      token: token.trim(),
      secret: user.twoFactorSecretHash,
      window: 5,
    });

    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid TOTP code." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 }
    );
  }
}
