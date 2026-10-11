import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import {
  canTransitionTo,
  sendNotification,
  audit,
  getStepFromStatus,
  PIPELINE_STEPS,
} from "@/lib/recruitment";

// GET /api/applications — list applications
// - For seekers: their own applications (with job details + pipeline progress)
// - For employers: applications to their jobs (with candidate details + pipeline progress)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  if (user.role === "seeker") {
    const applications = await db.application.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
    });
    // Attach computed step number for the UI
    const withStep = applications.map((a) => ({
      ...a,
      currentStep: getStepFromStatus(a.status, a.rejectionStage),
    }));
    return NextResponse.json({ ok: true, applications: withStep, pipelineSteps: PIPELINE_STEPS });
  }

  if (user.role === "employer") {
    const jobs = await db.job.findMany({
      where: { employerId: user.id },
      include: {
        applications: {
          include: {
            user: { select: { id: true, name: true, email: true, title: true, avatarColor: true, initials: true, location: true } },
          },
        },
        examSchedules: { orderBy: { scheduledAt: "asc" } },
        interviewSchedules: { orderBy: { scheduledAt: "asc" } },
      },
    });
    const applications: any[] = [];
    for (const job of jobs) {
      for (const app of job.applications) {
        applications.push({
          id: app.id,
          status: app.status,
          matchScore: app.matchScore,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt,
          coverLetter: app.coverLetter,
          currentStep: getStepFromStatus(app.status, app.rejectionStage),
          // Pipeline fields
          reviewedAt: app.reviewedAt,
          reviewPassed: app.reviewPassed,
          reviewNotes: app.reviewNotes,
          examNotifiedAt: app.examNotifiedAt,
          examCompletedAt: app.examCompletedAt,
          examScore: app.examScore,
          examPassed: app.examPassed,
          examNotes: app.examNotes,
          interviewNotifiedAt: app.interviewNotifiedAt,
          interviewCompletedAt: app.interviewCompletedAt,
          oralScore: app.oralScore,
          practicalScore: app.practicalScore,
          interviewOverallScore: app.interviewOverallScore,
          interviewPassed: app.interviewPassed,
          interviewNotes: app.interviewNotes,
          selectedAt: app.selectedAt,
          selectionNotes: app.selectionNotes,
          hiredAt: app.hiredAt,
          jobAssignment: app.jobAssignment,
          finalCallNotes: app.finalCallNotes,
          rejectedAt: app.rejectedAt,
          rejectionStage: app.rejectionStage,
          rejectionReason: app.rejectionReason,
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            companyLogo: job.companyLogo,
            location: job.location,
          },
          candidate: app.user,
          examSchedule: job.examSchedules[0] ?? null,
          interviewSchedule: job.interviewSchedules[0] ?? null,
        });
      }
    }
    return NextResponse.json({ ok: true, applications, pipelineSteps: PIPELINE_STEPS });
  }

  return NextResponse.json({ ok: false, error: "Not supported for this role" }, { status: 403 });
}

