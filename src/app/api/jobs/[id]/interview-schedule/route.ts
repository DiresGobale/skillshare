import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { sendNotifications, audit } from "@/lib/recruitment";

// POST /api/jobs/[jobId]/interview-schedule — employer schedules the interview (Step 5)
// This notifies ALL candidates who passed the written exam (status = "exam_passed")
// with the interview date, time, location, and instructions.
// The interview has two components: oral interview + practical test.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "employer" && session.user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Employers only" }, { status: 403 });
  }

  const { id: jobId } = await params;
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
  if (user.role === "employer" && job.employerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { scheduledAt, duration, location, format, instructions } = body;

    if (!scheduledAt) {
      return NextResponse.json({ ok: false, error: "Interview date and time are required." }, { status: 400 });
    }
    const interviewDate = new Date(scheduledAt);
    if (isNaN(interviewDate.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid interview date." }, { status: 400 });
    }
    if (interviewDate.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "Interview date cannot be in the past." }, { status: 400 });
    }

    // Create or update the interview schedule
    const existing = await db.interviewSchedule.findFirst({ where: { jobId } });
    let schedule;
    if (existing) {
      schedule = await db.interviewSchedule.update({
        where: { id: existing.id },
        data: {
          scheduledAt: interviewDate,
          duration: parseInt(duration, 10) || 60,
          location: location || "Online",
          format: format || "both",
          instructions: instructions || null,
        },
      });
    } else {
      schedule = await db.interviewSchedule.create({
        data: {
          jobId,
          scheduledAt: interviewDate,
          duration: parseInt(duration, 10) || 60,
          location: location || "Online",
          format: format || "both",
          instructions: instructions || null,
        },
      });
    }

    // Find all candidates who passed the written exam (status = "exam_passed")
    // and move them to "interview_notified"
    const eligible = await db.application.findMany({
      where: { jobId, status: "exam_passed" },
      select: { id: true, userId: true },
    });

    const interviewDateStr = interviewDate.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formatLabel = schedule.format === "oral" ? "Oral interview" : schedule.format === "practical" ? "Practical test" : "Oral interview + Practical test";

    const message = `Congratulations on passing the written examination! You have been selected for the interview stage for "${job.title}" at ${job.company}.\n\nInterview details:\n• Date & Time: ${interviewDateStr}\n• Duration: ${schedule.duration} minutes\n• Location: ${schedule.location}\n• Format: ${formatLabel}${instructions ? `\n• Instructions: ${instructions}` : ""}\n\nThe interview will include ${formatLabel.toLowerCase()}. Please prepare accordingly. Good luck!`;

    if (eligible.length > 0) {
      await db.application.updateMany({
        where: { id: { in: eligible.map((e) => e.id) } },
        data: { status: "interview_notified", interviewNotifiedAt: new Date() },
      });
      await sendNotifications(
        eligible.map((e) => e.userId),
        "interview",
        "Interview scheduled 📅",
        message
      );
    }

    await audit(user.id, `Scheduled interview for ${job.title} (${eligible.length} candidates notified)`, job.title, "application", "success");

    return NextResponse.json({
      ok: true,
      schedule,
      notifiedCount: eligible.length,
      message: eligible.length > 0
        ? `Interview scheduled. ${eligible.length} candidate(s) notified.`
        : "Interview schedule saved. No candidates are currently eligible (no one has passed the written exam yet).",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// GET /api/jobs/[jobId]/interview-schedule — fetch the interview schedule for a job
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const schedule = await db.interviewSchedule.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, schedule });
}
