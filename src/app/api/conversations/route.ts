import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";

// GET /api/conversations — list all conversations for the current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // Find all conversations where the user is either participant
  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    include: {
      user1: { select: { id: true, name: true, email: true, title: true, avatarColor: true, initials: true, role: true } },
      user2: { select: { id: true, name: true, email: true, title: true, avatarColor: true, initials: true, role: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Format: return the other participant's info + last message + unread count
  const result = await Promise.all(conversations.map(async (c) => {
    const isUser1 = c.user1Id === user.id;
    const other = isUser1 ? c.user2 : c.user1;
    const lastMessage = c.messages[0];
    // Count unread messages from the other participant
    const unreadCount = await db.message.count({
      where: {
        conversationId: c.id,
        senderId: { not: user.id },
        read: false,
      },
    });
    return {
      id: c.id,
      participantId: other.id,
      participantName: other.name,
      participantInitials: other.initials ?? other.name?.slice(0, 2).toUpperCase() ?? "?",
      participantColor: other.avatarColor ?? "oklch(0.55 0.22 285)",
      participantRole: other.title ?? "",
      lastMessage: lastMessage?.content ?? "",
      lastTime: lastMessage ? timeAgo(lastMessage.createdAt) : "",
      unread: unreadCount,
      jobId: c.jobId,
    };
  }));

  return NextResponse.json({ ok: true, conversations: result });
}

// Helper: human-readable time ago
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

// POST /api/conversations — start a new conversation (or return existing one)
// Body: { participantId, jobId? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  try {
    const { participantId, jobId } = await req.json();
    if (!participantId) return NextResponse.json({ ok: false, error: "Participant ID is required." }, { status: 400 });

    // Ensure the participant exists
    const participant = await db.user.findUnique({ where: { id: participantId } });
    if (!participant) return NextResponse.json({ ok: false, error: "Participant not found." }, { status: 404 });

    // Normalize: user1Id is always the lexicographically smaller ID to maintain the unique constraint
    const user1Id = user.id < participantId ? user.id : participantId;
    const user2Id = user.id < participantId ? participantId : user.id;

    // Find or create the conversation
    const conversation = await db.conversation.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      create: { user1Id, user2Id, jobId: jobId || null },
      update: {},
    });

    return NextResponse.json({ ok: true, conversationId: conversation.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
