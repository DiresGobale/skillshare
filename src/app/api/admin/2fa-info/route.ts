import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/admin/2fa-info
// Returns the admin's TOTP secret so the 2FA gate can show a live demo code.
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
    select: { twoFactorSecretHash: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecretHash) {
    return NextResponse.json({ ok: false, error: "2FA not configured" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, secret: user.twoFactorSecretHash });
}
