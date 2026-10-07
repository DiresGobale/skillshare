import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/site-images — public, returns active images for a category
// Query params: ?category=home (defaults to "home"), ?includeInactive=true (admin only), ?category=all (returns all categories, admin only)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category");
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  // If includeInactive is requested OR category=all, require admin auth
  if (includeInactive || categoryParam === "all") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });
    }
  }

  const where: any = {};
  if (categoryParam && categoryParam !== "all") {
    where.category = categoryParam;
  } else if (!categoryParam) {
    where.category = "home";
  }
  // category=all → no category filter
  if (!includeInactive) where.isActive = true;

  const images = await db.siteImage.findMany({
    where,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    images: images.map((img) => ({
      id: img.id,
      key: img.key,
      src: img.src,
      alt: img.alt,
      caption: img.caption,
      description: img.description,
      accent: img.accent,
      category: img.category,
      sortOrder: img.sortOrder,
      isActive: img.isActive,
    })),
  });
}

// POST /api/site-images — create a new site image (admin only)
// Body: { key, src, alt, caption?, description?, accent?, category?, sortOrder?, isActive? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const body = await req.json();
    const { key, src, alt, caption, description, accent, category, sortOrder, isActive } = body;

    if (!key || !src || !alt) {
      return NextResponse.json({ ok: false, error: "Key, src, and alt are required." }, { status: 400 });
    }

    // Check for duplicate key
    const existing = await db.siteImage.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ ok: false, error: `An image with key "${key}" already exists.` }, { status: 409 });
    }

    const image = await db.siteImage.create({
      data: {
        key: String(key).trim(),
        src: String(src),
        alt: String(alt).slice(0, 500),
        caption: caption ? String(caption).slice(0, 200) : null,
        description: description ? String(description).slice(0, 500) : null,
        accent: accent ?? "from-violet-500 to-blue-500",
        category: category ?? "home",
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    // Audit log
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Created site image: ${key}`,
        target: `Category: ${category ?? "home"}`,
        type: "admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, image });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to create site image" },
      { status: 500 }
    );
  }
}

// PATCH /api/site-images — update an existing site image (admin only)
// Body: { id, ...fields to update }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Image id is required." }, { status: 400 });
    }

    // Build the update payload from allowed fields
    const data: any = {};
    const allowedFields = ["key", "src", "alt", "caption", "description", "accent", "category", "sortOrder", "isActive"];
    for (const field of allowedFields) {
      if (field in updates) {
        const val = updates[field];
        if (field === "alt") data.alt = String(val).slice(0, 500);
        else if (field === "caption") data.caption = val ? String(val).slice(0, 200) : null;
        else if (field === "description") data.description = val ? String(val).slice(0, 500) : null;
        else if (field === "sortOrder") data.sortOrder = typeof val === "number" ? val : parseInt(val, 10) || 0;
        else if (field === "isActive") data.isActive = Boolean(val);
        else data[field] = String(val);
      }
    }

    // Check for duplicate key if key is being updated
    if (data.key) {
      const existing = await db.siteImage.findUnique({ where: { key: data.key } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ ok: false, error: `An image with key "${data.key}" already exists.` }, { status: 409 });
      }
    }

    const image = await db.siteImage.update({
      where: { id },
      data,
    });

    // Audit log
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Updated site image: ${image.key}`,
        target: `ID: ${image.id}`,
        type: "admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true, image });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to update site image" },
      { status: 500 }
    );
  }
}

// DELETE /api/site-images?id=... — delete a site image (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ ok: false, error: "Admins only" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Image id is required." }, { status: 400 });
    }

    const image = await db.siteImage.delete({ where: { id } });

    // Audit log
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    await db.auditLog.create({
      data: {
        userId: user?.id,
        action: `Deleted site image: ${image.key}`,
        target: `ID: ${id}`,
        type: "admin",
        status: "success",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to delete site image" },
      { status: 500 }
    );
  }
}
