"use client";

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import type { Role } from "./types";
import type { DemoAccount } from "./demo-accounts";

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

interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  title: string;
}

interface AppState {
  // Session
  user: SessionUser | null;
  isAdminUnlocked: boolean; // 2FA-style gate for admin dashboard
  // Navigation
  role: Role;
  view: View;
  selectedJobId?: string;
  selectedCandidateId?: string;
  selectedConversationId?: string;
  // Actions
  signIn: (acc: DemoAccount) => void;
  signOut: () => void;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  setRole: (r: Role) => void;
  setView: (v: View) => void;
  go: (v: View, opts?: { jobId?: string; candidateId?: string; conversationId?: string }) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "skillmatch.session";
const ADMIN_KEY = "skillmatch.admin-unlocked";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [role, setRole] = useState<Role>("guest");
  const [view, setView] = useState<View>("landing");
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | undefined>();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionUser;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsed);
        setRole(parsed.role);
        setView("dashboard");
      }
      if (localStorage.getItem(ADMIN_KEY) === "1") {
        setIsAdminUnlocked(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((u: SessionUser | null) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = useCallback(
    (acc: DemoAccount) => {
      const session: SessionUser = {
        id: acc.id,
        role: acc.role,
        name: acc.name,
        email: acc.email,
        initials: acc.initials,
        avatarColor: acc.avatarColor,
        title: acc.title,
      };
      setUser(session);
      setRole(acc.role);
      setView("dashboard");
      persist(session);
      // Auto-unlock admin session if the admin previously unlocked in this browser
      if (acc.role === "admin" && localStorage.getItem(ADMIN_KEY) === "1") {
        setIsAdminUnlocked(true);
      } else if (acc.role !== "admin") {
        // Non-admins don't need the gate; keep it cleared
        setIsAdminUnlocked(false);
      }
    },
    [persist]
  );

  const signOut = useCallback(() => {
    setUser(null);
    setRole("guest");
    setView("landing");
    setIsAdminUnlocked(false);
    persist(null);
  }, [persist]);

  const unlockAdmin = useCallback(() => {
    setIsAdminUnlocked(true);
    try {
      localStorage.setItem(ADMIN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const lockAdmin = useCallback(() => {
    setIsAdminUnlocked(false);
    try {
      localStorage.removeItem(ADMIN_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setRoleAndDefault: (r: Role) => void = useCallback((r) => {
    setRole(r);
    if (r === "guest") setView("landing");
    else setView("dashboard");
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
      user,
      isAdminUnlocked,
      role,
      view,
      selectedJobId,
      selectedCandidateId,
      selectedConversationId,
      signIn,
      signOut,
      unlockAdmin,
      lockAdmin,
      setRole: setRoleAndDefault,
      setView: go,
      go,
    }),
    [user, isAdminUnlocked, role, view, selectedJobId, selectedCandidateId, selectedConversationId, signIn, signOut, unlockAdmin, lockAdmin, setRoleAndDefault, go]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
