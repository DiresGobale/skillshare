"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  ClipboardCheck,
  Mail,
  PenSquare,
  Users,
  Trophy,
  PhoneCall,
  Check,
  X,
  Clock,
} from "lucide-react";

// ============================================================
// 7-STEP RECRUITMENT PIPELINE VISUAL COMPONENT
// ============================================================
// Shows the 7-step recruitment process as a horizontal (desktop)
// or vertical (mobile) progress bar with the current step highlighted.

export interface PipelineStepInfo {
  step: number;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const RECRUITMENT_STEPS: PipelineStepInfo[] = [
  { step: 1, name: "Application", description: "Candidate submits application letter", icon: <FileText className="h-4 w-4" /> },
  { step: 2, name: "Review", description: "Employer reviews application", icon: <ClipboardCheck className="h-4 w-4" /> },
  { step: 3, name: "Exam Notification", description: "Exam date & time sent to candidate", icon: <Mail className="h-4 w-4" /> },
  { step: 4, name: "Written Exam", description: "Candidate takes written exam", icon: <PenSquare className="h-4 w-4" /> },
  { step: 5, name: "Interview", description: "Oral + practical interview", icon: <Users className="h-4 w-4" /> },
  { step: 6, name: "Final Selection", description: "Employer selects best candidates", icon: <Trophy className="h-4 w-4" /> },
  { step: 7, name: "Job Assignment", description: "Phone call & job details", icon: <PhoneCall className="h-4 w-4" /> },
];

interface RecruitmentPipelineProps {
  currentStep: number;        // 1-7 (0 = rejected before step 1)
  rejected?: boolean;
  rejectionStage?: number;    // which step they were rejected at
  rejectionReason?: string | null;
  scores?: {
    examScore?: number | null;
    oralScore?: number | null;
    practicalScore?: number | null;
    interviewOverallScore?: number | null;
  };
  dates?: {
    appliedAt?: string | null;
    reviewedAt?: string | null;
    examNotifiedAt?: string | null;
    examCompletedAt?: string | null;
    interviewNotifiedAt?: string | null;
    interviewCompletedAt?: string | null;
    selectedAt?: string | null;
    hiredAt?: string | null;
  };
  compact?: boolean;          // smaller version for cards
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function RecruitmentPipeline({
  currentStep,
  rejected = false,
  rejectionStage,
  rejectionReason,
  scores,
  dates,
  compact = false,
}: RecruitmentPipelineProps) {
  const activeStep = rejected ? (rejectionStage ?? currentStep) : currentStep;

  return (
    <div className={cn("w-full", compact ? "space-y-2" : "space-y-4")}>
      {/* Progress bar — horizontal on desktop, vertical on mobile */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((activeStep - 1) / 6) * 100}%` }}
          />
          {/* Steps */}
          <div className="relative flex justify-between">
            {RECRUITMENT_STEPS.map((s) => {
              const isComplete = !rejected && s.step < currentStep;
              const isCurrent = !rejected && s.step === currentStep;
              const isRejected = rejected && s.step === (rejectionStage ?? currentStep);
              const isFuture = !rejected && s.step > currentStep;

              return (
                <div key={s.step} className="flex flex-col items-center" style={{ width: "14.28%" }}>
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full border-2 transition-all",
                      compact ? "h-8 w-8" : "h-10 w-10",
                      isComplete && "border-emerald-500 bg-emerald-500 text-white",
                      isCurrent && "border-violet-500 bg-violet-500 text-white ring-4 ring-violet-500/20 animate-pulse",
                      isRejected && "border-rose-500 bg-rose-500 text-white",
                      isFuture && "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <Check className={compact ? "h-4 w-4" : "h-5 w-5"} />
                    ) : isRejected ? (
                      <X className={compact ? "h-4 w-4" : "h-5 w-5"} />
                    ) : (
                      s.icon
                    )}
                  </div>
                  {!compact && (
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        isComplete && "text-emerald-600",
                        isCurrent && "text-violet-600",
                        isRejected && "text-rose-600",
                        isFuture && "text-muted-foreground"
                      )}>
                        Step {s.step}
                      </p>
                      <p className={cn(
                        "mt-0.5 text-xs font-medium",
                        (isComplete || isCurrent) ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s.name}
                      </p>
                    </div>
                  )}
                  {compact && (
                    <p className={cn(
                      "mt-1 text-[9px] font-medium",
                      isComplete ? "text-emerald-600" : isCurrent ? "text-violet-600" : isRejected ? "text-rose-600" : "text-muted-foreground"
                    )}>
                      {s.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile vertical layout */}
      <div className="md:hidden">
        <div className="space-y-3">
          {RECRUITMENT_STEPS.map((s) => {
            const isComplete = !rejected && s.step < currentStep;
            const isCurrent = !rejected && s.step === currentStep;
            const isRejected = rejected && s.step === (rejectionStage ?? currentStep);
            const isFuture = !rejected && s.step > currentStep;

            return (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    compact ? "h-7 w-7" : "h-9 w-9",
                    isComplete && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-violet-500 bg-violet-500 text-white",
                    isRejected && "border-rose-500 bg-rose-500 text-white",
                    isFuture && "border-border bg-card text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : isRejected ? <X className="h-4 w-4" /> : s.icon}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-xs font-semibold",
                      isComplete && "text-emerald-600",
                      isCurrent && "text-violet-600",
                      isRejected && "text-rose-600",
                      isFuture && "text-muted-foreground"
                    )}>
                      Step {s.step}: {s.name}
                    </p>
                    {isCurrent && (
                      <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-medium text-violet-700">
                        <Clock className="h-2.5 w-2.5" /> In progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                  {/* Show relevant date/score for this step */}
                  {dates && (
                    <StepDetails step={s.step} dates={dates} scores={scores} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: show details for the current step */}
      {!compact && dates && (
        <div className="hidden md:block mt-4">
          <StepDetails step={currentStep} dates={dates} scores={scores} rejected={rejected} rejectionReason={rejectionReason} />
        </div>
      )}

      {/* Rejection banner */}
      {rejected && !compact && rejectionReason && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <div className="flex items-start gap-2">
            <X className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-700">Application not selected</p>
              <p className="text-xs text-rose-600 mt-0.5">{rejectionReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Show date/score details for a specific step
function StepDetails({
  step,
  dates,
  scores,
  rejected,
  rejectionReason,
}: {
  step: number;
  dates: NonNullable<RecruitmentPipelineProps["dates"]>;
  scores?: RecruitmentPipelineProps["scores"];
  rejected?: boolean;
  rejectionReason?: string | null;
}) {
  const items: { label: string; value: string }[] = [];

  if (step === 1 && dates.appliedAt) {
    items.push({ label: "Applied on", value: formatDate(dates.appliedAt) ?? "" });
  }
  if (step === 2 && dates.reviewedAt) {
    items.push({ label: "Reviewed on", value: formatDate(dates.reviewedAt) ?? "" });
  }
  if (step === 3 && dates.examNotifiedAt) {
    items.push({ label: "Notified on", value: formatDate(dates.examNotifiedAt) ?? "" });
  }
  if (step === 4) {
    if (dates.examCompletedAt) items.push({ label: "Completed on", value: formatDate(dates.examCompletedAt) ?? "" });
    if (scores?.examScore != null) items.push({ label: "Score", value: `${scores.examScore}/100` });
  }
  if (step === 5) {
    if (dates.interviewNotifiedAt) items.push({ label: "Notified on", value: formatDate(dates.interviewNotifiedAt) ?? "" });
    if (dates.interviewCompletedAt) items.push({ label: "Completed on", value: formatDate(dates.interviewCompletedAt) ?? "" });
    if (scores?.oralScore != null) items.push({ label: "Oral", value: `${scores.oralScore}/100` });
    if (scores?.practicalScore != null) items.push({ label: "Practical", value: `${scores.practicalScore}/100` });
    if (scores?.interviewOverallScore != null) items.push({ label: "Overall", value: `${scores.interviewOverallScore}/100` });
  }
  if (step === 6 && dates.selectedAt) {
    items.push({ label: "Selected on", value: formatDate(dates.selectedAt) ?? "" });
  }
  if (step === 7 && dates.hiredAt) {
    items.push({ label: "Hired on", value: formatDate(dates.hiredAt) ?? "" });
  }

  if (items.length === 0 && !rejected) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item, i) => (
        <span key={i} className="text-[11px] text-muted-foreground">
          <span className="font-medium">{item.label}:</span> {item.value}
        </span>
      ))}
    </div>
  );
}
