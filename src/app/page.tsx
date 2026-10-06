"use client";

import React from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { TooltipProvider } from "@/components/shared/ui";
import { AppShell } from "@/components/chrome/app-shell";
// Guest views
import {
  Landing,
  Login,
  Register,
  PublicJobs,
  PublicJobDetail,
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
} from "@/components/admin/views";

function Router() {
  const { role, view } = useApp();

  // Guest
  if (role === "guest") {
    if (view === "login") return <Login />;
    if (view === "register") return <Register />;
    if (view === "public-jobs") return <PublicJobs />;
    if (view === "public-job-detail") return <PublicJobDetail />;
    return <Landing />;
  }

  // Authenticated views share the AppShell
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
      default: content = <AdminDashboard />;
    }
  }

  return <AppShell>{content}</AppShell>;
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
