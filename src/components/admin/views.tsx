"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  SectionHeader,
  StatCard,
  EmptyState,
  LoadingState,
  SuccessBanner,
  InfoCallout,
  TableToolbar,
  SkillChip,
} from "@/components/shared/ui";
import {
  adminUsers,
  skillOntology,
  activityLogs,
  adminDashboardStats,
} from "@/lib/mock-data";
import { useFetch } from "@/lib/use-fetch";
import type { AdminUser, ActivityLog, SkillOntologyItem } from "@/lib/types";
import {
  Users,
  Briefcase,
  Send,
  TrendingUp,
  Sparkles,
  GitBranch,
  BarChart3,
  Activity,
  Settings,
  Search,
  Filter,
  ShieldCheck,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Server,
  Globe,
  Lock,
  Database,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Building2,
  UserCheck,
  UserX,
  Pause,
  Play,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";

function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
export function AdminDashboard() {
  const { go } = useApp();
  const { data, loading } = useFetch<any>("/api/admin/stats");
  const stats = data?.stats;
  const topSkills = data?.topSkills ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <PageContainer>
      <SectionHeader
        title="Platform overview"
        description="Health, usage, and key metrics for the SkillMatch AI platform."
      />

      {loading ? (
        <LoadingState label="Loading platform stats…" rows={4} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={(stats?.totalUsers ?? 0).toLocaleString()} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Active jobs" value={(stats?.activeJobs ?? 0).toLocaleString()} icon={<Briefcase className="h-4 w-4" />} />
            <StatCard label="Applications" value={(stats?.totalApplications ?? 0).toLocaleString()} icon={<Send className="h-4 w-4" />} />
            <StatCard label="Verified skills" value={(stats?.verifiedSkills ?? 0).toLocaleString()} icon={<ShieldCheck className="h-4 w-4" />} hint="Across all users" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Job seekers" value={(stats?.jobSeekers ?? 0).toLocaleString()} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Employers" value={(stats?.employers ?? 0).toLocaleString()} icon={<Building2 className="h-4 w-4" />} hint={`${stats?.pendingEmployers ?? 0} pending`} />
            <StatCard label="Audit events" value={(stats?.auditCount ?? 0).toLocaleString()} icon={<Activity className="h-4 w-4" />} hint="Total logged" />
            <StatCard label="System status" value="Healthy" icon={<Server className="h-4 w-4" />} hint="All services operational" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Recent activity */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Recent activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => go("activity")}>
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivity.length === 0 ? (
                  <EmptyState icon={<Activity className="h-5 w-5" />} title="No activity yet" />
                ) : (
                  recentActivity.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5 text-xs">
                      <div className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        log.status === "success" ? "bg-emerald-500" : log.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">
                          <span className="font-semibold">{log.user}</span>
                          <span className="text-muted-foreground"> · {log.action} · </span>
                          <span>{log.target}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Top skills */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Top skills</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => go("skills")}>
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {topSkills.length === 0 ? (
                  <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No skills yet" />
                ) : (
                  topSkills.map((s: any) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (s.count / 10) * 100)}%` }} />
                        </div>
                        <span className="w-8 text-right tabular-nums text-muted-foreground">{s.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}

// Mock bar chart
function MockBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all hover:opacity-80"
              style={{ height: `${(d.value / max) * 100}%`, background: color, minHeight: 4 }}
              title={`${d.value.toLocaleString()} users`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// USER MANAGEMENT
// ============================================================
export function AdminUsers() {
  const [filter, setFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const PAGE_SIZE = 8;

  // Build the API URL with filters
  const apiUrl = `/api/admin/users?role=${roleFilter}&status=${filter}&q=${encodeURIComponent(debouncedQuery)}`;
  const { data, loading, refetch } = useFetch<any>(apiUrl);

  const allUsers: any[] = data?.users ?? [];

  // Debounce search input for efficiency on large datasets
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  // Paginate — only render the current page's slice
  const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = allUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateStatus = async (userId: string, status: string) => {
    setActionLoading(userId + status);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      refetch();
    } finally {
      setActionLoading(null);
      setConfirmSuspend(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setActionLoading(userId + "delete");
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      refetch();
    } finally {
      setActionLoading(null);
      setConfirmDelete(null);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="User Management"
        description="Manage job seekers, employers, and platform access."
        actions={
          <Button><Plus className="h-4 w-4" /> Invite user</Button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={(data?.total ?? allUsers.length).toLocaleString()} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active" value={allUsers.filter(u => u.status === "active").length} icon={<UserCheck className="h-4 w-4" />} hint="of filtered" />
        <StatCard label="Pending" value={allUsers.filter(u => u.status === "pending").length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Suspended" value={allUsers.filter(u => u.status === "suspended").length} icon={<UserX className="h-4 w-4" />} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <TableToolbar>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email… (debounced)"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="seeker">Job seekers</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {loading ? (
            <LoadingState label="Loading users…" rows={4} />
          ) : paged.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<Users className="h-5 w-5" />}
              title="No users match your filters"
              description="Try adjusting search or filters."
            />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">User</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Role</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Joined</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Last active</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paged.map((u) => (
                    <tr key={u.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={u.initials ?? u.name.slice(0,2).toUpperCase()} color={u.avatarColor} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant="outline" className={cn(
                          "capitalize text-[10px]",
                          u.role === "employer" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          u.role === "seeker" ? "bg-violet-50 text-violet-700 border-violet-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{u.joinedAt}</td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{u.lastActive}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          u.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          u.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelected(u)} title="View / edit">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {u.status === "active" ? (
                            <Button size="sm" variant="ghost" title="Suspend" onClick={() => setConfirmSuspend(u)}>
                              <Pause className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" title="Activate" onClick={() => setConfirmSuspend(u)}>
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" title="Delete" onClick={() => setConfirmDelete(u)}>
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && allUsers.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing <span className="font-semibold text-foreground">{paged.length}</span> of{" "}
                <span className="font-semibold text-foreground">{allUsers.length}</span> filtered
                · page {currentPage}/{totalPages}
              </span>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User detail drawer (mock) */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
              <DialogDescription>{selected.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar initials={selected.name.slice(0,2).toUpperCase()} color={selected.avatarColor} size="lg" />
                <div>
                  <p className="text-sm font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selected.role} · {selected.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2"><p className="text-muted-foreground">Joined</p><p className="font-semibold">{selected.joinedAt}</p></div>
                <div className="rounded-md border border-border p-2"><p className="text-muted-foreground">Last active</p><p className="font-semibold">{selected.lastActive}</p></div>
                {selected.company && <div className="rounded-md border border-border p-2"><p className="text-muted-foreground">Company</p><p className="font-semibold">{selected.company}</p></div>}
                {selected.title && <div className="rounded-md border border-border p-2"><p className="text-muted-foreground">Title</p><p className="font-semibold">{selected.title}</p></div>}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setConfirmSuspend(selected); setSelected(null); }}
                >
                  {selected.status === "active" ? (
                    <><Pause className="h-3.5 w-3.5" /> Suspend</>
                  ) : (
                    <><Play className="h-3.5 w-3.5" /> Activate</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-rose-600"
                  onClick={() => { setConfirmDelete(selected); setSelected(null); }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm delete dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user account?</DialogTitle>
            <DialogDescription>
              You're about to permanently delete <span className="font-semibold text-foreground">{confirmDelete?.name}</span> ({confirmDelete?.email}).
              This action is logged in the audit trail and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteUser(confirmDelete?.id)} disabled={!!actionLoading}>
              {actionLoading?.endsWith("delete") ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" /> Delete permanently
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm suspend/activate dialog */}
      <Dialog open={!!confirmSuspend} onOpenChange={(o) => !o && setConfirmSuspend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmSuspend?.status === "active" ? "Suspend" : "Activate"} user account?</DialogTitle>
            <DialogDescription>
              {confirmSuspend?.status === "active" ? (
                <>Suspending <span className="font-semibold text-foreground">{confirmSuspend?.name}</span> will revoke their access immediately. They will not be able to log in until reactivated.</>
              ) : (
                <>Reactivating <span className="font-semibold text-foreground">{confirmSuspend?.name}</span> will restore their access.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmSuspend(null)}>Cancel</Button>
            <Button
              variant={confirmSuspend?.status === "active" ? "destructive" : "default"}
              onClick={() => updateStatus(confirmSuspend?.id, confirmSuspend?.status === "active" ? "suspended" : "active")}
              disabled={!!actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Updating…
                </>
              ) : confirmSuspend?.status === "active" ? (
                <><Pause className="h-3.5 w-3.5" /> Suspend</>
              ) : (
                <><Play className="h-3.5 w-3.5" /> Activate</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// ============================================================
// SKILLS DATABASE
// ============================================================
export function AdminSkills() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  let skills = [...skillOntology];
  if (filter !== "all") skills = skills.filter((s) => s.category === filter);
  if (query) {
    const q = query.toLowerCase();
    skills = skills.filter((s) => s.name.toLowerCase().includes(q) || s.aliases.some(a => a.toLowerCase().includes(q)));
  }

  const categories = Array.from(new Set(skillOntology.map((s) => s.category)));

  return (
    <PageContainer>
      <SectionHeader
        title="Skills Database"
        description="All skills in the platform, organized by category."
        actions={<Button><Plus className="h-4 w-4" /> Add skill</Button>}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total skills" value={skillOntology.length} icon={<Sparkles className="h-4 w-4" />} />
        <StatCard label="Categories" value={categories.length} icon={<GitBranch className="h-4 w-4" />} />
        <StatCard label="Total usage" value={skillOntology.reduce((a,s) => a+s.usageCount, 0).toLocaleString()} icon={<TrendingUp className="h-4 w-4" />} hint="across all profiles" />
        <StatCard label="Verified" value={skillOntology.reduce((a,s) => a+s.verifiedCount, 0).toLocaleString()} icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <TableToolbar>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search skills or aliases…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Skill</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Category</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Aliases</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Proficiency distribution</th>
                  <th className="px-4 py-2.5 text-left font-medium">Usage</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {skills.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.related.length} related</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.aliases.length === 0 ? <span className="text-xs text-muted-foreground">—</span> :
                          s.aliases.map((a) => <span key={a} className="text-[11px] text-muted-foreground">{a}</span>)}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-1">
                        {(["beginner", "intermediate", "advanced", "expert"] as const).map((lvl) => (
                          <div
                            key={lvl}
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${s.proficiencyDistribution[lvl]}px`,
                              background:
                                lvl === "beginner" ? "oklch(0.7 0.18 75)" :
                                lvl === "intermediate" ? "oklch(0.65 0.16 200)" :
                                lvl === "advanced" ? "oklch(0.55 0.22 285)" :
                                "oklch(0.6 0.18 152)",
                            }}
                            title={`${lvl}: ${s.proficiencyDistribution[lvl]}%`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{s.usageCount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{s.verifiedCount} verified</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// SKILL ONTOLOGY
// ============================================================
export function AdminSkillOntology() {
  const [selected, setSelected] = useState<SkillOntologyItem>(skillOntology[0]);

  return (
    <PageContainer>
      <SectionHeader
        title="Skill Ontology"
        description="Manage skill relationships, aliases, and category mapping."
        actions={<Button><Plus className="h-4 w-4" /> New skill node</Button>}
      />

      <InfoCallout className="mt-6">
        <span className="font-medium">What is the ontology?</span> It's the canonical graph that maps raw extracted skills to normalized forms. Every AI resume analysis hits this graph for normalization — keeping it clean directly improves match quality.
      </InfoCallout>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Skill list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Skill nodes ({skillOntology.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[60vh] divide-y divide-border overflow-y-auto lg:max-h-[70vh]">
              {skillOntology.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={cn(
                    "flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-accent",
                    selected.id === s.id && "bg-primary/5"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.category} · {s.related.length} related</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill detail */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{selected.name}</CardTitle>
              <CardDescription>{selected.category}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /> Edit</Button>
              <Button variant="outline" size="sm text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aliases</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.aliases.length === 0 ? <span className="text-xs text-muted-foreground">No aliases</span> :
                  selected.aliases.map((a) => <SkillChip key={a} name={a} size="sm" />)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.related.map((r) => <SkillChip key={r} name={r} size="sm" />)}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usage</p>
                <p className="mt-1 text-2xl font-bold">{selected.usageCount.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">{selected.verifiedCount} verified ({Math.round((selected.verifiedCount / selected.usageCount) * 100)}%)</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proficiency distribution</p>
                <div className="mt-2 space-y-1.5">
                  {(["beginner", "intermediate", "advanced", "expert"] as const).map((lvl) => (
                    <div key={lvl}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="capitalize text-muted-foreground">{lvl}</span>
                        <span className="font-semibold">{selected.proficiencyDistribution[lvl]}%</span>
                      </div>
                      <Progress value={selected.proficiencyDistribution[lvl]} className="h-1 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

// ============================================================
// JOBS & CATEGORIES
// ============================================================
export function AdminJobs() {
  return (
    <PageContainer>
      <SectionHeader
        title="Jobs & Categories"
        description="Manage job categories and monitor all posted jobs platform-wide."
        actions={<Button><Plus className="h-4 w-4" /> New category</Button>}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: "Senior Frontend Engineer", company: "Northwind Technologies", category: "Engineering", status: "Published", applicants: 47 },
                { title: "Backend Engineer (Go)", company: "Northwind Technologies", category: "Engineering", status: "Published", applicants: 34 },
                { title: "Product Designer", company: "Yellow Card", category: "Design", status: "Published", applicants: 53 },
                { title: "Product Manager, Growth", company: "Northwind Technologies", category: "Product", status: "Draft", applicants: 0 },
                { title: "Data Engineer", company: "Northwind Technologies", category: "Data", status: "Closed", applicants: 41 },
              ].map((j, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{j.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.company} · {j.category}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold">{j.applicants}</p>
                    <p className="text-muted-foreground">applicants</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    j.status === "Published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    j.status === "Draft" ? "bg-slate-100 text-slate-600 border-slate-200" :
                    "bg-rose-50 text-rose-600 border-rose-200"
                  )}>
                    {j.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Engineering", count: 412, color: "bg-violet-500" },
                { name: "Design", count: 187, color: "bg-blue-500" },
                { name: "Product", count: 142, color: "bg-emerald-500" },
                { name: "Data", count: 98, color: "bg-amber-500" },
                { name: "Marketing", count: 76, color: "bg-rose-500" },
                { name: "Operations", count: 54, color: "bg-slate-500" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", c.color)} />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.count} jobs</span>
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
// REPORTS & ANALYTICS
// ============================================================
export function AdminReports() {
  return (
    <PageContainer>
      <SectionHeader
        title="Reports & Analytics"
        description="Platform-wide insights into matching, applications, and engagement."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Match computation success" value="98.4%" icon={<Cpu className="h-4 w-4" />} delta="+0.3%" deltaTone="up" />
        <StatCard label="Avg. time to first match" value="3.2s" icon={<Clock className="h-4 w-4" />} delta="-0.4s" deltaTone="up" />
        <StatCard label="Application → interview" value="14.8%" icon={<TrendingUp className="h-4 w-4" />} delta="+1.2%" deltaTone="up" />
        <StatCard label="Hire success rate" value="6.3%" icon={<UserCheck className="h-4 w-4" />} delta="+0.5%" deltaTone="up" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Applications over time</CardTitle>
            <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <MockBarChart
              data={[
                { label: "W32", value: 1820 },
                { label: "W33", value: 2010 },
                { label: "W34", value: 2180 },
                { label: "W35", value: 2320 },
                { label: "W36", value: 2480 },
                { label: "W37", value: 2590 },
                { label: "W38", value: 2720 },
                { label: "W39", value: 2872 },
              ]}
              color="oklch(0.6 0.18 240)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Match score distribution</CardTitle>
            <CardDescription>All applications last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { range: "90-100%", count: 1240, color: "oklch(0.6 0.18 152)" },
                { range: "75-89%", count: 3820, color: "oklch(0.55 0.22 285)" },
                { range: "60-74%", count: 5210, color: "oklch(0.65 0.16 200)" },
                { range: "45-59%", count: 4180, color: "oklch(0.75 0.16 75)" },
                { range: "0-44%", count: 2180, color: "oklch(0.65 0.22 25)" },
              ].map((r) => (
                <div key={r.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{r.range}</span>
                    <span className="font-semibold">{r.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${(r.count / 5210) * 100}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recommendation monitoring</CardTitle>
          <CardDescription>AI fairness & quality metrics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Recommendation coverage", value: "94.2%", hint: "% seekers with ≥3 recommendations" },
            { label: "Skill-verification rate", value: "62.1%", hint: "% matched skills that are verified" },
            { label: "Bias audit (gender)", value: "Pass", hint: "Last run: 2026-10-01" },
            { label: "Bias audit (region)", value: "Pass", hint: "Last run: 2026-10-01" },
            { label: "False-positive rate", value: "3.8%", hint: "Recommendations rejected by seeker" },
            { label: "Cold-start fallback", value: "Active", hint: "For seekers w/o resume" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-lg font-bold">{m.value}</p>
              <p className="text-[11px] text-muted-foreground">{m.hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// ACTIVITY MONITORING
// ============================================================
export function AdminActivity() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  const apiUrl = `/api/admin/audit?type=${filter}&q=${encodeURIComponent(debouncedQuery)}`;
  const { data, loading } = useFetch<any>(apiUrl);
  const logs: any[] = data?.logs ?? [];

  return (
    <PageContainer>
      <SectionHeader
        title="Activity Monitoring"
        description="Audit trail of all key platform events."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Total events" value={logs.length} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Errors" value={logs.filter(l => l.status === "error").length} icon={<AlertCircle className="h-4 w-4" />} />
        <StatCard label="Warnings" value={logs.filter(l => l.status === "warning").length} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="Success" value={logs.filter(l => l.status === "success").length} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <TableToolbar>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search user, action, target…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="application">Applications</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {loading ? (
            <LoadingState label="Loading audit logs…" rows={4} />
          ) : logs.length === 0 ? (
            <EmptyState className="mt-4" icon={<Activity className="h-5 w-5" />} title="No events match your filters" />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">User</th>
                    <th className="px-4 py-2.5 text-left font-medium">Action</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium sm:table-cell">Target</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Type</th>
                  <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">IP</th>
                  <th className="px-4 py-2.5 text-left font-medium">Time</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 text-sm font-semibold">{l.user}</td>
                    <td className="px-4 py-3 text-sm">{l.action}</td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{l.target}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <Badge variant="outline" className="text-[10px] capitalize">{l.type}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground font-mono lg:table-cell">{l.ip}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.time}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          l.status === "success" ? "bg-emerald-500" : l.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className="text-[10px] capitalize text-muted-foreground">{l.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// ============================================================
// SYSTEM CONFIG
// ============================================================
export function AdminConfig() {
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const handleSave = () => { setSavedMsg("Settings saved successfully."); setTimeout(() => setSavedMsg(null), 3000); };

  return (
    <PageContainer>
      <SectionHeader
        title="System Settings"
        description="Manage user roles, AI matching weights, privacy rules, and system policies."
        icon={<Settings className="h-4 w-4" />}
      />
      {savedMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {savedMsg}
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> AI Matching Weights</CardTitle>
            <CardDescription>Control how match scores are computed platform-wide. Total should equal 100%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Skill match", value: 25, hint: "Overall skill overlap" },
              { label: "Required skill match", value: 30, hint: "Mandatory skill coverage" },
              { label: "Proficiency match", value: 15, hint: "Proficiency threshold compliance" },
              { label: "Experience match", value: 15, hint: "Years + seniority alignment" },
              { label: "Education match", value: 10, hint: "Degree threshold" },
              { label: "Verified skills", value: 5, hint: "Verification bonus" },
            ].map((w) => (
              <div key={w.label}>
                <div className="flex items-center justify-between text-xs">
                  <div><p className="font-semibold">{w.label}</p><p className="text-muted-foreground">{w.hint}</p></div>
                  <span className="font-semibold tabular-nums">{w.value}%</span>
                </div>
                <input type="range" min="0" max="50" defaultValue={w.value} className="mt-2 w-full accent-[var(--primary)]" />
              </div>
            ))}
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm">Reset to defaults</Button>
              <Button size="sm" className="btn-blue" onClick={handleSave}>Save weights</Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Role Management</CardTitle><CardDescription>Default permissions for each role</CardDescription></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="rounded-md border border-border bg-card p-2.5">
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] mb-1">Job Seeker</Badge>
                <p className="text-muted-foreground">Can: create profile, upload resume, apply to jobs, track applications, message employers</p>
              </div>
              <div className="rounded-md border border-border bg-card p-2.5">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] mb-1">Employer</Badge>
                <p className="text-muted-foreground">Can: post jobs, review candidates, shortlist, schedule interviews, message seekers</p>
              </div>
              <div className="rounded-md border border-border bg-card p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Admin</Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] gap-1"><ShieldCheck className="h-2.5 w-2.5" /> 2FA</Badge>
                </div>
                <p className="text-muted-foreground">Full platform access: users, skills, jobs, analytics, security, settings</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">Configure role permissions</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Privacy Rules</CardTitle><CardDescription>Compliance with privacy policies</CardDescription></CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { label: "Lock employer contact until interview accepted", enabled: true },
                { label: "Hide candidate name in ranking until applied", enabled: false },
                { label: "Allow seekers to export their data (GDPR)", enabled: true },
                { label: "Auto-expire applications after 60 days", enabled: true },
                { label: "Require 2FA for all admin accounts", enabled: true },
                { label: "Encrypt PII at rest (AES-256)", enabled: true },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{r.label}</span>
                  <Switch defaultChecked={r.enabled} />
                </div>
              ))}
              <Button size="sm" className="w-full btn-green" onClick={handleSave}>Save privacy settings</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">System Status</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                { label: "API Server", status: "Operational", tone: "good" },
                { label: "Database", status: "Operational", tone: "good" },
                { label: "AI Service", status: "Operational", tone: "good" },
                { label: "Notifications", status: "Degraded", tone: "warning" },
                { label: "WebSocket", status: "Operational", tone: "good" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{s.label}</span>
                  <Badge variant="outline" className={cn("text-[10px]", s.tone === "good" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                    {s.tone === "good" && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                    {s.tone === "warning" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                    {s.status}
                  </Badge>
                </div>
              ))}
              <div className="border-t border-border pt-2 text-[11px] text-muted-foreground">
                <p>Version: v2.4.1 · Region: af-east-1</p>
                <p>Last deploy: 2026-10-04 09:12 EAT</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================
// SYSTEM MONITORING — performance, uptime, data integrity
// ============================================================
export function AdminMonitoring() {
  const { data, loading } = useFetch<any>("/api/admin/monitoring");
  const m = data?.metrics;
  const integrity = data?.integrity;
  const services = data?.services ?? [];
  const counts = data?.counts;

  return (
    <PageContainer>
      <SectionHeader
        title="System Monitoring"
        description="Real-time system performance, uptime, and data integrity monitoring."
        icon={<Server className="h-4 w-4" />}
      />

      {loading ? (
        <LoadingState label="Loading system metrics…" rows={4} />
      ) : (
        <>
          {/* System Metrics */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="API Uptime" value={`${m?.api?.uptime ?? 0}%`} icon={<Server className="h-4 w-4" />} hint="30-day rolling" delta="Healthy" deltaTone="up" />
            <StatCard label="Avg Response" value={`${m?.api?.avgResponseTime ?? 0}ms`} icon={<Activity className="h-4 w-4" />} hint={`${m?.api?.requestsPerMinute ?? 0} req/min`} />
            <StatCard label="DB Latency" value={`${m?.database?.queryLatency ?? 0}ms`} icon={<Database className="h-4 w-4" />} hint={`${m?.database?.connections ?? 0}/${m?.database?.maxConnections ?? 0} connections`} />
            <StatCard label="AI Success Rate" value={`${m?.ai?.successRate ?? 0}%`} icon={<Cpu className="h-4 w-4" />} hint={`${m?.ai?.queueBacklog ?? 0} in queue`} />
          </div>

          {/* Service Health */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Service Health</CardTitle>
              <CardDescription>Real-time status of all platform services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.map((s: any) => (
                <div key={s.name} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    s.status === "operational" ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{s.status} · {s.latency}ms latency · {s.uptime}% uptime</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] capitalize",
                    s.status === "operational" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Integrity */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data Integrity</CardTitle>
                <CardDescription>Database consistency and health checks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total records", value: integrity?.totalRecords ?? 0, ok: true },
                  { label: "Orphaned records", value: integrity?.orphanedRecords ?? 0, ok: (integrity?.orphanedRecords ?? 0) === 0 },
                  { label: "Duplicate detections", value: integrity?.duplicatesDetected ?? 0, ok: (integrity?.duplicatesDetected ?? 0) === 0 },
                  { label: "Integrity score", value: `${integrity?.integrityScore ?? 0}%`, ok: true },
                  { label: "Last backup", value: integrity?.lastBackup ? new Date(integrity.lastBackup).toLocaleString() : "—", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.value}</span>
                      {item.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cache & AI Performance</CardTitle>
                <CardDescription>System resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cache hit rate</span>
                    <span className="font-semibold">{m?.cache?.hitRate ?? 0}%</span>
                  </div>
                  <Progress value={m?.cache?.hitRate ?? 0} className="mt-1 h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">API error rate</span>
                    <span className="font-semibold">{m?.api?.errorRate ?? 0}%</span>
                  </div>
                  <Progress value={100 - (m?.api?.errorRate ?? 0)} className="mt-1 h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">DB connection usage</span>
                    <span className="font-semibold">{m?.database?.connections ?? 0}/{m?.database?.maxConnections ?? 0}</span>
                  </div>
                  <Progress value={((m?.database?.connections ?? 0) / (m?.database?.maxConnections ?? 1)) * 100} className="mt-1 h-1.5" />
                </div>
                <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                  DB size: {m?.database?.size ?? "—"} · Cache size: {m?.cache?.size ?? "—"}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}

// ============================================================
// AI ANALYTICS — employment trends and AI performance
// ============================================================
export function AdminAIAnalytics() {
  const { data, loading } = useFetch<any>("/api/admin/ai-analytics");
  const ai = data?.aiMetrics;
  const insights = data?.insights ?? [];
  const jobsByCategory = data?.jobsByCategory ?? [];
  const topSkills = data?.topSkills ?? [];

  return (
    <PageContainer>
      <SectionHeader
        title="AI Analytics & Employment Trends"
        description="AI-powered insights into employment trends, platform performance, and matching quality."
        icon={<Cpu className="h-4 w-4" />}
      />

      {loading ? (
        <LoadingState label="Loading AI analytics…" rows={4} />
      ) : (
        <>
          {/* AI Performance Metrics */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="AI Computations" value={(ai?.totalComputations ?? 0).toLocaleString()} icon={<Cpu className="h-4 w-4" />} hint="Total match scores computed" />
            <StatCard label="Avg Match Score" value={`${ai?.avgMatchScore ?? 0}%`} icon={<Target className="h-4 w-4" />} hint="Across all applications" />
            <StatCard label="High Match Rate" value={`${ai?.highMatchRate ?? 0}%`} icon={<TrendingUp className="h-4 w-4" />} hint="Applications scoring > 80%" delta="+5%" deltaTone="up" />
            <StatCard label="AI Success Rate" value={`${ai?.successRate ?? 0}%`} icon={<CheckCircle2 className="h-4 w-4" />} hint={`Avg: ${ai?.avgProcessingTime ?? 0}s · ${ai?.modelVersion ?? ""}`} />
          </div>

          {/* AI Insights */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI-Generated Insights
              </CardTitle>
              <CardDescription>Automated analysis of employment trends and platform performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    insight.trend === "up" ? "bg-emerald-100 text-emerald-700" :
                    insight.trend === "down" ? "bg-rose-100 text-rose-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {insight.trend === "up" ? <TrendingUp className="h-4 w-4" /> :
                     insight.trend === "down" ? <ArrowDownRight className="h-4 w-4" /> :
                     <BarChart3 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{insight.title}</p>
                      <Badge variant="outline" className={cn(
                        "text-[9px]",
                        insight.impact === "high" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trends: Jobs by Category + Top Skills */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Jobs by Category</CardTitle>
                <CardDescription>Demand distribution across job categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {jobsByCategory.map((c: any) => {
                  const max = Math.max(...jobsByCategory.map((x: any) => x.count), 1);
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{c.category}</span>
                        <span className="text-muted-foreground">{c.count} jobs</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${(c.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Top Skills in Demand</CardTitle>
                <CardDescription>Most frequently listed skills across all profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topSkills.map((s: any) => {
                  const max = Math.max(...topSkills.map((x: any) => x.count), 1);
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground">{s.count} profiles</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500" style={{ width: `${(s.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Predictive Analytics */}
          <PredictiveAnalyticsSection />
        </>
      )}
    </PageContainer>
  );
}

// ============================================================
// PREDICTIVE ANALYTICS SECTION
// ============================================================
function PredictiveAnalyticsSection() {
  const { data, loading } = useFetch<any>("/api/ai/predictive");
  const pa = data?.analytics;

  if (loading) return <LoadingState label="Loading predictive analytics…" rows={3} />;
  if (!pa) return null;

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Predictive Employment Analytics
          </CardTitle>
          <CardDescription>AI-generated forecasts for job growth, skill demand, and salary trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Market Insights */}
          {pa.marketInsights?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">AI Market Insights</p>
              {pa.marketInsights.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Job Growth + Skill Demand */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold mb-2">Job Growth Forecast by Category</p>
              <div className="space-y-1.5">
                {pa.jobGrowthForecast?.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{g.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{g.growthRate}%</span>
                      <Badge variant="outline" className={cn("text-[9px] capitalize", g.trend === "up" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200")}>
                        {g.trend === "up" && <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />}
                        {g.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Skill Demand Forecast</p>
              <div className="space-y-1.5">
                {pa.skillDemandForecast?.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{s.skill}</span>
                      <span className="text-muted-foreground">{s.demandLevel}% demand</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500" style={{ width: `${s.demandLevel}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Trends */}
          <div>
            <p className="text-xs font-semibold mb-2">Salary Trends (USD/month)</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {pa.salaryTrends?.map((s: any, i: number) => (
                <div key={i} className="rounded-lg border border-border bg-card p-2.5 text-center">
                  <p className="text-sm font-bold text-primary">${s.avgSalary.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{s.role}</p>
                  <Badge variant="outline" className={cn("text-[9px] mt-1 capitalize", s.trend === "up" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200")}>
                    {s.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Seasonality */}
          <div>
            <p className="text-xs font-semibold mb-2">Hiring Seasonality (monthly activity)</p>
            <div className="flex items-end gap-1 h-20">
              {pa.hiringSeasonality?.map((m: any, i: number) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-violet-500 to-blue-400" style={{ height: `${m.activity}%`, minHeight: 4 }} title={`${m.activity}% activity`} />
                  <span className="text-[8px] text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================================
// SECURITY & COMPLIANCE — data security, privacy, compliance
// ============================================================
export function AdminSecurity() {
  const { data, loading } = useFetch<any>("/api/admin/security");
  const summary = data?.summary;
  const compliance = data?.compliance;
  const securityChecks = data?.securityChecks ?? [];
  const securityEvents = data?.securityEvents ?? [];

  return (
    <PageContainer>
      <SectionHeader
        title="Security & Compliance"
        description="Data security monitoring, privacy policy enforcement, and compliance audits."
        icon={<ShieldCheck className="h-4 w-4" />}
      />

      {loading ? (
        <LoadingState label="Loading security data…" rows={4} />
      ) : (
        <>
          {/* Security Summary */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="2FA Adoption" value={`${summary?.twoFARate ?? 0}%`} icon={<ShieldCheck className="h-4 w-4" />} hint={`${summary?.usersWith2FA ?? 0} of ${summary?.totalUsers ?? 0} users`} />
            <StatCard label="Suspended Accounts" value={summary?.suspendedUsers ?? 0} icon={<AlertTriangle className="h-4 w-4" />} hint="Security-related suspensions" />
            <StatCard label="Failed Logins" value={summary?.failedLogins ?? 0} icon={<AlertCircle className="h-4 w-4" />} hint="Total failed auth attempts" />
            <StatCard label="Admin Actions" value={summary?.adminActions ?? 0} icon={<Lock className="h-4 w-4" />} hint="Total logged admin events" />
          </div>

          {/* Security Checklist */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Security Audit Checklist
              </CardTitle>
              <CardDescription>Automated security checks across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {securityChecks.map((check: any) => (
                <div key={check.name} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  {check.status === "pass" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{check.name}</p>
                      <Badge variant="outline" className={cn(
                        "text-[9px] capitalize",
                        check.status === "pass" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {check.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance + Security Events */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Compliance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Privacy & Compliance
                </CardTitle>
                <CardDescription>GDPR, data retention, and privacy policy enforcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {compliance && Object.entries(compliance).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border border-border bg-card p-2.5 text-xs">
                    <div>
                      <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      {val.lastUpdated && <p className="text-muted-foreground">Updated: {val.lastUpdated}</p>}
                      {val.maxDays && <p className="text-muted-foreground">Retention: {val.maxDays} days</p>}
                      {val.algorithm && <p className="text-muted-foreground">Algorithm: {val.algorithm}</p>}
                      {val.totalEvents !== undefined && <p className="text-muted-foreground">{val.totalEvents} events logged</p>}
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] capitalize",
                      val.status === "compliant" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {val.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Security Events
                </CardTitle>
                <CardDescription>Authentication and security-related audit logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {securityEvents.length === 0 ? (
                  <EmptyState icon={<Activity className="h-5 w-5" />} title="No security events" description="All clear — no recent security incidents." />
                ) : (
                  securityEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5 text-xs">
                      <div className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        event.status === "success" ? "bg-emerald-500" :
                        event.status === "error" ? "bg-rose-500" : "bg-amber-500"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">
                          <span className="font-semibold">{event.user}</span>
                          <span className="text-muted-foreground"> · {event.action}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">{event.target} · {event.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}
