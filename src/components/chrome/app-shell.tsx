"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useApp, type View } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar } from "@/components/shared/ui";
import { currentUser } from "@/lib/mock-data";
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
  LogOut,
  ChevronDown,
  Zap,
  ShieldCheck,
  CalendarClock,
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

function getUser(role: Role) {
  if (role === "seeker") return currentUser.seeker;
  if (role === "employer") return currentUser.employer;
  if (role === "admin") return currentUser.admin;
  return null;
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

// Sidebar (desktop)
function SidebarNav({ role, view, onNavigate }: { role: Role; view: View; onNavigate?: (v: View) => void }) {
  const nav = getNav(role);
  const user = getUser(role);
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
          {user && <Avatar initials={user.initials} color={user.avatarColor} size="sm" />}
          {user && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Top bar (search + actions + role switcher)
function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { role, setRole } = useApp();
  const user = getUser(role);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      <button
        onClick={onOpenMobile}
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

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
              <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-md">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Switch role (demo)
                </p>
                {(["guest", "seeker", "employer", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent capitalize",
                      r === role && "bg-primary/5 text-primary font-medium"
                    )}
                  >
                    {r}
                    {r === role && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                ))}
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

        {user && (
          <div className="flex items-center gap-2 pl-1">
            <Avatar initials={user.initials} color={user.avatarColor} size="sm" />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => setRole("guest")}
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
  const { role, view, go, setRole } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarNav role={role} view={view} onNavigate={(v) => go(v)} />
      </aside>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarNav
            role={role}
            view={view}
            onNavigate={(v) => {
              go(v);
              setMobileOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
