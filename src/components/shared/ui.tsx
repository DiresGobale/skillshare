"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CheckCircle2, ShieldCheck, Clock, AlertCircle, Lock, Info } from "lucide-react";
import type {
  ProficiencyLevel,
  VerificationStatus,
  ApplicationStatus,
  JobStatus,
} from "@/lib/types";

// ============================================================
// MATCH SCORE — circular gauge with color-coded ring
// ============================================================
export function MatchScore({
  score,
  size = "md",
  showLabel = true,
}: {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}) {
  const dims = {
    sm: 44,
    md: 64,
    lg: 96,
    xl: 140,
  }[size];
  const stroke = {
    sm: 3,
    md: 4,
    lg: 6,
    xl: 9,
  }[size];
  const fontClass = {
    sm: "text-xs font-semibold",
    md: "text-sm font-bold",
    lg: "text-xl font-bold",
    xl: "text-3xl font-bold",
  }[size];

  const r = (dims - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 85 ? "oklch(0.6 0.18 152)" : score >= 70 ? "oklch(0.55 0.22 285)" : score >= 50 ? "oklch(0.75 0.16 75)" : "oklch(0.65 0.22 25)";

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: dims, height: dims }}
      aria-label={`Match score ${score}%`}
    >
      <svg width={dims} height={dims} className="-rotate-90">
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          stroke="oklch(0.92 0.012 270)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={dims / 2}
          cy={dims / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(fontClass, "leading-none")} style={{ color }}>
          {score}%
        </span>
        {showLabel && size !== "sm" && (
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground mt-0.5">
            match
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SKILL CHIP — with proficiency dot & verified badge
// ============================================================
const PROFICIENCY_COLOR: Record<ProficiencyLevel, string> = {
  beginner: "oklch(0.7 0.18 75)",
  intermediate: "oklch(0.65 0.16 200)",
  advanced: "oklch(0.55 0.22 285)",
  expert: "oklch(0.6 0.18 152)",
};

export function ProficiencyDot({ level }: { level: ProficiencyLevel }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ background: PROFICIENCY_COLOR[level] }}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="capitalize">
        {level}
      </TooltipContent>
    </Tooltip>
  );
}

export function SkillChip({
  name,
  proficiency,
  verified,
  mandatory,
  size = "md",
  className,
}: {
  name: string;
  proficiency?: ProficiencyLevel;
  verified?: VerificationStatus | boolean;
  mandatory?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const verifiedBool = verified === true || verified === "verified";
  const pendingBool = verified === "pending";
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card font-medium",
        mandatory
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-border bg-muted/40 text-foreground",
        padding,
        className
      )}
    >
      {proficiency && <ProficiencyDot level={proficiency} />}
      <span>{name}</span>
      {mandatory && (
        <span className="text-[9px] uppercase tracking-wide text-primary/70 font-semibold">
          req
        </span>
      )}
      {verifiedBool && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
      {pendingBool && <Clock className="h-3 w-3 text-amber-500" />}
    </span>
  );
}

// ============================================================
// STATUS BADGE — unified styling for application / job status
// ============================================================
const APP_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  // Legacy statuses
  submitted: { label: "Submitted", className: "bg-slate-100 text-slate-700 border-slate-200" },
  screening: { label: "Screening", className: "bg-blue-50 text-blue-700 border-blue-200" },
  shortlisted: { label: "Shortlisted", className: "bg-violet-50 text-violet-700 border-violet-200" },
  interview: { label: "Interview", className: "bg-amber-50 text-amber-700 border-amber-200" },
  offer: { label: "Offer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  withdrawn: { label: "Withdrawn", className: "bg-slate-100 text-slate-500 border-slate-200" },
  // 7-step recruitment pipeline statuses
  applied: { label: "Applied", className: "bg-slate-100 text-slate-700 border-slate-200" },
  reviewing: { label: "Under Review", className: "bg-blue-50 text-blue-700 border-blue-200" },
  review_passed: { label: "Review Passed", className: "bg-violet-50 text-violet-700 border-violet-200" },
  exam_notified: { label: "Exam Notified", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  exam_completed: { label: "Exam Completed", className: "bg-blue-50 text-blue-700 border-blue-200" },
  exam_passed: { label: "Exam Passed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  interview_notified: { label: "Interview Notified", className: "bg-amber-50 text-amber-700 border-amber-200" },
  interview_completed: { label: "Interview Completed", className: "bg-amber-50 text-amber-700 border-amber-200" },
  interview_passed: { label: "Interview Passed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  selected: { label: "Selected", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  hired: { label: "Hired", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  // Crash-safe: fall back to a neutral badge if the status is unknown
  const s = APP_STATUS_STYLE[status] ?? { label: status || "Unknown", className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <Badge variant="outline" className={cn("font-medium", s.className)}>
      {s.label}
    </Badge>
  );
}

const JOB_STATUS_STYLE: Record<JobStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200" },
  published: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-700 border-amber-200" },
  closed: { label: "Closed", className: "bg-rose-50 text-rose-600 border-rose-200" },
  expired: { label: "Expired", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const s = JOB_STATUS_STYLE[status];
  return (
    <Badge variant="outline" className={cn("font-medium", s.className)}>
      {s.label}
    </Badge>
  );
}

// ============================================================
// JOB EXPIRY BADGE — shows "Expires in X" or "Job Expired"
// ============================================================

// Formats a remaining time duration into a human-readable string.
// e.g. "Expires in 2 days", "Expires in 5 hours", "Expires in 20 minutes"
export function formatTimeRemaining(expiresAt: string | Date | null): string | null {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = expiry - now;

  if (diff <= 0) return "Job Expired";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Expires in ${days} day${days === 1 ? "" : "s"}`;
  if (hours > 0) return `Expires in ${hours} hour${hours === 1 ? "" : "s"}`;
  if (minutes > 0) return `Expires in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  return "Expires in less than a minute";
}

// Returns true if the job's expiresAt has passed
export function isJobExpired(expiresAt: string | Date | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

export function JobExpiryBadge({ expiresAt, status }: { expiresAt?: string | Date | null; status?: string }) {
  // If the job is already marked as expired by the backend, show "Job Expired"
  if (status === "expired") {
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
        <Clock className="h-3 w-3" /> Job Expired
      </Badge>
    );
  }

  const remaining = formatTimeRemaining(expiresAt ?? null);
  if (!remaining) return null;

  if (remaining === "Job Expired") {
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
        <Clock className="h-3 w-3" /> Job Expired
      </Badge>
    );
  }

  // Calculate urgency — if less than 24h, show amber; if less than 1h, show red
  const diff = new Date(expiresAt!).getTime() - Date.now();
  const hours = diff / (1000 * 60 * 60);

  const className = hours < 1
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : hours < 24
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", className)}>
      <Clock className="h-3 w-3" /> {remaining}
    </Badge>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified")
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium">
        <ShieldCheck className="h-3 w-3" /> Verified
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-medium">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1 font-medium">
      Unverified
    </Badge>
  );
}

// ============================================================
// PRIVACY INDICATOR — contact locked
// ============================================================
export function PrivacyLock({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Lock className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">Contact info locked until candidate accepts interview</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-500">
      <Lock className="h-3 w-3" />
      <span>Contact locked — apply or accept interview to view</span>
    </div>
  );
}

// ============================================================
// PROFILE COMPLETION RING
// ============================================================
export function ProfileCompletionRing({
  value,
  size = 96,
}: {
  value: number;
  size?: number;
}) {
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.92 0.012 270)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.55 0.22 285)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{value}%</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">complete</span>
      </div>
    </div>
  );
}

