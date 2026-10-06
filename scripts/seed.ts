// Seed the database with demo users + sample skills, experience, education,
// jobs (from the employer), applications, notifications, and audit logs.
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

const DEMO_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- JOB SEEKER ----------
  const seeker = await db.user.upsert({
    where: { email: "seeker@demo.com" },
    update: {
      name: "Amara Okafor",
      title: "Senior Frontend Engineer",
      location: "Nairobi, Kenya",
      about:
        "Senior Frontend Engineer with 6 years building customer-facing products across fintech, agritech, and payments. Led the React/Next.js rewrite at Twiga Foods, lifting Lighthouse scores by 47%. Passionate about accessibility, performance, and mentoring.",
    },
    create: {
      email: "seeker@demo.com",
      name: "Amara Okafor",
      passwordHash,
      role: "seeker",
      title: "Senior Frontend Engineer",
      avatarColor: "oklch(0.55 0.22 285)",
      initials: "AO",
      location: "Nairobi, Kenya",
      about:
        "Senior Frontend Engineer with 6 years building customer-facing products across fintech, agritech, and payments. Led the React/Next.js rewrite at Twiga Foods, lifting Lighthouse scores by 47%. Passionate about accessibility, performance, and mentoring.",
    },
  });

  // Seeker skills (clear then re-insert to keep deterministic)
  await db.skill.deleteMany({ where: { userId: seeker.id } });
  const seekerSkills = [
    { name: "React", category: "Frontend", proficiency: "expert", verified: "verified", yearsOfExperience: 6 },
    { name: "TypeScript", category: "Languages", proficiency: "advanced", verified: "verified", yearsOfExperience: 5 },
    { name: "Next.js", category: "Frontend", proficiency: "advanced", verified: "pending", yearsOfExperience: 4 },
    { name: "Tailwind CSS", category: "Styling", proficiency: "advanced", verified: "verified", yearsOfExperience: 4 },
    { name: "Node.js", category: "Backend", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 3 },
    { name: "GraphQL", category: "API", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 2 },
    { name: "Jest", category: "Testing", proficiency: "intermediate", verified: "verified", yearsOfExperience: 3 },
    { name: "PostgreSQL", category: "Database", proficiency: "intermediate", verified: "pending", yearsOfExperience: 2 },
  ];
  for (const s of seekerSkills) {
    await db.skill.create({ data: { userId: seeker.id, ...s, source: "manual" } });
  }

  // Seeker experience
  await db.experience.deleteMany({ where: { userId: seeker.id } });
  const seekerExperiences = [
    { company: "Twiga Foods", title: "Senior Frontend Engineer", startDate: "2022-03", endDate: "Present", current: true, description: "Led the frontend rewrite from Vue to React/Next.js, improving Lighthouse scores by 47%. Mentored 4 junior engineers." },
    { company: "Safaricom PLC", title: "Frontend Engineer", startDate: "2019-07", endDate: "2022-02", current: false, description: "Built customer-facing dashboards for the M-Pesa merchant portal serving 1.2M monthly users." },
    { company: "Andela", title: "Junior Developer", startDate: "2018-07", endDate: "2019-06", current: false, description: "Contributed to multiple partner teams across fintech and edtech." },
  ];
  for (const e of seekerExperiences) {
    await db.experience.create({ data: { userId: seeker.id, ...e } });
  }

  // Seeker education
  await db.education.deleteMany({ where: { userId: seeker.id } });
  const seekerEducations = [
    { institution: "University of Nairobi", degree: "B.Sc.", field: "Computer Science", startDate: "2014-09", endDate: "2018-06", verified: true },
    { institution: "ALX Africa", degree: "Diploma", field: "Software Engineering", startDate: "2020-01", endDate: "2020-12", verified: false },
  ];
  for (const e of seekerEducations) {
    await db.education.create({ data: { userId: seeker.id, ...e } });
  }

  // ---------- EMPLOYER ----------
  const employer = await db.user.upsert({
    where: { email: "employer@demo.com" },
    update: {
      name: "David Chen",
      title: "Talent Acquisition Lead",
      company: "Northwind Technologies",
      location: "Lagos, Nigeria",
      about: "Northwind Technologies builds analytics infrastructure for Sub-Saharan African fintechs. We process 40M+ events per day and serve 40k+ daily active users.",
    },
    create: {
      email: "employer@demo.com",
      name: "David Chen",
      passwordHash,
      role: "employer",
      title: "Talent Acquisition Lead",
      company: "Northwind Technologies",
      avatarColor: "oklch(0.6 0.18 240)",
      initials: "DC",
      location: "Lagos, Nigeria",
      about: "Northwind Technologies builds analytics infrastructure for Sub-Saharan African fintechs. We process 40M+ events per day and serve 40k+ daily active users.",
    },
  });

  // ---------- ADMIN (with 2FA enabled) ----------
  const adminSecret = "JBSWY3DPEHPK3PXP"; // Deterministic demo secret — easy to enroll in any authenticator app
  await db.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      name: "Priya Sharma",
      title: "Platform Administrator",
      location: "Global",
      twoFactorSecretHash: adminSecret,
      twoFactorEnabled: true,
    },
    create: {
      email: "admin@demo.com",
      name: "Priya Sharma",
      passwordHash,
      role: "admin",
      title: "Platform Administrator",
      avatarColor: "oklch(0.65 0.2 330)",
      initials: "PS",
      location: "Global",
      twoFactorSecretHash: adminSecret,
      twoFactorEnabled: true,
    },
  });

  const otpUri = authenticator.keyuri("admin@demo.com", "SkillMatch AI", adminSecret);
  console.log("\n=== ADMIN 2FA SETUP ===");
  console.log("Secret:", adminSecret);
  console.log("OTP URI (scan with authenticator app):", otpUri);
  console.log("Current TOTP code:", authenticator.generate(adminSecret));
  console.log("Demo password for all users:", DEMO_PASSWORD);
  console.log("=======================\n");

  // ---------- JOBS (from the employer) ----------
  await db.job.deleteMany({ where: { employerId: employer.id } });
  const jobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Northwind Technologies",
      companyLogo: "NW",
      location: "Lagos, Nigeria",
      remote: "hybrid",
      type: "full-time",
      category: "Engineering",
      salaryMin: 6500,
      salaryMax: 9500,
      description: "Lead the next generation of our customer-facing analytics suite. You will partner with product and design to ship fast, accessible interfaces used by 40k+ daily active users across Sub-Saharan Africa.",
      status: "published",
    },
    {
      title: "Backend Engineer (Go)",
      company: "Northwind Technologies",
      companyLogo: "NW",
      location: "Lagos, Nigeria",
      remote: "hybrid",
      type: "full-time",
      category: "Engineering",
      salaryMin: 5500,
      salaryMax: 8000,
      description: "Build scalable backend services in Go for our analytics platform.",
      status: "published",
    },
    {
      title: "Product Manager, Growth",
      company: "Northwind Technologies",
      companyLogo: "NW",
      location: "Lagos, Nigeria",
      remote: "hybrid",
      type: "full-time",
      category: "Product",
      salaryMin: 6000,
      salaryMax: 9000,
      description: "Drive growth experiments across our analytics products.",
      status: "draft",
    },
    {
      title: "Data Engineer",
      company: "Northwind Technologies",
      companyLogo: "NW",
      location: "Remote — Africa",
      remote: "remote",
      type: "full-time",
      category: "Data",
      salaryMin: 5000,
      salaryMax: 7500,
      description: "Build and operate our data warehouse and ETL pipelines.",
      status: "closed",
    },
  ];
  const jobRecords = [];
  for (const j of jobs) {
    const job = await db.job.create({ data: { employerId: employer.id, currency: "USD", salaryPeriod: "month", ...j } });
    jobRecords.push(job);
  }

  // ---------- APPLICATIONS (seeker applied to first 2 jobs) ----------
  await db.application.deleteMany({ where: { userId: seeker.id } });
  await db.application.create({
    data: {
      userId: seeker.id,
      jobId: jobRecords[0].id,
      status: "interview",
      matchScore: 92,
    },
  });
  await db.application.create({
    data: {
      userId: seeker.id,
      jobId: jobRecords[1].id,
      status: "screening",
      matchScore: 78,
    },
  });

  // ---------- NOTIFICATIONS for seeker ----------
  await db.notification.deleteMany({ where: { userId: seeker.id } });
  const seekerNotifs = [
    { type: "interview", title: "Technical interview scheduled", message: "Northwind Technologies scheduled your technical interview for Oct 9, 14:00 EAT.", read: false },
    { type: "application", title: "Application status update", message: "Northwind moved your application to Interview stage.", read: false },
    { type: "match", title: "New high-match job: Lead UI Engineer at Paystack", message: "Your match score is 88%. This role closes in 5 days.", read: true },
    { type: "system", title: "Resume re-analysis complete", message: "We re-processed your resume. 2 new skills detected.", read: true },
  ];
  for (const n of seekerNotifs) {
    await db.notification.create({ data: { userId: seeker.id, ...n } });
  }

  // ---------- NOTIFICATIONS for employer ----------
  await db.notification.deleteMany({ where: { userId: employer.id } });
  const employerNotifs = [
    { type: "application", title: "5 new applications for Senior Frontend Engineer", message: "2 applicants scored above 85% match. Review them in the candidate ranking.", read: false },
    { type: "interview", title: "Interview confirmed with Amara Okafor", message: "Technical interview scheduled for Oct 9, 14:00 EAT.", read: false },
    { type: "system", title: "Job draft auto-saved", message: "Your draft \"Product Manager, Growth\" was auto-saved.", read: true },
  ];
  for (const n of employerNotifs) {
    await db.notification.create({ data: { userId: employer.id, ...n } });
  }

  // ---------- AUDIT LOGS ----------
  await db.auditLog.create({
    data: { userId: seeker.id, action: "Seeded database", target: "Initial seeker data", type: "admin", ip: "127.0.0.1", status: "success" },
  });
  await db.auditLog.create({
    data: { userId: employer.id, action: "Published job", target: "Senior Frontend Engineer", type: "job", ip: "102.89.34.10", status: "success" },
  });
  await db.auditLog.create({
    data: { userId: seeker.id, action: "Applied to", target: "Senior Frontend Engineer @ Northwind", type: "application", ip: "41.90.64.12", status: "success" },
  });
  await db.auditLog.create({
    data: { userId: employer.id, action: "Shortlisted candidate", target: "Amara Okafor", type: "application", ip: "102.176.78.4", status: "success" },
  });
  await db.auditLog.create({
    data: { action: "AI match computation", target: "47 candidates", type: "ai", status: "success" },
  });
  await db.auditLog.create({
    data: { userId: seeker.id, action: "Resume upload failed", target: "corrupted PDF", type: "application", ip: "154.122.18.9", status: "error" },
  });

  console.log("Seed complete.");
  console.log("- 3 users (seeker, employer, admin)");
  console.log("- Seeker: 8 skills, 3 experiences, 2 educations");
  console.log("- Employer: 4 jobs (2 published, 1 draft, 1 closed)");
  console.log("- 2 applications, 7 notifications, 6 audit logs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
