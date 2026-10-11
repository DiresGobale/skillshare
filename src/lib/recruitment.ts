import { db } from "@/lib/db";

// ============================================================
// 7-STEP RECRUITMENT PIPELINE
// ============================================================
// Step 1: Job Application        → status: "applied"
// Step 2: Application Review     → status: "reviewing" → "review_passed" (or "rejected")
// Step 3: Written Exam Notif.    → status: "exam_notified"
// Step 4: Written Examination    → status: "exam_completed" → "exam_passed" (or "rejected")
// Step 5: Interview Stage        → status: "interview_notified" → "interview_completed" → "interview_passed" (or "rejected")
// Step 6: Final Selection        → status: "selected"
// Step 7: Final Call & Assign.   → status: "hired"
// Rejected at any stage          → status: "rejected"

export const PIPELINE_STEPS = [
  { step: 1, name: "Job Application", status: "applied", description: "Candidate submits a professional application letter" },
  { step: 2, name: "Application Review", status: "reviewing", description: "Employer reviews the application and decides" },
  { step: 3, name: "Written Exam Notification", status: "exam_notified", description: "Eligible candidates are notified of the exam date and time" },
  { step: 4, name: "Written Examination", status: "exam_completed", description: "Candidates take the written exam; results are evaluated" },
  { step: 5, name: "Interview Stage", status: "interview_notified", description: "Oral interview + practical test; candidates are notified of the schedule" },
  { step: 6, name: "Final Selection", status: "selected", description: "Employer selects the best candidates based on overall results" },
  { step: 7, name: "Final Call & Job Assignment", status: "hired", description: "Employer contacts successful candidates with job details" },
] as const;

// Map each status to its step number (1-7). Rejected inherits the step at which rejection happened.
export const STATUS_TO_STEP: Record<string, number> = {
  applied: 1,
  reviewing: 2,
  review_passed: 2,
  exam_notified: 3,
  exam_completed: 4,
  exam_passed: 4,
  interview_notified: 5,
  interview_completed: 5,
  interview_passed: 5,
  selected: 6,
  hired: 7,
  rejected: 0, // rejectionStage field holds the actual step
};

// Strict ordering: which status must come BEFORE the target status.
// A candidate cannot jump to a status without having passed the prerequisite.
export const STATUS_PREREQUISITES: Record<string, string[]> = {
  reviewing:            ["applied"],
  review_passed:        ["reviewing"],
  exam_notified:        ["review_passed"],
  exam_completed:       ["exam_notified"],
  exam_passed:          ["exam_completed"],
  interview_notified:   ["exam_passed"],
  interview_completed:  ["interview_notified"],
  interview_passed:     ["interview_completed"],
  selected:             ["interview_passed"],
  hired:                ["selected"],
};

// The "happy path" forward status from each status.
export const NEXT_STATUS: Record<string, string> = {
  applied:             "reviewing",
  reviewing:           "review_passed",
  review_passed:       "exam_notified",
  exam_notified:       "exam_completed",
  exam_completed:      "exam_passed",
  exam_passed:         "interview_notified",
  interview_notified:  "interview_completed",
  interview_completed: "interview_passed",
  interview_passed:    "selected",
  selected:            "hired",
};

export function getStepFromStatus(status: string, rejectionStage?: string | null): number {
  if (status === "rejected" && rejectionStage) {
    return parseInt(rejectionStage, 10) || 0;
  }
  return STATUS_TO_STEP[status] ?? 0;
}

export function getStepName(step: number): string {
  return PIPELINE_STEPS.find((s) => s.step === step)?.name ?? `Step ${step}`;
}

// Validate that the current status allows transitioning to the target status.
export function canTransitionTo(currentStatus: string, targetStatus: string): { ok: boolean; error?: string } {
  if (currentStatus === "rejected") {
    return { ok: false, error: "This application has already been rejected and cannot advance." };
  }
  if (currentStatus === "hired") {
    return { ok: false, error: "This candidate has already been hired." };
  }
  if (currentStatus === targetStatus) {
    return { ok: false, error: `Application is already at status "${targetStatus}".` };
  }
  const prereqs = STATUS_PREREQUISITES[targetStatus];
  if (!prereqs) {
    return { ok: false, error: `Unknown target status "${targetStatus}".` };
  }
  if (!prereqs.includes(currentStatus)) {
    return {
      ok: false,
      error: `Cannot move to "${targetStatus}" from "${currentStatus}". The candidate must pass the previous step first. Required prerequisite(s): ${prereqs.join(", ")}.`,
    };
  }
  return { ok: true };
}

// Send a notification to a user. Returns void; errors are swallowed (non-fatal).
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await db.notification.create({
      data: { userId, type, title, message, read: false },
    });
  } catch {
    // Non-fatal: don't fail the API call if notification creation fails.
  }
}

// Send a notification to many users (bulk).
export async function sendNotifications(
  userIds: string[],
  type: string,
  title: string,
  message: string
): Promise<void> {
  if (userIds.length === 0) return;
  try {
    await db.notification.createMany({
      data: userIds.map((uid) => ({ userId: uid, type, title, message, read: false })),
    });
  } catch {
    // Non-fatal.
  }
}

// Record an audit log entry.
export async function audit(
  userId: string | undefined,
  action: string,
  target: string,
  type: string = "application",
  status: string = "success"
): Promise<void> {
  try {
    await db.auditLog.create({
      data: { userId, action, target, type, status },
    });
  } catch {
    // Non-fatal.
  }
}