// ============================================================
// AVATAR — colored initials
// ============================================================
export function Avatar({
  initials,
  color,
  size = "md",
  photo,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  photo?: string | null;
}) {
  const dims = { sm: 32, md: 40, lg: 56 }[size];
  const fontSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  if (photo) {
    return (
      <img
        src={photo}
        alt={initials}
        className={cn("shrink-0 rounded-full object-cover", fontSize)}
        style={{ width: dims, height: dims }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        fontSize
      )}
      style={{ width: dims, height: dims, background: color }}
    >
      {initials}
    </span>
  );
}

// ============================================================
// COMPANY LOGO — square rounded
// ============================================================
export function CompanyLogo({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: 32, md: 40, lg: 48 }[size];
  const fontSize = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 font-bold text-white",
        fontSize,
        className
      )}
      style={{ width: dims, height: dims }}
    >
      {initials}
    </span>
  );
}

// ============================================================
// SECTION HEADER — title + optional description + actions
// ============================================================
export function SectionHeader({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ============================================================
// STATE VIEWS — loading / empty / error / success
// ============================================================
export function LoadingState({
  label = "Loading…",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem persists, contact support.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-rose-700">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SuccessBanner({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-emerald-900">{title}</p>
        {description && <p className="text-xs text-emerald-700">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-emerald-700 hover:text-emerald-900 text-xs"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export function InfoCallout({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-900">
      <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
      <div className="flex-1">
        {icon && <div className="mb-0.5 font-semibold">{icon}</div>}
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MATCH FACTOR BAR
// ============================================================
export function MatchFactorBar({
  label,
  score,
  weight,
  description,
}: {
  label: string;
  score: number;
  weight: number;
  description?: string;
}) {
  const color =
    score >= 85 ? "oklch(0.6 0.18 152)" : score >= 70 ? "oklch(0.55 0.22 285)" : score >= 50 ? "oklch(0.75 0.16 75)" : "oklch(0.65 0.22 25)";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{label}</span>
            <span className="tabular-nums text-muted-foreground">
              {score}% <span className="text-muted-foreground/70">· weight {Math.round(weight * 100)}%</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${score}%`, background: color, transition: "width 0.6s ease" }}
            />
          </div>
        </div>
      </TooltipTrigger>
      {description && (
        <TooltipContent side="top" className="max-w-xs">
          {description}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

// ============================================================
// PROGRESS HELPERS
// ============================================================
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return <Progress value={value} className={cn("h-2", className)} />;
}

// ============================================================
// STAT CARD — for dashboards
// ============================================================
export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  hint,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  hint?: string;
  onClick?: () => void;
}) {
  const deltaClass =
    deltaTone === "up"
      ? "text-emerald-600 bg-emerald-50"
      : deltaTone === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-muted-foreground bg-muted";
  const Wrapper: React.ElementType = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full rounded-xl border border-border bg-card p-4 text-left shadow-card-soft",
        onClick && "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-ring/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div className={cn("mt-3 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium", deltaClass)}>
          {delta}
        </div>
      )}
    </Wrapper>
  );
}

// ============================================================
// SEARCH INPUT — for tables
// ============================================================
export function TableToolbar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

// Re-export provider so consumers can wrap tooltips in one place
export { TooltipProvider };
