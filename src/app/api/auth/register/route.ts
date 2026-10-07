import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// POST /api/auth/register
// Body: { name, email, password, role }
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!["seeker", "employer"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role. Only seeker or employer can self-register." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = name.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
    const avatarColor = role === "employer" ? "oklch(0.6 0.18 240)" : "oklch(0.55 0.22 285)";

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash,
        role,
        title: role === "employer" ? "Employer" : "Job Seeker",
        avatarColor,
        initials,
        status: "active",
      },
    });

    // Audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "Registered",
        target: user.email,
        type: "auth",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Registration failed." },
      { status: 500 }
    );
  }
}
