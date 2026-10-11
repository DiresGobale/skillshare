"use client";

import React, { useState, useEffect } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandMark, HamburgerToggle } from "@/components/chrome/app-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CompanyLogo,
  SkillChip,
  MatchScore,
  EmptyState,
  InfoCallout,
} from "@/components/shared/ui";
import { publicJobs, recommendedJobs } from "@/lib/mock-data";
import { demoAccounts } from "@/lib/demo-accounts";
import type { Job, Role } from "@/lib/types";
import { X } from "lucide-react";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Target,
  ShieldCheck,
  BarChart3,
  Zap,
  FileText,
  Download,
  TrendingUp,
  Users,
  Building2,
  Star,
  Clock,
  Lock,
  Mail,
  ArrowLeft,
  Filter,
  AlertCircle,
  ChevronDown,
  Plus,
  Minus,
  Quote,
  Globe2,
  Cpu,
  Rocket,
  Heart,
  Award,
  Lightbulb,
  Layers,
  Github,
  Twitter,
  Linkedin,
  Newspaper,
  Calendar,
  Tag,
  Pin,
  Loader2,
  Phone,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { validateName, validateEmail, validatePassword, validateEthiopianPhone, sanitizePhone } from "@/lib/validation";

// ============================================================
// Public top nav (guest header)
// ============================================================
function PublicHeader({ onAuth }: { onAuth: (r: "login" | "register") => void }) {
  const { go } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll + ESC to close
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home", view: "home" as const },
    { label: "How it works", view: "landing" as const },
    { label: "Browse jobs", view: "public-jobs" as const },
    { label: "News", view: "public-news" as const },
    { label: "FAQ", view: "faq" as const },
    { label: "About", view: "about" as const },
    { label: "Contact", view: "contact" as const },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Hamburger toggle (mobile only) */}
          <HamburgerToggle
            open={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden"
          />

          <button onClick={() => go("home")} className="flex items-center">
            <BrandMark />
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Button key={link.label} variant="ghost" size="sm" onClick={() => go(link.view)}>
                {link.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onAuth("login")} className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button size="sm" className="btn-rainbow" onClick={() => onAuth("register")}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down nav panel */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav
        aria-label="Mobile public navigation"
        className={cn(
          "fixed inset-x-0 top-16 z-30 border-b border-border bg-background shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <div className="space-y-1 p-3">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                go(link.view);
                setMobileOpen(false);
              }}
              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-border pt-2">
            <button
              onClick={() => {
                onAuth("login");
                setMobileOpen(false);
              }}
              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

function PublicFooter() {
  const { go } = useApp();
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <BrandMark />
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              AI-powered, skill-based matching for the African talent market. Connecting verified skills to real opportunities.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("home")}>Home</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("public-jobs")}>Browse jobs</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>How it works</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("public-news")}>News</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("faq")}>FAQ</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For employers</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => { try { sessionStorage.setItem("registerRole", "employer"); } catch { /* ignore */ } go("register"); }}>Post a job</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>Pricing</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>Talent search</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("about")}>About</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("contact")}>Contact</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("faq")}>FAQ</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("privacy")}>Privacy Policy</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("terms")}>Terms of Use</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 SkillMatch AI. All rights reserved.</span>
          <div className="flex gap-4">
            <button className="hover:text-foreground" onClick={() => go("privacy")}>Privacy</button>
            <button className="hover:text-foreground" onClick={() => go("terms")}>Terms</button>
            <button className="hover:text-foreground" onClick={() => go("faq")}>FAQ</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// LANDING
