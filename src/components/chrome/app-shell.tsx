"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp, type View } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/ui";
import { demoAccounts } from "@/lib/demo-accounts";
import {
  LayoutDashboard,
  User,
  Sparkles,
  FileText,
  Target,
  Briefcase,
  Send,
  TrendingUp,
  Bell,
  MessageSquare,
  Building2,
  Users,
  GitBranch,
  BarChart3,
  Activity,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Zap,
  ShieldCheck,
  CalendarClock,
  Lock,
} from "lucide-react";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  view: View;
  icon: React.ReactNode;
  badge?: number;
}

const seekerNav: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Profile", view: "profile", icon: <User className="h-4 w-4" /> },
  { label: "Skills & Proficiency", view: "skills", icon: <Sparkles className="h-4 w-4" /> },
  { label: "Resume & AI Analysis", view: "resume", icon: <FileText className="h-4 w-4" /> },
  { label: "Recommended Jobs", view: "recommended", icon: <Target className="h-4 w-4" />, badge: 4 },
  { label: "Applications", view: "applications", icon: <Send className="h-4 w-4" /> },
  { label: "Skill Gap Analysis", view: "skill-gap", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Messages", view: "messages", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Notifications", view: "notifications", icon: <Bell className="h-4 w-4" />, badge: 2 },
];

const employerNav: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Company Profile", view: "company-profile", icon: <Building2 className="h-4 w-4" /> },
  { label: "Jobs", view: "jobs", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Candidate Ranking", view: "candidates", icon: <Users className="h-4 w-4" />, badge: 5 },
  { label: "Applications", view: "applications", icon: <Send className="h-4 w-4" /> },
  { label: "Interviews", view: "interviews", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Messages", view: "messages", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Notifications", view: "notifications", icon: <Bell className="h-4 w-4" />, badge: 2 },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "User Management", view: "users", icon: <Users className="h-4 w-4" /> },
  { label: "Skills Database", view: "skills", icon: <Sparkles className="h-4 w-4" /> },
  { label: "Skill Ontology", view: "skill-ontology", icon: <GitBranch className="h-4 w-4" /> },
  { label: "Jobs & Categories", view: "jobs", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Reports & Analytics", view: "reports", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Activity Monitoring", view: "activity", icon: <Activity className="h-4 w-4" /> },
  { label: "System Config", view: "config", icon: <Settings className="h-4 w-4" /> },
];

function getNav(role: Role): NavItem[] {
  if (role === "seeker") return seekerNav;
  if (role === "employer") return employerNav;
  if (role === "admin") return adminNav;
  return [];
}

// Brand mark
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-sm">
        <Zap className="h-4 w-4" fill="currentColor" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">
            SkillMatch<span className="text-primary"> AI</span>
          </p>
          <p className="text-[10px] text-muted-foreground">Skill-based hiring</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 3-LINE HAMBURGER TOGGLE BUTTON
// Three horizontal lines that animate into an X when active
// ============================================================
export function HamburgerToggle({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="mobile-navbar"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent",
        className
      )}
    >
      <span className="relative block h-4 w-5">
        {/* Line 1 */}
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ease-in-out",
            open ? "top-1.5 rotate-45" : "top-0"
          )}
        />
        {/* Line 2 */}
        <span
          className={cn(
            "absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-foreground transition-all duration-200 ease-in-out",
            open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
          )}
        />
        {/* Line 3 */}
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 ease-in-out",
            open ? "top-1.5 -rotate-45" : "top-3"
          )}
        />
      </span>
    </button>
  );
}

