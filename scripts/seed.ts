// Seed the database with the 3 demo accounts + sample skills, experience, education.
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
    update: {},
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

  // Seeker skills
  const seekerSkills = [
    { name: "React", category: "Frontend", proficiency: "expert", verified: "verified", yearsOfExperience: 6, source: "manual" },
    { name: "TypeScript", category: "Languages", proficiency: "advanced", verified: "verified", yearsOfExperience: 5, source: "manual" },
    { name: "Next.js", category: "Frontend", proficiency: "advanced", verified: "pending", yearsOfExperience: 4, source: "manual" },
    { name: "Tailwind CSS", category: "Styling", proficiency: "advanced", verified: "verified", yearsOfExperience: 4, source: "manual" },
    { name: "Node.js", category: "Backend", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 3, source: "manual" },
    { name: "GraphQL", category: "API", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 2, source: "manual" },
    { name: "Jest", category: "Testing", proficiency: "intermediate", verified: "verified", yearsOfExperience: 3, source: "manual" },
    { name: "PostgreSQL", category: "Database", proficiency: "intermediate", verified: "pending", yearsOfExperience: 2, source: "manual" },
  ];
  for (const s of seekerSkills) {
    await db.skill.upsert({
      where: { id: `${seeker.id}-${s.name}` },
      update: {},
      create: { id: `${seeker.id}-${s.name}`, userId: seeker.id, ...s },
    });
  }

  // Seeker experience
  const seekerExperiences = [
    { company: "Twiga Foods", title: "Senior Frontend Engineer", startDate: "2022-03", endDate: "Present", current: true, description: "Led the frontend rewrite from Vue to React/Next.js, improving Lighthouse scores by 47%. Mentored 4 junior engineers." },
    { company: "Safaricom PLC", title: "Frontend Engineer", startDate: "2019-07", endDate: "2022-02", current: false, description: "Built customer-facing dashboards for the M-Pesa merchant portal serving 1.2M monthly users." },
    { company: "Andela", title: "Junior Developer", startDate: "2018-07", endDate: "2019-06", current: false, description: "Contributed to multiple partner teams across fintech and edtech." },
  ];
  for (const e of seekerExperiences) {
    await db.experience.create({ data: { userId: seeker.id, ...e } });
  }

  // Seeker education
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
    update: {},
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
      about: "Northwind Technologies builds analytics infrastructure for Sub-Saharan African fintechs.",
    },
  });

  // ---------- ADMIN (with 2FA enabled) ----------
  // For demo: secret = base32 of "SKILLMATCHADMIN2026" — but we use a random
  // secret and just print the OTP URI so the user can enroll via authenticator app.
  // For simplicity in this demo, we use a fixed secret so the user always knows
  // the current TOTP code can be derived from the same secret.
  const adminSecret = authenticator.generateSecret();
  const admin = await db.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      // Always reset 2FA secret on seed so it's deterministic per run
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

  // Print the TOTP URI + current code for the admin
  const otpUri = authenticator.keyuri("admin@demo.com", "SkillMatch AI", adminSecret);
  console.log("\n=== ADMIN 2FA SETUP ===");
  console.log("Secret:", adminSecret);
  console.log("OTP URI (scan with authenticator app):", otpUri);
  console.log("Current TOTP code:", authenticator.generate(adminSecret));
  console.log("Demo password for all users:", DEMO_PASSWORD);
  console.log("=======================\n");

  // ---------- SAMPLE JOB ----------
  await db.job.upsert({
    where: { id: "demo-job-1" },
    update: {},
    create: {
      id: "demo-job-1",
      employerId: employer.id,
      title: "Senior Frontend Engineer",
      company: "Northwind Technologies",
      companyLogo: "NW",
      location: "Lagos, Nigeria",
      remote: "hybrid",
      type: "full-time",
      category: "Engineering",
      salaryMin: 6500,
      salaryMax: 9500,
      currency: "USD",
      salaryPeriod: "month",
      description:
        "Lead the next generation of our customer-facing analytics suite. You will partner with product and design to ship fast, accessible interfaces used by 40k+ daily active users across Sub-Saharan Africa.",
      status: "published",
    },
  });

  // ---------- SAMPLE AUDIT LOG ----------
  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "Seeded database",
      target: "Initial seed",
      type: "admin",
      ip: "127.0.0.1",
      status: "success",
    },
  });

  console.log("Seed complete. 3 users created (seeker, employer, admin).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
