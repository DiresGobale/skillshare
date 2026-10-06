"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import type { Role } from "./types";

// All navigable views keyed by role
export type GuestView = "landing" | "login" | "register" | "public-jobs" | "public-job-detail" | "about" | "contact";
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
  // Navigation
  role: Role;
  view: View;
  selectedJobId?: string;
  selectedCandidateId?: string;
  selectedConversationId?: string;
  // User (derived from NextAuth session, with fallback for guest)
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    title?: string;
    avatarColor: string;
    initials?: string;
  } | null;
  // Admin 2FA unlock state (still tracked client-side — NextAuth credential
  // already validated the TOTP, but we keep a soft "unlocked" flag so the
  // 2FA gate can be re-shown after inactivity without forcing a full re-login)
  isAdminUnlocked: boolean;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  // Actions
  signOut: () => void;
  setRole: (r: Role) => void;
  setView: (v: View) => void;
  go: (v: View, opts?: { jobId?: string; candidateId?: string; conversationId?: string }) => void;
}

const AppContext = createContext<AppState | null>(null);

const ADMIN_KEY = "skillmatch.admin-unlocked";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [view, setView] = useState<View>("landing");
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  // Derive user + role from session
  const user = useMemo(() => {
    if (status !== "authenticated" || !session?.user) return null;
    return {
      id: (session.user as any).id,
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      role: (session.user as any).role as Role,
      title: (session.user as any).title,
      avatarColor: (session.user as any).avatarColor ?? "oklch(0.55 0.22 285)",
      initials: (session.user as any).initials,
    };
  }, [session, status]);

  const role: Role = user?.role ?? "guest";

  // Hydrate admin unlock state from sessionStorage on mount + when role changes
  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(ADMIN_KEY) === "1" && role === "admin") {
        setIsAdminUnlocked(true);
      } else if (role !== "admin") {
        setIsAdminUnlocked(false);
      }
    } catch {
      /* ignore */
    }
  }, [role]);

  const unlockAdmin = useCallback(() => {
    setIsAdminUnlocked(true);
    try {
      sessionStorage.setItem(ADMIN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem(ADMIN_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(ADMIN_KEY);
    } catch {
      /* ignore */
    }
    setIsAdminUnlocked(false);
    setView("landing");
    nextAuthSignOut({ redirect: false });
  }, []);

  const setRole = useCallback((r: Role) => {
    // Just a no-op for compatibility — real role changes go through sign-in
    void r;
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
      user,
      isAdminUnlocked,
      unlockAdmin,
      lockAdmin,
      signOut,
      setRole,
      setView: go,
      go,
    }),
    [role, view, selectedJobId, selectedCandidateId, selectedConversationId, user, isAdminUnlocked, unlockAdmin, lockAdmin, signOut, setRole, go]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
