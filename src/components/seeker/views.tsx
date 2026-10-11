"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TooltipProvider,
  MatchScore,
  SkillChip,
  ApplicationStatusBadge,
  VerificationBadge,
  ProfileCompletionRing,
  Avatar,
  CompanyLogo,
  SectionHeader,
  StatCard,
  MatchFactorBar,
  EmptyState,
  LoadingState,
  ErrorState,
  SuccessBanner,
  InfoCallout,
  JobExpiryBadge,
} from "@/components/shared/ui";
import { RecruitmentPipeline } from "@/components/shared/recruitment-pipeline";
import {
  recommendedJobs,
  seekerSkills,
  seekerEducation,
  seekerExperience,
  seekerApplications,
  seekerNotifications,
  seekerConversations,
  skillGapAnalysis,
  resumeAnalysis,
  seekerDashboardStats,
  currentUser,
} from "@/lib/mock-data";
import { useFetch } from "@/lib/use-fetch";
import { ProfilePhotoUpload } from "@/components/shared/profile-photo-upload";
import type {
  Job,
  Application,
  NotificationItem,
  Conversation,
  SkillGapItem,
  ProficiencyLevel,
  Skill,
} from "@/lib/types";
import {
  User,
  Sparkles,
  FileText,
  Target,
  Send,
  TrendingUp,
  Bell,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Briefcase,
  Calendar,
  Upload,
  FileCheck2,
  Cpu,
  Check,
  Plus,
  Search,
  Filter,
  Star,
  Download,
  Lock,
  ShieldCheck,
  ChevronRight,
  Mail,
  Phone,
  PhoneCall,
  GraduationCap,
  Award,
  Zap,
  Lightbulb,
  RefreshCw,
  X,
  PenSquare,
  Users,
  Trophy,
} from "lucide-react";

// ============================================================
// Page container — uniform padding/max width
// ============================================================
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  );
}

const formatSalary = (j: Job) =>
  `$${j.salary.min.toLocaleString()}–$${j.salary.max.toLocaleString()} / ${j.salary.period}`;

