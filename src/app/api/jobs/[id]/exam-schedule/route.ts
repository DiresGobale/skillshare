import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { sendNotifications, audit, canTransitionTo } from "@/lib/recruitment";

// POST /api/jobs/[jobId]/exam-schedule — employer schedules the written exam (Step 3)
// This notifies ALL candidates who passed the application review (status = "review_passed")
// with the exam date, time, location, and instructions.
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
      return NextResponse.json({ ok: false, error: "Exam date and time are required." }, { status: 400 });
    }
    const examDate = new Date(scheduledAt);
    if (isNaN(examDate.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid exam date." }, { status: 400 });
    }
    if (examDate.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "Exam date cannot be in the past." }, { status: 400 });
    }

    // Create or update the exam schedule for this job (one active schedule per job)
    const existing = await db.examSchedule.findFirst({ where: { jobId } });
    let schedule;
    if (existing) {
      schedule = await db.examSchedule.update({
        where: { id: existing.id },
        data: {
          scheduledAt: examDate,
          duration: parseInt(duration, 10) || 60,
          location: location || "Online",
          format: format || "written",
          instructions: instructions || null,
        },
      });
    } else {
      schedule = await db.examSchedule.create({
        data: {
          jobId,
          scheduledAt: examDate,
          duration: parseInt(duration, 10) || 60,
          location: location || "Online",
          format: format || "written",
          instructions: instructions || null,
        },
      });
    }

    // Find all candidates who passed the application review (status = "review_passed")
    // and move them to "exam_notified"
    const eligible = await db.application.findMany({
      where: { jobId, status: "review_passed" },
      select: { id: true, userId: true },
    });

    const examDateStr = examDate.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `Congratulations! You have been selected to take the written examination for "${job.title}" at ${job.company}.\n\nExam details:\n• Date & Time: ${examDateStr}\n• Duration: ${schedule.duration} minutes\n• Location: ${schedule.location}\n• Format: ${schedule.format}${instructions ? `\n• Instructions: ${instructions}` : ""}\n\nPlease prepare accordingly. Good luck!`;

    // Update all eligible candidates to "exam_notified" and send notifications
    if (eligible.length > 0) {
      await db.application.updateMany({
        where: { id: { in: eligible.map((e) => e.id) } },
        data: { status: "exam_notified", examNotifiedAt: new Date() },
      });
      await sendNotifications(
        eligible.map((e) => e.userId),
        "interview",
        "Written exam notification 📝",
        message
      );
    }

    await audit(user.id, `Scheduled exam for ${job.title} (${eligible.length} candidates notified)`, job.title, "application", "success");

    return NextResponse.json({
      ok: true,
      schedule,
      notifiedCount: eligible.length,
      message: eligible.length > 0
        ? `Exam scheduled. ${eligible.length} candidate(s) notified.`
        : "Exam schedule saved. No candidates are currently eligible (no one has passed the application review yet).",
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// GET /api/jobs/[jobId]/exam-schedule — fetch the exam schedule for a job
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const schedule = await db.examSchedule.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, schedule });
}