// POST /api/applications — seeker applies to a job (Step 1)
// Requires a professional application letter (coverLetter)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "seeker") return NextResponse.json({ ok: false, error: "Seekers only" }, { status: 403 });
  try {
    const { jobId, matchScore, coverLetter } = await req.json();
    if (!jobId) return NextResponse.json({ ok: false, error: "Job ID is required." }, { status: 400 });
    if (!coverLetter || !coverLetter.trim()) {
      return NextResponse.json({ ok: false, error: "A professional application letter is required to apply." }, { status: 400 });
    }
    if (coverLetter.trim().length < 50) {
      return NextResponse.json({ ok: false, error: "Your application letter must be at least 50 characters." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // CV requirement: seeker must have uploaded a CV before applying
    const hasResume = await db.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!hasResume) {
      return NextResponse.json({
        ok: false,
        error: "You must upload your CV before applying for jobs. Please go to Resume & AI Analysis to upload your CV.",
      }, { status: 400 });
    }

    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    if (job.status !== "published") return NextResponse.json({ ok: false, error: "This job is no longer accepting applications." }, { status: 400 });

    // Check for duplicate
    const existing = await db.application.findFirst({ where: { userId: user.id, jobId } });
    if (existing) return NextResponse.json({ ok: false, error: "You've already applied to this job." }, { status: 409 });

    // Step 1: Application submitted with cover letter
    const application = await db.application.create({
      data: {
        userId: user.id,
        jobId,
        status: "applied",
        matchScore: matchScore || null,
        coverLetter: coverLetter.trim(),
      },
    });

    // Notify the employer
    await sendNotification(
      job.employerId,
      "application",
      "New application received",
      `${user.name} applied to ${job.title} with a cover letter.`
    );

    // Confirm to the seeker
    await sendNotification(
      user.id,
      "application",
      "Application submitted",
      `Your application to "${job.title}" at ${job.company} has been submitted successfully. The employer will review it and notify you of the next steps.`
    );

    await audit(user.id, "Applied to", `${job.title} @ ${job.company}`, "application", "success");

    return NextResponse.json({ ok: true, application });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// PATCH /api/applications — Step transitions (employer advances/rejects; seeker withdraws)
// Body: { applicationId, action, ...payload }
//   action: "review" | "exam_complete" | "interview_complete" | "select" | "hire" | "reject" | "withdraw"
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { applicationId, action } = body;
    if (!applicationId || !action) {
      return NextResponse.json({ ok: false, error: "applicationId and action are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });

    // Authorization
    const isEmployerOwner = user.role === "employer" && application.job.employerId === user.id;
    const isAdmin = user.role === "admin";
    const isSeekerOwner = user.role === "seeker" && application.userId === user.id;
    if (!isEmployerOwner && !isAdmin && !isSeekerOwner) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    const jobTitle = application.job.title;
    const jobCompany = application.job.company;
    const candidateName = (await db.user.findUnique({ where: { id: application.userId }, select: { name: true } }))?.name ?? "Candidate";

    // ============================================================
    // ACTION: WITHDRAW (seeker only)
    // ============================================================
    if (action === "withdraw") {
      if (!isSeekerOwner) {
        return NextResponse.json({ ok: false, error: "Only the applicant can withdraw." }, { status: 403 });
      }
      if (application.status === "hired") {
        return NextResponse.json({ ok: false, error: "Cannot withdraw after being hired." }, { status: 400 });
      }
      const updated = await db.application.update({
        where: { id: applicationId },
        data: { status: "rejected", rejectionStage: String(getStepFromStatus(application.status, application.rejectionStage)), rejectionReason: "Withdrawn by candidate", rejectedAt: new Date() },
      });
      await sendNotification(application.job.employerId, "application", "Application withdrawn", `${candidateName} withdrew their application to ${jobTitle}.`);
      await audit(user.id, "Withdrew application", jobTitle, "application", "warning");
      return NextResponse.json({ ok: true, application: updated });
    }

    // ============================================================
    // ACTION: REJECT (employer/admin only, at any stage)
    // ============================================================
    if (action === "reject") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can reject applications." }, { status: 403 });
      }
      if (application.status === "rejected") {
        return NextResponse.json({ ok: false, error: "Application is already rejected." }, { status: 400 });
      }
      const reason = body.reason?.trim() || "Not specified";
      const currentStep = getStepFromStatus(application.status, application.rejectionStage);

      const updated = await db.application.update({
        where: { id: applicationId },
        data: {
          status: "rejected",
          rejectionStage: String(currentStep),
          rejectionReason: reason,
          rejectedAt: new Date(),
        },
      });

      // Send the appropriate rejection notification based on the stage
      let rejectionMessage: string;
      if (currentStep <= 2) {
        rejectionMessage = `Thank you for your application to "${jobTitle}" at ${jobCompany}. Unfortunately, your application was not selected at this stage. We appreciate your interest and encourage you to apply for future opportunities.`;
      } else if (currentStep <= 4) {
        rejectionMessage = `Thank you for participating in the written examination for "${jobTitle}" at ${jobCompany}. Unfortunately, you did not pass the written exam at this stage. We appreciate your effort and encourage you to apply for future opportunities.`;
      } else {
        rejectionMessage = `Thank you for completing the interview for "${jobTitle}" at ${jobCompany}. Unfortunately, you were not selected at this stage. We appreciate your time and the effort you put into the process.`;
      }

      await sendNotification(
        application.userId,
        "application",
        "Application update",
        rejectionMessage
      );
      await audit(user.id, `Rejected application (step ${currentStep})`, jobTitle, "application", "warning");
      return NextResponse.json({ ok: true, application: updated });
    }

    // ============================================================
    // ACTION: REVIEW (Step 2) — employer reviews application
    // Body: { passed: boolean, notes?: string }
    // ============================================================
    if (action === "review") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can review applications." }, { status: 403 });
      }
      const passed = Boolean(body.passed);
      const notes = body.notes?.trim() || null;

      // Must be in "applied" state to start review, or already "reviewing"
      if (application.status !== "applied" && application.status !== "reviewing") {
        return NextResponse.json({
          ok: false,
          error: `Cannot review: application is at status "${application.status}". It must be at "applied" to start review.`,
        }, { status: 400 });
      }

      let newStatus: string;
      if (application.status === "applied") {
        // First: move to "reviewing"
        newStatus = "reviewing";
      } else {
        // Already reviewing → decide pass/fail
        newStatus = passed ? "review_passed" : "reviewing";
      }

      if (application.status === "reviewing" && passed) {
        // Pass review → move to review_passed
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "review_passed",
            reviewedAt: new Date(),
            reviewPassed: true,
            reviewNotes: notes,
          },
        });
        await sendNotification(
          application.userId,
          "application",
          "Application selected! 🎉",
          `Congratulations! Your application for "${jobTitle}" at ${jobCompany} has been selected. Please prepare for the next stage of the recruitment process — the written examination. You will receive a notification with the exam date and time soon.`
        );
        await audit(user.id, "Passed application review", jobTitle, "application", "success");
        return NextResponse.json({ ok: true, application: updated });
      } else if (application.status === "applied") {
        // Move to reviewing
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "reviewing",
            reviewNotes: notes,
          },
        });
        return NextResponse.json({ ok: true, application: updated });
      } else {
        return NextResponse.json({ ok: false, error: "Invalid review state." }, { status: 400 });
      }
    }

    // ============================================================
    // ACTION: EXAM_COMPLETE (Step 4) — employer enters exam score
    // Body: { score: number, passed: boolean, notes?: string }
    // ============================================================
    if (action === "exam_complete") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can enter exam results." }, { status: 403 });
      }
      const score = parseInt(body.score, 10);
      const passed = Boolean(body.passed);
      const notes = body.notes?.trim() || null;
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json({ ok: false, error: "Exam score must be a number between 0 and 100." }, { status: 400 });
      }

      // Must be in exam_notified or exam_completed to enter results
      const check = canTransitionTo(application.status, "exam_completed");
      if (application.status !== "exam_completed" && !check.ok) {
        return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
      }

      if (passed) {
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "exam_passed",
            examCompletedAt: new Date(),
            examScore: score,
            examPassed: true,
            examNotes: notes,
          },
        });
        await sendNotification(
          application.userId,
          "application",
          "Written exam passed! 🎉",
          `Congratulations! You have passed the written examination for "${jobTitle}" at ${jobCompany}. Your score: ${score}/100. Please prepare for the next interview stage. You will receive a notification with the interview date and time soon.`
        );
        await audit(user.id, `Passed exam (score ${score})`, jobTitle, "application", "success");
        return NextResponse.json({ ok: true, application: updated });
      } else {
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "rejected",
            rejectionStage: "4",
            rejectionReason: `Did not pass written exam (score: ${score}/100)`,
            examCompletedAt: new Date(),
            examScore: score,
            examPassed: false,
            examNotes: notes,
            rejectedAt: new Date(),
          },
        });
        await sendNotification(
          application.userId,
          "application",
          "Written exam result",
          `Thank you for taking the written examination for "${jobTitle}" at ${jobCompany}. Unfortunately, you did not pass the written exam at this stage (score: ${score}/100). We appreciate your effort and encourage you to apply for future opportunities.`
        );
        await audit(user.id, `Failed exam (score ${score})`, jobTitle, "application", "warning");
        return NextResponse.json({ ok: true, application: updated });
      }
    }

    // ============================================================
    // ACTION: INTERVIEW_COMPLETE (Step 5) — employer enters oral + practical scores
    // Body: { oralScore: number, practicalScore: number, passed: boolean, notes?: string }
    // ============================================================
    if (action === "interview_complete") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can enter interview results." }, { status: 403 });
      }
      const oralScore = parseInt(body.oralScore, 10);
      const practicalScore = parseInt(body.practicalScore, 10);
      const passed = Boolean(body.passed);
      const notes = body.notes?.trim() || null;
      if (isNaN(oralScore) || oralScore < 0 || oralScore > 100) {
        return NextResponse.json({ ok: false, error: "Oral interview score must be between 0 and 100." }, { status: 400 });
      }
      if (isNaN(practicalScore) || practicalScore < 0 || practicalScore > 100) {
        return NextResponse.json({ ok: false, error: "Practical test score must be between 0 and 100." }, { status: 400 });
      }
      const overall = Math.round((oralScore + practicalScore) / 2);

      const check = canTransitionTo(application.status, "interview_completed");
      if (application.status !== "interview_completed" && !check.ok) {
        return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
      }

      if (passed) {
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "interview_passed",
            interviewCompletedAt: new Date(),
            oralScore,
            practicalScore,
            interviewOverallScore: overall,
            interviewPassed: true,
            interviewNotes: notes,
          },
        });
        await sendNotification(
          application.userId,
          "application",
          "Interview passed! 🎉",
          `Congratulations! You have successfully passed the interview (oral + practical) for "${jobTitle}" at ${jobCompany}. Oral score: ${oralScore}/100, Practical score: ${practicalScore}/100, Overall: ${overall}/100. The employer will now make their final selection. You will be notified of the outcome soon.`
        );
        await audit(user.id, `Passed interview (overall ${overall})`, jobTitle, "application", "success");
        return NextResponse.json({ ok: true, application: updated });
      } else {
        const updated = await db.application.update({
          where: { id: applicationId },
          data: {
            status: "rejected",
            rejectionStage: "5",
            rejectionReason: `Did not pass interview (oral: ${oralScore}, practical: ${practicalScore}, overall: ${overall})`,
            interviewCompletedAt: new Date(),
            oralScore,
            practicalScore,
            interviewOverallScore: overall,
            interviewPassed: false,
            interviewNotes: notes,
            rejectedAt: new Date(),
          },
        });
        await sendNotification(
          application.userId,
          "application",
          "Interview result",
          `Thank you for completing the interview for "${jobTitle}" at ${jobCompany}. Unfortunately, you were not selected at this stage. We appreciate your time and the effort you put into the process.`
        );
        await audit(user.id, `Failed interview (overall ${overall})`, jobTitle, "application", "warning");
        return NextResponse.json({ ok: true, application: updated });
      }
    }

    // ============================================================
    // ACTION: SELECT (Step 6) — employer makes final selection
    // Body: { notes?: string }
    // ============================================================
    if (action === "select") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can make the final selection." }, { status: 403 });
      }
      const notes = body.notes?.trim() || null;
      const check = canTransitionTo(application.status, "selected");
      if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400 });

      const updated = await db.application.update({
        where: { id: applicationId },
        data: {
          status: "selected",
          selectedAt: new Date(),
          selectionNotes: notes,
        },
      });

      await sendNotification(
        application.userId,
        "application",
        "Congratulations! You have been selected! 🎉",
        `Congratulations! You have successfully completed the recruitment process for "${jobTitle}" at ${jobCompany}. We are pleased to inform you that you have been selected for this position and are now officially joining our workplace. The employer will contact you by phone shortly with your job assignment details, responsibilities, work location, and starting date.`
      );
      await audit(user.id, "Selected candidate", jobTitle, "application", "success");
      return NextResponse.json({ ok: true, application: updated });
    }

    // ============================================================
    // ACTION: HIRE (Step 7) — employer finalizes with job assignment details
    // Body: { jobAssignment: string, notes?: string }
    // ============================================================
    if (action === "hire") {
      if (!isEmployerOwner && !isAdmin) {
        return NextResponse.json({ ok: false, error: "Only the employer can finalize hiring." }, { status: 403 });
      }
      const jobAssignment = body.jobAssignment?.trim();
      const notes = body.notes?.trim() || null;
      if (!jobAssignment) {
        return NextResponse.json({ ok: false, error: "Job assignment details (responsibilities, work location, starting date) are required." }, { status: 400 });
      }
      const check = canTransitionTo(application.status, "hired");
      if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400 });

      const updated = await db.application.update({
        where: { id: applicationId },
        data: {
          status: "hired",
          hiredAt: new Date(),
          jobAssignment,
          finalCallNotes: notes,
        },
      });

      await sendNotification(
        application.userId,
        "application",
        "Welcome to the team! 🎉",
        `Congratulations! You have successfully completed the entire recruitment process for "${jobTitle}" at ${jobCompany}. You are now officially hired! Here are your job assignment details:\n\n${jobAssignment}\n\nWelcome aboard — we look forward to working with you!`
      );
      await audit(user.id, "Hired candidate", jobTitle, "application", "success");
      return NextResponse.json({ ok: true, application: updated });
    }

    return NextResponse.json({ ok: false, error: `Unknown action "${action}".` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
