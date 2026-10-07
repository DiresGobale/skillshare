// Demo credentials for the SkillMatch AI platform.
// Used by the login screen's "Try a demo account" picker and by the
// auth API route to validate sign-in attempts.

export type DemoRole = "seeker" | "employer" | "admin";

export interface DemoAccount {
  id: string;
  role: DemoRole;
  name: string;
  email: string;
  password: string;
  title: string;
  blurb: string;
  avatarColor: string;
  initials: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    id: "demo-seeker",
    role: "seeker",
    name: "Amara Okafor",
    email: "seeker@demo.com",
    password: "demo1234",
    title: "Senior Frontend Engineer",
    blurb: "Job seeker · 6 years experience · React/Next.js expert",
    avatarColor: "oklch(0.55 0.22 285)",
    initials: "AO",
  },
  {
    id: "demo-employer",
    role: "employer",
    name: "David Chen",
    email: "employer@demo.com",
    password: "demo1234",
    title: "Talent Acquisition Lead",
    blurb: "Employer · Northwind Technologies · hiring 3 roles",
    avatarColor: "oklch(0.6 0.18 240)",
    initials: "DC",
  },
  {
    id: "demo-admin",
    role: "admin",
    name: "Priya Sharma",
    email: "admin@demo.com",
    password: "demo1234",
    title: "Platform Administrator",
    blurb: "Admin · full platform access · 2FA enabled",
    avatarColor: "oklch(0.65 0.2 330)",
    initials: "PS",
  },
  {
    id: "demo-admin-zewtor",
    role: "admin",
    name: "Zewtor",
    email: "dires1466@gmail.com",
    password: "admin1234",
    title: "Platform Administrator",
    blurb: "Admin · full platform access · 2FA enabled",
    avatarColor: "oklch(0.65 0.2 200)",
    initials: "ZW",
  },
];

export function findDemoAccount(email: string, password: string): DemoAccount | null {
  const acc = demoAccounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  return acc ?? null;
}