function timeAgo(date: string) {
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ============================================================
// SEEKER DASHBOARD
// ============================================================
export function SeekerDashboard() {
  const { go } = useApp();
  const { data: profileData, loading: profileLoading } = useFetch<any>("/api/profile");
  const { data: appsData, loading: appsLoading } = useFetch<any>("/api/applications");
  const { data: notifData, loading: notifLoading } = useFetch<any>("/api/notifications");
  const { data: jobsData } = useFetch<any>("/api/jobs");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const profile = profileData?.profile;
  const applications = appsData?.applications ?? [];
  const notifications = notifData?.notifications ?? [];
  const publishedJobs = jobsData?.jobs ?? [];

  // Compute profile completion from real data
  const profileCompletion = profile
    ? Math.round(
        (((profile.name ? 1 : 0) +
          (profile.about ? 1 : 0) +
          (profile.location ? 1 : 0) +
          (profile.skills?.length > 0 ? 1 : 0) +
          (profile.experiences?.length > 0 ? 1 : 0) +
          (profile.educations?.length > 0 ? 1 : 0)) /
          6) *
          100
      )
    : 0;

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const activeApplications = applications.filter((a: any) =>
    ["submitted", "screening", "shortlisted", "interview"].includes(a.status)
  ).length;
  const interviewsScheduled = applications.filter((a: any) => a.status === "interview").length;
  const avgMatchScore = applications.length
    ? Math.round(applications.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0) / applications.length)
    : 0;
  const unreadNotifications = notifications.filter((n: any) => !n.read).length;

  return (
    <PageContainer>
      <SectionHeader
        title={`Welcome back, ${firstName}`}
        description="Here's your job-search overview for today."
        actions={
          <Button onClick={() => go("recommended")}>
            <Target className="h-4 w-4" /> View recommendations
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile completion" value={`${profileCompletion}%`} icon={<User className="h-4 w-4" />} hint={profileCompletion < 100 ? "Steps left" : "All done!"} />
        <StatCard label="Open jobs" value={publishedJobs.length} icon={<Target className="h-4 w-4" />} hint="Live on platform" />
        <StatCard label="Active applications" value={activeApplications} icon={<Send className="h-4 w-4" />} hint={`${interviewsScheduled} interview scheduled`} />
        <StatCard label="Avg. match score" value={`${avgMatchScore}%`} icon={<Sparkles className="h-4 w-4" />} hint="Across your applications" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Profile completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Profile completion</CardTitle>
            <CardDescription>Complete your profile to boost match scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <ProfileCompletionRing value={profileCompletion} size={84} />
              <div className="space-y-1 text-xs">
                {[
                  { label: "Basic info", done: !!(profile?.name && profile?.about) },
                  { label: "Skills & proficiency", done: (profile?.skills?.length ?? 0) > 0 },
                  { label: "Education", done: (profile?.educations?.length ?? 0) > 0 },
                  { label: "Experience", done: (profile?.experiences?.length ?? 0) > 0 },
                  { label: "Location", done: !!profile?.location },
                  { label: "Skill verification", done: (profile?.skills?.filter((s: any) => s.verified === "verified").length ?? 0) > 0 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    {s.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40" />
                    )}
                    <span className={s.done ? "text-muted-foreground line-through" : "font-medium"}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => go("profile")}>
              Continue setup
            </Button>
          </CardContent>
        </Card>

        {/* Recommended jobs (from published jobs in DB) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Open jobs on the platform</CardTitle>
              <CardDescription>Click any job to view details and apply</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go("recommended")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {profileLoading || jobsData === null ? (
              <LoadingState label="Loading jobs…" rows={2} />
            ) : publishedJobs.length === 0 ? (
              <EmptyState icon={<Target className="h-5 w-5" />} title="No open jobs yet" description="Check back soon — employers are posting new roles." />
            ) : (
              publishedJobs.slice(0, 4).map((j: any) => (
                <button
                  key={j.id}
                  onClick={() => go("job-detail", { jobId: j.id })}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <CompanyLogo initials={j.companyLogo || j.company.slice(0, 2).toUpperCase()} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:text-primary">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.company} · {j.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">${j.salaryMin.toLocaleString()}–${j.salaryMax.toLocaleString()}/{j.salaryPeriod}</span>
                    <span className="text-[10px] text-muted-foreground">{j.remote}</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Recent applications */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Recent applications</CardTitle>
              <CardDescription>Track your active applications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go("applications")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {appsLoading ? (
              <LoadingState label="Loading applications…" rows={2} />
            ) : applications.length === 0 ? (
              <EmptyState
                icon={<Send className="h-5 w-5" />}
                title="No applications yet"
                description="Browse open jobs and apply to start tracking them here."
                action={<Button size="sm" onClick={() => go("recommended")}>Browse jobs</Button>}
              />
            ) : (
              applications.slice(0, 4).map((a: any) => (
                <button
                  key={a.id}
                  onClick={() => go("applications")}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <CompanyLogo initials={a.job?.companyLogo || "CO"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:text-primary">{a.job?.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.job?.company} · applied {timeAgo(a.appliedAt)}</p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                  {a.matchScore && <MatchScore score={a.matchScore} size="sm" showLabel={false} />}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Notifications</CardTitle>
              <CardDescription>{unreadNotifications} unread</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go("notifications")}>
              <Bell className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifLoading ? (
              <LoadingState label="Loading…" rows={2} />
            ) : notifications.length === 0 ? (
              <EmptyState icon={<Bell className="h-5 w-5" />} title="No notifications" />
            ) : (
              notifications.slice(0, 3).map((n: any) => (
                <div
                  key={n.id}
                  className={cn(
                    "rounded-lg border border-border bg-card p-3",
                    !n.read && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill summary */}
      <Card className="mt-4">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Your skills</CardTitle>
            <CardDescription>{profile?.skills?.length ?? 0} skills on your profile</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go("skills")}>
            Manage skills <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <LoadingState label="Loading skills…" rows={1} />
          ) : (profile?.skills?.length ?? 0) === 0 ? (
            <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No skills yet" description="Add skills to your profile to start matching." action={<Button size="sm" onClick={() => go("skills")}>Add skills</Button>} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: any) => (
                <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} verified={s.verified} size="sm" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Profile Analysis */}
      <Card className="mt-4 border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> AI Profile Analysis
            </CardTitle>
            <CardDescription>AI-powered analysis of your skills, qualifications, and market position</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="btn-rainbow" onClick={async () => {
            setAiLoading(true);
            try {
              const res = await fetch("/api/ai/analyze", { method: "POST" });
              const data = await res.json();
              if (data.ok) setAiAnalysis(data.analysis);
            } catch { /* ignore */ }
            setAiLoading(false);
          }} disabled={aiLoading}>
            {aiLoading ? "Analyzing…" : "Analyze with AI"}
          </Button>
        </CardHeader>
        <CardContent>
          {aiLoading ? (
            <LoadingState label="AI is analyzing your profile…" rows={3} />
          ) : aiAnalysis ? (
            <div className="space-y-3">
              {/* Profile Score */}
              <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{aiAnalysis.profileScore}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Profile Score</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{aiAnalysis.careerLevel} · {aiAnalysis.marketPosition}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {aiAnalysis.recommendedRoles.map((r: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5">Strengths</p>
                  <ul className="space-y-1">
                    {aiAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-700 mb-1.5">Areas for Improvement</p>
                  <ul className="space-y-1">
                    {aiAnalysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" /> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Insights */}
              {aiAnalysis.insights.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">AI Insights</p>
                  {aiAnalysis.insights.map((ins: any, i: number) => (
                    <div key={i} className={cn(
                      "rounded-md border px-3 py-2 text-xs",
                      ins.type === "positive" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                      ins.type === "negative" ? "border-rose-200 bg-rose-50 text-rose-800" :
                      "border-blue-200 bg-blue-50 text-blue-800"
                    )}>
                      <span className="font-semibold">{ins.title}:</span> {ins.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Cpu className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click "Analyze with AI" to get a comprehensive analysis of your profile, including strengths, weaknesses, market position, and recommended roles.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// SEEKER PROFILE
// ============================================================
export function SeekerProfile() {
  const { go, user: sessionUser } = useApp();
  const { data, loading, refetch } = useFetch<any>("/api/profile");
  const profile = data?.profile;

  // Editable form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  // Add experience dialog state
  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({ company: "", title: "", startDate: "", endDate: "", description: "", current: false });
  const [expError, setExpError] = useState<string | null>(null);
  const [expSaving, setExpSaving] = useState(false);

  // Add education dialog state
  const [eduOpen, setEduOpen] = useState(false);
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", field: "", startDate: "", endDate: "" });
  const [eduError, setEduError] = useState<string | null>(null);
  const [eduSaving, setEduSaving] = useState(false);

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setTitle(profile.title ?? "");
      setLocation(profile.location ?? "");
      setAbout(profile.about ?? "");
    }
  }, [profile]);

  const save = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, location, about }),
      });
      const json = await res.json();
      if (json.ok) {
        setSaveMsg({ ok: true, msg: "Profile updated successfully." });
        refetch();
      } else {
        setSaveMsg({ ok: false, msg: json.error ?? "Save failed." });
      }
    } catch {
      setSaveMsg({ ok: false, msg: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = async () => {
    setExpError(null);
    if (!expForm.company.trim()) { setExpError("Company is required."); return; }
    if (!expForm.title.trim()) { setExpError("Job title is required."); return; }
    setExpSaving(true);
    try {
      const res = await fetch("/api/profile/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expForm),
      });
      const json = await res.json();
      if (json.ok) {
        setExpOpen(false);
        setExpForm({ company: "", title: "", startDate: "", endDate: "", description: "", current: false });
        refetch();
      } else {
        setExpError(json.error ?? "Failed to add experience.");
      }
    } catch {
      setExpError("Network error.");
    } finally {
      setExpSaving(false);
    }
  };

  const addEducation = async () => {
    setEduError(null);
    if (!eduForm.institution.trim()) { setEduError("Institution is required."); return; }
    if (!eduForm.degree.trim()) { setEduError("Degree is required."); return; }
    if (!eduForm.field.trim()) { setEduError("Field of study is required."); return; }
    setEduSaving(true);
    try {
      const res = await fetch("/api/profile/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eduForm),
      });
      const json = await res.json();
      if (json.ok) {
        setEduOpen(false);
        setEduForm({ institution: "", degree: "", field: "", startDate: "", endDate: "" });
        refetch();
      } else {
        setEduError(json.error ?? "Failed to add education.");
      }
    } catch {
      setEduError("Network error.");
    } finally {
      setEduSaving(false);
    }
  };

  const completion = profile
    ? Math.round(
        (((profile.name ? 1 : 0) +
          (profile.about ? 1 : 0) +
          (profile.location ? 1 : 0) +
          (profile.skills?.length > 0 ? 1 : 0) +
          (profile.experiences?.length > 0 ? 1 : 0) +
          (profile.educations?.length > 0 ? 1 : 0)) /
          6) *
          100
      )
    : 0;

  const pendingSkills = profile?.skills?.filter((s: any) => s.verified === "pending").length ?? 0;

  return (
    <PageContainer>
      <SectionHeader
        title="My Profile"
        description="Your professional profile is used by the AI matching engine."
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="Loading profile…" rows={3} />
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              {/* Profile photo with upload */}
              <div className="flex flex-col items-center text-center">
                <ProfilePhotoUpload
                  photo={profile?.profilePhoto}
                  initials={profile?.initials ?? sessionUser?.initials ?? "U"}
                  color={profile?.avatarColor ?? sessionUser?.avatarColor ?? "oklch(0.55 0.22 285)"}
                  onUploaded={() => refetch()}
                />
                <h2 className="mt-3 text-base font-semibold">{profile?.name ?? "—"}</h2>
                <p className="text-xs text-muted-foreground">{profile?.title ?? "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{profile?.location ?? "—"}</p>
              </div>
              <div className="mt-5 space-y-3 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{sessionUser?.email}</span>
                </div>
                {profile?.location && (
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Profile completion</p>
                  <span className="text-xs font-semibold text-primary">{completion}%</span>
                </div>
                <Progress value={completion} className="mt-1.5 h-1.5" />
                {pendingSkills > 0 && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => go("skills")}>
                    <Sparkles className="h-3.5 w-3.5" /> {pendingSkills} skill{pendingSkills === 1 ? "" : "s"} pending verification
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* About + editable sections */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">About</CardTitle>
                <CardDescription>Edit your name, title, location, and bio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Professional title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="about">About / Bio</Label>
                  <Textarea
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Tell employers about your experience, strengths, and what you're looking for."
                  />
                </div>
                {saveMsg && (
                  <div className={cn(
                    "rounded-md border px-3 py-2 text-xs",
                    saveMsg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
                  )}>
                    {saveMsg.msg}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={save} disabled={saving} className="btn-blue">
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> Experience
                </CardTitle>
                <Dialog open={expOpen} onOpenChange={(o) => { setExpOpen(o); setExpError(null); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="btn-green">
                      <Plus className="h-3.5 w-3.5" /> Add experience
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add work experience</DialogTitle>
                      <DialogDescription>Fill in the details of your work experience.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="exp-title">Job title *</Label>
                          <Input id="exp-title" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="exp-company">Company *</Label>
                          <Input id="exp-company" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} placeholder="e.g. Twiga Foods" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="exp-start">Start date</Label>
                          <Input id="exp-start" type="month" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="exp-end">End date</Label>
                          <Input id="exp-end" type="month" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} disabled={expForm.current} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="exp-current" checked={expForm.current} onCheckedChange={(v) => setExpForm({ ...expForm, current: Boolean(v), endDate: Boolean(v) ? "Present" : "" })} />
                        <label htmlFor="exp-current" className="text-xs">I currently work here</label>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="exp-desc">Description</Label>
                        <Textarea id="exp-desc" rows={3} value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="What did you do?" className="resize-none" />
                      </div>
                      {expError && <p className="text-xs text-rose-600">{expError}</p>}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setExpOpen(false)}>Cancel</Button>
                      <Button onClick={addExperience} disabled={expSaving} className="btn-green">
                        {expSaving ? "Saving…" : "Add experience"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                {(profile?.experiences?.length ?? 0) === 0 ? (
                  <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No experience added" description="Click 'Add experience' above or upload your resume to auto-extract." />
                ) : (
                  profile.experiences.map((e: any) => (
                    <div key={e.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.company}</p>
                          <p className="text-[11px] text-muted-foreground">{e.startDate} — {e.endDate}</p>
                        </div>
                        {e.current && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Current</Badge>}
                      </div>
                      {e.description && <p className="mt-2 text-xs text-muted-foreground">{e.description}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Education
                </CardTitle>
                <Dialog open={eduOpen} onOpenChange={(o) => { setEduOpen(o); setEduError(null); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="btn-blue">
                      <Plus className="h-3.5 w-3.5" /> Add education
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add education</DialogTitle>
                      <DialogDescription>Fill in your education details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="edu-institution">Institution *</Label>
                        <Input id="edu-institution" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="e.g. University of Nairobi" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="edu-degree">Degree *</Label>
                          <Input id="edu-degree" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="e.g. B.Sc." />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edu-field">Field of study *</Label>
                          <Input id="edu-field" value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} placeholder="e.g. Computer Science" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edu-start">Start date</Label>
                          <Input id="edu-start" type="month" value={eduForm.startDate} onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edu-end">End date</Label>
                          <Input id="edu-end" type="month" value={eduForm.endDate} onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })} />
                        </div>
                      </div>
                      {eduError && <p className="text-xs text-rose-600">{eduError}</p>}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEduOpen(false)}>Cancel</Button>
                      <Button onClick={addEducation} disabled={eduSaving} className="btn-blue">
                        {eduSaving ? "Saving…" : "Add education"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                {(profile?.educations?.length ?? 0) === 0 ? (
                  <EmptyState icon={<GraduationCap className="h-5 w-5" />} title="No education added" description="Click 'Add education' above or upload your resume to auto-extract." />
                ) : (
                  profile.educations.map((ed: any) => (
                    <div key={ed.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{ed.degree}, {ed.field}</p>
                          <p className="text-xs text-muted-foreground">{ed.institution}</p>
                          <p className="text-[11px] text-muted-foreground">{ed.startDate} — {ed.endDate}</p>
                        </div>
                        {ed.verified ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// SEEKER SKILLS
// ============================================================
export function SeekerSkills() {
  const { data, loading, refetch } = useFetch<any>("/api/skills");
  const skills: any[] = data?.skills ?? [];

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<ProficiencyLevel>("intermediate");
  const [newYears, setNewYears] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = skills.reduce<Record<string, any[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const addSkill = async () => {
    setAddError(null);
    if (!newSkill.trim()) {
      setAddError("Skill name is required.");
      return;
    }
    if (newSkill.trim().length < 2) {
      setAddError("Skill name must be at least 2 characters.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill.trim(),
          proficiency: newProficiency,
          category: "Custom",
          yearsOfExperience: newYears ? Number(newYears) : null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setAddError(json.error ?? "Failed to add skill.");
        return;
      }
      setNewSkill("");
      setNewYears("");
      setAddDialogOpen(false);
      refetch();
    } catch {
      setAddError("Network error.");
    } finally {
      setAdding(false);
    }
  };

  const deleteSkill = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/skills/${id}`, { method: "DELETE" });
      refetch();
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const verifiedCount = skills.filter((s) => s.verified === "verified").length;
  const pendingCount = skills.filter((s) => s.verified === "pending").length;

  return (
    <PageContainer>
      <SectionHeader
        title="Skills & Proficiency"
        description="The AI uses your verified skills to compute match scores."
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-rainbow">
                <Plus className="h-4 w-4" /> Add skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a skill</DialogTitle>
                <DialogDescription>Search our skill ontology or add a custom skill.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="skill-name">Skill name *</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g. Kubernetes"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  {addError && <p className="text-xs text-rose-600">{addError}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Proficiency level *</Label>
                  <Select value={newProficiency} onValueChange={(v) => setNewProficiency(v as ProficiencyLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner — basic knowledge</SelectItem>
                      <SelectItem value="intermediate">Intermediate — practical experience</SelectItem>
                      <SelectItem value="advanced">Advanced — production experience</SelectItem>
                      <SelectItem value="expert">Expert — can mentor others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="skill-years">Years of experience (optional)</Label>
                  <Input
                    id="skill-years"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 3"
                    value={newYears}
                    onChange={(e) => setNewYears(e.target.value)}
                  />
                </div>
                <InfoCallout>
                  New skills start as <span className="font-medium">unverified</span>. You can request verification through a short assessment.
                </InfoCallout>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddDialogOpen(false); setAddError(null); }}>Cancel</Button>
                <Button onClick={addSkill} disabled={adding} className="btn-green">
                  {adding ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Adding…
                    </>
                  ) : (
                    "Add skill"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total skills" value={skills.length} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Verified" value={verifiedCount} icon={<ShieldCheck className="h-4 w-4" />} hint="Boosts match weight" />
        <StatCard label="Pending verification" value={pendingCount} icon={<Clock className="h-4 w-4" />} />
      </div>

      {loading ? (
        <LoadingState label="Loading skills…" rows={3} />
      ) : skills.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Sparkles className="h-5 w-5" />}
          title="No skills yet"
          description="Add your first skill to start matching with jobs."
          action={<Button size="sm" onClick={() => setAddDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> Add skill</Button>}
        />
      ) : (
        <div className="mt-6 space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {category}
                  <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs"
                    >
                      <SkillChip name={s.name} proficiency={s.proficiency} verified={s.verified} />
                      {s.yearsOfExperience && (
                        <span className="text-[10px] text-muted-foreground">· {s.yearsOfExperience}y</span>
                      )}
                      {s.verified === "pending" && (
                        <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </Badge>
                      )}
                      {s.verified === "verified" && (
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                      <button
                        onClick={() => deleteSkill(s.id)}
                        disabled={deletingId === s.id}
                        className="text-muted-foreground hover:text-rose-600 transition-colors"
                        aria-label={`Delete ${s.name}`}
                        title="Delete skill"
                      >
                        {deletingId === s.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// SEEKER RESUME & AI ANALYSIS
// ============================================================
// Sample resume text used by the "Try with sample resume" button — lets users
// test the AI extraction without having to upload a file.
const SAMPLE_RESUME_TEXT = `Amara Okafor
Senior Frontend Engineer · Nairobi, Kenya · amara.okafor@gmail.com · +254 712 345 678

SUMMARY
Senior Frontend Engineer with 6 years of experience building customer-facing
products across fintech, agritech, and payments. Led the React/Next.js rewrite
at Twiga Foods, lifting Lighthouse scores by 47%. Passionate about
accessibility, performance, and mentoring.

EXPERIENCE
Senior Frontend Engineer · Twiga Foods · 2022 — Present
- Led the frontend rewrite from Vue to React/Next.js, improving Lighthouse
  scores by 47%.
- Mentored 4 junior engineers and established a design-system practice used
  across 6 product teams.
- Owned the migration to TypeScript and Tailwind CSS.

Frontend Engineer · Safaricom PLC · 2019 — 2022
- Built customer-facing dashboards for the M-Pesa merchant portal serving
  1.2M monthly users.
- Owned the component library migration to a typed system.
- Introduced Jest and React Testing Library, lifting test coverage from 12% to 78%.

Junior Developer · Andela · 2018 — 2019
- Contributed to multiple partner teams across fintech and edtech.
- Completed the Andela fellowship with distinction.

EDUCATION
B.Sc. Computer Science · University of Nairobi · 2014 — 2018
Diploma in Software Engineering · ALX Africa · 2020

SKILLS
React.js (expert), TypeScript (advanced), Next.js (advanced), Tailwind CSS
(advanced), Node.js (intermediate), GraphQL (intermediate), Jest (intermediate),
PostgreSQL (intermediate), Figma (beginner).`;

export function SeekerResume() {
  const { go } = useApp();
  const [showProcessing, setShowProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("We couldn't parse the file. It may be corrupted, password-protected, or in an unsupported format.");
  const [processingStep, setProcessingStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Step-through animation for the processing card
  useEffect(() => {
    if (!showProcessing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProcessingStep(0);
    const id = setInterval(() => {
      setProcessingStep((s) => Math.min(s + 1, 4));
    }, 500);
    return () => clearInterval(id);
  }, [showProcessing]);

  const runExtraction = async (text: string, label: string) => {
    setShowError(false);
    setShowSuccess(false);
    setShowProcessing(true);
    setFileName(label);
    try {
      const res = await fetch("/api/ai/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      // Give the animation a moment to complete
      await new Promise((r) => setTimeout(r, 1200));
      setShowProcessing(false);
      if (!data.ok) {
        setErrorMsg(data.error ?? "AI extraction failed.");
        setShowError(true);
        return;
      }
      setShowSuccess(true);
      // Store the AI result so the analysis page can display it
      try {
        sessionStorage.setItem("skillmatch.last-extraction", JSON.stringify({ result: data.result, fileName: label }));
      } catch { /* ignore */ }
      setTimeout(() => go("resume-analysis"), 900);
    } catch {
      setShowProcessing(false);
      setErrorMsg("Network error. Please try again.");
      setShowError(true);
    }
  };

  const runFileExtraction = async (file: File) => {
    setShowError(false);
    setShowSuccess(false);
    setShowProcessing(true);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai/extract-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 1200));
      setShowProcessing(false);
      if (!data.ok) {
        setErrorMsg(data.error ?? "AI extraction failed.");
        setShowError(true);
        return;
      }
      setShowSuccess(true);
      try {
        sessionStorage.setItem("skillmatch.last-extraction", JSON.stringify({ result: data.result, fileName: file.name }));
      } catch { /* ignore */ }
      setTimeout(() => go("resume-analysis"), 900);
    } catch {
      setShowProcessing(false);
      setErrorMsg("Network error. Please try again.");
      setShowError(true);
    }
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Upload the file to the server which uses pdf-parse for PDFs and
    // text-decoding for .txt/.md files.
    await runFileExtraction(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startAnalysis = () => {
    runExtraction(SAMPLE_RESUME_TEXT, "Amara_Okafor_Resume_2026.pdf");
  };

  const steps = [
    "Uploading file",
    "Extracting text (OCR)",
    "Detecting skills (NLP)",
    "Normalizing against skill ontology",
    "Inferring proficiency levels",
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Resume & AI Analysis"
        description="Upload your resume and our AI will extract, normalize, and verify your skills."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Upload card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Upload resume
              </CardTitle>
              <CardDescription>PDF, DOCX, or TXT up to 5MB. We'll process it locally before sending for AI analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={onFileSelected}
                className="hidden"
                aria-hidden="true"
              />
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold">Drop your resume here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Choose file
                  </Button>
                  <Button size="sm" variant="outline" onClick={startAnalysis}>
                    <Sparkles className="h-3.5 w-3.5" /> Try with sample resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing state */}
          {showProcessing && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary animate-pulse" /> AI is analyzing {fileName ?? "your resume"}…
                </CardTitle>
                <CardDescription>This usually takes 5–10 seconds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((label, i) => {
                  const done = i < processingStep;
                  const active = i === processingStep;
                  return (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : active ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={done || active ? "font-medium" : "text-muted-foreground"}>{label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {showError && (
            <ErrorState
              title="Resume processing failed"
              description={errorMsg}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowError(false)}>Dismiss</Button>
                  <Button size="sm" onClick={startAnalysis}>
                    <RefreshCw className="h-3.5 w-3.5" /> Try with sample
                  </Button>
                </div>
              }
            />
          )}

          {/* Success state */}
          {showSuccess && (
            <SuccessBanner
              title="Resume processed successfully"
              description="AI extraction complete. Redirecting to your analysis…"
              onClose={() => setShowSuccess(false)}
            />
          )}

          {/* Existing resume */}
          {!showProcessing && !showError && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{resumeAnalysis.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {resumeAnalysis.fileSize} · uploaded {resumeAnalysis.uploadedAt}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => go("resume-analysis")}>
                    View analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" /> How AI analysis works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>1. <span className="font-medium text-foreground">Upload</span> — your file is processed for text extraction (OCR for scanned PDFs).</p>
              <p>2. <span className="font-medium text-foreground">Extract</span> — an NLP model detects raw skill mentions, education, and experience.</p>
              <p>3. <span className="font-medium text-foreground">Normalize</span> — raw skills are mapped to our skill ontology (e.g. "React.js" → "React").</p>
              <p>4. <span className="font-medium text-foreground">Infer proficiency</span> — based on years of experience and contextual signals.</p>
              <p>5. <span className="font-medium text-foreground">Review & edit</span> — you can correct any extraction before it's saved.</p>
            </CardContent>
          </Card>

          <InfoCallout>
            <span className="font-medium">Privacy first.</span> Your resume is processed to extract skills and is never shared with employers. Only your verified skill profile is visible to them.
          </InfoCallout>
        </div>
      </div>
    </PageContainer>
  );
}

export function SeekerResumeAnalysis() {
  const { go } = useApp();
  const { toast } = useToast();
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Try to load the last extraction from sessionStorage (set by SeekerResume)
  const [extractionData, setExtractionData] = useState<{
    skills: typeof resumeAnalysis.extractedSkills;
    education: typeof resumeAnalysis.extractedEducation;
    experience: typeof resumeAnalysis.extractedExperience;
    fileName: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("skillmatch.last-extraction");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.result) {
          setExtractionData({
            skills: parsed.result.skills ?? resumeAnalysis.extractedSkills,
            education: parsed.result.education ?? resumeAnalysis.extractedEducation,
            experience: parsed.result.experience ?? resumeAnalysis.extractedExperience,
            fileName: parsed.fileName ?? "resume.pdf",
          });
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveToProfile = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const payload = {
        skills: (extractionData?.skills ?? resumeAnalysis.extractedSkills).map((s) => ({
          name: s.raw,
          normalized: s.normalized,
          proficiency: s.proficiency,
          source: "ai_extraction",
        })),
        education: (extractionData?.education ?? resumeAnalysis.extractedEducation).map((e) => ({
          institution: e.institution,
          degree: e.degree,
          field: e.field,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
        experience: (extractionData?.experience ?? resumeAnalysis.extractedExperience).map((e) => ({
          company: e.company,
          title: e.title,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
      };
      const res = await fetch("/api/profile/save-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveResult({
          ok: true,
          msg: `Saved ${data.skillsSaved} new skills (${data.skillsSkipped} already existed), ${data.educationSaved} education entries, ${data.experienceSaved} experience entries to your profile.`,
        });
        // Redirect to skills page after a moment
        setTimeout(() => go("skills"), 1800);
      } else {
        setSaveResult({ ok: false, msg: data.error ?? "Save failed." });
      }
    } catch {
      setSaveResult({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="AI Resume Analysis"
        description="Review and edit the extracted information before saving to your profile."
        icon={<Cpu className="h-4 w-4" />}
        actions={
          <Button onClick={saveToProfile} disabled={saving}>
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save to profile
              </>
            )}
          </Button>
        }
      />

      {saveResult && (
        <div className="mt-4">
          {saveResult.ok ? (
            <SuccessBanner
              title="Saved to profile"
              description={saveResult.msg + " Redirecting to your skills…"}
              onClose={() => setSaveResult(null)}
            />
          ) : (
            <ErrorState title="Save failed" description={saveResult.msg} action={<Button size="sm" variant="outline" onClick={saveToProfile}>Try again</Button>} />
          )}
        </div>
      )}

      <SuccessBanner
        title="Resume processed successfully"
        description={`${(extractionData?.skills ?? resumeAnalysis.extractedSkills).length} skills detected, ${(extractionData?.education ?? resumeAnalysis.extractedEducation).length} education entries, ${(extractionData?.experience ?? resumeAnalysis.extractedExperience).length} experience entries. Please review for accuracy.`}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Processing pipeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Processing pipeline
              </CardTitle>
              <CardDescription>{resumeAnalysis.fileName} · {resumeAnalysis.fileSize}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {resumeAnalysis.processingSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{step.label}</p>
                      <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Extracted skills */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Extracted skills
                </CardTitle>
                <CardDescription>Normalized against the skill ontology · click to edit</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {resumeAnalysis.extractedSkills.length} detected
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Raw text</th>
                      <th className="px-3 py-2 text-left font-medium">Normalized</th>
                      <th className="px-3 py-2 text-left font-medium">Proficiency</th>
                      <th className="px-3 py-2 text-left font-medium">Confidence</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {resumeAnalysis.extractedSkills.map((s) => (
                      <tr key={s.raw} className="hover:bg-accent/30">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{s.raw}</td>
                        <td className="px-3 py-2">
                          <SkillChip name={s.normalized} size="sm" />
                        </td>
                        <td className="px-3 py-2">
                          {editingSkill === s.raw ? (
                            <Select defaultValue={s.proficiency}>
                              <SelectTrigger className="h-7 w-32 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-[10px] capitalize">{s.proficiency}</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Progress value={s.confidence * 100} className="h-1.5 w-16" />
                            <span className="text-[10px] text-muted-foreground">{Math.round(s.confidence * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingSkill(editingSkill === s.raw ? null : s.raw)}
                          >
                            {editingSkill === s.raw ? "Done" : "Edit"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Source:</span> {resumeAnalysis.extractedSkills[0].source} indicates the skill was inferred from context, not stated explicitly.
              </p>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resumeAnalysis.extractedEducation.map((ed) => (
                <div key={ed.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{ed.degree}, {ed.field}</p>
                      <p className="text-xs text-muted-foreground">{ed.institution}</p>
                      <p className="text-[11px] text-muted-foreground">{ed.startDate} — {ed.endDate}</p>
                    </div>
                    {ed.verified ? (
                      <VerificationBadge status="verified" />
                    ) : (
                      <VerificationBadge status="pending" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resumeAnalysis.extractedExperience.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.company} · {e.startDate} — {e.endDate}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Skills detected</span><span className="font-semibold">{resumeAnalysis.extractedSkills.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Normalized</span><span className="font-semibold">{resumeAnalysis.extractedSkills.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Education entries</span><span className="font-semibold">{resumeAnalysis.extractedEducation.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Experience entries</span><span className="font-semibold">{resumeAnalysis.extractedExperience.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Eligible for verification</span><span className="font-semibold">4</span></div>
            </CardContent>
          </Card>

          <InfoCallout>
            <span className="font-medium">Disclaimer.</span> AI extraction is probabilistic. Always review extracted data before saving. SkillMatch AI is not trained on real production data — your corrections improve future extractions on your account only.
          </InfoCallout>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Verification status</CardTitle>
              <CardDescription>4 skills flagged for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {["React", "TypeScript", "Tailwind CSS", "Jest"].map((s) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{s}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => toast({ title: "Verification requested", description: `${s} verification request submitted. You'll be notified when it's reviewed.` })}
                  >
                    <ShieldCheck className="h-3 w-3" /> Verify
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================
// RECOMMENDED JOBS LIST
// ============================================================
export function SeekerRecommended() {
  const { go } = useApp();
  const { data, loading, refetch } = useFetch<any>("/api/jobs");
  const [sortBy, setSortBy] = useState("recent");
  const [filter, setFilter] = useState("all");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReranked, setAiReranked] = useState(false);

  const dbJobs: any[] = data?.jobs ?? [];

  // Re-rank jobs using the AI recommendation endpoint
  const refreshWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: {
            name: "Amara Okafor",
            title: "Senior Frontend Engineer",
            skills: seekerSkills.map((s) => ({
              name: s.name,
              proficiency: s.proficiency,
              verified: s.verified === "verified",
            })),
            experienceYears: 6,
            education: "B.Sc. Computer Science · University of Nairobi",
            location: "Nairobi, Kenya",
            preferences: "Open to remote and hybrid roles across Africa",
          },
        }),
      });
      const aiData = await res.json();
      if (!aiData.ok) {
        setAiError(aiData.error ?? "AI recommendation failed.");
        return;
      }
      setAiReranked(true);
      refetch();
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  let filtered = [...dbJobs];
  if (filter === "remote") filtered = filtered.filter((j) => j.remote === "remote");
  if (sortBy === "recent") filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return (
    <PageContainer>
      <SectionHeader
        title="Open Jobs"
        description="Browse all open jobs on the platform. Click any job to view details and apply."
        actions={
          <Button variant="outline" size="sm" onClick={refreshWithAI} disabled={aiLoading}>
            {aiLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Re-ranking…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Re-rank with AI
              </>
            )}
          </Button>
        }
      />

      {aiReranked && !aiError && (
        <div className="mt-4">
          <SuccessBanner
            title="Recommendations re-ranked by AI"
            description="We re-evaluated all jobs against your profile, skills, and preferences."
            onClose={() => setAiReranked(false)}
          />
        </div>
      )}
      {aiError && (
        <div className="mt-4">
          <ErrorState title="AI re-ranking failed" description={aiError} action={<Button size="sm" variant="outline" onClick={refreshWithAI}>Try again</Button>} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({dbJobs.length})</TabsTrigger>
            <TabsTrigger value="remote">Remote ({dbJobs.filter(j => j.remote === "remote").length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading jobs…" rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Target className="h-5 w-5" />}
          title="No open jobs yet"
          description="Check back soon — employers are posting new roles."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((j) => (
            <Card key={j.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <CompanyLogo initials={j.companyLogo || j.company?.slice(0, 2).toUpperCase() || "CO"} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => go("job-detail", { jobId: j.id })}
                          className="text-left text-base font-semibold tracking-tight hover:text-primary"
                        >
                          {j.title}
                        </button>
                        <p className="text-sm text-muted-foreground">{j.company}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.type}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(j.postedAt)}</span>
                          <span className="font-medium text-foreground">${j.salaryMin.toLocaleString()}–${j.salaryMax.toLocaleString()}/{j.salaryPeriod}</span>
                        </div>
                      </div>
                      {j.expiresAt && <JobExpiryBadge expiresAt={j.expiresAt} status={j.status} />}
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => go("job-detail", { jobId: j.id })}>
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => go("match-explanation", { jobId: j.id })}>
                        <Sparkles className="h-3.5 w-3.5" /> Why this match?
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// JOB DETAIL
// ============================================================
export function SeekerJobDetail() {
  const { go, selectedJobId } = useApp();
  const { toast } = useToast();
  // Fetch the real job from the API (includes expiresAt + status)
  const { data: jobData, loading } = useFetch<any>(selectedJobId ? `/api/jobs/${selectedJobId}` : null);
  const apiJob = jobData?.job;
  // Fall back to mock data if the API call fails or is loading
  const mockJob = recommendedJobs.find((j) => j.id === selectedJobId) || recommendedJobs[0];
  const job = apiJob ?? mockJob;
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If the job is expired, show a prominent expired banner
  const isExpired = apiJob?.status === "expired" || (apiJob?.expiresAt && new Date(apiJob.expiresAt).getTime() <= Date.now());

  return (
    <PageContainer>
      <button
        onClick={() => go("recommended")}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to recommendations
      </button>

      {/* Expired job banner */}
      {isExpired && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Job Expired</p>
            <p className="text-xs">This job posting has expired and is no longer accepting applications.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <CompanyLogo initials={job.companyLogo || job.company?.slice(0, 2).toUpperCase() || "CO"} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{job.title}</h1>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.postedAt)}</span>
                      </div>
                    </div>
                    {apiJob?.expiresAt && <JobExpiryBadge expiresAt={apiJob.expiresAt} status={apiJob.status} />}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">{job.category}</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">{job.remote}</Badge>
                    {apiJob ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">${Number(apiJob.salaryMin || 0).toLocaleString()}–${Number(apiJob.salaryMax || 0).toLocaleString()} / {apiJob.salaryPeriod || "month"}</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">${job.salary.min.toLocaleString()}–${job.salary.max.toLocaleString()} / {job.salary.period}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold">About the role</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Required skills</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} mandatory={s.mandatory} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">What you'll do</h2>
                  <ul className="mt-2 space-y-1.5">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">What we're looking for</h2>
                  <ul className="mt-2 space-y-1.5">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          {/* Match score */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Your match score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <MatchScore score={job.matchScore || 0} size="xl" />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {job.matchExplanation?.rationale}
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => go("match-explanation", { jobId: job.id })}
                >
                  See full explanation <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Apply */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {applied ? (
                <SuccessBanner
                  title="Application submitted!"
                  description="Your professional application letter has been sent. You'll receive a notification at each stage of the recruitment process."
                />
              ) : (
                <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) setCoverLetter(""); }}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-10" disabled={isExpired}>
                      {isExpired ? (
                        <><AlertCircle className="h-4 w-4" /> Job Expired</>
                      ) : (
                        <><Send className="h-4 w-4" /> Apply now</>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Apply to {job.title}</DialogTitle>
                      <DialogDescription>
                        You're applying to <span className="font-medium text-foreground">{job.title}</span> at {job.company}. Write a professional application letter below — this is Step 1 of the 7-step recruitment process.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
                      <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                        <span>Match score</span>
                        <span className="font-semibold text-primary">{job.matchScore || 0}%</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cover-letter">Professional application letter *</Label>
                        <Textarea
                          id="cover-letter"
                          rows={8}
                          placeholder={`Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in [your skills/experience], I believe I would be a great fit for this role...\n\nPlease describe:\n• Why you're interested in this role\n• Your relevant skills and experience\n• What makes you a strong candidate`}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="resize-y"
                        />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Minimum 50 characters</span>
                          <span className={coverLetter.trim().length < 50 ? "text-amber-600" : "text-emerald-600"}>
                            {coverLetter.trim().length} chars
                          </span>
                        </div>
                      </div>
                      <InfoCallout>
                        Your contact information stays private until the employer reviews your application and advances you to the next stage.
                      </InfoCallout>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setConfirmOpen(false); setCoverLetter(""); }}>Cancel</Button>
                      <Button
                        onClick={async () => {
                          if (coverLetter.trim().length < 50) {
                            toast({ title: "Application letter too short", description: "Please write at least 50 characters in your application letter." });
                            return;
                          }
                          setSubmitting(true);
                          try {
                            const res = await fetch("/api/applications", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                jobId: job.id,
                                matchScore: job.matchScore || 0,
                                coverLetter: coverLetter.trim(),
                              }),
                            });
                            const data = await res.json();
                            if (data.ok) {
                              setApplied(true);
                              setConfirmOpen(false);
                              setCoverLetter("");
                              toast({ title: "Application submitted!", description: "Your application letter has been sent to the employer." });
                            } else {
                              toast({ title: "Application failed", description: data.error ?? "Please try again." });
                            }
                          } catch {
                            toast({ title: "Network error", description: "Please try again." });
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting || coverLetter.trim().length < 50}
                      >
                        {submitting ? (
                          <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Submitting…</>
                        ) : (
                          <><Send className="h-3.5 w-3.5" /> Submit application</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => {
                  try {
                    const saved = JSON.parse(localStorage.getItem("skillmatch.savedJobs") || "[]");
                    if (!saved.includes(job.id)) {
                      saved.push(job.id);
                      localStorage.setItem("skillmatch.savedJobs", JSON.stringify(saved));
                      toast({ title: "Saved", description: `${job.title} added to your saved jobs.` });
                    } else {
                      toast({ title: "Already saved", description: `${job.title} is already in your saved jobs.` });
                    }
                  } catch {
                    toast({ title: "Could not save", description: "Please try again." });
                  }
                }}
              >
                <Star className="h-3.5 w-3.5" /> Save for later
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Applicants</span><span className="font-semibold">{job.applicants}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Views</span><span className="font-semibold">{job.views}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Posted</span><span className="font-semibold">{timeAgo(job.postedAt)}</span></div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

// ============================================================
// MATCH EXPLANATION
// ============================================================
export function SeekerMatchExplanation() {
  const { go, selectedJobId } = useApp();
  const job = recommendedJobs.find((j) => j.id === selectedJobId) || recommendedJobs[0];
  const explanation = job.matchExplanation!;

  return (
    <PageContainer>
      <button
        onClick={() => go("job-detail", { jobId: job.id })}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to job
      </button>

      <SectionHeader
        title="Why we recommended this job"
        description={`${job.title} · ${job.company}`}
        icon={<Sparkles className="h-4 w-4" />}
      />

      <Card className="mt-6 overflow-hidden border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <MatchScore score={explanation.overall} size="xl" />
            <div className="flex-1">
              <h2 className="text-base font-semibold">Overall match: {explanation.overall}%</h2>
              <p className="mt-1 text-sm text-muted-foreground">{explanation.rationale}</p>
              <div className="mt-3">
                <SuccessBanner
                  title="Strong match"
                  description="You meet all mandatory skills at the requested proficiency."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Match factors breakdown</CardTitle>
            <CardDescription>Hover any factor to see how it's calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {explanation.factors.map((f) => (
              <MatchFactorBar
                key={f.key}
                label={f.label}
                score={f.score}
                weight={f.weight}
                description={f.description}
              />
            ))}
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="font-medium">How is the overall score computed?</p>
              <p className="mt-1 text-blue-700">
                Each factor is weighted, then averaged. Skill match (25%) and required-skill coverage (30%) dominate — proficiencies, experience, education, and verification refine the score.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Matching skills
              </CardTitle>
              <CardDescription>{explanation.matchingSkills.length} of {job.skills.length} required</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {explanation.matchingSkills.map((s) => (
                <SkillChip
                  key={s.name}
                  name={s.name}
                  proficiency={s.proficiency}
                  verified={s.verified}
                  size="sm"
                />
              ))}
            </CardContent>
          </Card>

          {explanation.missingSkills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" /> Missing skills
                </CardTitle>
                <CardDescription>You'll need to address these to maximize your match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {explanation.missingSkills.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-rose-900">{s.name}</p>
                      <p className="text-rose-700">Required: <span className="capitalize">{s.requiredProficiency}</span></p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-white">
                      {s.mandatory ? "Mandatory" : "Preferred"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" /> Recommended skills to learn
              </CardTitle>
              <CardDescription>Picking these up will lift your score</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {explanation.recommendedSkills.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => go("skill-gap")}
              >
                View full skill-gap analysis <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================
// APPLICATIONS
// ============================================================
export function SeekerApplications() {
  const { go } = useApp();
  const { toast } = useToast();
  const { data, loading } = useFetch<any>("/api/applications");
  const [filter, setFilter] = useState("all");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const allApps: any[] = data?.applications ?? [];
  let apps = [...allApps];
  if (filter !== "all") {
    if (filter === "active") {
      apps = apps.filter((a) => a.status !== "rejected" && a.status !== "hired");
    } else if (filter === "rejected") {
      apps = apps.filter((a) => a.status === "rejected");
    } else if (filter === "hired") {
      apps = apps.filter((a) => a.status === "hired");
    } else {
      apps = apps.filter((a) => a.status === filter);
    }
  }

  // Count by pipeline stage
  const stepCounts = {
    step1: allApps.filter(a => a.status === "applied").length,
    step2: allApps.filter(a => a.status === "reviewing" || a.status === "review_passed").length,
    step3: allApps.filter(a => a.status === "exam_notified").length,
    step4: allApps.filter(a => a.status === "exam_completed" || a.status === "exam_passed").length,
    step5: allApps.filter(a => a.status === "interview_notified" || a.status === "interview_completed" || a.status === "interview_passed").length,
    step6: allApps.filter(a => a.status === "selected").length,
    step7: allApps.filter(a => a.status === "hired").length,
    rejected: allApps.filter(a => a.status === "rejected").length,
  };

  return (
    <PageContainer>
      <SectionHeader
        title="My Applications"
        description="Track every application through the 7-step recruitment process — from submission to job assignment."
      />

      <div className="mt-4">
        <InfoCallout>
          <span className="font-medium">7-Step Recruitment Process:</span> Apply → Application Review → Written Exam Notification → Written Examination → Interview (Oral + Practical) → Final Selection → Final Call & Job Assignment. You must pass each stage to advance to the next. You'll receive a notification at every step.
        </InfoCallout>
      </div>

      {/* Stage stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Applied" value={stepCounts.step1.toString()} icon={<Send className="h-3 w-3" />} />
        <StatCard label="Review" value={stepCounts.step2.toString()} icon={<CheckCircle2 className="h-3 w-3" />} />
        <StatCard label="Exam Notified" value={stepCounts.step3.toString()} icon={<Mail className="h-3 w-3" />} />
        <StatCard label="Exam" value={stepCounts.step4.toString()} icon={<PenSquare className="h-3 w-3" />} />
        <StatCard label="Interview" value={stepCounts.step5.toString()} icon={<Users className="h-3 w-3" />} />
        <StatCard label="Selected" value={stepCounts.step6.toString()} icon={<Trophy className="h-3 w-3" />} />
        <StatCard label="Hired" value={stepCounts.step7.toString()} icon={<PhoneCall className="h-3 w-3" />} />
        <StatCard label="Rejected" value={stepCounts.rejected.toString()} icon={<X className="h-3 w-3" />} />
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="all">All ({allApps.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({allApps.filter(a => a.status !== "rejected" && a.status !== "hired").length})</TabsTrigger>
          <TabsTrigger value="applied">Applied ({stepCounts.step1})</TabsTrigger>
          <TabsTrigger value="review_passed">Review Passed ({stepCounts.step2})</TabsTrigger>
          <TabsTrigger value="exam_notified">Exam Notified ({stepCounts.step3})</TabsTrigger>
          <TabsTrigger value="exam_passed">Exam Passed ({stepCounts.step4})</TabsTrigger>
          <TabsTrigger value="interview_passed">Interview ({stepCounts.step5})</TabsTrigger>
          <TabsTrigger value="selected">Selected ({stepCounts.step6})</TabsTrigger>
          <TabsTrigger value="hired">Hired ({stepCounts.step7})</TabsTrigger>
          <TabsTrigger value="rejected">Closed ({stepCounts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState label="Loading applications…" rows={2} />
      ) : apps.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Send className="h-5 w-5" />}
          title="No applications in this category"
          description="Apply to open jobs to start tracking them here."
          action={<Button size="sm" onClick={() => go("recommended")}>Browse jobs</Button>}
        />
      ) : (
        <div className="mt-6 space-y-3">
          {apps.map((a) => {
            const isExpanded = expandedApp === a.id;
            const isRejected = a.status === "rejected";
            const currentStep = a.currentStep || (isRejected ? parseInt(a.rejectionStage || "1", 10) : 1);
            return (
              <Card key={a.id} className={cn(isRejected && "opacity-80")}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <CompanyLogo initials={a.job?.companyLogo || "CO"} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{a.job?.title}</p>
                          <p className="text-xs text-muted-foreground">{a.job?.company} · {a.job?.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            isRejected ? "bg-rose-50 text-rose-700 border-rose-200" :
                            a.status === "hired" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-violet-50 text-violet-700 border-violet-200"
                          )}>
                            {isRejected ? "Rejected" : a.status === "hired" ? "Hired" : `Step ${currentStep}/7`}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Applied {timeAgo(a.appliedAt)}</span>
                        <span>Updated {timeAgo(a.updatedAt)}</span>
                        {a.matchScore && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-primary" /> Match: <span className="font-semibold text-foreground">{a.matchScore}%</span>
                          </span>
                        )}
                      </div>

                      {/* Compact pipeline */}
                      <div className="mt-3">
                        <RecruitmentPipeline
                          currentStep={currentStep}
                          rejected={isRejected}
                          rejectionStage={a.rejectionStage ? parseInt(a.rejectionStage, 10) : undefined}
                          rejectionReason={a.rejectionReason}
                          scores={{
                            examScore: a.examScore,
                            oralScore: a.oralScore,
                            practicalScore: a.practicalScore,
                            interviewOverallScore: a.interviewOverallScore,
                          }}
                          dates={{
                            appliedAt: a.appliedAt,
                            reviewedAt: a.reviewedAt,
                            examNotifiedAt: a.examNotifiedAt,
                            examCompletedAt: a.examCompletedAt,
                            interviewNotifiedAt: a.interviewNotifiedAt,
                            interviewCompletedAt: a.interviewCompletedAt,
                            selectedAt: a.selectedAt,
                            hiredAt: a.hiredAt,
                          }}
                          compact
                        />
                      </div>

                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="mt-4 space-y-3 border-t border-border pt-3">
                          {a.coverLetter && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your Application Letter</p>
                              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap text-foreground/80 max-h-40 overflow-y-auto">
                                {a.coverLetter}
                              </div>
                            </div>
                          )}
                          {a.jobAssignment && a.status === "hired" && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Job Assignment Details</p>
                              <p className="text-xs text-emerald-800 whitespace-pre-wrap">{a.jobAssignment}</p>
                            </div>
                          )}
                          {a.examNotifiedAt && a.examSchedule && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Written Exam Details</p>
                              <p className="text-xs text-blue-800">
                                Date: {new Date(a.examSchedule.scheduledAt).toLocaleString()} · Duration: {a.examSchedule.duration} min · Location: {a.examSchedule.location}
                              </p>
                              {a.examSchedule.instructions && <p className="text-xs text-blue-700 mt-1">{a.examSchedule.instructions}</p>}
                            </div>
                          )}
                          {a.interviewNotifiedAt && a.interviewSchedule && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Interview Details</p>
                              <p className="text-xs text-amber-800">
                                Date: {new Date(a.interviewSchedule.scheduledAt).toLocaleString()} · Duration: {a.interviewSchedule.duration} min · Location: {a.interviewSchedule.location} · Format: {a.interviewSchedule.format}
                              </p>
                              {a.interviewSchedule.instructions && <p className="text-xs text-amber-700 mt-1">{a.interviewSchedule.instructions}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setExpandedApp(isExpanded ? null : a.id)}>
                          {isExpanded ? "Hide details" : "View details"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => go("messages")}>
                          <MessageSquare className="h-3.5 w-3.5" /> Message
                        </Button>
                        {!isRejected && a.status !== "hired" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600"
                            onClick={async () => {
                              if (!confirm("Withdraw this application? This cannot be undone.")) return;
                              try {
                                const res = await fetch("/api/applications", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ applicationId: a.id, action: "withdraw" }),
                                });
                                const data = await res.json();
                                if (data.ok) {
                                  toast({ title: "Application withdrawn", description: "Your application has been withdrawn." });
                                  window.location.reload();
                                } else {
                                  toast({ title: "Failed", description: data.error ?? "Please try again." });
                                }
                              } catch {
                                toast({ title: "Network error", description: "Please try again." });
                              }
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                    {a.matchScore && (
                      <div className="sm:pl-2">
                        <MatchScore score={a.matchScore} size="md" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// SKILL GAP ANALYSIS
// ============================================================
export function SeekerSkillGap() {
  const { go } = useApp();
  return (
    <PageContainer>
      <SectionHeader
        title="Skill Gap Analysis"
        description="Skills that separate you from your target roles, with curated learning paths."
        icon={<TrendingUp className="h-4 w-4" />}
      />

      <InfoCallout className="mt-6">
        <span className="font-medium">How this works.</span> We analyzed the skills required across 4 recommended jobs and identified the gaps below. Each gap shows how many additional jobs it would unlock.
      </InfoCallout>

      <div className="mt-6 space-y-3">
        {skillGapAnalysis.map((g: SkillGapItem) => (
          <Card key={g.skill}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{g.skill}</p>
                    {g.gap >= 3 && (
                      <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">
                        Critical gap
                      </Badge>
                    )}
                    {g.gap === 1 && (
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        Small gap
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required: <span className="capitalize font-medium text-foreground">{g.requiredProficiency}</span> · You: {g.currentProficiency ? <span className="capitalize font-medium text-foreground">{g.currentProficiency}</span> : "not yet started"}
                  </p>
                  <p className="text-xs text-muted-foreground">Unlocks <span className="font-semibold text-foreground">{g.jobsAvailable}</span> additional job matches</p>

                  {/* Gap visualization */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase text-muted-foreground">Beginner</span>
                    {(["beginner", "intermediate", "advanced", "expert"] as ProficiencyLevel[]).map((lvl) => {
                      const isReached = g.currentProficiency && (
                        ["beginner", "intermediate", "advanced", "expert"].indexOf(g.currentProficiency) >=
                        ["beginner", "intermediate", "advanced", "expert"].indexOf(lvl)
                      );
                      const isRequired = lvl === g.requiredProficiency;
                      return (
                        <div
                          key={lvl}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            isReached ? "bg-emerald-500" : isRequired ? "bg-rose-400" : "bg-muted"
                          )}
                        />
                      );
                    })}
                    <span className="text-[10px] uppercase text-muted-foreground">Expert</span>
                  </div>
                </div>
                <div className="sm:ml-3 sm:w-56">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Recommended resources</p>
                  <div className="space-y-1.5">
                    {g.recommendedResources.map((r) => (
                      <div key={r.title} className="rounded-md border border-border bg-card p-2 text-xs">
                        <p className="font-semibold leading-tight">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground">{r.provider} · {r.duration} · {r.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export function SeekerNotifications() {
  const { data, loading, refetch } = useFetch<any>("/api/notifications");
  const items: any[] = data?.notifications ?? [];
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread" ? items.filter((n) => !n.read) : items;

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    refetch();
  };

  const toggleRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refetch();
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Notifications"
        description={`${items.filter((n) => !n.read).length} unread`}
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={items.filter((n) => !n.read).length === 0}>
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({items.filter(n => !n.read).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState label="Loading notifications…" rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Bell className="h-5 w-5" />}
          title="No notifications here"
          description="You're all caught up. New activity will appear here."
        />
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent",
                !n.read ? "border-primary/30 bg-primary/5" : "border-border"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                n.type === "interview" ? "bg-amber-100 text-amber-700" :
                n.type === "match" ? "bg-violet-100 text-violet-700" :
                n.type === "application" ? "bg-blue-100 text-blue-700" :
                n.type === "message" ? "bg-emerald-100 text-emerald-700" :
                "bg-slate-100 text-slate-700"
              )}>
                {n.type === "interview" ? <Calendar className="h-4 w-4" /> :
                 n.type === "match" ? <Target className="h-4 w-4" /> :
                 n.type === "application" ? <Send className="h-4 w-4" /> :
                 n.type === "message" ? <MessageSquare className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// MESSAGES
// ============================================================
export function SeekerMessages() {
  const { selectedConversationId, go } = useApp();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(seekerConversations);
  const [activeId, setActiveId] = useState<string>(selectedConversationId || conversations[0].id);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;

  const send = () => {
    if (!draft.trim()) return;
    setConversations(
      conversations.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: draft,
              lastTime: "now",
              unread: 0,
              messages: [
                ...c.messages,
                { id: `m${Date.now()}`, sender: "me", text: draft, time: "now" },
              ],
            }
          : c
      )
    );
    setDraft("");
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Messages"
        description="Chat with recruiters after they shortlist you."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-border p-3">
              <Input placeholder="Search conversations…" className="h-9" />
            </div>
            <div className="max-h-[60vh] divide-y divide-border lg:max-h-full overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-accent",
                    activeId === c.id && "bg-primary/5"
                  )}
                >
                  <Avatar initials={c.participantInitials} color={c.participantColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{c.participantName}</p>
                      <span className="text-[10px] text-muted-foreground">{c.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.participantRole}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active conversation */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border p-3">
              <Avatar initials={active.participantInitials} color={active.participantColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{active.participantName}</p>
                <p className="text-[11px] text-muted-foreground">{active.participantRole}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast({ title: "Call feature", description: "Voice calls are not enabled in this demo. Send a message instead." })}
                aria-label="Call"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 max-h-[60vh]">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                      m.sender === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    )}
                  >
                    <p>{m.text}</p>
                    <p className={cn(
                      "mt-1 text-[10px]",
                      m.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input
                placeholder="Type your message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              />
              <Button size="icon" onClick={send}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
