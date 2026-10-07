"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { AppProvider, useApp } from "@/lib/app-context";
import { TooltipProvider } from "@/components/shared/ui";
import { AppShell } from "@/components/chrome/app-shell";
import { Admin2FAGate } from "@/components/chrome/admin-gate";
import { PageTransition } from "@/components/chrome/page-transition";
// Guest views
import {
  Landing,
  Login,
  Register,
  PublicJobs,
  PublicJobDetail,
  AboutPage,
  ContactPage,
} from "@/components/guest/views";
// Seeker views
import {
  SeekerDashboard,
  SeekerProfile,
  SeekerSkills,
  SeekerResume,
  SeekerResumeAnalysis,
  SeekerRecommended,
  SeekerJobDetail,
  SeekerMatchExplanation,
  SeekerApplications,
  SeekerSkillGap,
  SeekerNotifications,
  SeekerMessages,
} from "@/components/seeker/views";
// Employer views
import {
  EmployerDashboard,
  EmployerCompanyProfile,
  EmployerJobs,
  EmployerJobEdit,
  EmployerCandidates,
  EmployerCandidateDetail,
  EmployerApplications,
  EmployerInterviews,
  EmployerMessages,
  EmployerNotifications,
} from "@/components/employer/views";
// Admin views
import {
  AdminDashboard,
  AdminUsers,
  AdminSkills,
  AdminSkillOntology,
  AdminJobs,
  AdminReports,
  AdminActivity,
  AdminConfig,
  AdminMonitoring,
  AdminAIAnalytics,
  AdminSecurity,
} from "@/components/admin/views";

function Router() {
  const { data: session, status } = useSession();
  const { role, view, user, isAdminUnlocked, lockAdmin, go } = useApp();

  // ---------- ADMIN AUTO-LOCK AFTER 30 MIN INACTIVITY ----------
  useEffect(() => {
    if (role !== "admin" || !isAdminUnlocked) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lockAdmin();
      }, 30 * 60 * 1000); // 30 minutes
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [role, isAdminUnlocked, lockAdmin]);

  // ---------- LOADING STATE ----------
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // ---------- GUEST ROUTING ----------
  if (status === "unauthenticated" || !session?.user) {
    if (view === "login") return <Login />;
    if (view === "register") return <Register />;
    if (view === "public-jobs") return <PublicJobs />;
    if (view === "public-job-detail") return <PublicJobDetail />;
    if (view === "about") return <AboutPage />;
    if (view === "contact") return <ContactPage />;
    return <Landing />;
  }

  // ---------- ADMIN 2FA GATE ----------
  // Show the 2FA gate if the user is an admin and hasn't unlocked the session yet.
  // NextAuth has already validated the password+TOTP at login, but we keep a
  // soft client-side gate that re-locks after 30 min of inactivity without
  // forcing a full re-login.
  if (role === "admin" && !isAdminUnlocked) {
    return <Admin2FAGate />;
  }

  // ---------- AUTHENTICATED VIEWS ----------
  let content: React.ReactNode = null;
  if (role === "seeker") {
    switch (view) {
      case "dashboard": content = <SeekerDashboard />; break;
      case "profile": content = <SeekerProfile />; break;
      case "skills": content = <SeekerSkills />; break;
      case "resume": content = <SeekerResume />; break;
      case "resume-analysis": content = <SeekerResumeAnalysis />; break;
      case "recommended": content = <SeekerRecommended />; break;
      case "job-detail": content = <SeekerJobDetail />; break;
      case "match-explanation": content = <SeekerMatchExplanation />; break;
      case "applications": content = <SeekerApplications />; break;
      case "skill-gap": content = <SeekerSkillGap />; break;
      case "notifications": content = <SeekerNotifications />; break;
      case "messages": content = <SeekerMessages />; break;
      default: content = <SeekerDashboard />;
    }
  } else if (role === "employer") {
    switch (view) {
      case "dashboard": content = <EmployerDashboard />; break;
      case "company-profile": content = <EmployerCompanyProfile />; break;
      case "jobs": content = <EmployerJobs />; break;
      case "job-edit": content = <EmployerJobEdit />; break;
      case "candidates": content = <EmployerCandidates />; break;
      case "candidate-detail": content = <EmployerCandidateDetail />; break;
      case "applications": content = <EmployerApplications />; break;
      case "interviews": content = <EmployerInterviews />; break;
      case "messages": content = <EmployerMessages />; break;
      case "notifications": content = <EmployerNotifications />; break;
      default: content = <EmployerDashboard />;
    }
  } else if (role === "admin") {
    switch (view) {
      case "dashboard": content = <AdminDashboard />; break;
      case "users": content = <AdminUsers />; break;
      case "skills": content = <AdminSkills />; break;
      case "skill-ontology": content = <AdminSkillOntology />; break;
      case "jobs": content = <AdminJobs />; break;
      case "reports": content = <AdminReports />; break;
      case "activity": content = <AdminActivity />; break;
      case "config": content = <AdminConfig />; break;
      case "monitoring": content = <AdminMonitoring />; break;
      case "ai-analytics": content = <AdminAIAnalytics />; break;
      case "security": content = <AdminSecurity />; break;
      default: content = <AdminDashboard />;
    }
  }

  return (
    <AppShell>
      <PageTransition>{content}</PageTransition>
    </AppShell>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={200}>
        <Router />
      </TooltipProvider>
    </AppProvider>
  );
}
