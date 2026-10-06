"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
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
  Avatar,
  CompanyLogo,
  SectionHeader,
  StatCard,
  EmptyState,
  SuccessBanner,
  InfoCallout,
  PrivacyLock,
  TableToolbar,
} from "@/components/shared/ui";
import {
  employerJobs,
  candidates,
  employerNotifications,
  employerConversations,
  employerDashboardStats,
  currentUser,
} from "@/lib/mock-data";
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
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  TrendingUp,
  ChevronRight,
  UserCheck,
  X,
  Save,
  Send as SendIcon,
  CalendarClock,
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
  return (
    <PageContainer>
      <SectionHeader
        title="Hiring overview"
        description="Track your active jobs, applicants, and interviews."
        actions={
          <Button onClick={() => go("job-edit", { jobId: "new" })}>
            <Plus className="h-4 w-4" /> Post a job
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={employerDashboardStats.activeJobs} icon={<Briefcase className="h-4 w-4" />} hint="2 published, 1 draft" />
        <StatCard label="Total applicants" value={employerDashboardStats.totalApplicants} icon={<Users className="h-4 w-4" />} hint="+12 this week" delta="+15%" deltaTone="up" />
        <StatCard label="Shortlisted" value={employerDashboardStats.shortlisted} icon={<Star className="h-4 w-4" />} hint="Awaiting next step" />
        <StatCard label="Interviews this week" value={employerDashboardStats.interviewsThisWeek} icon={<CalendarClock className="h-4 w-4" />} hint="Thursday, Oct 9" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Active jobs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Active jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => go("jobs")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {employerJobs.filter(j => j.status === "published").map((j) => (
              <button
                key={j.id}
                onClick={() => go("candidates", { jobId: j.id })}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <CompanyLogo initials={j.companyLogo || "CO"} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold group-hover:text-primary">{j.title}</p>
                  <p className="text-xs text-muted-foreground">{j.location} · posted {timeAgo(j.postedAt)}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{j.applicants} applicants</span>
                    <span>{j.views} views</span>
                  </div>
                </div>
                <JobStatusBadge status={j.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            {employerJobs.find(j => j.status === "draft") && (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{employerJobs.find(j => j.status === "draft")?.title}</p>
                    <p className="text-xs text-muted-foreground">Draft · last edited 3 days ago</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => go("job-edit", { jobId: employerJobs.find(j => j.status === "draft")?.id })}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top candidates */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Top candidates</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => go("candidates")}>
              All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {candidates.slice(0, 4).map((c) => (
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
                <MatchScore score={c.matchScore} size="sm" showLabel={false} />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending actions */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pending actions</CardTitle>
          <CardDescription>{employerDashboardStats.pendingActions} items need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "5 new applicants awaiting review for Senior Frontend Engineer", action: "Review", view: "candidates" as const, urgent: true },
              { label: "Interview confirmation needed with Amara Okafor", action: "Confirm", view: "interviews" as const, urgent: true },
              { label: "Draft job \"Product Manager, Growth\" not yet published", action: "Continue", view: "job-edit" as const, urgent: false },
              { label: "2 unread messages from candidates", action: "Open", view: "messages" as const, urgent: false },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  a.urgent ? "bg-rose-500" : "bg-amber-500"
                )} />
                <p className="flex-1 text-xs">{a.label}</p>
                <Button size="sm" variant="outline" onClick={() => go(a.view)}>
                  {a.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// COMPANY PROFILE
// ============================================================
export function EmployerCompanyProfile() {
  const user = currentUser.employer;
  return (
    <PageContainer>
      <SectionHeader
        title="Company Profile"
        description="This information appears on every job you post."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <CompanyLogo initials={user.companyLogo || user.company.slice(0, 2).toUpperCase()} size="lg" className="!h-20 !w-20 !text-2xl" />
              <h2 className="mt-3 text-base font-semibold">{user.company}</h2>
              <p className="text-xs text-muted-foreground">{user.location}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">Technology</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">51-200 employees</Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Verified</Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <ShieldCheck className="h-3.5 w-3.5" /> Re-verify domain
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">About company</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                defaultValue="Northwind Technologies builds analytics infrastructure for Sub-Saharan African fintechs. We process 40M+ events per day and serve 40k+ daily active users. Our team is fully distributed across 7 African countries."
                rows={4}
                className="resize-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Company details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input defaultValue="https://northwind.tech" />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select defaultValue="technology">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Financial services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Company size</Label>
                <Select defaultValue="51-200">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Headquarters</Label>
                <Input defaultValue="Lagos, Nigeria" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Hiring contact email</Label>
                <Input defaultValue={user.email} />
              </div>
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
  const [filter, setFilter] = useState("all");

  let jobs = [...employerJobs];
  if (filter !== "all") jobs = jobs.filter((j) => j.status === filter);

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
          <TabsTrigger value="all">All ({employerJobs.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({employerJobs.filter(j => j.status === "published").length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({employerJobs.filter(j => j.status === "draft").length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({employerJobs.filter(j => j.status === "closed").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Job</th>
              <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Status</th>
              <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Applicants</th>
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
                <td className="hidden px-4 py-3 sm:table-cell"><JobStatusBadge status={j.status} /></td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <button onClick={() => go("candidates", { jobId: j.id })} className="text-sm font-semibold hover:text-primary">
                    {j.applicants}
                  </button>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(j.postedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => go("candidates", { jobId: j.id })}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => go("job-edit", { jobId: j.id })}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <EmptyState
          className="mt-4"
          icon={<Briefcase className="h-5 w-5" />}
          title="No jobs in this category"
          description="Create a new job posting to start receiving applicants."
          action={<Button size="sm" onClick={() => go("job-edit", { jobId: "new" })}>Post a job</Button>}
        />
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
  const existing = employerJobs.find((j) => j.id === selectedJobId);

  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [skills, setSkills] = useState(
    existing?.skills ?? [
      { id: "n1", name: "React", category: "Frontend", proficiency: "advanced" as ProficiencyLevel, mandatory: true, weight: 0.9 },
      { id: "n2", name: "TypeScript", category: "Languages", proficiency: "advanced" as ProficiencyLevel, mandatory: true, weight: 0.85 },
    ]
  );
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<ProficiencyLevel>("intermediate");
  const [newMandatory, setNewMandatory] = useState(true);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([
      ...skills,
      { id: `n${Date.now()}`, name: newSkill.trim(), category: "Custom", proficiency: newProficiency, mandatory: newMandatory, weight: newMandatory ? 0.8 : 0.4 },
    ]);
    setNewSkill("");
  };

  const removeSkill = (id: string) => setSkills(skills.filter((s) => s.id !== id));

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
                <Label>Job title</Label>
                <Input defaultValue={existing?.title ?? ""} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select defaultValue={existing?.category ?? "Engineering"}>
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
                  <Select defaultValue={existing?.type ?? "full-time"}>
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
                  <Label>Location</Label>
                  <Input defaultValue={existing?.location ?? ""} placeholder="e.g. Lagos, Nigeria" />
                </div>
                <div className="space-y-1.5">
                  <Label>Workplace</Label>
                  <Select defaultValue={existing?.remote ?? "hybrid"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Salary min (USD / month)</Label>
                  <Input type="number" defaultValue={existing?.salary.min ?? 5000} />
                </div>
                <div className="space-y-1.5">
                  <Label>Salary max (USD / month)</Label>
                  <Input type="number" defaultValue={existing?.salary.max ?? 8000} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Job description</Label>
                <Textarea
                  rows={5}
                  defaultValue={existing?.description ?? ""}
                  placeholder="Describe the role, team, and what success looks like…"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>Continue <ArrowRight className="h-3.5 w-3.5" /></Button>
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
                  <div><p className="text-[10px] uppercase text-muted-foreground">Title</p><p className="text-sm font-semibold">{existing?.title || "Senior Frontend Engineer"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Category</p><p className="text-sm">{existing?.category || "Engineering"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Location</p><p className="text-sm">{existing?.location || "Lagos, Nigeria"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Workplace</p><p className="text-sm capitalize">{existing?.remote || "hybrid"}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Salary</p><p className="text-sm">${(existing?.salary.min ?? 5000).toLocaleString()}–${(existing?.salary.max ?? 8000).toLocaleString()} / month</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Skills</p><p className="text-sm">{skills.length} required ({skills.filter(s=>s.mandatory).length} mandatory)</p></div>
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
                  <Button variant="outline" onClick={() => setSavedDraft(true)}>
                    <Save className="h-3.5 w-3.5" /> Save draft
                  </Button>
                  <Button onClick={() => { setPublished(true); setTimeout(() => go("jobs"), 1500); }}>
                    <SendIcon className="h-3.5 w-3.5" /> Publish job
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
  const [sortBy, setSortBy] = useState("match");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  let list = [...candidates];
  if (filter !== "all") list = list.filter((c) => c.applicationStatus === filter);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }
  list.sort((a, b) => b.matchScore - a.matchScore);

  const targetJob = employerJobs.find((j) => j.id === selectedJobId) || employerJobs[0];

  return (
    <PageContainer>
      <SectionHeader
        title="Candidate Ranking"
        description={`AI-ranked applicants for ${targetJob?.title}`}
        actions={
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {candidates.length} candidates
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
            <SelectItem value="experience">Sort: Experience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
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
                          <span>{c.experienceYears}y experience</span>
                          <span>{c.education}</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" /> {c.verifiedSkills} verified
                          </span>
                          <span>Applied {timeAgo(c.appliedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApplicationStatusBadge status={c.applicationStatus} />
                        <MatchScore score={c.matchScore} size="md" />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-emerald-700">Matching skills</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.matchingSkills.slice(0, 5).map((s) => (
                            <SkillChip key={s} name={s} size="sm" />
                          ))}
                        </div>
                      </div>
                      {c.missingSkills.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-rose-700">Missing skills</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.missingSkills.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                              >
                                <AlertCircle className="h-3 w-3" /> {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => go("candidate-detail", { candidateId: c.id })}>
                        <Eye className="h-3.5 w-3.5" /> View profile
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => go("candidate-detail", { candidateId: c.id })}>
                        <Star className="h-3.5 w-3.5" /> Shortlist
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => go("messages")}>
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => go("interviews")}>
                        <CalendarClock className="h-3.5 w-3.5" /> Interview
                      </Button>
                      {!c.contactUnlocked && <PrivacyLock compact />}
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
  const c = candidates.find((x) => x.id === selectedCandidateId) || candidates[0];
  const [shortlisted, setShortlisted] = useState(c.applicationStatus === "shortlisted" || c.applicationStatus === "interview");
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);

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
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar initials={c.initials} color={c.avatarColor} size="lg" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold tracking-tight">{c.name}</h1>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.experienceYears}y experience</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-600" />{c.verifiedSkills} verified skills</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ApplicationStatusBadge status={c.applicationStatus} />
                    <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                      Applied {timeAgo(c.appliedAt)}
                    </Badge>
                  </div>
                </div>
                <MatchScore score={c.matchScore} size="lg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Skill breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-2">Matching skills ({c.matchingSkills.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.matchingSkills.map((s) => (
                      <SkillChip key={s} name={s} verified size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-700 mb-2">Missing skills ({c.missingSkills.length})</p>
                  <div className="space-y-1.5">
                    {c.missingSkills.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 text-xs">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold mb-2">Top skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.topSkills.map((s) => (
                    <SkillChip key={s.name} name={s.name} proficiency={s.proficiency} verified={s.verified} size="sm" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Experience & education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="font-semibold">Senior Frontend Engineer · Twiga Foods</p>
                <p className="text-xs text-muted-foreground">2022 — Present · Nairobi, Kenya</p>
                <p className="mt-1 text-xs text-muted-foreground">Led the frontend rewrite from Vue to React/Next.js, improving Lighthouse scores by 47%.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="font-semibold">Frontend Engineer · Safaricom PLC</p>
                <p className="text-xs text-muted-foreground">2019 — 2022 · Nairobi, Kenya</p>
                <p className="mt-1 text-xs text-muted-foreground">Built customer-facing dashboards for the M-Pesa merchant portal serving 1.2M monthly users.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="font-semibold">B.Sc. Computer Science · University of Nairobi</p>
                <p className="text-xs text-muted-foreground">2014 — 2018</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant={shortlisted ? "secondary" : "default"}
                onClick={() => setShortlisted(!shortlisted)}
              >
                <Star className="h-4 w-4" /> {shortlisted ? "Shortlisted" : "Shortlist"}
              </Button>
              <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
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
                      <Textarea rows={3} placeholder="Anything they should prepare?" />
                    </div>
                    <InfoCallout>
                      <span className="font-medium">Privacy:</span> Contact details unlock only after {c.name} accepts this invitation.
                    </InfoCallout>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => { setInterviewDialogOpen(false); go("interviews"); }}>Send invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="w-full" variant="outline" onClick={() => go("messages")}>
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
              <Button className="w-full" variant="ghost">
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
                    <span>{c.name.toLowerCase().replace(" ", ".")}@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>+254 712 345 678</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <PrivacyLock />
                  <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                    <p>🔒 Email hidden</p>
                    <p className="mt-1">🔒 Phone hidden</p>
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
  return (
    <PageContainer>
      <SectionHeader
        title="Applications"
        description="All applications across your active jobs."
      />
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Candidate</th>
              <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Job</th>
              <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Match</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Applied</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {candidates.map((c) => (
              <tr key={c.id} className="hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.title}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <p className="text-sm">Senior Frontend Engineer</p>
                  <p className="text-xs text-muted-foreground">Northwind</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <MatchScore score={c.matchScore} size="sm" showLabel={false} />
                </td>
                <td className="px-4 py-3"><ApplicationStatusBadge status={c.applicationStatus} /></td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(c.appliedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => go("candidate-detail", { candidateId: c.id })}>
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

// ============================================================
// INTERVIEWS
// ============================================================
export function EmployerInterviews() {
  const { go } = useApp();
  const interviews = [
    { id: "i1", candidate: candidates[0], title: "Technical interview", date: "2026-10-09", time: "14:00 EAT", type: "Technical", status: "scheduled" as const },
    { id: "i2", candidate: candidates[5], title: "Recruiter screen", date: "2026-10-11", time: "10:00 EAT", type: "Screen", status: "scheduled" as const },
    { id: "i3", candidate: candidates[1], title: "Hiring manager call", date: "2026-10-12", time: "15:30 EAT", type: "Behavioral", status: "pending_confirmation" as const },
  ];

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

      <div className="mt-6 space-y-3">
        {interviews.map((iv) => (
          <Card key={iv.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Avatar initials={iv.candidate.initials} color={iv.candidate.avatarColor} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{iv.title} · {iv.candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{iv.candidate.title}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={iv.status === "scheduled" ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]" : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"}
                    >
                      {iv.status === "scheduled" ? "Confirmed" : "Pending"}
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
    </PageContainer>
  );
}

// ============================================================
// EMPLOYER NOTIFICATIONS & MESSAGES (mirror seeker pattern)
// ============================================================
export function EmployerNotifications() {
  const [items, setItems] = useState(employerNotifications);
  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <PageContainer>
      <SectionHeader
        title="Notifications"
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        }
      />
      <div className="mt-6 space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-card p-3",
              !n.read ? "border-primary/30 bg-primary/5" : "border-border"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              n.type === "application" ? "bg-blue-100 text-blue-700" :
              n.type === "interview" ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-700"
            )}>
              {n.type === "application" ? <Send className="h-4 w-4" /> :
               n.type === "interview" ? <CalendarClock className="h-4 w-4" /> :
               <Bell className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{n.title}</p>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
              {n.actionLabel && (
                <Button size="sm" variant="link" className="mt-1 h-auto p-0 text-xs">
                  {n.actionLabel} <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export function EmployerMessages() {
  const [conversations] = useState<Conversation[]>(employerConversations);
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [draft, setDraft] = useState("");
  const active = conversations.find((c) => c.id === activeId)!;

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
                onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { setDraft(""); } }}
              />
              <Button size="icon">
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
