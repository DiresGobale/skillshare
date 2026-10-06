"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
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
} from "@/components/shared/ui";
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
  GraduationCap,
  Award,
  Zap,
  Lightbulb,
  RefreshCw,
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
  const user = currentUser.seeker;

  return (
    <PageContainer>
      <SectionHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's your job-search overview for today."
        actions={
          <Button onClick={() => go("recommended")}>
            <Target className="h-4 w-4" /> View recommendations
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile completion" value={`${user.profileCompletion}%`} icon={<User className="h-4 w-4" />} hint="3 steps left" />
        <StatCard label="Recommended jobs" value={seekerDashboardStats.newRecommendations} icon={<Target className="h-4 w-4" />} hint="Updated 2h ago" />
        <StatCard label="Active applications" value={seekerDashboardStats.activeApplications} icon={<Send className="h-4 w-4" />} hint={`${seekerDashboardStats.interviewsScheduled} interview scheduled`} />
        <StatCard label="Avg. match score" value={`${seekerDashboardStats.averageMatchScore}%`} icon={<Sparkles className="h-4 w-4" />} hint="Across active applications" delta="+4% this week" deltaTone="up" />
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
              <ProfileCompletionRing value={user.profileCompletion} size={84} />
              <div className="space-y-1 text-xs">
                {[
                  { label: "Basic info", done: true },
                  { label: "Skills & proficiency", done: true },
                  { label: "Education", done: true },
                  { label: "Experience", done: true },
                  { label: "Resume upload", done: true },
                  { label: "Skill verification", done: false },
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

        {/* Recommended jobs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Top recommended jobs</CardTitle>
              <CardDescription>Based on your skills & recent activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go("recommended")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recommendedJobs.slice(0, 3).map((j) => (
              <button
                key={j.id}
                onClick={() => go("job-detail", { jobId: j.id })}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <CompanyLogo initials={j.companyLogo || "CO"} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold group-hover:text-primary">{j.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{j.company} · {j.location}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {j.skills.slice(0, 3).map((s) => (
                      <SkillChip key={s.id} name={s.name} size="sm" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MatchScore score={j.matchScore || 0} size="sm" showLabel={false} />
                  <span className="text-[10px] text-muted-foreground">{formatSalary(j)}</span>
                </div>
              </button>
            ))}
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
            {seekerApplications.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => go("applications")}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <CompanyLogo initials={a.job.companyLogo || "CO"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold group-hover:text-primary">{a.job.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.job.company} · applied {timeAgo(a.appliedAt)}</p>
                </div>
                <ApplicationStatusBadge status={a.status} />
                <MatchScore score={a.matchScore} size="sm" showLabel={false} />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm">Notifications</CardTitle>
              <CardDescription>{seekerDashboardStats.unreadNotifications} unread</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => go("notifications")}>
              <Bell className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {seekerNotifications.slice(0, 3).map((n) => (
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
                    <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Skill gap teaser */}
      <Card className="mt-4">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm">Skill gap focus</CardTitle>
            <CardDescription>Skills that would unlock more high-match roles</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => go("skill-gap")}>
            Full analysis <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            {skillGapAnalysis.slice(0, 3).map((g) => (
              <div key={g.skill} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{g.skill}</p>
                  <Badge variant="outline" className="text-[10px]">{g.jobsAvailable} jobs</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Required: <span className="capitalize">{g.requiredProficiency}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  You: {g.currentProficiency ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// SEEKER PROFILE
// ============================================================
export function SeekerProfile() {
  const { go } = useApp();
  const user = currentUser.seeker;

  return (
    <PageContainer>
      <SectionHeader
        title="My Profile"
        description="Your professional profile is used by the AI matching engine."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar initials={user.initials} color={user.avatarColor} size="lg" />
              <h2 className="mt-3 text-base font-semibold">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.location}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-3.5 w-3.5" /> Message
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-3.5 w-3.5" /> Contact
                </Button>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {user.joinedAt}</span>
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Profile completion</p>
                <span className="text-xs font-semibold text-primary">{user.profileCompletion}%</span>
              </div>
              <Progress value={user.profileCompletion} className="mt-1.5 h-1.5" />
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => go("skills")}>
                <Sparkles className="h-3.5 w-3.5" /> Verify 4 pending skills
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About + editable sections */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">About</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                defaultValue="Senior Frontend Engineer with 6 years building customer-facing products across fintech, agritech, and payments. Led the React/Next.js rewrite at Twiga Foods, lifting Lighthouse scores by 47%. Passionate about accessibility, performance, and mentoring."
                rows={4}
                className="resize-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Experience
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {seekerExperience.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.company}</p>
                      <p className="text-[11px] text-muted-foreground">{e.startDate} — {e.endDate}</p>
                    </div>
                    {e.current && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Current</Badge>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{e.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Education
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {seekerEducation.map((ed) => (
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================
// SEEKER SKILLS
// ============================================================
export function SeekerSkills() {
  const [skills, setSkills] = useState<Skill[]>(seekerSkills);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState<ProficiencyLevel>("intermediate");

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([
      ...skills,
      {
        id: `s${Date.now()}`,
        name: newSkill.trim(),
        category: "Custom",
        proficiency: newProficiency,
        verified: "unverified",
        yearsOfExperience: 1,
      },
    ]);
    setNewSkill("");
    setAddDialogOpen(false);
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
              <Button>
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
                  <Label htmlFor="skill-name">Skill name</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g. Kubernetes"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Proficiency level</Label>
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
                <InfoCallout>
                  New skills start as <span className="font-medium">unverified</span>. You can request verification through a short assessment.
                </InfoCallout>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={addSkill}>Add skill</Button>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
                  <Button size="sm" variant="outline" className="h-7 text-xs">
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
  const [sortBy, setSortBy] = useState("match");
  const [filter, setFilter] = useState("all");
  const [jobs, setJobs] = useState<typeof recommendedJobs>(recommendedJobs);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReranked, setAiReranked] = useState(false);

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
      const data = await res.json();
      if (!data.ok) {
        setAiError(data.error ?? "AI recommendation failed.");
        return;
      }
      setJobs(data.jobs ?? recommendedJobs);
      setAiReranked(true);
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  let filtered = [...jobs];
  if (filter === "saved") filtered = filtered.filter((j) => j.isSaved);
  if (filter === "remote") filtered = filtered.filter((j) => j.remote === "remote");
  if (sortBy === "match") filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  if (sortBy === "recent") filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return (
    <PageContainer>
      <SectionHeader
        title="Recommended Jobs"
        description="Ranked by your AI match score. Click any job to see the full match explanation."
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
            <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({jobs.filter(j => j.isSaved).length})</TabsTrigger>
            <TabsTrigger value="remote">Remote ({jobs.filter(j => j.remote === "remote").length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Match score</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Target className="h-5 w-5" />}
          title="No recommended jobs yet"
          description="Complete your skill profile and upload your resume to start receiving personalized recommendations."
        />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((j) => (
            <Card key={j.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <CompanyLogo initials={j.companyLogo || "CO"} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
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
                          <span className="font-medium text-foreground">${j.salary.min.toLocaleString()}–${j.salary.max.toLocaleString()}/{j.salary.period}</span>
                        </div>
                      </div>
                      <MatchScore score={j.matchScore || 0} size="lg" />
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {j.matchExplanation?.matchingSkills.slice(0, 4).map((s) => (
                        <SkillChip key={s.name} name={s.name} proficiency={s.proficiency} verified={s.verified} size="sm" />
                      ))}
                      {j.matchExplanation?.missingSkills.map((s) => (
                        <span
                          key={s.name}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                        >
                          <AlertCircle className="h-3 w-3" /> {s.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" onClick={() => go("job-detail", { jobId: j.id })}>
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => go("match-explanation", { jobId: j.id })}>
                        <Sparkles className="h-3.5 w-3.5" /> Why this match?
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Star className="h-3.5 w-3.5" /> {j.isSaved ? "Saved" : "Save"}
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
  const job = recommendedJobs.find((j) => j.id === selectedJobId) || recommendedJobs[0];
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <PageContainer>
      <button
        onClick={() => go("recommended")}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to recommendations
      </button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <CompanyLogo initials={job.companyLogo || "CO"} size="lg" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{job.title}</h1>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.postedAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">{job.category}</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">{job.remote}</Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">${job.salary.min.toLocaleString()}–${job.salary.max.toLocaleString()} / {job.salary.period}</Badge>
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
                  description="You'll receive a notification when the employer responds."
                />
              ) : (
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-10">
                      <Send className="h-4 w-4" /> Apply now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm application</DialogTitle>
                      <DialogDescription>
                        You're applying to <span className="font-medium text-foreground">{job.title}</span> at {job.company}. Your profile, skills, and most recent resume will be shared.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                      <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                        <span>Match score</span>
                        <span className="font-semibold text-primary">{job.matchScore}%</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                        <span>Resume</span>
                        <span className="font-medium">Amara_Okafor_Resume_2026.pdf</span>
                      </div>
                      <InfoCallout>
                        Your contact information stays private until the employer shortlists you and you accept their interview request.
                      </InfoCallout>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                      <Button onClick={() => { setApplied(true); setConfirmOpen(false); }}>
                        Submit application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" className="w-full" size="sm">
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
  const [filter, setFilter] = useState("all");

  let apps = [...seekerApplications];
  if (filter !== "all") apps = apps.filter((a) => a.status === filter);

  return (
    <PageContainer>
      <SectionHeader
        title="My Applications"
        description="Track every application from submission to decision."
      />

      <Tabs value={filter} onValueChange={setFilter} className="mt-6">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="all">All ({seekerApplications.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({seekerApplications.filter(a=>a.status==="submitted").length})</TabsTrigger>
          <TabsTrigger value="screening">Screening ({seekerApplications.filter(a=>a.status==="screening").length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({seekerApplications.filter(a=>a.status==="shortlisted").length})</TabsTrigger>
          <TabsTrigger value="interview">Interview ({seekerApplications.filter(a=>a.status==="interview").length})</TabsTrigger>
          <TabsTrigger value="rejected">Closed ({seekerApplications.filter(a=>a.status==="rejected").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {apps.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Send className="h-5 w-5" />}
          title="No applications in this category"
          description="Apply to recommended jobs to start tracking them here."
          action={<Button size="sm" onClick={() => go("recommended")}>Browse jobs</Button>}
        />
      ) : (
        <div className="mt-6 space-y-3">
          {apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <CompanyLogo initials={a.job.companyLogo || "CO"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{a.job.title}</p>
                        <p className="text-xs text-muted-foreground">{a.job.company} · {a.job.location}</p>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Applied {timeAgo(a.appliedAt)}</span>
                      <span>Updated {timeAgo(a.updatedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" /> Match score: <span className="font-semibold text-foreground">{a.matchScore}%</span>
                      </span>
                    </div>

                    {a.nextStep && (
                      <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
                        <p className="font-semibold text-blue-900">Next step: {a.nextStep.label}</p>
                        <p className="text-blue-700">{a.nextStep.date}</p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="mt-3">
                      <ol className="relative ml-2 border-l-2 border-border">
                        {a.timeline.map((t, i) => (
                          <li key={i} className="mb-3 ml-3 last:mb-0">
                            <span className="absolute -left-[5px] mt-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                            <p className="text-xs font-semibold capitalize">{t.status}</p>
                            <p className="text-[11px] text-muted-foreground">{t.date} · {t.note}</p>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => go("messages")}>
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </Button>
                      <Button size="sm" variant="ghost">Withdraw</Button>
                    </div>
                  </div>
                  <div className="sm:pl-2">
                    <MatchScore score={a.matchScore} size="md" />
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
  const [items, setItems] = useState(seekerNotifications);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread" ? items.filter((n) => !n.read) : items;

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) =>
    setItems(items.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <PageContainer>
      <SectionHeader
        title="Notifications"
        description={`${items.filter((n) => !n.read).length} unread`}
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
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

      {filtered.length === 0 ? (
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
              <Button variant="ghost" size="sm">
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
