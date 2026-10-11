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
import {
  MatchScore,
  SkillChip,
  ApplicationStatusBadge,
  JobStatusBadge,
  JobExpiryBadge,
  Avatar,
  CompanyLogo,
  SectionHeader,
  StatCard,
  EmptyState,
  LoadingState,
  ErrorState,
  SuccessBanner,
  InfoCallout,
  PrivacyLock,
  TableToolbar,
} from "@/components/shared/ui";
import { RecruitmentPipeline } from "@/components/shared/recruitment-pipeline";
import {
  employerJobs,
  candidates,
  employerNotifications,
  employerConversations,
  employerDashboardStats,
  currentUser,
} from "@/lib/mock-data";
import { useFetch } from "@/lib/use-fetch";
import { ProfilePhotoUpload } from "@/components/shared/profile-photo-upload";
import {
  validateJobTitle,
  validateLocation,
  validateNumber,
  validateRequired,
  validateExpirationDuration,
  sanitizeNumber,
} from "@/lib/validation";
import type { Job, Candidate, ApplicationStatus, Conversation, ProficiencyLevel } from "@/lib/types";
import {
  Building2,
  Briefcase,
  Users,
  Send,
  Bell,
  MessageSquare,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  Target,
  Star,
  Eye,
  Check,
  Search,
  Filter,
  Sparkles,
  Cpu,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  UserCheck,
  X,
  Trash2,
  Save,
  Send as SendIcon,
  CalendarClock,
  PenSquare,
  Trophy,
  PhoneCall,
  ClipboardCheck,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";

function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  );
}

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
// EMPLOYER DASHBOARD
// ============================================================
export function EmployerDashboard() {
  const { go } = useApp();
  const { data: jobsData, loading: jobsLoading } = useFetch<any>("/api/jobs");
  const { data: candidatesData } = useFetch<any>("/api/candidates");
  const { data: notifData } = useFetch<any>("/api/notifications");

  const jobs: any[] = jobsData?.jobs ?? [];
  const candidates: any[] = candidatesData?.candidates ?? [];
  const notifications: any[] = notifData?.notifications ?? [];

  const publishedJobs = jobs.filter((j) => j.status === "published");
  const draftJobs = jobs.filter((j) => j.status === "draft");
  const totalApplicants = candidates.length;
  const shortlisted = candidates.filter((c) => c.applicationStatus === "shortlisted").length;
  const interviews = candidates.filter((c) => c.applicationStatus === "interview").length;

  return (
    <PageContainer>
      <SectionHeader
        title="Hiring overview"
        description="Track your active jobs, applicants, and interviews."
        actions={
          <Button className="btn-rainbow" onClick={() => go("job-edit", { jobId: "new" })}>
            <Plus className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={publishedJobs.length} icon={<Briefcase className="h-4 w-4" />} hint={`${draftJobs.length} draft${draftJobs.length === 1 ? "" : "s"}`} onClick={() => go("jobs")} />
        <StatCard label="Total applicants" value={totalApplicants} icon={<Users className="h-4 w-4" />} hint="Across all jobs" onClick={() => go("candidates")} />
        <StatCard label="Shortlisted" value={shortlisted} icon={<Star className="h-4 w-4" />} hint="Awaiting next step" onClick={() => go("candidates")} />
        <StatCard label="In interview" value={interviews} icon={<CalendarClock className="h-4 w-4" />} hint="Active interview stage" onClick={() => go("interviews")} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Active jobs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Your jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => go("jobs")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {jobsLoading ? (
              <LoadingState label="Loading jobs…" rows={2} />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-5 w-5" />}
                title="No jobs yet"
                description="Post your first job to start receiving applicants."
                action={<Button size="sm" onClick={() => go("job-edit", { jobId: "new" })}><Plus className="h-3.5 w-3.5" /> Post a job</Button>}
              />
            ) : (
              jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => go("candidates", { jobId: j.id })}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <CompanyLogo initials={j.companyLogo || "CO"} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:text-primary">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.location} · posted {timeAgo(j.postedAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <JobStatusBadge status={j.status} />
                    {j.status === "published" && j.expiresAt && <JobExpiryBadge expiresAt={j.expiresAt} status={j.status} />}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top candidates */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Recent candidates</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => go("candidates")}>
              All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {candidates.length === 0 ? (
              <EmptyState icon={<Users className="h-5 w-5" />} title="No candidates yet" description="Applicants will appear here." />
            ) : (
              candidates.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => go("candidate-detail", { candidateId: c.id })}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:bg-accent"
                >
                  <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold group-hover:text-primary">{c.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{c.title}</p>
                  </div>
                  {c.matchScore > 0 && <MatchScore score={c.matchScore} size="sm" showLabel={false} />}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent notifications */}
      <Card className="mt-4">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Recent notifications</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => go("notifications")}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell className="h-5 w-5" />} title="No notifications" />
          ) : (
            notifications.slice(0, 3).map((n) => (
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
    </PageContainer>
  );
}

// ============================================================
// COMPANY PROFILE
// ============================================================
export function EmployerCompanyProfile() {
  const { user: sessionUser } = useApp();
  const { data, loading, refetch } = useFetch<any>("/api/profile");
  const profile = data?.profile;

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setCompany(profile.company ?? "");
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
        body: JSON.stringify({ name, title, location, about, company }),
      });
      const json = await res.json();
      if (json.ok) {
        setSaveMsg({ ok: true, msg: "Company profile updated successfully." });
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

  if (loading) return <PageContainer><LoadingState label="Loading company profile…" rows={3} /></PageContainer>;

  return (
    <PageContainer>
      <SectionHeader
        title="Company Profile"
        description="This information appears on every job you post."
        actions={
          <ProfilePhotoUpload
            photo={profile?.profilePhoto}
            initials={profile?.initials ?? sessionUser?.initials ?? "CO"}
            color={profile?.avatarColor ?? sessionUser?.avatarColor ?? "oklch(0.6 0.18 240)"}
            onUploaded={() => refetch()}
          />
        }
      />

      {saveMsg && (
        <div className={cn(
          "mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
          saveMsg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
        )}>
          {saveMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {saveMsg.msg}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Company card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Company logo" className="h-20 w-20 rounded-xl object-cover shadow-md" />
              ) : (
                <CompanyLogo initials={company?.slice(0, 2).toUpperCase() || "CO"} size="lg" className="!h-20 !w-20 !text-2xl" />
              )}
              <h2 className="mt-3 text-base font-semibold">{company || "Your Company"}</h2>
              <p className="text-xs text-muted-foreground">{location || "—"}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">Technology</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Employer</Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                  <ShieldCheck className="h-2.5 w-2.5" /> Verified
                </Badge>
              </div>
              <div className="mt-4 w-full space-y-1 border-t border-border pt-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {sessionUser?.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable fields */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Company information</CardTitle>
              <CardDescription>Edit your company name, contact info, and description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company name *</Label>
                  <Input id="company-name" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Northwind Technologies" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Contact person</Label>
                  <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-title">Your title</Label>
                  <Input id="contact-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Talent Acquisition Lead" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-location">Location *</Label>
                  <Input id="company-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-about">About the company</Label>
                <Textarea
                  id="company-about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Describe your company, mission, and what you do."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={saving}>Cancel</Button>
                <Button size="sm" className="btn-blue" onClick={save} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Saving…
                    </>
                  ) : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Hiring contact</CardTitle>
              <CardDescription>This email receives application notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{sessionUser?.email}</span>
              </div>
              <p className="text-muted-foreground">To change the hiring contact email, contact your platform administrator.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================
// EMPLOYER JOBS LIST
// ============================================================
export function EmployerJobs() {
  const { go } = useApp();
  const { data, loading, refetch } = useFetch<any>("/api/jobs");
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allJobs: any[] = data?.jobs ?? [];
  let jobs = [...allJobs];
  if (filter !== "all") jobs = jobs.filter((j) => j.status === filter);

  const closeJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    refetch();
  };

  const deleteJob = async (id: string) => {
    setDeleteId(id);
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      refetch();
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Jobs"
        description="Create, publish, and manage your job postings."
        actions={
          <Button onClick={() => go("job-edit", { jobId: "new" })}>
            <Plus className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="all">All ({allJobs.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({allJobs.filter(j => j.status === "published").length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({allJobs.filter(j => j.status === "draft").length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({allJobs.filter(j => j.status === "closed").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState label="Loading jobs…" rows={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<Briefcase className="h-5 w-5" />}
          title="No jobs in this category"
          description="Create a new job posting to start receiving applicants."
          action={<Button size="sm" onClick={() => go("job-edit", { jobId: "new" })}>Post a job</Button>}
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Job</th>
                <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Status</th>
                <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Posted</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <CompanyLogo initials={j.companyLogo || "CO"} size="sm" />
                      <div className="min-w-0">
                        <button
                          onClick={() => go("candidates", { jobId: j.id })}
                          className="block truncate text-sm font-semibold hover:text-primary text-left"
                        >
                          {j.title}
                        </button>
                        <p className="text-xs text-muted-foreground">{j.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <JobStatusBadge status={j.status} />
                      {j.status === "published" && j.expiresAt && <JobExpiryBadge expiresAt={j.expiresAt} status={j.status} />}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(j.postedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => go("candidates", { jobId: j.id })} title="View candidates">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => go("job-edit", { jobId: j.id })} title="Edit">
                        Edit
                      </Button>
                      {j.status === "published" && (
                        <Button size="sm" variant="ghost" onClick={() => closeJob(j.id)} title="Close job">
                          Close
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteJob(j.id)}
                        disabled={deleteId === j.id}
                        title="Delete job"
                      >
                        {deleteId === j.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

// ============================================================
// JOB CREATE/EDIT
// ============================================================
export function EmployerJobEdit() {
  const { go, selectedJobId } = useApp();
  const isNew = selectedJobId === "new";
  const { data: existingData } = useFetch<any>(selectedJobId && selectedJobId !== "new" ? `/api/jobs/${selectedJobId}` : null);
  const existing = existingData?.job;

  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [jobType, setJobType] = useState("full-time");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("hybrid");
  const [salaryMin, setSalaryMin] = useState("5000");
  const [salaryMax, setSalaryMax] = useState("8000");
  const [description, setDescription] = useState("");
  const [expirationDays, setExpirationDays] = useState("30"); // default 30 days
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<
    { id: string; name: string; category: string; proficiency: ProficiencyLevel; mandatory: boolean; weight: number }[]
  >([]);
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<ProficiencyLevel>("intermediate");
  const [newMandatory, setNewMandatory] = useState(true);

  // Sync form when existing job loads
  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? "");
      setCategory(existing.category ?? "Engineering");
      setJobType(existing.type ?? "full-time");
      setLocation(existing.location ?? "");
      setRemote(existing.remote ?? "hybrid");
      setSalaryMin(String(existing.salaryMin ?? 5000));
      setSalaryMax(String(existing.salaryMax ?? 8000));
      setDescription(existing.description ?? "");
      // If the job has an expiresAt, calculate remaining days for display
      if (existing.expiresAt) {
        const remaining = Math.ceil((new Date(existing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        setExpirationDays(String(Math.max(1, remaining)));
      }
    }
  }, [existing]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([
      ...skills,
      { id: `n${Date.now()}`, name: newSkill.trim(), category: "Custom", proficiency: newProficiency, mandatory: newMandatory, weight: newMandatory ? 0.8 : 0.4 },
    ]);
    setNewSkill("");
  };

  const removeSkill = (id: string) => setSkills(skills.filter((s) => s.id !== id));

  const saveJob = async (status: "draft" | "published") => {
    setError(null);
    setFieldErrors({});

    // ---------- FRONTEND VALIDATION ----------
    const errs: Record<string, string> = {};
    const titleCheck = validateJobTitle(title);
    if (!titleCheck.ok) errs.title = titleCheck.error!;
    const locCheck = validateLocation(location);
    if (!locCheck.ok) errs.location = locCheck.error!;
    const descCheck = validateRequired(description, "Job description", { minLength: 10, maxLength: 5000 });
    if (!descCheck.ok) errs.description = descCheck.error!;
    const minCheck = validateNumber(salaryMin, "Salary minimum", { min: 0, max: 1000000 });
    if (!minCheck.ok) errs.salaryMin = minCheck.error!;
    const maxCheck = validateNumber(salaryMax, "Salary maximum", { min: 0, max: 1000000 });
    if (!maxCheck.ok) errs.salaryMax = maxCheck.error!;
    if (Number(salaryMin) >= Number(salaryMax)) errs.salaryMax = "Salary maximum must be greater than the minimum.";
    if (status === "published") {
      const expCheck = validateExpirationDuration(expirationDays);
      if (!expCheck.ok) errs.expirationDays = expCheck.error!;
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the errors highlighted below before continuing.");
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        type: jobType,
        location: location.trim(),
        remote,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        description: description.trim(),
        status,
        expirationDays: status === "published" ? Number(expirationDays) : undefined,
        skills: skills.map((s) => ({ name: s.name, proficiency: s.proficiency, mandatory: s.mandatory })),
      };
      let res;
      if (isNew) {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/jobs/${selectedJobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Failed to save job.");
        return;
      }
      if (status === "draft") {
        setSavedDraft(true);
      } else {
        setPublished(true);
        // Trigger the notification popup + sound on the client
        try {
          sessionStorage.setItem("skillmatch.jobPosted", JSON.stringify({
            title: title.trim(),
            company: existing?.company ?? "Your company",
            timestamp: Date.now(),
          }));
        } catch { /* ignore */ }
        setTimeout(() => go("jobs"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <button
        onClick={() => go("jobs")}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
      </button>

      <SectionHeader
        title={isNew ? "Post a new job" : `Edit: ${existing?.title}`}
        description="Define job details and required skills. The AI uses these to score every applicant."
      />

      {savedDraft && (
        <div className="mt-4">
          <SuccessBanner title="Draft saved" description="You can continue editing and publish when ready." onClose={() => setSavedDraft(false)} />
        </div>
      )}
      {published && (
        <div className="mt-4">
          <SuccessBanner title="Job published!" description="It's now live and visible to candidates. We'll notify you when applications arrive." onClose={() => setPublished(false)} />
        </div>
      )}

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {[
          { n: 1, label: "Job details" },
          { n: 2, label: "Skills & proficiency" },
          { n: 3, label: "Review & publish" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <button
              onClick={() => setStep(s.n)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                step === s.n ? "bg-primary text-primary-foreground" : step > s.n ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.n ? <Check className="h-3 w-3" /> : <span className="font-bold">{s.n}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < 2 && <div className="h-px flex-1 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Job title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={cn(fieldErrors.title && "border-rose-400 focus-visible:ring-rose-200")}
                />
                {fieldErrors.title && <p className="text-xs text-rose-600">{fieldErrors.title}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Location *</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className={cn(fieldErrors.location && "border-rose-400 focus-visible:ring-rose-200")}
                  />
                  {fieldErrors.location && <p className="text-xs text-rose-600">{fieldErrors.location}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Workplace</Label>
                  <Select value={remote} onValueChange={setRemote}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Salary min (USD / month) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(sanitizeNumber(e.target.value))}
                    className={cn(fieldErrors.salaryMin && "border-rose-400 focus-visible:ring-rose-200")}
                  />
                  {fieldErrors.salaryMin && <p className="text-xs text-rose-600">{fieldErrors.salaryMin}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Salary max (USD / month) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(sanitizeNumber(e.target.value))}
                    className={cn(fieldErrors.salaryMax && "border-rose-400 focus-visible:ring-rose-200")}
                  />
                  {fieldErrors.salaryMax && <p className="text-xs text-rose-600">{fieldErrors.salaryMax}</p>}
                </div>
              </div>
              {/* Expiration duration — required when publishing */}
              <div className="space-y-1.5">
                <Label>Expiration duration (days) *</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(sanitizeNumber(e.target.value))}
                    placeholder="30"
                    className={cn("w-32", fieldErrors.expirationDays && "border-rose-400 focus-visible:ring-rose-200")}
                  />
                  <div className="flex gap-1.5">
                    {[
                      { label: "7 days", val: "7" },
                      { label: "14 days", val: "14" },
                      { label: "30 days", val: "30" },
                      { label: "60 days", val: "60" },
                      { label: "90 days", val: "90" },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setExpirationDays(preset.val)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-medium transition-all",
                          expirationDays === preset.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                {fieldErrors.expirationDays ? (
                  <p className="text-xs text-rose-600">{fieldErrors.expirationDays}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    The job will automatically expire and change to "Expired" status after this many days.
                    {expirationDays && Number(expirationDays) > 0 && (
                      <> Expires on <strong>{new Date(Date.now() + Number(expirationDays) * 86400000).toLocaleDateString()}</strong>.</>
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Job description *</Label>
                <Textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, team, and what success looks like…"
                  className={cn(fieldErrors.description && "border-rose-400 focus-visible:ring-rose-200")}
                />
                {fieldErrors.description && <p className="text-xs text-rose-600">{fieldErrors.description}</p>}
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => { setError(null); setStep(2); }}>Continue <ArrowRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Required skills</h3>
                <p className="text-xs text-muted-foreground">Mark skills as mandatory or preferred and set proficiency thresholds. The AI uses these to score every applicant.</p>
              </div>

              <InfoCallout>
                <span className="font-medium">Tip:</span> Set the proficiency threshold to the minimum acceptable level. Setting it higher narrows your funnel; setting it lower widens it.
              </InfoCallout>

              {/* Existing skills */}
              <div className="space-y-2">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
                    <SkillChip name={s.name} size="sm" />
                    <div className="ml-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Proficiency:</span>
                      <Badge variant="outline" className="capitalize text-[10px]">{s.proficiency}</Badge>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Label className="text-xs flex items-center gap-1.5 cursor-pointer">
                        <Switch
                          checked={s.mandatory}
                          onCheckedChange={(v) => setSkills(skills.map(x => x.id === s.id ? { ...x, mandatory: v } : x))}
                        />
                        Mandatory
                      </Label>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeSkill(s.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add skill */}
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-semibold">Add a skill</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Skill name (e.g. AWS)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="h-8 flex-1 min-w-[140px]"
                  />
                  <Select value={newProficiency} onValueChange={(v) => setNewProficiency(v as ProficiencyLevel)}>
                    <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="text-xs flex items-center gap-1.5">
                    <Switch checked={newMandatory} onCheckedChange={setNewMandatory} />
                    Mandatory
                  </Label>
                  <Button size="sm" onClick={addSkill}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue <ArrowRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Review & publish</h3>
                <p className="text-xs text-muted-foreground">Check everything looks right, then publish to make this job visible to candidates.</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="text-[10px] uppercase text-muted-foreground">Title</p><p className="text-sm font-semibold">{title || "—"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Category</p><p className="text-sm">{category}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Location</p><p className="text-sm">{location || "—"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Workplace</p><p className="text-sm capitalize">{remote}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Salary</p><p className="text-sm">${Number(salaryMin || 0).toLocaleString()}–${Number(salaryMax || 0).toLocaleString()} / month</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Skills</p><p className="text-sm">{skills.length} required ({skills.filter(s=>s.mandatory).length} mandatory)</p></div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Expiration</p>
                    <p className="text-sm font-semibold">
                      {expirationDays && Number(expirationDays) > 0 ? (
                        <>
                          Expires in {expirationDays} day{Number(expirationDays) === 1 ? "" : "s"}
                          {" "}(<strong>{new Date(Date.now() + Number(expirationDays) * 86400000).toLocaleDateString()}</strong>)
                        </>
                      ) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} mandatory={s.mandatory} size="sm" />
                  ))}
                </div>
              </div>

              <InfoCallout>
                <span className="font-medium">Privacy commitment:</span> Candidates' contact information remains hidden until they apply or accept your interview request. This protects candidate privacy and improves funnel quality.
              </InfoCallout>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => saveJob("draft")} disabled={saving}>
                    <Save className="h-3.5 w-3.5" /> Save draft
                  </Button>
                  <Button onClick={() => saveJob("published")} disabled={saving}>
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Publishing…
                      </>
                    ) : (
                      <>
                        <SendIcon className="h-3.5 w-3.5" /> Publish job
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// CANDIDATE RANKING
// ============================================================
export function EmployerCandidates() {
  const { go, selectedJobId } = useApp();
  const url = selectedJobId ? `/api/candidates?jobId=${selectedJobId}` : "/api/candidates";
  const { data, loading } = useFetch<any>(url);
  const [sortBy, setSortBy] = useState("match");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const allCandidates: any[] = data?.candidates ?? [];
  let list = [...allCandidates];
  if (filter !== "all") list = list.filter((c) => c.applicationStatus === filter);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.title ?? "").toLowerCase().includes(q));
  }
  list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const targetJobTitle = allCandidates[0]?.job?.title ?? "all your jobs";

  const updateStatus = async (applicationId: string, status: string) => {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status }),
    });
    // Refresh by reloading the page (simple)
    window.location.reload();
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Candidate Ranking"
        description={`Applicants for ${targetJobTitle}`}
        actions={
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {allCandidates.length} candidate{allCandidates.length === 1 ? "" : "s"}
          </Badge>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Sort: Match score</SelectItem>
            <SelectItem value="recent">Sort: Most recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading candidates…" rows={3} />
      ) : list.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Users className="h-5 w-5" />}
          title="No candidates match your filters"
          description="Try clearing filters or wait for new applications to arrive."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => go("candidate-detail", { candidateId: c.id })}
                          className="text-left text-sm font-semibold hover:text-primary"
                        >
                          {c.name}
                        </button>
                        <p className="text-xs text-muted-foreground">{c.title} · {c.location}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span>Applied {timeAgo(c.appliedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApplicationStatusBadge status={c.applicationStatus} />
                        {c.matchScore > 0 && <MatchScore score={c.matchScore} size="md" />}
                      </div>
                    </div>

                    {c.skills && c.skills.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-semibold uppercase text-emerald-700">Candidate skills</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.skills.slice(0, 6).map((s: any) => (
                            <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} verified={s.verified} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => go("candidate-detail", { candidateId: c.id })}>
                        <Eye className="h-3.5 w-3.5" /> View profile
                      </Button>
                      {c.applicationStatus !== "shortlisted" && c.applicationStatus !== "interview" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(c.applicationId, "shortlisted")}>
                          <Star className="h-3.5 w-3.5" /> Shortlist
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => updateStatus(c.applicationId, "interview")}>
                        <CalendarClock className="h-3.5 w-3.5" /> Move to interview
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(c.applicationId, "rejected")}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                      <PrivacyLock compact />
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
// CANDIDATE DETAIL
// ============================================================
export function EmployerCandidateDetail() {
  const { go, selectedCandidateId } = useApp();
  const { data, loading, refetch } = useFetch<any>(`/api/candidates`);
  const allCandidates: any[] = data?.candidates ?? [];
  const c = allCandidates.find((x: any) => x.id === selectedCandidateId) || allCandidates[0];
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const updateStatus = async (status: string) => {
    if (!c?.applicationId) return;
    setActionLoading(true);
    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: c.applicationId, status }),
      });
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !c) {
    return <PageContainer><LoadingState label="Loading candidate profile…" rows={3} /></PageContainer>;
  }

  const isShortlisted = c.applicationStatus === "shortlisted" || c.applicationStatus === "interview";

  return (
    <PageContainer>
      <button
        onClick={() => go("candidates")}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to candidates
      </button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Candidate header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {c.profilePhoto ? (
                  <img src={c.profilePhoto} alt={c.name} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <Avatar initials={c.initials} color={c.avatarColor} size="lg" />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold tracking-tight">{c.name}</h1>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                    <span>Applied {timeAgo(c.appliedAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ApplicationStatusBadge status={c.applicationStatus} />
                  </div>
                </div>
                {c.matchScore > 0 && <MatchScore score={c.matchScore} size="lg" />}
              </div>
              {c.about && (
                <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-3">{c.about}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {c.skills && c.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Candidate skills</CardTitle>
                <CardDescription>{c.skills.length} skills on profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((s: any) => (
                    <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} verified={s.verified} size="sm" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {c.experiences && c.experiences.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.experiences.map((e: any) => (
                  <div key={e.id} className="rounded-lg border border-border bg-card p-3">
                    <p className="font-semibold text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.company} · {e.startDate} — {e.endDate}</p>
                    {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {c.educations && c.educations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.educations.map((ed: any) => (
                  <div key={ed.id} className="rounded-lg border border-border bg-card p-3">
                    <p className="font-semibold text-sm">{ed.degree}, {ed.field}</p>
                    <p className="text-xs text-muted-foreground">{ed.institution} · {ed.startDate} — {ed.endDate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full btn-green"
                variant={isShortlisted ? "secondary" : "default"}
                onClick={() => updateStatus(isShortlisted ? "screening" : "shortlisted")}
                disabled={actionLoading}
              >
                <Star className="h-4 w-4" /> {isShortlisted ? "Remove shortlist" : "Shortlist"}
              </Button>
              <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full btn-blue" variant="outline">
                    <CalendarClock className="h-4 w-4" /> Schedule interview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule interview with {c.name}</DialogTitle>
                    <DialogDescription>
                      The candidate will receive an invitation. Their contact information will be unlocked once they accept.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label>Date</Label>
                        <Input type="date" defaultValue="2026-10-12" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Time</Label>
                        <Input type="time" defaultValue="14:00" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Interview type</Label>
                      <Select defaultValue="technical">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="screen">Recruiter screen</SelectItem>
                          <SelectItem value="technical">Technical interview</SelectItem>
                          <SelectItem value="behavioral">Behavioral interview</SelectItem>
                          <SelectItem value="final">Final round</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes for candidate</Label>
                      <Textarea rows={3} placeholder="Anything they should prepare?" className="resize-none" />
                    </div>
                    <InfoCallout>
                      <span className="font-medium">Privacy:</span> Contact details unlock only after {c.name} accepts this invitation.
                    </InfoCallout>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
                    <Button className="btn-green" onClick={() => { updateStatus("interview"); setInterviewDialogOpen(false); }}>
                      Send invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="w-full" variant="outline" onClick={() => go("messages")}>
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => updateStatus("rejected")}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contact information</CardTitle>
              <CardDescription>{c.contactUnlocked ? "Visible — candidate accepted interview" : "Locked — privacy protection active"}</CardDescription>
            </CardHeader>
            <CardContent>
              {c.contactUnlocked ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{c.email}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <PrivacyLock />
                  <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                    <p>🔒 Email hidden</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Per our privacy commitment, contact details become visible only after the candidate accepts your interview request.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

// ============================================================
// EMPLOYER APPLICATIONS
// ============================================================
export function EmployerApplications() {
  const { go } = useApp();
  const { toast } = useToast();
  const { data, loading, refetch } = useFetch<any>("/api/applications");
  const applications: any[] = data?.applications ?? [];

  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterStep, setFilterStep] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // Dialog state for each step action
  const [reviewDialog, setReviewDialog] = useState<any | null>(null);
  const [examScheduleDialog, setExamScheduleDialog] = useState<string | null>(null); // jobId
  const [examCompleteDialog, setExamCompleteDialog] = useState<any | null>(null);
  const [interviewScheduleDialog, setInterviewScheduleDialog] = useState<string | null>(null); // jobId
  const [interviewCompleteDialog, setInterviewCompleteDialog] = useState<any | null>(null);
  const [selectDialog, setSelectDialog] = useState<any | null>(null);
  const [hireDialog, setHireDialog] = useState<any | null>(null);
  const [rejectDialog, setRejectDialog] = useState<any | null>(null);
  const [acting, setActing] = useState(false);

  // Get unique jobs for the filter dropdown
  const jobMap = new Map<string, any>();
  for (const a of applications) {
    if (a.job?.id && !jobMap.has(a.job.id)) jobMap.set(a.job.id, a.job);
  }
  const jobs: any[] = Array.from(jobMap.values());

  // Filter applications
  let filtered = applications;
  if (filterJob !== "all") filtered = filtered.filter((a) => a.job?.id === filterJob);
  if (filterStep !== "all") {
    if (filterStep === "active") {
      filtered = filtered.filter((a) => a.status !== "rejected" && a.status !== "hired");
    } else {
      filtered = filtered.filter((a) => a.status === filterStep);
    }
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((a) =>
      a.candidate?.name?.toLowerCase().includes(q) ||
      a.job?.title?.toLowerCase().includes(q)
    );
  }

  // Group by step for stats
  const stepStats = {
    applied: applications.filter(a => a.status === "applied").length,
    reviewing: applications.filter(a => a.status === "reviewing" || a.status === "review_passed").length,
    exam: applications.filter(a => a.status === "exam_notified" || a.status === "exam_completed" || a.status === "exam_passed").length,
    interview: applications.filter(a => a.status === "interview_notified" || a.status === "interview_completed" || a.status === "interview_passed").length,
    selected: applications.filter(a => a.status === "selected").length,
    hired: applications.filter(a => a.status === "hired").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  // Generic PATCH helper
  const patchApplication = async (applicationId: string, action: string, payload: any = {}) => {
    setActing(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action, ...payload }),
      });
      const data = await res.json();
      if (data.ok) {
        return data;
      } else {
        toast({ title: "Action failed", description: data.error ?? "Please try again." });
        return null;
      }
    } catch {
      toast({ title: "Network error", description: "Please try again." });
      return null;
    } finally {
      setActing(false);
    }
  };

  // Schedule exam (notifies all review_passed candidates for the job)
  const scheduleExam = async (jobId: string, payload: any) => {
    setActing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/exam-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Exam scheduled", description: data.message ?? "Candidates notified." });
        setExamScheduleDialog(null);
        refetch();
      } else {
        toast({ title: "Failed", description: data.error ?? "Please try again." });
      }
    } catch {
      toast({ title: "Network error", description: "Please try again." });
    } finally {
      setActing(false);
    }
  };

  // Schedule interview (notifies all exam_passed candidates for the job)
  const scheduleInterview = async (jobId: string, payload: any) => {
    setActing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/interview-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Interview scheduled", description: data.message ?? "Candidates notified." });
        setInterviewScheduleDialog(null);
        refetch();
      } else {
        toast({ title: "Failed", description: data.error ?? "Please try again." });
      }
    } catch {
      toast({ title: "Network error", description: "Please try again." });
    } finally {
      setActing(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Recruitment Pipeline"
        description="Manage every application through the 7-step recruitment process. Advance candidates step by step — no skipping allowed."
        icon={<ClipboardCheck className="h-4 w-4" />}
      />

      <div className="mt-4">
        <InfoCallout>
          <span className="font-medium">7-Step Process:</span> 1. Application → 2. Application Review → 3. Written Exam Notification → 4. Written Examination → 5. Interview (Oral + Practical) → 6. Final Selection → 7. Final Call & Job Assignment. Each candidate must pass a step to advance. Notifications are sent automatically at every transition.
        </InfoCallout>
      </div>

      {/* Step stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Step 1: Applied" value={stepStats.applied.toString()} icon={<FileText className="h-3 w-3" />} />
        <StatCard label="Step 2: Review" value={stepStats.reviewing.toString()} icon={<ClipboardCheck className="h-3 w-3" />} />
        <StatCard label="Step 3-4: Exam" value={stepStats.exam.toString()} icon={<PenSquare className="h-3 w-3" />} />
        <StatCard label="Step 5: Interview" value={stepStats.interview.toString()} icon={<Users className="h-3 w-3" />} />
        <StatCard label="Step 6: Selected" value={stepStats.selected.toString()} icon={<Trophy className="h-3 w-3" />} />
        <StatCard label="Step 7: Hired" value={stepStats.hired.toString()} icon={<PhoneCall className="h-3 w-3" />} />
        <StatCard label="Rejected" value={stepStats.rejected.toString()} icon={<X className="h-3 w-3" />} />
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search candidates or jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8" />
        </div>
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="h-9 w-full sm:w-[200px]"><SelectValue placeholder="All jobs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStep} onValueChange={setFilterStep}>
          <SelectTrigger className="h-9 w-full sm:w-[180px]"><SelectValue placeholder="All stages" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="active">Active (in progress)</SelectItem>
            <SelectItem value="applied">Step 1: Applied</SelectItem>
            <SelectItem value="reviewing">Step 2: Under Review</SelectItem>
            <SelectItem value="review_passed">Step 2: Review Passed</SelectItem>
            <SelectItem value="exam_notified">Step 3: Exam Notified</SelectItem>
            <SelectItem value="exam_completed">Step 4: Exam Completed</SelectItem>
            <SelectItem value="exam_passed">Step 4: Exam Passed</SelectItem>
            <SelectItem value="interview_notified">Step 5: Interview Notified</SelectItem>
            <SelectItem value="interview_completed">Step 5: Interview Completed</SelectItem>
            <SelectItem value="interview_passed">Step 5: Interview Passed</SelectItem>
            <SelectItem value="selected">Step 6: Selected</SelectItem>
            <SelectItem value="hired">Step 7: Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications list */}
      {loading ? (
        <LoadingState label="Loading applications…" rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState className="mt-6" icon={<Send className="h-5 w-5" />} title="No applications found" description={applications.length === 0 ? "Once candidates apply to your jobs, they'll appear here." : "Try adjusting your filters."} />
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((a) => {
            const isExpanded = expandedApp === a.id;
            const isRejected = a.status === "rejected";
            const currentStep = a.currentStep || (isRejected ? parseInt(a.rejectionStage || "1", 10) : 1);
            const jobHasExamSchedule = a.examSchedule;
            const jobHasInterviewSchedule = a.interviewSchedule;
            return (
              <Card key={a.id} className={cn(isRejected && "opacity-75")}>
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Avatar
                      initials={a.candidate?.initials ?? a.candidate?.name?.slice(0, 2).toUpperCase() ?? "?"}
                      color={a.candidate?.avatarColor ?? "oklch(0.55 0.22 285)"}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{a.candidate?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{a.candidate?.title ?? ""} · {a.job?.title ?? "—"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            isRejected ? "bg-rose-50 text-rose-700 border-rose-200" :
                            a.status === "hired" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            a.status === "selected" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-violet-50 text-violet-700 border-violet-200"
                          )}>
                            {isRejected ? "Rejected" : a.status === "hired" ? "Hired ✓" : `Step ${currentStep}/7`}
                          </Badge>
                          {a.matchScore != null && (
                            <span className="text-xs text-muted-foreground">Match: <span className="font-semibold text-foreground">{a.matchScore}%</span></span>
                          )}
                        </div>
                      </div>

                      {/* Pipeline visual */}
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

                      {/* Action buttons based on current step */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {/* Step 1 → 2: Review */}
                        {a.status === "applied" && (
                          <Button size="sm" className="btn-blue" onClick={() => setReviewDialog(a)}>
                            <ClipboardCheck className="h-3.5 w-3.5" /> Start Review
                          </Button>
                        )}
                        {a.status === "reviewing" && (
                          <Button size="sm" className="btn-green" onClick={() => setReviewDialog(a)}>
                            <Check className="h-3.5 w-3.5" /> Complete Review
                          </Button>
                        )}

                        {/* Step 2 → 3: Schedule exam (per-job, bulk notify) */}
                        {a.status === "review_passed" && (
                          <Button size="sm" className="btn-blue" onClick={() => setExamScheduleDialog(a.job?.id ?? "")}>
                            <PenSquare className="h-3.5 w-3.5" /> Schedule Written Exam
                          </Button>
                        )}

                        {/* Step 3 → 4: Enter exam results */}
                        {(a.status === "exam_notified" || a.status === "exam_completed") && (
                          <Button size="sm" className="btn-blue" onClick={() => setExamCompleteDialog(a)}>
                            <Check className="h-3.5 w-3.5" /> Enter Exam Results
                          </Button>
                        )}

                        {/* Step 4 → 5: Schedule interview (per-job, bulk notify) */}
                        {a.status === "exam_passed" && (
                          <Button size="sm" className="btn-blue" onClick={() => setInterviewScheduleDialog(a.job?.id ?? "")}>
                            <Users className="h-3.5 w-3.5" /> Schedule Interview
                          </Button>
                        )}

                        {/* Step 5: Enter interview results */}
                        {(a.status === "interview_notified" || a.status === "interview_completed") && (
                          <Button size="sm" className="btn-blue" onClick={() => setInterviewCompleteDialog(a)}>
                            <Check className="h-3.5 w-3.5" /> Enter Interview Results
                          </Button>
                        )}

                        {/* Step 6: Final selection */}
                        {a.status === "interview_passed" && (
                          <Button size="sm" className="btn-green" onClick={() => setSelectDialog(a)}>
                            <Trophy className="h-3.5 w-3.5" /> Select Candidate
                          </Button>
                        )}

                        {/* Step 7: Hire */}
                        {a.status === "selected" && (
                          <Button size="sm" className="btn-rainbow" onClick={() => setHireDialog(a)}>
                            <PhoneCall className="h-3.5 w-3.5" /> Finalize Hiring
                          </Button>
                        )}

                        {/* Reject (at any active stage) */}
                        {!isRejected && a.status !== "hired" && (
                          <Button size="sm" variant="outline" className="text-rose-600" onClick={() => setRejectDialog(a)}>
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}

                        {/* View details toggle */}
                        <Button size="sm" variant="ghost" onClick={() => setExpandedApp(isExpanded ? null : a.id)}>
                          {isExpanded ? "Hide" : "Details"} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                        </Button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 space-y-3 border-t border-border pt-3">
                          {a.coverLetter && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Application Letter</p>
                              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap text-foreground/80 max-h-48 overflow-y-auto">
                                {a.coverLetter}
                              </div>
                            </div>
                          )}
                          {a.reviewNotes && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Review Notes</p>
                              <p className="text-xs text-foreground/80">{a.reviewNotes}</p>
                            </div>
                          )}
                          {a.examSchedule && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Exam Schedule</p>
                              <p className="text-xs text-blue-800">
                                {new Date(a.examSchedule.scheduledAt).toLocaleString()} · {a.examSchedule.duration} min · {a.examSchedule.location} · {a.examSchedule.format}
                              </p>
                              {a.examSchedule.instructions && <p className="text-xs text-blue-700 mt-1">{a.examSchedule.instructions}</p>}
                            </div>
                          )}
                          {a.examScore != null && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg border border-border bg-card p-2">
                                <span className="text-muted-foreground">Exam Score:</span> <span className="font-semibold">{a.examScore}/100</span>
                                <span className={cn("ml-2 font-medium", a.examPassed ? "text-emerald-600" : "text-rose-600")}>{a.examPassed ? "Passed" : "Failed"}</span>
                              </div>
                              {a.examNotes && <div className="rounded-lg border border-border bg-card p-2 col-span-2"><span className="text-muted-foreground">Notes:</span> {a.examNotes}</div>}
                            </div>
                          )}
                          {a.interviewSchedule && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Interview Schedule</p>
                              <p className="text-xs text-amber-800">
                                {new Date(a.interviewSchedule.scheduledAt).toLocaleString()} · {a.interviewSchedule.duration} min · {a.interviewSchedule.location} · {a.interviewSchedule.format}
                              </p>
                              {a.interviewSchedule.instructions && <p className="text-xs text-amber-700 mt-1">{a.interviewSchedule.instructions}</p>}
                            </div>
                          )}
                          {a.oralScore != null && (
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="rounded-lg border border-border bg-card p-2">
                                <span className="text-muted-foreground">Oral:</span> <span className="font-semibold">{a.oralScore}/100</span>
                              </div>
                              <div className="rounded-lg border border-border bg-card p-2">
                                <span className="text-muted-foreground">Practical:</span> <span className="font-semibold">{a.practicalScore}/100</span>
                              </div>
                              <div className="rounded-lg border border-border bg-card p-2">
                                <span className="text-muted-foreground">Overall:</span> <span className="font-semibold">{a.interviewOverallScore}/100</span>
                              </div>
                              {a.interviewNotes && <div className="rounded-lg border border-border bg-card p-2 col-span-3"><span className="text-muted-foreground">Notes:</span> {a.interviewNotes}</div>}
                            </div>
                          )}
                          {a.jobAssignment && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Job Assignment</p>
                              <p className="text-xs text-emerald-800 whitespace-pre-wrap">{a.jobAssignment}</p>
                            </div>
                          )}
                          <Button size="sm" variant="outline" onClick={() => go("candidate-detail", { candidateId: a.candidate?.id })}>
                            View full profile <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ===== STEP 2: REVIEW DIALOG ===== */}
      {reviewDialog && (
        <ReviewDialog
          application={reviewDialog}
          acting={acting}
          onClose={() => setReviewDialog(null)}
          onSubmit={async (passed, notes) => {
            const result = await patchApplication(reviewDialog.id, "review", { passed, notes });
            if (result) {
              toast({
                title: passed ? "Review passed" : "Under review",
                description: passed
                  ? `${reviewDialog.candidate?.name} has passed the application review. They'll be notified to prepare for the written exam.`
                  : `${reviewDialog.candidate?.name} is now under review.`,
              });
              setReviewDialog(null);
              refetch();
            }
          }}
        />
      )}

      {/* ===== STEP 3: EXAM SCHEDULE DIALOG ===== */}
      {examScheduleDialog && (
        <ScheduleDialog
          title="Schedule Written Examination (Step 3)"
          description="All candidates who passed the application review will be automatically notified with the exam date, time, and instructions."
          acting={acting}
          onClose={() => setExamScheduleDialog(null)}
          onSubmit={(payload) => scheduleExam(examScheduleDialog, payload)}
        />
      )}

      {/* ===== STEP 4: EXAM COMPLETE DIALOG ===== */}
      {examCompleteDialog && (
        <ExamResultDialog
          application={examCompleteDialog}
          acting={acting}
          onClose={() => setExamCompleteDialog(null)}
          onSubmit={async (score, passed, notes) => {
            const result = await patchApplication(examCompleteDialog.id, "exam_complete", { score, passed, notes });
            if (result) {
              toast({
                title: passed ? "Exam passed!" : "Exam not passed",
                description: passed
                  ? `${examCompleteDialog.candidate?.name} has passed the written exam (${score}/100). They'll be notified to prepare for the interview.`
                  : `${examCompleteDialog.candidate?.name} did not pass the written exam (${score}/100). Rejection notification sent.`,
              });
              setExamCompleteDialog(null);
              refetch();
            }
          }}
        />
      )}

      {/* ===== STEP 5: INTERVIEW SCHEDULE DIALOG ===== */}
      {interviewScheduleDialog && (
        <ScheduleDialog
          title="Schedule Interview (Step 5)"
          description="All candidates who passed the written exam will be automatically notified with the interview date, time, and instructions. The interview includes oral and practical components."
          acting={acting}
          onClose={() => setInterviewScheduleDialog(null)}
          onSubmit={(payload) => scheduleInterview(interviewScheduleDialog, payload)}
          isInterview
        />
      )}

      {/* ===== STEP 5: INTERVIEW COMPLETE DIALOG ===== */}
      {interviewCompleteDialog && (
        <InterviewResultDialog
          application={interviewCompleteDialog}
          acting={acting}
          onClose={() => setInterviewCompleteDialog(null)}
          onSubmit={async (oralScore, practicalScore, passed, notes) => {
            const result = await patchApplication(interviewCompleteDialog.id, "interview_complete", { oralScore, practicalScore, passed, notes });
            if (result) {
              toast({
                title: passed ? "Interview passed!" : "Interview not passed",
                description: passed
                  ? `${interviewCompleteDialog.candidate?.name} has passed the interview (oral: ${oralScore}, practical: ${practicalScore}). They're now eligible for final selection.`
                  : `${interviewCompleteDialog.candidate?.name} did not pass the interview. Rejection notification sent.`,
              });
              setInterviewCompleteDialog(null);
              refetch();
            }
          }}
        />
      )}

      {/* ===== STEP 6: SELECT DIALOG ===== */}
      {selectDialog && (
        <SelectDialog
          application={selectDialog}
          acting={acting}
          onClose={() => setSelectDialog(null)}
          onSubmit={async (notes) => {
            const result = await patchApplication(selectDialog.id, "select", { notes });
            if (result) {
              toast({
                title: "Candidate selected! 🎉",
                description: `${selectDialog.candidate?.name} has been selected. Congratulations notification sent. Proceed to finalize hiring (Step 7).`,
              });
              setSelectDialog(null);
              refetch();
            }
          }}
        />
      )}

      {/* ===== STEP 7: HIRE DIALOG ===== */}
      {hireDialog && (
        <HireDialog
          application={hireDialog}
          acting={acting}
          onClose={() => setHireDialog(null)}
          onSubmit={async (jobAssignment, notes) => {
            const result = await patchApplication(hireDialog.id, "hire", { jobAssignment, notes });
            if (result) {
              toast({
                title: "Candidate hired! 🎉",
                description: `${hireDialog.candidate?.name} has been hired. Welcome aboard message sent with job assignment details.`,
              });
              setHireDialog(null);
              refetch();
            }
          }}
        />
      )}

      {/* ===== REJECT DIALOG ===== */}
      {rejectDialog && (
        <RejectDialog
          application={rejectDialog}
          acting={acting}
          onClose={() => setRejectDialog(null)}
          onSubmit={async (reason) => {
            const result = await patchApplication(rejectDialog.id, "reject", { reason });
            if (result) {
              toast({
                title: "Candidate rejected",
                description: `${rejectDialog.candidate?.name} has been rejected. Appropriate rejection notification sent.`,
              });
              setRejectDialog(null);
              refetch();
            }
          }}
        />
      )}
    </PageContainer>
  );
}

// ============================================================
// RECRUITMENT DIALOG COMPONENTS
// ============================================================
function ReviewDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (passed: boolean, notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const isUnderReview = application.status === "reviewing";
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isUnderReview ? "Complete Application Review (Step 2)" : "Start Application Review (Step 2)"}</DialogTitle>
          <DialogDescription>
            Reviewing <span className="font-medium text-foreground">{application.candidate?.name}</span> for <span className="font-medium text-foreground">{application.job?.title}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          {application.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Application Letter</p>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap text-foreground/80 max-h-48 overflow-y-auto">
                {application.coverLetter}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="review-notes">Review notes (optional)</Label>
            <Textarea
              id="review-notes"
              rows={3}
              placeholder="Add your review notes about this candidate…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {isUnderReview ? (
            <>
              <Button variant="outline" className="text-rose-600" disabled={acting} onClick={() => onSubmit(false, notes)}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button className="btn-green" disabled={acting} onClick={() => onSubmit(true, notes)}>
                <Check className="h-3.5 w-3.5" /> Pass review
              </Button>
            </>
          ) : (
            <Button className="btn-blue" disabled={acting} onClick={() => onSubmit(false, notes)}>
              {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
              Start review
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleDialog({ title, description, acting, onClose, onSubmit, isInterview }: {
  title: string;
  description: string;
  acting: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isInterview?: boolean;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("Online");
  const [format, setFormat] = useState(isInterview ? "both" : "written");
  const [instructions, setInstructions] = useState("");

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sched-date">Date & Time *</Label>
              <Input
                id="sched-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sched-duration">Duration (minutes)</Label>
              <Input id="sched-duration" type="number" min="15" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sched-location">Location</Label>
              <Input id="sched-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Online / Office address" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sched-format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isInterview ? (
                    <>
                      <SelectItem value="both">Oral + Practical</SelectItem>
                      <SelectItem value="oral">Oral only</SelectItem>
                      <SelectItem value="practical">Practical only</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="written">Written</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sched-instructions">Instructions (optional)</Label>
            <Textarea
              id="sched-instructions"
              rows={3}
              placeholder={isInterview ? "What to prepare, what to bring, interview format details…" : "What to study, what to bring, exam topics…"}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="btn-blue"
            disabled={acting || !scheduledAt}
            onClick={() => onSubmit({ scheduledAt: new Date(scheduledAt).toISOString(), duration: parseInt(duration, 10), location, format, instructions: instructions || undefined })}
          >
            {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
            Schedule & notify candidates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExamResultDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (score: number, passed: boolean, notes: string) => void;
}) {
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enter Written Exam Results (Step 4)</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{application.candidate?.name}</span> · {application.job?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="exam-score">Exam Score (0-100) *</Label>
            <Input id="exam-score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 85" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exam-notes">Notes (optional)</Label>
            <Textarea id="exam-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" placeholder="Comments on performance…" />
          </div>
          <InfoCallout>
            If the candidate passes, they'll receive: "Congratulations! You have passed the written examination. Please prepare for the next interview stage." If they fail, a rejection notification is sent.
          </InfoCallout>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" className="text-rose-600" disabled={acting || !score} onClick={() => onSubmit(parseInt(score, 10), false, notes)}>
            <X className="h-3.5 w-3.5" /> Did not pass
          </Button>
          <Button className="btn-green" disabled={acting || !score} onClick={() => onSubmit(parseInt(score, 10), true, notes)}>
            <Check className="h-3.5 w-3.5" /> Passed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InterviewResultDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (oralScore: number, practicalScore: number, passed: boolean, notes: string) => void;
}) {
  const [oralScore, setOralScore] = useState("");
  const [practicalScore, setPracticalScore] = useState("");
  const [notes, setNotes] = useState("");
  const overall = oralScore && practicalScore ? Math.round((parseInt(oralScore, 10) + parseInt(practicalScore, 10)) / 2) : null;
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enter Interview Results (Step 5)</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{application.candidate?.name}</span> · {application.job?.title} · Oral + Practical
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="oral-score">Oral Interview Score (0-100) *</Label>
              <Input id="oral-score" type="number" min="0" max="100" value={oralScore} onChange={(e) => setOralScore(e.target.value)} placeholder="e.g. 80" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="practical-score">Practical Test Score (0-100) *</Label>
              <Input id="practical-score" type="number" min="0" max="100" value={practicalScore} onChange={(e) => setPracticalScore(e.target.value)} placeholder="e.g. 75" />
            </div>
          </div>
          {overall != null && (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
              Overall Score: <span className="font-semibold text-primary">{overall}/100</span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="interview-notes">Notes (optional)</Label>
            <Textarea id="interview-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" placeholder="Comments on interview performance…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" className="text-rose-600" disabled={acting || !oralScore || !practicalScore} onClick={() => onSubmit(parseInt(oralScore, 10), parseInt(practicalScore, 10), false, notes)}>
            <X className="h-3.5 w-3.5" /> Did not pass
          </Button>
          <Button className="btn-green" disabled={acting || !oralScore || !practicalScore} onClick={() => onSubmit(parseInt(oralScore, 10), parseInt(practicalScore, 10), true, notes)}>
            <Check className="h-3.5 w-3.5" /> Passed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SelectDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Final Selection (Step 6) 🎉</DialogTitle>
          <DialogDescription>
            You're selecting <span className="font-medium text-foreground">{application.candidate?.name}</span> for <span className="font-medium text-foreground">{application.job?.title}</span>. A congratulations message will be sent automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            The candidate will receive: "Congratulations! You have successfully completed the recruitment process. We are pleased to inform you that you have been selected for this position and are now officially joining our workplace."
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="select-notes">Selection notes (optional)</Label>
            <Textarea id="select-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" placeholder="Why this candidate was selected…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="btn-green" disabled={acting} onClick={() => onSubmit(notes)}>
            <Trophy className="h-3.5 w-3.5" /> Select this candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HireDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (jobAssignment: string, notes: string) => void;
}) {
  const [jobAssignment, setJobAssignment] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Final Call & Job Assignment (Step 7) 🎉</DialogTitle>
          <DialogDescription>
            Finalize hiring for <span className="font-medium text-foreground">{application.candidate?.name}</span>. The job assignment details below will be sent to the candidate in the welcome notification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            After this step, the candidate will receive: "Welcome to the team! You have successfully completed the entire recruitment process. Here are your job assignment details: [details below]. Welcome aboard!"
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-assignment">Job Assignment Details *</Label>
            <Textarea
              id="job-assignment"
              rows={6}
              placeholder={"Include:\n• Responsibilities and role description\n• Work location (office address or remote)\n• Starting date\n• Work schedule / hours\n• Reporting manager\n• Any other relevant information"}
              value={jobAssignment}
              onChange={(e) => setJobAssignment(e.target.value)}
              className="resize-y"
            />
            <p className="text-[11px] text-muted-foreground">This information will be sent to the candidate in the welcome notification.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hire-notes">Internal notes (optional)</Label>
            <Textarea id="hire-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" placeholder="Internal notes about the hire (not sent to candidate)…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="btn-rainbow" disabled={acting || !jobAssignment.trim()} onClick={() => onSubmit(jobAssignment.trim(), notes)}>
            {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}
            Finalize hiring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ application, acting, onClose, onSubmit }: {
  application: any;
  acting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const currentStep = application.currentStep || 1;
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Rejecting <span className="font-medium text-foreground">{application.candidate?.name}</span> at Step {currentStep}. An appropriate rejection notification will be sent based on the current stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea id="reject-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="resize-none" placeholder="Reason for rejection…" />
          </div>
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {currentStep <= 2
              ? "Candidate will receive: \"Thank you for your application. Unfortunately, your application was not selected at this stage.\""
              : currentStep <= 4
              ? "Candidate will receive: \"Thank you for participating in the written examination. Unfortunately, you did not pass the written exam at this stage.\""
              : "Candidate will receive: \"Thank you for completing the interview. Unfortunately, you were not selected at this stage.\""}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" className="text-rose-600 border-rose-300" disabled={acting} onClick={() => onSubmit(reason)}>
            <X className="h-3.5 w-3.5" /> Reject candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// INTERVIEWS
// ============================================================
export function EmployerInterviews() {
  const { go } = useApp();
  const { data, loading } = useFetch<any>("/api/candidates");
  const allCandidates: any[] = data?.candidates ?? [];
  // Candidates in "interview" status are the interviews
  const interviews = allCandidates
    .filter((c: any) => c.applicationStatus === "interview")
    .map((c: any, i: number) => ({
      id: `iv-${i}`,
      candidate: c,
      title: c.job?.title ? `Interview for ${c.job.title}` : "Interview",
      date: "2026-10-09",
      time: "14:00 EAT",
      type: "Technical",
      status: "scheduled" as const,
    }));

  return (
    <PageContainer>
      <SectionHeader
        title="Interviews"
        description="Scheduled interviews and pending invitations."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Scheduled" value={interviews.filter(i => i.status === "scheduled").length} icon={<CalendarClock className="h-4 w-4" />} />
        <StatCard label="Pending confirmation" value={interviews.filter(i => i.status === "pending_confirmation").length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="This week" value={2} icon={<Calendar className="h-4 w-4" />} hint="Thu, Fri" />
      </div>

      {loading ? (
        <LoadingState label="Loading interviews…" rows={2} />
      ) : interviews.length === 0 ? (
        <EmptyState className="mt-6" icon={<CalendarClock className="h-5 w-5" />} title="No interviews scheduled" description="Shortlist candidates and schedule interviews from the Candidate Ranking page." action={<Button size="sm" onClick={() => go("candidates")}>View candidates</Button>} />
      ) : (
        <div className="mt-6 space-y-3">
          {interviews.map((iv) => (
            <Card key={iv.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {iv.candidate.profilePhoto ? (
                    <img src={iv.candidate.profilePhoto} alt={iv.candidate.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <Avatar initials={iv.candidate.initials} color={iv.candidate.avatarColor} size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{iv.candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{iv.candidate.title}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        Confirmed
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{iv.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{iv.time}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{iv.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => go("candidate-detail", { candidateId: iv.candidate.id })}>
                      View profile
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => go("messages")}>
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
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
// EMPLOYER NOTIFICATIONS & MESSAGES (mirror seeker pattern)
// ============================================================
export function EmployerNotifications() {
  const { go } = useApp();
  const { data, loading, refetch } = useFetch<any>("/api/notifications");
  const items: any[] = data?.notifications ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread" ? items.filter((n) => !n.read) : items;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      refetch();
    } catch {
      /* non-fatal */
    }
  };

  const toggleRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      refetch();
    } catch {
      /* non-fatal */
    }
  };

  const handleClick = (n: any) => {
    if (expandedId === n.id) {
      setExpandedId(null);
    } else {
      setExpandedId(n.id);
      if (!n.read) toggleRead(n.id);
    }
  };

  const getNotifMeta = (type: string) => {
    switch (type) {
      case "interview":
        return { icon: <CalendarClock className="h-4 w-4" />, bg: "bg-amber-100 text-amber-700", gradient: "from-amber-500 to-orange-500", label: "Interview" };
      case "application":
        return { icon: <Send className="h-4 w-4" />, bg: "bg-blue-100 text-blue-700", gradient: "from-blue-500 to-cyan-500", label: "Application" };
      case "message":
        return { icon: <MessageSquare className="h-4 w-4" />, bg: "bg-emerald-100 text-emerald-700", gradient: "from-emerald-500 to-teal-500", label: "Message" };
      case "job":
        return { icon: <Briefcase className="h-4 w-4" />, bg: "bg-cyan-100 text-cyan-700", gradient: "from-cyan-500 to-blue-500", label: "Job" };
      default:
        return { icon: <Bell className="h-4 w-4" />, bg: "bg-slate-100 text-slate-700", gradient: "from-slate-500 to-slate-600", label: "System" };
    }
  };

  const formatFullDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Notifications"
        description={`${items.filter((n) => !n.read).length} unread · click any notification to expand details`}
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
        <EmptyState className="mt-6" icon={<Bell className="h-5 w-5" />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((n) => {
            const meta = getNotifMeta(n.type);
            const isOpen = expandedId === n.id;
            return (
              <div
                key={n.id}
                className={cn(
                  "lift-card overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                  isOpen ? "border-primary/40 shadow-md scale-[1.01]" : "border-border hover:border-primary/20",
                  !n.read && !isOpen && "border-primary/30 bg-primary/5"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isOpen ? cn("bg-gradient-to-br text-white shadow-lg", meta.gradient) : meta.bg
                    )}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className={cn("mt-0.5 text-sm font-semibold transition-colors sm:text-base", isOpen && "text-primary")}>{n.title}</p>
                    {!isOpen && <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.message}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    <div className={cn("faq-chevron flex h-7 w-7 items-center justify-center rounded-full transition-colors", isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")} aria-hidden="true">
                      <ChevronDown className={cn("h-3.5 w-3.5 faq-chevron", isOpen && "is-open")} />
                    </div>
                  </div>
                </button>
                <div className={cn("grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden">
                    <div className="border-t border-border/60 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{n.message}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatFullDate(n.createdAt)}</span>
                        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", meta.bg)}>{meta.label}</span>
                        {n.read ? (
                          <span className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> Read</span>
                        ) : (
                          <span className="flex items-center gap-1 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Unread</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!n.read && (
                          <Button size="sm" variant="outline" onClick={() => toggleRead(n.id)}>
                            <Check className="h-3.5 w-3.5" /> Mark as read
                          </Button>
                        )}
                        {(n.type === "application" || n.type === "interview") && (
                          <Button size="sm" variant="outline" onClick={() => go("applications")}>
                            <Send className="h-3.5 w-3.5" /> View applications
                          </Button>
                        )}
                        {n.type === "message" && (
                          <Button size="sm" variant="outline" onClick={() => go("messages")}>
                            <MessageSquare className="h-3.5 w-3.5" /> Open messages
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

export function EmployerMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(employerConversations);
  const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const active = conversations.find((c) => c.id === activeId);

  const send = () => {
    if (!draft.trim()) return;
    setConversations(conversations.map((c) =>
      c.id === activeId
        ? {
            ...c,
            lastMessage: draft.trim(),
            lastTime: "now",
            messages: [...c.messages, { id: String(Date.now()), sender: "me" as const, text: draft.trim(), time: "now" }],
          }
        : c
    ));
    setDraft("");
  };

  return (
    <PageContainer>
      <SectionHeader title="Messages" description="Chat with candidates after they're shortlisted." />
      <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:h-[calc(100vh-220px)]">
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

        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex flex-1 flex-col">
            {active ? (
            <>
            <div className="flex items-center gap-3 border-b border-border p-3">
              <Avatar initials={active.participantInitials} color={active.participantColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{active.participantName}</p>
                <p className="text-[11px] text-muted-foreground">{active.participantRole}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 max-h-[60vh]">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                      m.sender === "me" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
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
              <Button size="icon" onClick={send} aria-label="Send message">
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">Select a conversation to start messaging.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

// ============================================================
// AI REPORT — Employer hiring report generated by AI
// ============================================================
export function EmployerAIReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "employer" }),
      });
      const data = await res.json();
      if (data.ok) {
        setReport(data.report);
      } else {
        setError(data.error ?? "Failed to generate report.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="AI Hiring Report"
        description="AI-generated analysis of your hiring pipeline with actionable recommendations."
        icon={<Cpu className="h-4 w-4" />}
        actions={
          <Button className="btn-rainbow" onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate report"}
          </Button>
        }
      />

      {loading && <LoadingState label="AI is analyzing your hiring data…" rows={4} />}

      {error && <ErrorState title="Report generation failed" description={error} action={<Button size="sm" variant="outline" onClick={generate}>Try again</Button>} />}

      {report && !loading && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>Generated by AI · {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report.summary}</p>
            </CardContent>
          </Card>

          {/* Sections */}
          {(report.sections ?? []).map((section: any, i: number) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{section.content}</p>
                {section.metrics && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {section.metrics.map((m: any, j: number) => (
                      <div key={j} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                        <p className="text-lg font-bold text-primary">{m.value}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Recommendations */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(report.recommendations ?? []).map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{i + 1}</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!report && !loading && !error && (
        <EmptyState
          className="mt-6"
          icon={<Cpu className="h-5 w-5" />}
          title="No report generated yet"
          description="Click 'Generate report' to get an AI-powered analysis of your hiring pipeline."
          action={<Button size="sm" className="btn-rainbow" onClick={generate}>Generate report</Button>}
        />
      )}
    </PageContainer>
  );
}
