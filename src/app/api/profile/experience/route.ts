import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// POST /api/profile/experience — add an experience entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { company, title, startDate, endDate, description, current } = body;

    if (!company?.trim()) return NextResponse.json({ ok: false, error: "Company is required." }, { status: 400 });
    if (!title?.trim()) return NextResponse.json({ ok: false, error: "Job title is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    if (user.role !== "seeker") return NextResponse.json({ ok: false, error: "Only job seekers can add experience." }, { status: 403 });

    const experience = await db.experience.create({
      data: {
        userId: user.id,
        company: company.trim(),
        title: title.trim(),
        startDate: startDate?.trim() || "",
        endDate: endDate?.trim() || "",
        description: description?.trim() || "",
        current: current ?? false,
      },
    });

    await db.auditLog.create({
      data: { userId: user.id, action: "Added experience", target: `${title} at ${company}`, type: "admin", status: "success" },
    });

    return NextResponse.json({ ok: true, experience });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
