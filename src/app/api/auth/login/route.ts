import { NextRequest, NextResponse } from "next/server";
import { findDemoAccount } from "@/lib/demo-accounts";

// POST /api/auth/login
// Body: { email, password }
// Returns: { ok, account? | error }
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
    }
    const acc = findDemoAccount(email, password);
    if (!acc) {
      return NextResponse.json({ ok: false, error: "Invalid credentials. Try a demo account below." }, { status: 401 });
    }
    // Don't leak the password back
    return NextResponse.json({
      ok: true,
      account: {
        id: acc.id,
        role: acc.role,
        name: acc.name,
        email: acc.email,
        title: acc.title,
        blurb: acc.blurb,
        avatarColor: acc.avatarColor,
        initials: acc.initials,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}