// ============================================================
function LandingHero() {
  const { go } = useApp();
  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="absolute inset-0 bg-grid-subtle opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-powered skill matching · live in 14 African markets
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient-primary">Find work</span> that fits your skills — not the other way around.
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            SkillMatch AI analyzes your verified skills, proficiency, and experience to recommend jobs
            you'll actually get. Every recommendation comes with a transparent 0–100% match score.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-6 btn-rainbow" onClick={() => go("public-jobs")}>
              Find jobs <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6"
              onClick={() => {
                try { sessionStorage.setItem("registerRole", "employer"); } catch { /* ignore */ }
                go("register");
              }}
            >
              Hire talent
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free for job seekers · No credit card required
          </p>
        </div>

        {/* Mock dashboard preview */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-muted-foreground">skillmatch.ai/dashboard</span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo initials="NW" size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Senior Frontend Engineer</p>
                      <p className="text-xs text-muted-foreground">Northwind Technologies · Lagos, NG</p>
                    </div>
                    <MatchScore score={92} size="md" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <SkillChip name="React" proficiency="expert" verified size="sm" />
                    <SkillChip name="TypeScript" proficiency="advanced" verified size="sm" />
                    <SkillChip name="Next.js" proficiency="advanced" size="sm" />
                    <SkillChip name="Tailwind CSS" proficiency="advanced" verified size="sm" />
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo initials="CG" size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Frontend Engineer, Design Systems</p>
                      <p className="text-xs text-muted-foreground">Cellulant Group · Remote — Africa</p>
                    </div>
                    <MatchScore score={84} size="md" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Profile completion</p>
                  <div className="mt-2 flex items-center gap-3">
                    <MatchScore score={78} size="sm" showLabel={false} />
                    <div className="text-sm">
                      <p className="font-semibold">78%</p>
                      <p className="text-xs text-muted-foreground">3 steps left</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active applications</p>
                  <p className="mt-2 text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">1 interview scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFeatures() {
  const features = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Explainable match scores",
      description: "Every job comes with a 0–100% score broken down by skill match, proficiency, experience, education, and verified skills. No black boxes.",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "AI resume analysis",
      description: "Upload your resume once. We extract skills, normalize them against our ontology, infer proficiency, and flag what's verifiable.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Verified skills, not vibes",
      description: "Skills are verified through assessments, certificates, and prior employer attestations. Verified skills carry real weight in matching.",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Skill-gap analysis",
      description: "See exactly which skills separate you from your target roles, with curated learning resources and the number of jobs each unlocks.",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Privacy by default",
      description: "Employers cannot see your contact information until you apply or accept an interview request. You're always in control.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time conversations",
      description: "Once shortlisted, message recruiters directly inside the platform. Track every application from submission to offer.",
    },
  ];
  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why SkillMatch AI</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Built on skills. Powered by AI. Owned by you.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're not another keyword job board. Every match is computed from your verified skill graph — and every score is explainable.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {f.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingHowItWorks() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">For job seekers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Your skills, your story.</h2>
            <p className="mt-3 text-muted-foreground">
              Build a profile once. Let our AI translate your experience into a structured skill graph
              that employers can trust — and that powers your match scores.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                { t: "Build your skill profile", d: "Add education, experience, and skills with proficiency levels." },
                { t: "Upload your resume", d: "AI extracts, normalizes, and infers proficiency automatically." },
                { t: "Get matched", d: "Receive jobs with explainable 0–100% scores and skill-gap insights." },
                { t: "Apply & track", d: "Submit applications and watch them progress from screening to offer." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.t}</p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">For employers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Hire on evidence, not keywords.</h2>
            <p className="mt-3 text-muted-foreground">
              Define the skills and proficiency your role actually needs. Our AI ranks every applicant
              by match score, surfaces gaps, and respects candidate privacy throughout.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                { t: "Create a job with skill requirements", d: "Mark skills as mandatory or preferred, and set proficiency thresholds." },
                { t: "Receive AI-ranked candidates", d: "Every applicant is scored 0–100% with skill-by-skill breakdown." },
                { t: "Shortlist with confidence", d: "See matching, missing, and verified skills side-by-side." },
                { t: "Connect & interview", d: "Contact details unlock only after a candidate accepts your interview request." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.t}</p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingCTA() {
  const { go } = useApp();
  const pickRole = (r: "seeker" | "employer") => {
    try { sessionStorage.setItem("registerRole", r); } catch { /* ignore */ }
    go("register");
  };
  return (
    <section className="border-t border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 px-6 py-12 text-center text-white shadow-card-soft sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to be matched?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
            Join 4,800+ job seekers and 950+ employers using SkillMatch AI across Africa.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-6 bg-white text-violet-700 hover:bg-white/90"
              onClick={() => pickRole("seeker")}
            >
              Sign up as job seeker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
              onClick={() => pickRole("employer")}
            >
              Sign up as employer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const { go } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// HOME PAGE — modern, animated, with four group photos
// ============================================================

// Reusable scroll-reveal wrapper
function RevealBlock({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const visible = useScrollReveal(ref);
  return (
    <Tag
      ref={ref as any}
      className={cn("reveal-on-scroll", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

// Group photo data — used as a fallback if the database fetch fails.
// The live source of truth is the /api/site-images endpoint, which admins
// can edit at runtime to change which images appear on the home page.
const GROUP_PHOTOS_FALLBACK = [
  {
    id: "fallback-1",
    key: "home-group-1",
    src: "/groups/group1.jpg",
    alt: "Five engineers collaborating in a glass-walled meeting room",
    caption: "Collaborative engineering",
    description: "Cross-functional teams iterate daily on customer-facing products.",
    accent: "from-violet-500 to-blue-500",
    category: "home",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "fallback-2",
    key: "home-group-2",
    src: "/groups/group2.jpg",
    alt: "Five IT engineers pair-programming at a standing desk",
    caption: "Pair programming",
    description: "Knowledge-sharing built into every sprint through paired work.",
    accent: "from-emerald-500 to-cyan-500",
    category: "home",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "fallback-3",
    key: "home-group-3",
    src: "/groups/group3.jpg",
    alt: "Five tech professionals celebrating around a project whiteboard",
    caption: "Milestone celebrations",
    description: "Every shipped feature is recognized, every voice matters.",
    accent: "from-amber-500 to-rose-500",
    category: "home",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "fallback-4",
    key: "home-group-4",
    src: "/groups/group4.jpg",
    alt: "Five developers gathered in a tech lounge for a daily standup",
    caption: "Casual standups",
    description: "Quick syncs in our lounge keep momentum without crushing focus.",
    accent: "from-fuchsia-500 to-purple-500",
    category: "home",
    sortOrder: 4,
    isActive: true,
  },
];

// Type for a site image returned by the API
interface SiteImage {
  id: string;
  key: string;
  src: string;
  alt: string;
  caption: string | null;
  description: string | null;
  accent: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

// Hook to fetch site images from the database for a given category.
// Falls back to GROUP_PHOTOS_FALLBACK on error so the page never breaks.
function useSiteImages(category: string): { images: SiteImage[]; loading: boolean } {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/site-images?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok && Array.isArray(data.images) && data.images.length > 0) {
          setImages(data.images);
        } else {
          // Fall back to hardcoded data
          setImages(GROUP_PHOTOS_FALLBACK.filter((p) => p.category === category));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImages(GROUP_PHOTOS_FALLBACK.filter((p) => p.category === category));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [category]);

  return { images, loading };
}

// Animated counter
function AnimatedCounter({ target, suffix = "", duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const visible = useScrollReveal(ref);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let startTime: number | null = null;
    let frame: number;
    const animate = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible, target, duration]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function HomeHero() {
  const { go } = useApp();
  const { images: heroImages } = useSiteImages("home-hero");
  const heroImage = heroImages[0];

  return (
    <section className="relative overflow-hidden bg-hero-glow">
      {/* Animated gradient blobs in the background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl animate-blob" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>
      <div className="absolute inset-0 bg-grid-subtle opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Left: copy + CTAs */}
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI-powered skill matching · live in 14 African markets
            </div>
            <h1 className="animate-fade-up delay-100 mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl sm:mt-6 lg:text-5xl xl:text-6xl">
              Where <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent animate-gradient-text">verified skills</span> meet real opportunities.
            </h1>
            <p className="animate-fade-up delay-200 mt-4 max-w-xl text-sm text-muted-foreground sm:mt-5 sm:text-base lg:text-lg">
              SkillMatch AI builds a structured skill graph for every candidate, verifies it through assessments and prior employer attestation, then uses explainable AI to match the right people to the right roles — no keyword spam, no résumé black holes.
            </p>
            <div className="animate-fade-up delay-300 mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:mt-8">
              <Button size="lg" className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base btn-rainbow w-full sm:w-auto" onClick={() => go("public-jobs")}>
                Find jobs <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base w-full sm:w-auto"
                onClick={() => {
                  try { sessionStorage.setItem("registerRole", "employer"); } catch { /* ignore */ }
                  go("register");
                }}
              >
                Hire talent
              </Button>
            </div>
            <div className="animate-fade-up delay-400 mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:mt-8">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free for job seekers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> GDPR-compliant
              </span>
            </div>
          </div>

          {/* Right: floating photo collage with the hero group photo — responsive on all screens */}
          <div className="relative">
            <div className="animate-scale-in delay-200 relative mx-auto max-w-md sm:max-w-lg lg:max-w-none">
              {/* Decorative gradient ring */}
              <div className="absolute -inset-3 sm:-inset-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500/30 via-blue-500/30 to-emerald-500/30 blur-2xl animate-pulse-glow" />
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl animate-float">
                {/* Responsive image using Next.js Image-like pattern with aspect ratio */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11]">
                  <img
                    src={heroImage?.src ?? "/groups/group1.jpg"}
                    alt={heroImage?.alt ?? "Five engineers collaborating in a modern tech office"}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    // Provide width/height hints for the browser to avoid layout shift
                    width={1344}
                    height={768}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Floating stat badge — responsive: hidden on very small screens */}
                <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-lg backdrop-blur sm:bottom-4 sm:left-4 sm:rounded-xl sm:px-3 sm:py-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[10px]">Match accuracy</p>
                  <p className="text-sm font-bold text-gradient-primary sm:text-lg">94.2%</p>
                </div>
              </div>
              {/* Floating side cards — hidden on mobile, shown on tablet+ */}
              <div className="animate-float absolute -right-3 top-8 rounded-xl border border-border bg-card p-2.5 shadow-xl hidden sm:block lg:-right-6 lg:top-12 lg:p-3" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 lg:h-8 lg:w-8">
                    <ShieldCheck className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground lg:text-[10px]">Verified</p>
                    <p className="text-[11px] font-bold lg:text-xs">6,124 skills</p>
                  </div>
                </div>
              </div>
              <div className="animate-float absolute -left-3 bottom-16 rounded-xl border border-border bg-card p-2.5 shadow-xl hidden sm:block lg:-left-6 lg:bottom-20 lg:p-3" style={{ animationDelay: "3s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 lg:h-8 lg:w-8">
                    <Cpu className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground lg:text-[10px]">AI score</p>
                    <p className="text-[11px] font-bold lg:text-xs">Explainable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeStats() {
  const stats = [
    { value: 4872, suffix: "+", label: "Active job seekers", icon: <Users className="h-5 w-5" />, color: "from-violet-500 to-blue-500" },
    { value: 958, suffix: "+", label: "Hiring employers", icon: <Building2 className="h-5 w-5" />, color: "from-blue-500 to-cyan-500" },
    { value: 1247, suffix: "", label: "Open roles", icon: <Briefcase className="h-5 w-5" />, color: "from-emerald-500 to-teal-500" },
    { value: 6124, suffix: "", label: "Verified skills", icon: <ShieldCheck className="h-5 w-5" />, color: "from-amber-500 to-rose-500" },
  ];
  return (
    <section className="border-y border-border bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <RevealBlock key={s.label} delay={i * 100}>
              <div className="lift-card rounded-2xl border border-border bg-card p-5 text-center sm:p-6">
                <div className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", s.color)}>
                  {s.icon}
                </div>
                <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeGroupPhotos() {
  const { images: groupPhotos, loading } = useSiteImages("home");
  const photos = groupPhotos.length > 0 ? groupPhotos : GROUP_PHOTOS_FALLBACK;

  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealBlock className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Our community</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Real teams. Real collaboration. Real outcomes.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            SkillMatch AI is built by engineers, for engineers. Our community spans 14 African markets and 50+ technology stacks — connected through a shared belief that hiring should be transparent, fair, and skill-based.
          </p>
        </RevealBlock>

        {/* Responsive grid: 1 column on mobile, 2 on tablet+ */}
        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {loading ? (
            // Skeleton placeholders while loading
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] sm:aspect-[16/9] animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))
          ) : (
            photos.map((photo, i) => (
              <RevealBlock key={photo.id ?? photo.key} delay={i * 120}>
                <figure className="zoom-img-container lift-card group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-md">
                  {/* Responsive aspect ratio: taller on mobile, wider on tablet+ */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="zoom-img absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      // Width/height hints to prevent layout shift
                      width={1344}
                      height={768}
                    />
                    <div className={cn("absolute inset-0 bg-gradient-to-t opacity-60 mix-blend-multiply", photo.accent)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4 lg:p-5">
                    <div className="flex items-end justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80 sm:text-xs">{photo.caption}</p>
                        <p className="mt-0.5 text-xs font-medium leading-tight sm:mt-1 sm:text-sm lg:text-base">{photo.description}</p>
                      </div>
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg sm:h-8 sm:w-9 lg:h-9 lg:w-9 text-[10px] sm:text-xs", photo.accent)}>
                        {i + 1}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </RevealBlock>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function HomeFeatures() {
  const features = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Explainable match scores",
      description: "Every job match comes with a 0–100% score broken down by skill overlap, proficiency, experience, education, and verified skills. No black boxes — every decision is auditable.",
      color: "from-violet-500 to-blue-500",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "AI resume analysis",
      description: "Upload your resume once. We extract skills, normalize them against our ontology, infer proficiency, and flag what's verifiable through assessments or prior employer attestation.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Verified skills, not vibes",
      description: "Skills are verified through assessments, certificates, and prior employer attestations. Verified skills carry real, weighted value in every match computation.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Skill-gap analysis",
      description: "See exactly which skills separate you from your target roles, with curated learning resources and the number of jobs each new skill unlocks.",
      color: "from-amber-500 to-rose-500",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Privacy by default",
      description: "Employers cannot see your contact information until you apply or accept an interview request. You're always in control of who sees what.",
      color: "from-fuchsia-500 to-purple-500",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time conversations",
      description: "Once shortlisted, message recruiters directly inside the platform. Track every application from submission to interview to offer — all in one place.",
      color: "from-rose-500 to-orange-500",
    },
  ];
  return (
    <section className="border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealBlock className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why SkillMatch AI</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Built on skills. Powered by AI. Owned by you.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're not another keyword job board. Every match is computed from your verified skill graph — and every score is fully explainable.
          </p>
        </RevealBlock>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <RevealBlock key={f.title} delay={i * 100}>
              <div className="lift-card h-full rounded-xl border border-border bg-card p-6">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", f.color)}>
                  {f.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeTestimonials() {
  const testimonials = [
    {
      quote: "SkillMatch AI matched me to a Senior Frontend role at Northwind with a 92% score. The interview felt fair — they already knew what I could do. I started two weeks later.",
      name: "Amara Okafor",
      title: "Senior Frontend Engineer · Lagos",
      initials: "AO",
      color: "from-violet-500 to-blue-500",
    },
    {
      quote: "We filled three engineering roles in six weeks. The skill verification cut our screening time by 70%. The candidates who showed up could actually do the work.",
      name: "David Chen",
      title: "Talent Acquisition Lead · Northwind",
      initials: "DC",
      color: "from-emerald-500 to-teal-500",
    },
    {
      quote: "I love that employers can't see my phone number until I accept an interview. No more cold calls from recruiters who haven't even read my profile.",
      name: "Tunde Bello",
      title: "Backend Engineer · Nairobi",
      initials: "TB",
      color: "from-amber-500 to-rose-500",
    },
  ];

  return (
    <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealBlock className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Success stories</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by talent and teams across Africa.
          </h2>
        </RevealBlock>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealBlock key={t.name} delay={i * 120}>
              <figure className="lift-card h-full rounded-2xl border border-border bg-card p-6">
                <Quote className="h-8 w-8 text-primary/30" />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md", t.color)}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeCTA() {
  const { go } = useApp();
  const pickRole = (r: "seeker" | "employer") => {
    try { sessionStorage.setItem("registerRole", r); } catch { /* ignore */ }
    go("register");
  };
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealBlock>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-600 px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            {/* Decorative animated blobs */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob" />
              <div className="absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-white/10 blur-2xl animate-blob" style={{ animationDelay: "4s" }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to be matched?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Join 4,800+ job seekers and 950+ employers using SkillMatch AI across the continent. Your next opportunity — or your next great hire — is one click away.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-6 bg-white text-violet-700 hover:bg-white/90"
                  onClick={() => pickRole("seeker")}
                >
                  Sign up as job seeker
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/40 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => pickRole("employer")}
                >
                  Sign up as employer
                </Button>
              </div>
            </div>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

export function HomePage() {
  const { go } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1">
        <HomeHero />
        <HomeStats />
        <HomeGroupPhotos />
        <HomeFeatures />
        <HomeTestimonials />
        <HomeCTA />
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// FAQ PAGE — eight expandable questions with smooth animations
// ============================================================

interface FAQItem {
  q: string;
  a: string;
  icon: React.ReactNode;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "How does the AI matching actually work?",
    a: "Our AI computes a 0–100% match score for every job application by combining six weighted factors: skill match (25%), required skill coverage (30%), proficiency alignment (15%), experience match (15%), education threshold (10%), and verified-skill bonus (5%). Every factor is explainable — you can drill into exactly which skills boosted or lowered your score. The weights are tunable by platform admins and visible to all users for full transparency.",
    icon: <Cpu className="h-5 w-5" />,
    category: "How it works",
  },
  {
    q: "Is SkillMatch AI free for job seekers?",
    a: "Yes — completely free for job seekers, forever. You can build your profile, upload your resume, get AI-extracted skills, apply to unlimited jobs, and message employers after shortlist, all at no cost. We monetize through employer subscriptions, never through candidate fees. No credit card is required to sign up, and we will never sell your data to third parties.",
    icon: <Heart className="h-5 w-5" />,
    category: "Pricing",
  },
  {
    q: "How are skills verified?",
    a: "Skills move through three verification tiers: unverified (self-reported), pending (in our assessment queue), and verified (confirmed). Verification happens through four channels: (1) automated skill assessments built into the platform, (2) uploaded certificates and certifications, (3) prior employer attestation, and (4) verified education records. Verified skills carry a 5% bonus weight in every match score and are clearly marked with a shield icon throughout the platform.",
    icon: <ShieldCheck className="h-5 w-5" />,
    category: "Verification",
  },
  {
    q: "Who can see my contact information?",
    a: "By default, your name, email, and phone number are hidden from employers. They only see your skills, proficiency levels, experience, education, and match score. Your contact info is unlocked only when you explicitly apply to a job or accept an employer's interview request. You can revoke access at any time by withdrawing an application. This privacy-by-default model is core to how we operate — you're always in control.",
    icon: <Lock className="h-5 w-5" />,
    category: "Privacy",
  },
  {
    q: "What happens when I upload my resume?",
    a: "Our AI extracts skills from your resume, normalizes them against our skill ontology (so 'React.js', 'ReactJS', and 'React' all map to the same skill), infers a proficiency level based on context clues (years used, project complexity, leadership signals), and flags which skills are verifiable through your listed experience. You always review and approve the extracted skills before they're added to your profile — the AI suggests, you decide.",
    icon: <FileText className="h-5 w-5" />,
    category: "How it works",
  },
  {
    q: "How do I improve my match scores?",
    a: "Open the Skill Gap Analysis page for any target role to see exactly which skills separate you from a 90%+ match, ranked by impact. Each gap is paired with curated learning resources and an estimate of how many additional jobs unlocking that skill would create for you. Add the skill to your profile, build it through a project or assessment, request verification, and your match scores across the platform update automatically within 24 hours.",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "Career growth",
  },
  {
    q: "Can employers post jobs for free?",
    a: "Employers can post their first job for free, with full access to AI candidate ranking, skill-gap insights, and interview scheduling. Additional job posts and advanced features (bulk candidate messaging, team collaboration, advanced analytics, priority placement) are available on subscription plans starting at $99/month. All plans include the privacy-by-default candidate protections and GDPR compliance — we never charge for fairness.",
    icon: <Building2 className="h-5 w-5" />,
    category: "Pricing",
  },
  {
    q: "Is my data GDPR-compliant?",
    a: "Yes. We're GDPR-compliant and operate under a strict data-processing agreement. All personally identifiable information is encrypted at rest (AES-256) and in transit (TLS 1.3). You can export all your data at any time from Settings → Privacy, and you can permanently delete your account and all associated records with a single click — no support ticket required. We retain only anonymized, aggregated skill statistics for platform analytics.",
    icon: <Globe2 className="h-5 w-5" />,
    category: "Privacy",
  },
];

function FAQItemRow({ item, isOpen, onToggle, index }: { item: FAQItem; isOpen: boolean; onToggle: () => void; index: number }) {
  return (
    <RevealBlock delay={index * 60}>
      <div
        className={cn(
          "lift-card overflow-hidden rounded-2xl border bg-card transition-colors",
          isOpen ? "border-primary/40 shadow-md" : "border-border"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
        >
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
              isOpen
                ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg"
                : "bg-primary/10 text-primary"
            )}
          >
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.category}
              </span>
            </div>
            <h3 className={cn("mt-0.5 text-sm font-semibold transition-colors sm:text-base", isOpen && "text-primary")}>
              {item.q}
            </h3>
          </div>
          <div
            className={cn(
              "faq-chevron flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
              isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <ChevronDown className={cn("h-4 w-4 faq-chevron", isOpen && "is-open")} />
          </div>
        </button>
        <div
          className={cn(
            "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="ml-0 sm:ml-15">
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealBlock>
  );
}

function FAQHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero-glow">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl animate-blob" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>
      <div className="absolute inset-0 bg-grid-subtle opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Lightbulb className="h-3 w-3" />
          Frequently asked questions
        </div>
        <h1 className="animate-fade-up delay-100 mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Got questions? <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent animate-gradient-text">We've got answers.</span>
        </h1>
        <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Everything you need to know about how SkillMatch AI works, how your data is protected, and how to get the most out of the platform. Can't find what you're looking for? Reach out anytime.
        </p>
      </div>
    </section>
  );
}

function FAQCategoryPills({ activeCategory, onSelect }: { activeCategory: string; onSelect: (c: string) => void }) {
  const categories = ["All", ...Array.from(new Set(FAQ_ITEMS.map((i) => i.category)))];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
            activeCategory === c
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function FAQContactCTA() {
  const { go } = useApp();
  return (
    <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <RevealBlock>
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-md sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Still have questions?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              Our team is here to help. Reach out and we'll get back to you within 1–2 business days. We love feedback, ideas, and the occasional bug report.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="btn-rainbow h-12 px-6" onClick={() => go("contact")}>
                Contact support <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => go("about")}>
                Learn about us
              </Button>
            </div>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

export function FAQPage() {
  const { go } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default
  const [category, setCategory] = useState<string>("All");

  const filtered = category === "All" ? FAQ_ITEMS : FAQ_ITEMS.filter((i) => i.category === category);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1">
        <FAQHero />
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <RevealBlock className="mb-8">
              <FAQCategoryPills activeCategory={category} onSelect={(c) => { setCategory(c); setOpenIndex(null); }} />
            </RevealBlock>
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <FAQItemRow
                  key={item.q}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No questions in this category yet.
              </div>
            )}
          </div>
        </section>
        <FAQContactCTA />
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// PRIVACY POLICY PAGE
// ============================================================

// Shared layout for legal pages
function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  children: React.ReactNode;
}) {
  const { go } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-hero-glow">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl animate-blob" />
            <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
          </div>
          <div className="absolute inset-0 bg-grid-subtle opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3 w-3" />
              Legal
            </div>
            <h1 className="animate-fade-up delay-100 mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {intro}
            </p>
            <p className="animate-fade-up delay-300 mt-4 text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
              <div className="legal-content space-y-8">
                {children}
              </div>
            </div>

            {/* Quick navigation back */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <button onClick={() => go("terms")} className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                Terms of Use
              </button>
              <button onClick={() => go("faq")} className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                FAQ
              </button>
              <button onClick={() => go("contact")} className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                Contact us
              </button>
              <button onClick={() => go("home")} className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

// Reusable section component for legal pages
function LegalSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight sm:text-xl">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 pl-0 sm:pl-10 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="October 7, 2026"
      intro="Your privacy is foundational to everything we build. This policy explains what data we collect, why we collect it, how we use it, and the controls you have over it."
    >
      <LegalSection number={1} title="Information we collect">
        <p>
          We collect information that you provide directly to us when you create an account, build your profile, upload a resume, apply to jobs, or communicate with employers. This includes:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><strong className="text-foreground">Account data:</strong> name, email address, password (bcrypt-hashed), role (seeker/employer/admin), and profile photo.</li>
          <li><strong className="text-foreground">Profile data:</strong> skills, proficiency levels, work experience, education, location, and about/bio text.</li>
          <li><strong className="text-foreground">Resume data:</strong> the contents of any resume you upload for AI analysis. We extract skills, normalize them, and store the normalized form.</li>
          <li><strong className="text-foreground">Application data:</strong> which jobs you apply to, application status, match scores, and messages exchanged with employers.</li>
          <li><strong className="text-foreground">Usage data:</strong> aggregated, anonymized analytics about feature usage, page views, and performance. We do not link this back to your identity.</li>
        </ul>
      </LegalSection>

      <LegalSection number={2} title="How we use your information">
        <p>We use your information to operate, maintain, and improve the platform:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>To compute match scores between your skill profile and posted jobs.</li>
          <li>To display your profile (minus contact details) to employers when you apply or are shortlisted.</li>
          <li>To send you notifications about applications, interviews, and platform updates.</li>
          <li>To generate aggregated, anonymized analytics about skill trends and platform health.</li>
          <li>To detect, prevent, and address fraud, abuse, and security incidents.</li>
          <li>To comply with our legal obligations under Kenyan, Nigerian, and EU data-protection law.</li>
        </ul>
        <p>We never sell your personal data to third parties. We never share your contact information with employers until you explicitly apply to a job or accept an interview request.</p>
      </LegalSection>

      <LegalSection number={3} title="Privacy by default">
        <p>
          Privacy-by-default is a core product principle, not just a legal checkbox. Specifically:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Your name, email, and phone number are hidden from employers until you apply or accept an interview.</li>
          <li>Employers see only your skills, proficiency, experience, education, and match score during candidate ranking.</li>
          <li>You can revoke an employer's access to your contact details at any time by withdrawing your application.</li>
          <li>You can export or permanently delete your account and all associated data from Settings → Privacy with a single click — no support ticket required.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Data retention">
        <p>
          We retain your data for as long as your account is active. If you delete your account, we permanently remove your personal data (profile, resume, applications, messages) within 30 days. We retain only anonymized, aggregated skill statistics for platform analytics — these cannot be traced back to you.
        </p>
        <p>
          If you simply stop using the platform without deleting your account, we will retain your data for 24 months of inactivity before automatically archiving it. You will receive two email reminders (at 18 and 23 months) before this happens.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Data security">
        <p>
          We use industry-standard technical and organizational measures to protect your data:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><strong className="text-foreground">Encryption at rest:</strong> AES-256 for all personally identifiable information stored in our database.</li>
          <li><strong className="text-foreground">Encryption in transit:</strong> TLS 1.3 for all network traffic between your browser and our servers.</li>
          <li><strong className="text-foreground">Password hashing:</strong> bcrypt with a cost factor of 10. We never store plaintext passwords.</li>
          <li><strong className="text-foreground">Access controls:</strong> strict role-based access for our team. Admin accounts require 2FA.</li>
          <li><strong className="text-foreground">Regular audits:</strong> quarterly security reviews and penetration testing.</li>
        </ul>
      </LegalSection>

      <LegalSection number={6} title="Your rights (GDPR & similar laws)">
        <p>
          Depending on your jurisdiction, you may have the following rights regarding your personal data:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><strong className="text-foreground">Right of access:</strong> request a copy of all data we hold about you.</li>
          <li><strong className="text-foreground">Right to rectification:</strong> correct inaccurate or incomplete data.</li>
          <li><strong className="text-foreground">Right to erasure:</strong> permanently delete your account and data.</li>
          <li><strong className="text-foreground">Right to restrict processing:</strong> limit how we use your data while a dispute is resolved.</li>
          <li><strong className="text-foreground">Right to data portability:</strong> export your data in a machine-readable format.</li>
          <li><strong className="text-foreground">Right to object:</strong> opt out of certain processing activities.</li>
        </ul>
        <p>
          To exercise any of these rights, use the in-app controls in Settings → Privacy, or email us at privacy@skillmatch.ai. We respond to all valid requests within 30 days.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Cookies and tracking">
        <p>
          We use only essential cookies required for the platform to function:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><strong className="text-foreground">Session cookie:</strong> authenticates you after login. HttpOnly, Secure, SameSite=Lax.</li>
          <li><strong className="text-foreground">CSRF cookie:</strong> protects against cross-site request forgery on form submissions.</li>
          <li><strong className="text-foreground">Theme preference cookie:</strong> remembers your light/dark mode choice.</li>
        </ul>
        <p>
          We do not use third-party advertising, marketing, or cross-site tracking cookies. We do not use Google Analytics, Facebook Pixel, or any similar service. The only third-party scripts we load are for email delivery and error monitoring — both configured to process only the minimum data necessary.
        </p>
      </LegalSection>

      <LegalSection number={8} title="International data transfers">
        <p>
          SkillMatch AI operates across 14 African markets. Your data may be processed on servers located in Kenya (primary), Nigeria (secondary), and the EU (backup). All transfers are governed by Standard Contractual Clauses approved by the European Commission, and we ensure an equivalent level of protection in every jurisdiction.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Children's privacy">
        <p>
          SkillMatch AI is not directed to children under 16. We do not knowingly collect personal information from anyone under 16. If you believe we have collected data from a minor, please contact us at privacy@skillmatch.ai and we will delete it immediately.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you by email and via an in-app banner at least 30 days before any material change takes effect. The "Last updated" date at the top of this page reflects the most recent revision.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Contact us">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Email: <strong className="text-foreground">privacy@skillmatch.ai</strong></li>
          <li>Postal: SkillMatch AI, PO Box 12345-00100, Nairobi, Kenya</li>
          <li>Or use the in-app contact form on the Contact page.</li>
        </ul>
        <p>We are committed to resolving every privacy inquiry within 5 business days.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}

// ============================================================
// TERMS OF USE PAGE
// ============================================================

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Use"
      lastUpdated="October 7, 2026"
      intro="These terms govern your use of SkillMatch AI. Please read them carefully — by creating an account, you agree to be bound by them."
    >
      <LegalSection number={1} title="Acceptance of terms">
        <p>
          By accessing or using SkillMatch AI (the "Platform"), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, you may not access or use the Platform. If you are using the Platform on behalf of a company, you represent that you have the authority to bind that company to these terms.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Eligibility">
        <p>
          You must be at least 16 years old to use SkillMatch AI. By creating an account, you represent and warrant that:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>You are at least 16 years of age (or the age of digital consent in your jurisdiction, whichever is higher).</li>
          <li>You are legally capable of entering into a binding agreement.</li>
          <li>All information you provide is accurate, current, and complete.</li>
          <li>You will maintain the accuracy of your information and update it as needed.</li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="Account responsibilities">
        <p>
          You are solely responsible for maintaining the confidentiality and security of your account credentials. You agree to:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Use a strong, unique password and not share it with anyone.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
          <li>Be responsible for all activities that occur under your account, whether authorized or not.</li>
          <li>Not create more than one account per person (or per company, for employer accounts).</li>
          <li>Not transfer, sell, or assign your account to anyone else.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Acceptable use">
        <p>You agree not to use the Platform to:</p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Post false, misleading, or fraudulent information — including fake skills, experience, or education.</li>
          <li>Impersonate another person or entity, or misrepresent your affiliation.</li>
          <li>Harass, threaten, or discriminate against any other user.</li>
          <li>Scrape, crawl, or otherwise extract data from the Platform using automated means without our written permission.</li>
          <li>Upload viruses, malware, or any other malicious code.</li>
          <li>Attempt to gain unauthorized access to any part of the Platform, another user's account, or our systems.</li>
          <li>Use the Platform for any illegal or unauthorized purpose.</li>
          <li>Circumvent the privacy-by-default protections (e.g., trying to extract contact info before a candidate has applied).</li>
        </ul>
        <p>
          Violations may result in immediate account suspension or termination, and we reserve the right to report illegal activity to the appropriate authorities.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Job seeker accounts">
        <p>
          Job seeker accounts are free. As a job seeker, you agree to:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Provide accurate information about your skills, experience, and education.</li>
          <li>Not misrepresent your proficiency levels or claim skills you do not have.</li>
          <li>Use the platform in good faith to find employment — not to spam employers or waste their time.</li>
          <li>Respond to interview requests in a timely manner (within 5 business days) or withdraw your application if you are no longer interested.</li>
        </ul>
      </LegalSection>

      <LegalSection number={6} title="Employer accounts">
        <p>
          Employer accounts may be subject to subscription fees. As an employer, you agree to:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Post only genuine job openings that you are actively hiring for.</li>
          <li>Provide accurate company information, including company name, location, and hiring contact.</li>
          <li>Respect candidate privacy — do not attempt to contact candidates outside the platform before they have applied or accepted an interview.</li>
          <li>Not discriminate on the basis of race, gender, religion, age, disability, sexual orientation, or any other protected characteristic.</li>
          <li>Pay all applicable subscription fees on time. Failure to pay may result in account suspension.</li>
        </ul>
      </LegalSection>

      <LegalSection number={7} title="AI matching and skill verification">
        <p>
          SkillMatch AI uses explainable artificial intelligence to compute match scores between candidates and jobs. You understand and agree that:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Match scores are recommendations, not guarantees. They do not replace human judgment in hiring decisions.</li>
          <li>The AI relies on the accuracy of the data you provide. Inaccurate data will produce inaccurate matches.</li>
          <li>Skill verification is based on assessments, certificates, and prior employer attestation — not on self-reporting alone.</li>
          <li>We continuously improve the matching algorithm, so scores may change over time even if your profile does not.</li>
        </ul>
      </LegalSection>

      <LegalSection number={8} title="Intellectual property">
        <p>
          You retain all rights to the content you submit to the Platform (resume, profile photo, skills, experience). By submitting content, you grant SkillMatch AI a non-exclusive, royalty-free, worldwide license to use, store, and process that content solely for the purpose of operating and improving the Platform.
        </p>
        <p>
          The Platform itself — including the SkillMatch AI name, logo, design, software, and AI models — is the intellectual property of SkillMatch AI and is protected by copyright, trademark, and other laws. You may not copy, modify, or distribute any part of the Platform without our written permission.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Fees and billing">
        <p>
          Job seeker accounts are free forever. Employer accounts are free for the first job post, with subscription plans starting at $99/month for additional features. All fees are billed in USD and are non-refundable except as required by law. We will notify you at least 30 days before any price increase takes effect.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Termination">
        <p>
          You may delete your account at any time from Settings → Privacy. We may suspend or terminate your account if:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>You violate these Terms of Use.</li>
          <li>Your account has been inactive for 24 months.</li>
          <li>We are required to do so by law.</li>
          <li>We discontinue the Platform or a specific feature (with at least 60 days' notice).</li>
        </ul>
        <p>
          Upon termination, your right to use the Platform ends immediately. We will retain your data for 30 days after termination to allow for recovery, after which it is permanently deleted (subject to our data retention policy).
        </p>
      </LegalSection>

      <LegalSection number={11} title="Disclaimers">
        <p>
          The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>The Platform will be uninterrupted, error-free, or secure.</li>
          <li>Match scores will result in interviews or job offers.</li>
          <li>Employers will respond to your applications, or that candidates will accept your offers.</li>
          <li>Any errors or defects will be corrected.</li>
        </ul>
        <p>
          You use the Platform at your own risk. We are not responsible for the conduct of any user on or off the Platform.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, SkillMatch AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or related to your use of (or inability to use) the Platform. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Governing law">
        <p>
          These Terms are governed by the laws of the Republic of Kenya, without regard to conflict-of-law principles. Any dispute arising from these Terms or your use of the Platform shall be resolved exclusively in the courts of Nairobi, Kenya — except that you may bring a claim in your local jurisdiction if you are a consumer protected by mandatory EU consumer-protection law.
        </p>
      </LegalSection>

      <LegalSection number={14} title="Changes to these terms">
        <p>
          We may update these Terms from time to time. We will notify you by email and via an in-app banner at least 30 days before any material change takes effect. If you continue to use the Platform after the effective date, you are deemed to have accepted the updated Terms.
        </p>
      </LegalSection>

      <LegalSection number={15} title="Contact">
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Email: <strong className="text-foreground">legal@skillmatch.ai</strong></li>
          <li>Postal: SkillMatch AI, PO Box 12345-00100, Nairobi, Kenya</li>
          <li>Or use the in-app contact form on the Contact page.</li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}

// ============================================================
// AUTH (login + register)
// ============================================================
function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { go } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <button onClick={() => go("terms")} className="font-medium text-primary hover:underline">Terms of Service</button>{" "}
            and{" "}
            <button onClick={() => go("privacy")} className="font-medium text-primary hover:underline">Privacy Policy</button>.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function Login() {
  const { go } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Core sign-in logic: pre-check credentials, then call NextAuth
  const doLogin = async (emailVal: string, passwordVal: string) => {
    setError(null);
    setLoading(true);
    try {
      // Step 1: Pre-check credentials via our API (returns clear error messages)
      const checkRes = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, password: passwordVal }),
      });
      const checkData = await checkRes.json();

      if (!checkData.ok) {
        if (checkData.needsVerification) {
          // Account is pending OTP verification — redirect to verify-otp page
          try {
            sessionStorage.setItem("skillmatch.otp-email", checkData.email || emailVal);
          } catch { /* ignore */ }
          setLoading(false);
          go("verify-otp");
          return;
        }
        setError(checkData.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Step 2: Call NextAuth signIn with email + password
      // For admin accounts, NextAuth just validates email+password.
      // The email OTP is handled by the admin 2FA gate after login.
      const res = await nextAuthSignIn("credentials", {
        email: emailVal,
        password: passwordVal,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success — reload so the server-rendered session hydrates.
      // The page.tsx router will redirect to the correct dashboard based on role.
      // Set a flag so the AppShell knows to auto-open the mobile sidebar
      // briefly after the dashboard loads (helps mobile users discover nav).
      try {
        sessionStorage.setItem("skillmatch.justLoggedIn", "1");
      } catch { /* ignore */ }
      setStatus("Success! Redirecting to your dashboard…");
      window.location.assign("/");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    doLogin(email, password);
  };

  // One-click demo login: fills the form AND submits immediately
  const quickLogin = (acc: typeof demoAccounts[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
    setStatus(null);
    doLogin(acc.email, acc.password);
  };

  // Just autofill (for manual review)
  const fillDemo = (acc: typeof demoAccounts[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
    setStatus(null);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your dashboard.">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog open={forgotOpen} onOpenChange={(o) => { setForgotOpen(o); if (!o) { setForgotError(null); setForgotSent(false); setForgotEmail(""); } }}>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{forgotSent ? "Check your email" : "Reset your password"}</DialogTitle>
                      <DialogDescription>
                        {forgotSent
                          ? "We've sent a password reset link to your email. Click the link in the email to set a new password."
                          : "Enter your email and we'll send you a password reset link."}
                      </DialogDescription>
                    </DialogHeader>

                    {forgotSent ? (
                      <div className="flex flex-col items-center py-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Mail className="h-7 w-7" />
                        </div>
                        <p className="mt-3 text-sm font-semibold">Reset link sent!</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Check <span className="font-medium text-foreground">{forgotEmail}</span> for the reset link.
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          In dev mode (no SMTP configured), the reset link is logged to the server console.
                        </p>
                        <Button className="mt-4" variant="outline" size="sm" onClick={() => setForgotOpen(false)}>
                          Close
                        </Button>
                      </div>
                    ) : (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setForgotError(null);
                          if (!forgotEmail.trim()) {
                            setForgotError("Please enter your email.");
                            return;
                          }
                          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
                            setForgotError("Please enter a valid email.");
                            return;
                          }
                          setForgotLoading(true);
                          try {
                            const res = await fetch("/api/auth/forgot-password", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: forgotEmail }),
                            });
                            const data = await res.json();
                            if (data.ok) {
                              setForgotSent(true);
                            } else {
                              setForgotError(data.error ?? "Failed to send reset link.");
                            }
                          } catch {
                            setForgotError("Network error.");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        className="space-y-3"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="forgot-email">Email *</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            autoComplete="email"
                          />
                          {forgotError && <p className="text-xs text-rose-600">{forgotError}</p>}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={forgotLoading} className="btn-blue">
                            {forgotLoading ? "Sending…" : "Send reset link"}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            {status && !error && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                {status}
              </div>
            )}
            <Button type="submit" className="w-full h-10 btn-rainbow" disabled={loading}>
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-9 text-xs"
              onClick={() => toast({ title: "Google sign-in", description: "OAuth provider not configured in this demo. Use a demo account below." })}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="h-9 text-xs"
              onClick={() => toast({ title: "LinkedIn sign-in", description: "OAuth provider not configured in this demo. Use a demo account below." })}
            >
              Continue with LinkedIn
            </Button>
          </div>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            New to SkillMatch AI?{" "}
            <button onClick={() => go("register")} className="font-medium text-primary hover:underline">
              Create an account
            </button>
          </p>
        </CardContent>
      </Card>

      {/* Demo credentials picker — one-click login */}
      <Card className="mt-4 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> One-click demo login
          </CardTitle>
          <CardDescription>
            Click any card to instantly sign in as that role. Password is{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">demo1234</code> for all accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {demoAccounts.map((acc) => (
            <div
              key={acc.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-accent"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: acc.avatarColor }}
              >
                {acc.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{acc.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      acc.role === "seeker" ? "bg-violet-50 text-violet-700 border-violet-200" :
                      acc.role === "employer" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {acc.role}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{acc.blurb}</p>
                <p className="truncate text-[10px] text-muted-foreground font-mono mt-0.5">{acc.email}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                >
                  {loading ? "…" : "Sign in"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px]"
                  onClick={() => fillDemo(acc)}
                >
                  Autofill
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AuthShell>
  );
}

export function Register() {
  const { go } = useApp();
  // Pre-select role from sessionStorage if the user clicked a role-specific CTA
  // (e.g. "Sign up as employer" from the landing page).
  const [role, setRoleChoice] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("registerRole");
      if (stored === "employer" || stored === "seeker") {
        // Clear after consuming so a manual navigation to /register starts clean
        sessionStorage.removeItem("registerRole");
        return stored;
      }
    }
    return "seeker";
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live validation — runs on every keystroke for touched fields
  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "name") {
      const c = validateName(value, role === "employer" ? "Company name" : "Full name");
      if (!c.ok) err = c.error ?? "";
    } else if (field === "email") {
      const c = validateEmail(value);
      if (!c.ok) err = c.error ?? "";
    } else if (field === "phone") {
      const c = validateEthiopianPhone(value);
      if (!c.ok) err = c.error ?? "";
    } else if (field === "password") {
      const c = validatePassword(value);
      if (!c.ok) err = c.error ?? "";
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleNameChange = (value: string) => {
    // For seeker accounts, enforce letters-only by stripping numbers/special chars live
    // For employer accounts (company names), allow letters + common business punctuation
    const cleaned = role === "seeker"
      ? value.replace(/[^\p{L}\p{M}\s'.-]/gu, "")
      : value.replace(/[^\p{L}\p{M}\p{N}\s'.\-&,.()]/gu, "");
    setName(cleaned);
    if (touched.name) validateField("name", cleaned);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) validateField("email", value);
  };

  const handlePhoneChange = (value: string) => {
    // Sanitize: keep only digits and + at the start
    const cleaned = sanitizePhone(value);
    setPhone(cleaned);
    if (touched.phone) validateField("phone", cleaned);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) validateField("password", value);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all fields as touched so errors show
    setTouched({ name: true, email: true, phone: true, password: true, terms: true });

    // Full validation
    const next: Record<string, string> = {};
    const nameCheck = validateName(name, role === "employer" ? "Company name" : "Full name");
    if (!nameCheck.ok) next.name = nameCheck.error!;
    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) next.email = emailCheck.error!;
    const phoneCheck = validateEthiopianPhone(phone);
    if (!phoneCheck.ok) next.phone = phoneCheck.error!;
    const passCheck = validatePassword(password);
    if (!passCheck.ok) next.password = passCheck.error!;
    if (!agree) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone, password, role }),
      });
      const data = await res.json();
      if (!data.ok) {
        setServerError(data.error ?? "Registration failed.");
        return;
      }
      // Account created — redirect to OTP verification page
      // Pass email + devOtp (dev mode only) via sessionStorage
      try {
        sessionStorage.setItem("skillmatch.otp-email", data.email || email.trim());
        if (data.devOtp) {
          sessionStorage.setItem("skillmatch.otp-dev", data.devOtp);
        }
      } catch { /* ignore */ }
      setSuccessMsg("Account created! A verification code has been sent to your email and phone. Redirecting to verification…");
      setTimeout(() => go("verify-otp"), 1500);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start matching in minutes. Free for job seekers.">
      <Card>
        <CardContent className="p-6">
          {/* Role switch */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRoleChoice("seeker")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                role === "seeker"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-accent"
              )}
            >
              <Users className="h-4 w-4 text-primary" />
              <p className="mt-1.5 text-sm font-semibold">I'm looking for work</p>
              <p className="text-xs text-muted-foreground">Job seeker account</p>
            </button>
            <button
              type="button"
              onClick={() => setRoleChoice("employer")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                role === "employer"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-accent"
              )}
            >
              <Building2 className="h-4 w-4 text-primary" />
              <p className="mt-1.5 text-sm font-semibold">I'm hiring</p>
              <p className="text-xs text-muted-foreground">Employer account</p>
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{role === "employer" ? "Company name" : "Full name"}</Label>
              <Input
                id="name"
                placeholder={role === "employer" ? "Acme Inc." : "Amara Okafor"}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => { setTouched((t) => ({ ...t, name: true })); validateField("name", name); }}
                className={cn(errors.name && "border-rose-400 focus-visible:ring-rose-200")}
                autoComplete="name"
              />
              {errors.name ? (
                <p className="text-xs text-rose-600">{errors.name}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  {role === "seeker" ? "Letters only — numbers and special characters are not allowed." : "Company name with letters and basic punctuation."}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => { setTouched((t) => ({ ...t, email: true })); validateField("email", email); }}
                className={cn(errors.email && "border-rose-400 focus-visible:ring-rose-200")}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Ethiopian phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => { setTouched((t) => ({ ...t, phone: true })); validateField("phone", phone); }}
                  className={cn("pl-9", errors.phone && "border-rose-400 focus-visible:ring-rose-200")}
                  autoComplete="tel"
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-rose-600">{errors.phone}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Ethiopian format: 09XXXXXXXX or +2519XXXXXXXX (digits must match Ethiopian phone numbers)
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => { setTouched((t) => ({ ...t, password: true })); validateField("password", password); }}
                className={cn(errors.password && "border-rose-400 focus-visible:ring-rose-200")}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the{" "}
                <button type="button" onClick={() => go("terms")} className="font-medium text-primary hover:underline">Terms of Service</button>,{" "}
                <button type="button" onClick={() => go("privacy")} className="font-medium text-primary hover:underline">Privacy Policy</button>, and the candidate-privacy commitment that protects contact information until I apply or accept an interview.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-rose-600">{errors.terms}</p>}
            {serverError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {serverError}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {successMsg}
              </div>
            )}
            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account…
                </>
              ) : (
                <>Create {role === "employer" ? "employer" : "job seeker"} account</>
              )}
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => go("login")} className="font-medium text-primary hover:underline">
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

// ============================================================
// PUBLIC JOB LISTINGS
// ============================================================
function JobCard({ job, onOpen }: { job: Job; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group block w-full rounded-xl border border-border bg-card p-4 text-left shadow-card-soft transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <CompanyLogo initials={job.companyLogo || job.company.slice(0, 2).toUpperCase()} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight group-hover:text-primary">{job.title}</p>
          <p className="text-xs text-muted-foreground">{job.company}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.postedAt)}</span>
          </div>
        </div>
        {job.matchScore && <MatchScore score={job.matchScore} size="sm" showLabel={false} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => (
          <SkillChip key={s.id} name={s.name} proficiency={s.proficiency} mandatory={s.mandatory} size="sm" />
        ))}
        {job.skills.length > 4 && (
          <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>
    </button>
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

export function PublicJobs() {
  const { go } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [remote, setRemote] = useState("all");

  const categories = Array.from(new Set(publicJobs.map((j) => j.category)));
  const filtered = publicJobs.filter((j) => {
    if (category !== "all" && j.category !== category) return false;
    if (remote !== "all" && j.remote !== remote) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse open jobs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {publicJobs.length} live roles across {categories.length} categories. Sign in to see your personalized match score.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, company, or skill"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={remote} onValueChange={setRemote}>
              <SelectTrigger>
                <SelectValue placeholder="Workplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workplaces</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} result{filtered.length !== 1 && "s"}</span>
            <span className="flex items-center gap-1"><Filter className="h-3 w-3" /> Sorted by recency</span>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} onOpen={() => go("public-job-detail", { jobId: j.id })} />
            ))}
          </div>

          {filtered.length === 0 && (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No jobs match your filters"
              description="Try clearing some filters or searching with a broader term."
            />
          )}

          <div className="mt-10 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-sm font-semibold">Want to see your match score?</p>
            <p className="mt-1 text-xs text-muted-foreground">Sign in and complete your skill profile to get personalized 0–100% match scores.</p>
            <Button className="mt-3" size="sm" onClick={() => go("login")}>
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// PUBLIC JOB DETAIL
// ============================================================
export function PublicJobDetail() {
  const { go, selectedJobId } = useApp();
  const job = publicJobs.find((j) => j.id === selectedJobId) || recommendedJobs.find((j) => j.id === selectedJobId) || recommendedJobs[0];

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => go("public-jobs")}
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to jobs
          </button>

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
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Posted {timeAgo(job.postedAt)}</span>
                  </div>
                </div>
                <Button className="btn-rainbow" onClick={() => go("login")}>
                  Apply now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                  {job.category}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                  {job.remote}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  ${job.salary.min.toLocaleString()}–${job.salary.max.toLocaleString()} / {job.salary.period}
                </Badge>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold">About the role</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">What you'll do</h2>
                    <ul className="mt-2 space-y-1.5">
                      {job.responsibilities.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">What we're looking for</h2>
                    <ul className="mt-2 space-y-1.5">
                      {job.requirements.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Required skills</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.skills.map((s) => (
                        <SkillChip
                          key={s.id}
                          name={s.name}
                          proficiency={s.proficiency}
                          mandatory={s.mandatory}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <aside className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Job activity</p>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applicants</span>
                        <span className="font-semibold">{job.applicants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Views</span>
                        <span className="font-semibold">{job.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted</span>
                        <span className="font-semibold">{timeAgo(job.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <InfoCallout>
                    <span className="font-medium">See your match score.</span> Sign in to view how your skills align with this role and get a personalized recommendation.
                  </InfoCallout>
                  <Button className="w-full btn-blue" onClick={() => go("login")}>
                    Sign in to apply
                  </Button>
                </aside>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// ABOUT PAGE
// ============================================================
export function AboutPage() {
  const { go } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero-glow border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 text-center">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mb-4">
              About SkillMatch AI
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="text-gradient-primary">Skill-based hiring</span> for the African talent market.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              We're building the most transparent, skill-first employment platform on the continent.
              No keyword spam. No résumé black holes. Just verifiable skills matched to real opportunities.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Our mission</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Make hiring about evidence, not keywords.</h2>
                <p className="mt-4 text-muted-foreground">
                  Traditional job boards treat candidates as a list of keywords and employers as a filter funnel.
                  That's broken. It wastes everyone's time and locks talented people out of roles they'd thrive in.
                </p>
                <p className="mt-3 text-muted-foreground">
                  SkillMatch AI flips the model. We build a structured skill graph for every candidate,
                  verify it through assessments and prior employer attestation, then use an explainable
                  AI to match candidates to jobs based on what they can actually do — not who they know
                  or how well they game applicant tracking systems.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { stat: "4,872", label: "Active job seekers" },
                  { stat: "958", label: "Hiring employers" },
                  { stat: "1,247", label: "Open roles" },
                  { stat: "6,124", label: "Verified skills" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
                    <p className="text-3xl font-bold tracking-tight text-primary">{s.stat}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-b border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight">What we stand for</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <ShieldCheck className="h-5 w-5" />, title: "Verified skills", desc: "Every skill is backed by an assessment, certificate, or employer attestation — never self-reported alone." },
                { icon: <Sparkles className="h-5 w-5" />, title: "Explainable AI", desc: "Every match score is broken into understandable factors. No black boxes, no opaque rejections." },
                { icon: <Lock className="h-5 w-5" />, title: "Privacy by default", desc: "Employers can't see your contact info until you apply or accept an interview. You're always in control." },
                { icon: <TrendingUp className="h-5 w-5" />, title: "Skill growth", desc: "We show you exactly which skills separate you from your target roles — and where to learn them." },
              ].map((v) => (
                <div key={v.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {v.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight">How the matching works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Our AI computes a 0–100% match score for every job application, broken down into six weighted factors.
            </p>
            <div className="mt-10 space-y-4">
              {[
                { label: "Skill match", weight: "25%", desc: "Overall overlap between your skills and the job's required + preferred skill set." },
                { label: "Required skill match", weight: "30%", desc: "Coverage of mandatory skills the employer explicitly requires." },
                { label: "Proficiency match", weight: "15%", desc: "How closely your proficiency level meets the requested level on each matched skill." },
                { label: "Experience match", weight: "15%", desc: "Years and seniority of relevant experience against the role's expectations." },
                { label: "Education match", weight: "10%", desc: "Whether your highest verified education meets the role's stated threshold." },
                { label: "Verified skills", weight: "5%", desc: "Share of matched skills that have been independently verified." },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {f.weight}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to be matched?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join thousands of job seekers and employers using SkillMatch AI across Africa.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => go("register")}>Sign up as job seeker</Button>
              <Button size="lg" variant="outline" onClick={() => go("register")}>Sign up as employer</Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// CONTACT PAGE
// ============================================================
export function ContactPage() {
  const { go } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.subject.trim()) next.subject = "Please enter a subject.";
    if (!form.message.trim()) next.message = "Please enter a message.";
    else if (form.message.trim().length < 10) next.message = "Message must be at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mb-4">
              Contact us
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Questions, feedback, or partnership ideas? We'd love to hear from you.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* Contact info */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Email</h3>
                <p className="mt-1 text-xs text-muted-foreground">For general inquiries</p>
                <a href="mailto:hello@skillmatch.ai" className="mt-2 block text-sm font-medium text-primary hover:underline">
                  hello@skillmatch.ai
                </a>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Employers</h3>
                <p className="mt-1 text-xs text-muted-foreground">For hiring & partnerships</p>
                <a href="mailto:employers@skillmatch.ai" className="mt-2 block text-sm font-medium text-primary hover:underline">
                  employers@skillmatch.ai
                </a>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">Office</h3>
                <p className="mt-1 text-xs text-muted-foreground">Nairobi, Kenya</p>
                <p className="mt-2 text-sm text-muted-foreground">Remote-first, operating across 14 African markets</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {submitted ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">Message sent!</h3>
                      <p className="mt-1 text-sm text-muted-foreground">We'll get back to you within 1–2 business days.</p>
                      <Button className="mt-5" size="sm" onClick={() => setSubmitted(false)}>Send another message</Button>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="c-name">Name *</Label>
                          <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="c-email">Email *</Label>
                          <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                          {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="c-subject">Subject *</Label>
                        <Input id="c-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
                        {errors.subject && <p className="text-xs text-rose-600">{errors.subject}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="c-message">Message *</Label>
                        <Textarea id="c-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more…" className="resize-none" />
                        {errors.message && <p className="text-xs text-rose-600">{errors.message}</p>}
                      </div>
                      <Button type="submit" className="w-full h-10">Send message</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// PUBLIC NEWS PAGE — list of published news articles
// ============================================================
interface PublicNewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  imageUrl: string | null;
  attachments?: { fileName: string; fileData: string; mimeType: string }[];
  status: string;
  pinned: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  authorInitials: string;
  authorColor: string;
}

const NEWS_CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Update:        { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200" },
  Announcement:  { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200" },
  Event:         { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200" },
  Release:       { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200" },
  Maintenance:   { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-200" },
};

function newsCategoryStyle(category: string) {
  return NEWS_CATEGORY_STYLE[category] ?? { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
}

function formatNewsDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function timeAgoNews(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatNewsDate(iso);
}

function NewsHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero-glow">
      <div className="absolute inset-0 bg-grid-subtle opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          <Newspaper className="mr-1 h-3 w-3" /> News & Announcements
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-primary">Latest updates</span> from SkillMatch AI
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Product releases, platform announcements, upcoming events, and important maintenance
          notices — all in one place.
        </p>
      </div>
    </section>
  );
}

function NewsListCard({ item, onOpen }: { item: PublicNewsItem; onOpen: () => void }) {
  const style = newsCategoryStyle(item.category);
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-card-soft"
    >
      {item.imageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.pinned && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500">
          <div className="absolute inset-0 bg-grid-subtle opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper className="h-12 w-12 text-white/80" />
          </div>
          {item.pinned && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
              <Pin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className={cn(style.bg, style.text, style.border)}>
            <Tag className="mr-1 h-2.5 w-2.5" /> {item.category}
          </Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" /> {formatNewsDate(item.publishedAt)}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {item.excerpt || item.content.slice(0, 140) + "…"}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ background: item.authorColor }}
          >
            {item.authorInitials}
          </span>
          <span>{item.author}</span>
          <span className="ml-auto flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Read more <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

export function PublicNewsPage() {
  const { go, selectedNewsId } = useApp();
  const [news, setNews] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Load published news from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/news?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setNews(data.news);
          setError(null);
        } else {
          setError(data.error || "Failed to load news.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Network error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If we have a selectedNewsId, render the detail page instead
  if (selectedNewsId) {
    return <PublicNewsDetailPage newsId={selectedNewsId} />;
  }

  const categories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
  const filtered = activeCategory === "All" ? news : news.filter((n) => n.category === activeCategory);
  const pinned = filtered.filter((n) => n.pinned);
  const regular = filtered.filter((n) => !n.pinned);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        <NewsHero />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Category filter pills */}
          {!loading && !error && news.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading news…</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
              <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetch("/api/news?limit=50")
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.ok) setNews(data.news);
                      else setError(data.error || "Failed to load news.");
                    })
                    .catch(() => setError("Network error. Please try again."))
                    .finally(() => setLoading(false));
                }}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && news.length === 0 && (
            <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Newspaper className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No news yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon for the latest platform updates, announcements, and events.
              </p>
            </div>
          )}

          {/* Pinned section */}
          {!loading && !error && pinned.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Pin className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pinned</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((item) => (
                  <NewsListCard
                    key={item.id}
                    item={item}
                    onOpen={() => go("public-news-detail", { newsId: item.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular news grid */}
          {!loading && !error && regular.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent updates</h2>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((item) => (
                  <NewsListCard
                    key={item.id}
                    item={item}
                    onOpen={() => go("public-news-detail", { newsId: item.id })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// PUBLIC NEWS DETAIL PAGE — single article view
// ============================================================
export function PublicNewsDetailPage({ newsId }: { newsId: string }) {
  const { go } = useApp();
  const [item, setItem] = useState<PublicNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/news/${newsId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setItem(data.news);
          setError(null);
        } else {
          setError(data.error || "News article not found.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Network error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [newsId]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => go("public-news", { newsId: undefined })}
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to news
          </button>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading article…</p>
            </div>
          )}

          {error && !loading && (
            <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
              <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => go("public-news", { newsId: undefined })}>
                Back to news
              </Button>
            </div>
          )}

          {item && !loading && !error && (
            <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
              {item.imageUrl ? (
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  {item.pinned && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                      <Pin className="h-2.5 w-2.5" /> Pinned
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500">
                  <div className="absolute inset-0 bg-grid-subtle opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Newspaper className="h-16 w-16 text-white/80" />
                  </div>
                  {item.pinned && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                      <Pin className="h-2.5 w-2.5" /> Pinned
                    </span>
                  )}
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <Badge variant="outline" className={cn(newsCategoryStyle(item.category).bg, newsCategoryStyle(item.category).text, newsCategoryStyle(item.category).border)}>
                    <Tag className="mr-1 h-2.5 w-2.5" /> {item.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatNewsDate(item.publishedAt)} · {timeAgoNews(item.publishedAt)}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  {item.title}
                </h1>

                <div className="mt-4 flex items-center gap-3 border-y border-border py-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: item.authorColor }}
                  >
                    {item.authorInitials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.author}</p>
                    <p className="text-xs text-muted-foreground">Published on {formatNewsDate(item.publishedAt)}</p>
                  </div>
                </div>

                {item.excerpt && (
                  <p className="mt-6 text-base font-medium text-foreground/90">{item.excerpt}</p>
                )}

                <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
                  {item.content}
                </div>

                {/* Attachments (PDF/DOC files) */}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachments</p>
                    <div className="space-y-2">
                      {item.attachments.map((att: any, i: number) => (
                        <a
                          key={i}
                          href={att.fileData}
                          download={att.fileName}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{att.fileName}</p>
                            <p className="text-[11px] text-muted-foreground">{att.mimeType} — click to download</p>
                          </div>
                          <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA: Apply / Sign in */}
                <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
                  <h3 className="text-base font-semibold">Ready to apply for jobs?</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Sign in or create an account to browse open positions and submit your application.</p>
                  <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                    <Button size="sm" className="btn-rainbow" onClick={() => go("login")}>
                      Apply Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => go("register")}>
                      Create account
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                  <Button variant="outline" size="sm" onClick={() => go("public-news", { newsId: undefined })}>
                    <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All news
                  </Button>
                  <span className="text-xs text-muted-foreground">Last updated {formatNewsDate(item.updatedAt)}</span>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// VERIFY EMAIL PAGE — accessed via the verification link in the email
// ============================================================
export function VerifyEmailPage() {
  const { go } = useApp();
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "already">("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Missing token or email.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          if (data.alreadyVerified) {
            setStatus("already");
            setMessage("Your email is already verified. You can log in.");
          } else {
            setStatus("success");
            setMessage(data.message || "Email verified successfully!");
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {status === "verifying" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Verifying your email…</h2>
                <p className="mt-1 text-sm text-muted-foreground">Please wait a moment.</p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-emerald-700">Email Verified!</h2>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                <Button className="mt-5 btn-green" onClick={() => go("login")}>
                  Sign in to your account
                </Button>
              </>
            )}
            {status === "already" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Already Verified</h2>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                <Button className="mt-5" onClick={() => go("login")}>
                  Sign in
                </Button>
              </>
            )}
            {status === "error" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                  <AlertCircle className="h-7 w-7 text-rose-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-rose-700">Verification Failed</h2>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                <Button className="mt-5" variant="outline" onClick={() => go("login")}>
                  Back to login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// RESET PASSWORD PAGE — accessed via the reset link in the email
// ============================================================
export function ResetPasswordPage() {
  const { go } = useApp();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
    setEmail(params.get("email"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token || !email) {
      setError("Invalid reset link. Missing token or email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-emerald-700">Password Reset!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your password has been changed successfully. You can now sign in with your new password.</p>
                <Button className="mt-5 btn-green" onClick={() => go("login")}>
                  Sign in
                </Button>
              </div>
            ) : !token || !email ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                  <AlertCircle className="h-7 w-7 text-rose-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-rose-700">Invalid Reset Link</h2>
                <p className="mt-1 text-sm text-muted-foreground">This password reset link is invalid or incomplete.</p>
                <Button className="mt-5" variant="outline" onClick={() => go("login")}>
                  Back to login
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-center">Set a New Password</h2>
                <p className="mt-1 text-sm text-muted-foreground text-center">Enter your new password below.</p>
                <form onSubmit={submit} className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-password">New password *</Label>
                    <Input
                      id="reset-password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-confirm">Confirm new password *</Label>
                    <Input
                      id="reset-confirm"
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-10 btn-green" disabled={loading}>
                    {loading ? (
                      <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Resetting…</>
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}

// ============================================================
// VERIFY OTP PAGE — enter the 6-digit code sent to email + phone
// ============================================================
export function VerifyOtpPage() {
  const { go } = useApp();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  // Countdown timer: 10 minutes = 600 seconds
  const [timeLeft, setTimeLeft] = useState(600);
  const [codeExpired, setCodeExpired] = useState(false);

  useEffect(() => {
    try {
      const storedEmail = sessionStorage.getItem("skillmatch.otp-email");
      if (storedEmail) setEmail(storedEmail);
      const storedDevOtp = sessionStorage.getItem("skillmatch.otp-dev");
      if (storedDevOtp) setDevOtp(storedDevOtp);
    } catch { /* ignore */ }
  }, []);

  // Resend cooldown timer (60 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // OTP expiry countdown timer (10 minutes = 600 seconds)
  useEffect(() => {
    if (timeLeft <= 0) {
      setCodeExpired(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (codeExpired) {
      setError("The verification code has expired. Please request a new code.");
      return;
    }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!/^\d{6}$/.test(otpCode)) { setError("Please enter the 6-digit verification code."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otpCode }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        try { sessionStorage.removeItem("skillmatch.otp-email"); sessionStorage.removeItem("skillmatch.otp-dev"); } catch { /* ignore */ }
      } else {
        setError(data.error ?? "Verification failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0 || !email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setResendCooldown(60);
        setTimeLeft(600); // Reset the 10-minute countdown
        setCodeExpired(false);
        setOtpCode(""); // Clear the old code
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setError(data.error ?? "Failed to resend code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onAuth={(r) => go(r)} />
      <main className="flex flex-1 items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-emerald-700">Account Verified!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your email has been verified successfully. You can now sign in to your account.</p>
                <Button className="mt-5 btn-green" onClick={() => go("login")}>Sign in now</Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">Verify Your Email</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A 6-digit verification code has been sent to your email{email ? <span className="font-medium text-foreground"> {email}</span> : null}.
                  </p>
                </div>

                {/* Countdown Timer */}
                {!codeExpired ? (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Code expires in <span className="font-bold text-blue-800 tabular-nums">{formatTime(timeLeft)}</span>
                    </span>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span className="text-sm font-medium text-rose-700">Code has expired — please request a new one</span>
                  </div>
                )}

                {devOtp && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Dev Mode — Your Code</p>
                    <p className="mt-1 text-2xl font-bold text-blue-800 tracking-widest">{devOtp}</p>
                    <p className="mt-1 text-[11px] text-blue-600">(No email configured — code displayed here for testing)</p>
                  </div>
                )}
                <form onSubmit={verify} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-email">Email</Label>
                    <Input id="otp-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code">Verification Code (6 digits)</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={cn("text-center text-2xl tracking-widest font-bold", codeExpired && "border-rose-400")}
                      autoComplete="one-time-code"
                      disabled={codeExpired}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10 btn-blue"
                    disabled={loading || otpCode.length !== 6 || codeExpired}
                  >
                    {loading ? (
                      <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Verifying…</>
                    ) : codeExpired ? (
                      "Code expired — resend to continue"
                    ) : (
                      "Verify Account"
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={resend}
                    disabled={resendCooldown > 0 || loading}
                    className={cn(
                      "text-xs hover:underline disabled:no-underline",
                      codeExpired ? "text-rose-600 font-semibold" : "text-primary",
                      "disabled:text-muted-foreground"
                    )}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : codeExpired
                      ? "→ Resend new code now ←"
                      : "Didn't receive a code? Resend"}
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button type="button" onClick={() => go("login")} className="text-xs text-muted-foreground hover:underline">Back to login</button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}