// Sidebar (desktop)
function SidebarNav({ role, view, onNavigate }: { role: Role; view: View; onNavigate?: (v: View) => void }) {
  const nav = getNav(role);
  const { user } = useApp();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {role === "seeker" ? "Job seeker" : role === "employer" ? "Employer" : "Administrator"}
        </p>
        {nav.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate?.(item.view)}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className={cn(active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          {user && <Avatar initials={user.initials ?? user.name.slice(0,2).toUpperCase()} color={user.avatarColor} size="sm" />}
          {user && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.title ?? user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE NAVBAR — slide-in panel controlled by hamburger toggle
// ============================================================
function MobileNavbar({
  open,
  onClose,
  role,
  view,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  view: View;
  onNavigate: (v: View) => void;
}) {
  const nav = getNav(role);
  const { user } = useApp();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <nav
        id="mobile-navbar"
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with brand + close button */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <BrandMark />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role === "seeker" ? "Job seeker" : role === "employer" ? "Employer" : "Administrator"}
          </p>
          <div className="space-y-0.5">
            {nav.map((item) => {
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    onClose();
                  }}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className={cn(active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                        active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
              <Avatar initials={user.initials ?? user.name.slice(0,2).toUpperCase()} color={user.avatarColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.title ?? user.email}</p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Top bar (search + actions + role switcher)
function Topbar({ onToggleMobile, mobileOpen }: { onToggleMobile: () => void; mobileOpen: boolean }) {
  const { role, user, signOut } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Determine display user — prefer session user
  const displayUser = user;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      {/* 3-line hamburger toggle (mobile only) */}
      <HamburgerToggle
        open={mobileOpen}
        onClick={onToggleMobile}
        className="lg:hidden"
      />

      {/* Search (desktop) */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={role === "admin" ? "Search users, jobs, skills…" : "Search jobs, companies, skills…"}
          className="h-9 w-full rounded-md border border-input bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Role switcher (demo helper) */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex h-9 gap-1.5"
            onClick={() => setRoleMenuOpen((v) => !v)}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize">{role}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          {roleMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-md border border-border bg-popover shadow-md">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Switch demo account
                </p>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={async () => {
                      setRoleMenuOpen(false);
                      // Sign out current session, then sign in as the demo account
                      await signOut();
                      // Use NextAuth credentials sign-in
                      const { signIn: nextAuthSignIn } = await import("next-auth/react");
                      await nextAuthSignIn("credentials", {
                        email: acc.email,
                        password: acc.password,
                        redirect: false,
                      });
                      window.location.assign("/");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                      acc.role === role && "bg-primary/5 text-primary font-medium"
                    )}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: acc.avatarColor }}
                    >
                      {acc.initials}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold capitalize">{acc.role}</p>
                      <p className="text-[10px] text-muted-foreground">{acc.email}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-border p-1.5">
                  <button
                    onClick={() => {
                      signOut();
                      setRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <MessageSquare className="h-4 w-4" />
        </Button>

        {displayUser && (
          <div className="flex items-center gap-2 pl-1">
            <Avatar initials={displayUser.initials ?? displayUser.name.slice(0,2).toUpperCase()} color={displayUser.avatarColor} size="sm" />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold leading-tight">{displayUser.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{displayUser.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => signOut()}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

// ============================================================
// MAIN LAYOUT — sidebar + topbar + content
// ============================================================
export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, view, go, isAdminUnlocked, lockAdmin } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarNav role={role} view={view} onNavigate={(v) => go(v)} />
      </aside>

      {/* Mobile navbar (toggle-controlled, slide-in) */}
      <MobileNavbar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
        view={view}
        onNavigate={(v) => go(v)}
      />

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleMobile={() => setMobileOpen((v) => !v)} mobileOpen={mobileOpen} />
        {/* Admin security banner */}
        {role === "admin" && isAdminUnlocked && (
          <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-900 lg:px-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-medium">Admin session unlocked</span>
              <span className="hidden text-amber-700 sm:inline">· auto-locks after 30 min of inactivity</span>
            </div>
            <button
              onClick={() => lockAdmin()}
              className="flex items-center gap-1 rounded px-2 py-0.5 font-medium text-amber-900 hover:bg-amber-100"
            >
              <Lock className="h-3 w-3" /> Lock now
            </button>
          </div>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
