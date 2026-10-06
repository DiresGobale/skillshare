"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { Role } from "./types";

// All navigable views keyed by role
export type GuestView = "landing" | "login" | "register" | "public-jobs" | "public-job-detail";
export type SeekerView =
  | "dashboard"
  | "profile"
  | "skills"
  | "resume"
  | "resume-analysis"
  | "recommended"
  | "job-detail"
  | "match-explanation"
  | "applications"
  | "skill-gap"
  | "notifications"
  | "messages";
export type EmployerView =
  | "dashboard"
  | "company-profile"
  | "jobs"
  | "job-edit"
  | "candidates"
  | "candidate-detail"
  | "applications"
  | "interviews"
  | "messages"
  | "notifications";
export type AdminView =
  | "dashboard"
  | "users"
  | "skills"
  | "skill-ontology"
  | "jobs"
  | "reports"
  | "activity"
  | "config";

export type View = GuestView | SeekerView | EmployerView | AdminView;

interface AppState {
  role: Role;
  view: View;
  selectedJobId?: string;
  selectedCandidateId?: string;
  selectedConversationId?: string;
  // Auth banner shown above the working area (used for confirmations etc.)
  setRole: (r: Role) => void;
  setView: (v: View) => void;
  go: (v: View, opts?: { jobId?: string; candidateId?: string; conversationId?: string }) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("guest");
  const [view, setView] = useState<View>("landing");
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  const setRoleAndDefault: (r: Role) => void = useCallback((r) => {
    setRole(r);
    if (r === "guest") setView("landing");
    if (r === "seeker") setView("dashboard");
    if (r === "employer") setView("dashboard");
    if (r === "admin") setView("dashboard");
  }, []);

  const go = useCallback<AppState["go"]>((v, opts) => {
    if (opts?.jobId !== undefined) setSelectedJobId(opts.jobId);
    if (opts?.candidateId !== undefined) setSelectedCandidateId(opts.candidateId);
    if (opts?.conversationId !== undefined) setSelectedConversationId(opts.conversationId);
    setView(v);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const value = useMemo<AppState>(
    () => ({
      role,
      view,
      selectedJobId,
      selectedCandidateId,
      selectedConversationId,
      setRole: setRoleAndDefault,
      setView: go,
      go,
    }),
    [role, view, selectedJobId, selectedCandidateId, selectedConversationId, setRoleAndDefault, go]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
