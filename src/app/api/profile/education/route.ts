import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// POST /api/profile/education — add an education entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { institution, degree, field, startDate, endDate } = body;

    if (!institution?.trim()) return NextResponse.json({ ok: false, error: "Institution is required." }, { status: 400 });
    if (!degree?.trim()) return NextResponse.json({ ok: false, error: "Degree is required." }, { status: 400 });
    if (!field?.trim()) return NextResponse.json({ ok: false, error: "Field of study is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    if (user.role !== "seeker") return NextResponse.json({ ok: false, error: "Only job seekers can add education." }, { status: 403 });

    const education = await db.education.create({
      data: {
        userId: user.id,
        institution: institution.trim(),
        degree: degree.trim(),
        field: field.trim(),
        startDate: startDate?.trim() || "",
        endDate: endDate?.trim() || "",
        verified: false,
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Added education", target: `${degree} at ${institution}`, type: "admin", status: "success" },
    });

    return NextResponse.json({ ok: true, education });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
