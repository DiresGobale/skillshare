import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/messages?conversationId=... — list messages in a conversation
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ ok: false, error: "conversationId is required" }, { status: 400 });

  // Verify the user is a participant in this conversation
  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || (conversation.user1Id !== user.id && conversation.user2Id !== user.id)) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "50", 10)));

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.message.count({ where: { conversationId } }),
  ]);

  // Mark messages from the other participant as read
  await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, read: false },
    data: { read: true },
  });

  const totalPages = Math.ceil(total / pageSize);
  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.senderId === user.id ? "me" : "them",
      text: m.content,
      time: timeAgo(m.createdAt),
      read: m.read,
    })),
    pagination: { page, pageSize, total, totalPages },
  });
}

// POST /api/messages — send a message
// Body: { conversationId, content }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  try {
    const { conversationId, content } = await req.json();
    if (!conversationId) return NextResponse.json({ ok: false, error: "conversationId is required." }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ ok: false, error: "Message content is required." }, { status: 400 });

    // Verify the user is a participant
    const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || (conversation.user1Id !== user.id && conversation.user2Id !== user.id)) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim(),
      },
    });

    // Update the conversation's lastMessageAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Notify the other participant
    const otherUserId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
    const otherUser = await db.user.findUnique({ where: { id: otherUserId } });
    if (otherUser) {
      try {
        await db.notification.create({
          data: {
            userId: otherUserId,
            type: "message",
            title: `New message from ${user.name}`,
            message: content.trim().slice(0, 100),
            read: false,
          },
        });
        // Send email notification
        try {
          const { sendNewMessageEmail } = await import("@/lib/email");
          await sendNewMessageEmail(otherUser.email, otherUser.name, user.name, content.trim().slice(0, 200));
        } catch { /* non-fatal */ }
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        sender: "me",
        text: message.content,
        time: "now",
        read: true,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
