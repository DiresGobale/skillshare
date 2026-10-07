import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// PATCH /api/admin/users/[id] — update user status (suspend/activate)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!["active", "suspended", "pending"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    const admin = await db.user.findUnique({ where: { email: session.user.email } });
    if (!admin) return NextResponse.json({ ok: false, error: "Admin not found" }, { status: 404 });
    if (id === admin.id) {
      return NextResponse.json({ ok: false, error: "You cannot modify your own account." }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true, role: true },
    });

    await db.auditLog.create({
      data: { userId: admin.id, action: `Set status to ${status}`, target: `${user.name} (${user.email})`, type: "admin", status: "success" },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — delete a user
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
  try {
    const { id } = await params;
    const admin = await db.user.findUnique({ where: { email: session.user.email } });
    if (!admin) return NextResponse.json({ ok: false, error: "Admin not found" }, { status: 404 });
    if (id === admin.id) {
      return NextResponse.json({ ok: false, error: "You cannot delete your own account." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id }, select: { name: true, email: true } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: { userId: admin.id, action: "Deleted user", target: `${user.name} (${user.email})`, type: "admin", status: "warning" },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
