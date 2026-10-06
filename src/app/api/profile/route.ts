import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/profile — current user's full profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      skills: { orderBy: { createdAt: "asc" } },
      experiences: { orderBy: { createdAt: "asc" } },
      educations: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    profile: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      title: user.title,
      company: user.company,
      location: user.location,
      about: user.about,
      avatarColor: user.avatarColor,
      initials: user.initials,
      profilePhoto: user.profilePhoto,
      skills: user.skills,
      experiences: user.experiences,
      educations: user.educations,
    },
  });
}

// PUT /api/profile — update current user's basic profile fields
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, title, location, about, company } = body;
    const updated = await db.user.update({
      where: { email: session.user.email },
      data: {
        name: name?.trim() || undefined,
        title: title?.trim() || undefined,
        location: location?.trim() || undefined,
        about: about?.trim() || undefined,
        company: company?.trim() || undefined,
      },
    });
    await db.auditLog.create({
      data: { userId: updated.id, action: "Updated profile", target: "Basic info", type: "admin", status: "success" },
    });
    return NextResponse.json({ ok: true, profile: { name: updated.name, title: updated.title, location: updated.location, about: updated.about, company: updated.company } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Update failed" }, { status: 500 });
  }
}
