import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/2fa-info
// Returns the admin's TOTP secret AND the current live code (for demo convenience).
// In production, this endpoint would NOT exist — the admin would use their
// authenticator app exclusively.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email ?? "" },
    select: { twoFactorSecretHash: true, twoFactorEnabled: true, name: true, email: true },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecretHash) {
    return NextResponse.json({ ok: false, error: "2FA not configured" }, { status: 400 });
  }

  // Generate the current TOTP code server-side
  const currentCode = authenticator.generate(user.twoFactorSecretHash);
  const epoch = Math.floor(Date.now() / 1000);
  const expiresIn = 30 - (epoch % 30);

  return NextResponse.json({
    ok: true,
    secret: user.twoFactorSecretHash,
    currentCode,
    expiresIn,
    name: user.name,
    email: user.email,
  });
}
