"use client";

import React, { useState, useEffect } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
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
  Sparkles,
  Target,
  ShieldCheck,
  BarChart3,
  Zap,
  FileText,
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
} from "lucide-react";

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
    { label: "Browse jobs", view: "public-jobs" as const },
    { label: "How it works", view: "landing" as const },
    { label: "For employers", view: "landing" as const },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Hamburger toggle (mobile only) */}
          <HamburgerToggle
            open={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
          />

          <button onClick={() => go("landing")} className="flex items-center">
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
            <Button size="sm" onClick={() => onAuth("register")}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down nav panel */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav
        aria-label="Mobile public navigation"
        className={cn(
          "fixed inset-x-0 top-16 z-30 border-b border-border bg-background shadow-lg transition-transform duration-300 ease-in-out md:hidden",
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
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("public-jobs")}>Browse jobs</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>How it works</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>AI matching</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For employers</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>Post a job</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>Pricing</button></li>
              <li><button className="text-muted-foreground hover:text-foreground" onClick={() => go("landing")}>Talent search</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button className="text-muted-foreground hover:text-foreground">About</button></li>
              <li><button className="text-muted-foreground hover:text-foreground">Privacy</button></li>
              <li><button className="text-muted-foreground hover:text-foreground">Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © 2026 SkillMatch AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// LANDING
// ============================================================
function LandingHero() {
  const { go, setRole } = useApp();
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
            <Button size="lg" className="h-12 px-6" onClick={() => setRole("seeker")}>
              Find jobs <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => setRole("employer")}>
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
  const { setRole } = useApp();
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
              onClick={() => setRole("seeker")}
            >
              Sign up as job seeker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setRole("employer")}
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
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function Login() {
  const { go } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Core sign-in logic: pre-check credentials, then call NextAuth
  const doLogin = async (emailVal: string, passwordVal: string, totpVal?: string) => {
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
        setError(checkData.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Step 2: If 2FA is needed and no TOTP provided, show the 2FA field
      if (checkData.needs2FA && !totpVal) {
        setShow2FA(true);
        setStatus("Enter your 6-digit authenticator code to continue.");
        setLoading(false);
        return;
      }

      // Step 3: Call NextAuth signIn with email + password + (optional) TOTP
      const res = await nextAuthSignIn("credentials", {
        email: emailVal,
        password: passwordVal,
        totp: totpVal || undefined,
        redirect: false,
      });

      if (!res || res.error) {
        // NextAuth returns "CredentialsSignin" for any authorize failure.
        // The specific error (wrong TOTP, etc.) was already caught by our
        // pre-check, so if we get here with an error it's likely a bad TOTP.
        if (checkData.needs2FA) {
          setError("Invalid 2FA code. Please try again.");
          setShow2FA(true);
        } else {
          setError("Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success — reload so the server-rendered session hydrates.
      // The page.tsx router will redirect to the correct dashboard based on role.
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
    doLogin(email, password, totp || undefined);
  };

  // One-click demo login: fills the form AND submits immediately
  const quickLogin = (acc: typeof demoAccounts[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setTotp("");
    setShow2FA(false);
    setError(null);
    setStatus(null);
    doLogin(acc.email, acc.password);
  };

  // Just autofill (for manual review)
  const fillDemo = (acc: typeof demoAccounts[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setTotp("");
    setShow2FA(false);
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
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
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
            {show2FA && (
              <div className="space-y-1.5 rounded-md border border-amber-200 bg-amber-50 p-3">
                <Label htmlFor="totp" className="text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 2FA code (from authenticator app)
                </Label>
                <Input
                  id="totp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="••••••"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoComplete="one-time-code"
                />
                <p className="text-[11px] text-amber-700">
                  The live TOTP code is shown on the next screen after you verify. For the demo admin, the code updates every 30 seconds.
                </p>
              </div>
            )}
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
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in…
                </>
              ) : show2FA ? (
                "Verify & sign in"
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
            <Button variant="outline" className="h-9 text-xs">
              Continue with Google
            </Button>
            <Button variant="outline" className="h-9 text-xs">
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
                  {acc.role === "admin" && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" /> 2FA
                    </Badge>
                  )}
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
  const [role, setRoleChoice] = useState<Role>("seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Please enter a valid email.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!agree) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json();
      if (!data.ok) {
        setServerError(data.error ?? "Registration failed.");
        return;
      }
      // Auto sign-in via NextAuth
      const signInRes = await nextAuthSignIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (!signInRes || signInRes.error) {
        // Account created but sign-in failed — go to login
        go("login");
        return;
      }
      window.location.assign("/");
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
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the Terms of Service, Privacy Policy, and the candidate-privacy commitment that protects contact information until I apply or accept an interview.
              </label>
            </div>
            {errors.terms && <p className="text-xs text-rose-600">{errors.terms}</p>}
            {serverError && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {serverError}
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
  const { go, selectedJobId, setRole } = useApp();
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
                <Button onClick={() => setRole("seeker")}>
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
                  <Button className="w-full" onClick={() => setRole("seeker")}>
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
