import type {
  Job,
  Candidate,
  Application,
  NotificationItem,
  Conversation,
  AdminUser,
  SkillOntologyItem,
  ActivityLog,
  SkillGapItem,
  Skill,
  Education,
  Experience,
  MatchFactor,
} from "./types";

// ============================================================
// AUTH / SESSION
// ============================================================
export const currentUser = {
  seeker: {
    name: "Amara Okafor",
    initials: "AO",
    title: "Senior Frontend Engineer",
    email: "amara.okafor@gmail.com",
    location: "Nairobi, Kenya",
    phone: "+254 712 345 678",
    avatarColor: "oklch(0.55 0.22 285)",
    joinedAt: "2024-08-12",
    profileCompletion: 78,
  },
  employer: {
    name: "David Chen",
    initials: "DC",
    title: "Talent Acquisition Lead",
    email: "d.chen@northwind.tech",
    company: "Northwind Technologies",
    companyLogo: "NW",
    avatarColor: "oklch(0.6 0.18 240)",
    location: "Lagos, Nigeria",
    joinedAt: "2024-06-22",
  },
  admin: {
    name: "Priya Sharma",
    initials: "PS",
    title: "Platform Administrator",
    email: "priya@skillmatch.ai",
    avatarColor: "oklch(0.65 0.2 330)",
    joinedAt: "2024-01-15",
  },
};

// ============================================================
// SEEKER PROFILE
// ============================================================
export const seekerSkills: Skill[] = [
  { id: "s1", name: "React", category: "Frontend", proficiency: "expert", verified: "verified", yearsOfExperience: 6 },
  { id: "s2", name: "TypeScript", category: "Languages", proficiency: "advanced", verified: "verified", yearsOfExperience: 5 },
  { id: "s3", name: "Next.js", category: "Frontend", proficiency: "advanced", verified: "pending", yearsOfExperience: 4 },
  { id: "s4", name: "Tailwind CSS", category: "Styling", proficiency: "advanced", verified: "verified", yearsOfExperience: 4 },
  { id: "s5", name: "Node.js", category: "Backend", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 3 },
  { id: "s6", name: "GraphQL", category: "API", proficiency: "intermediate", verified: "unverified", yearsOfExperience: 2 },
  { id: "s7", name: "Jest", category: "Testing", proficiency: "intermediate", verified: "verified", yearsOfExperience: 3 },
  { id: "s8", name: "Figma", category: "Design", proficiency: "beginner", verified: "unverified", yearsOfExperience: 1 },
  { id: "s9", name: "PostgreSQL", category: "Database", proficiency: "intermediate", verified: "pending", yearsOfExperience: 2 },
];

export const seekerEducation: Education[] = [
  {
    id: "e1",
    institution: "University of Nairobi",
    degree: "B.Sc.",
    field: "Computer Science",
    startDate: "2014-09",
    endDate: "2018-06",
    verified: true,
  },
  {
    id: "e2",
    institution: "ALX Africa",
    degree: "Diploma",
    field: "Software Engineering",
    startDate: "2020-01",
    endDate: "2020-12",
    verified: false,
  },
];

export const seekerExperience: Experience[] = [
  {
    id: "ex1",
    company: "Twiga Foods",
    title: "Senior Frontend Engineer",
    startDate: "2022-03",
    endDate: "Present",
    description: "Led the frontend rewrite from Vue to React/Next.js, improving Lighthouse scores by 47%. Mentored 4 junior engineers and established a design-system practice now used across 6 product teams.",
    current: true,
  },
  {
    id: "ex2",
    company: "Safaricom PLC",
    title: "Frontend Engineer",
    startDate: "2019-07",
    endDate: "2022-02",
    description: "Built customer-facing dashboards for the M-Pesa merchant portal serving 1.2M monthly users. Owned the component library migration to a typed system.",
    current: false,
  },
  {
    id: "ex3",
    company: "Andela",
    title: "Junior Developer",
    startDate: "2018-07",
    endDate: "2019-06",
    description: "Contributed to multiple partner teams across fintech and edtech. Completed the Andela fellowship with distinction.",
    current: false,
  },
];

// ============================================================
// JOBS
// ============================================================
const buildFactors = (overrides: Partial<Record<string, Partial<MatchFactor>>>): MatchFactor[] => {
  const base: MatchFactor[] = [
    { key: "skill_match", label: "Overall skill match", score: 0, weight: 0.25, description: "How well your combined skills overlap with the job's required and preferred skill set." },
    { key: "required_skill_match", label: "Required skill match", score: 0, weight: 0.30, description: "Coverage of mandatory skills explicitly required by the employer." },
    { key: "proficiency_match", label: "Proficiency match", score: 0, weight: 0.15, description: "How closely your proficiency level on each matched skill meets the requested level." },
    { key: "experience_match", label: "Experience match", score: 0, weight: 0.15, description: "Years and seniority of relevant experience against the role's expectations." },
    { key: "education_match", label: "Education match", score: 0, weight: 0.10, description: "Whether your highest verified education meets the role's stated education threshold." },
    { key: "verified_skills", label: "Verified skills", score: 0, weight: 0.05, description: "Share of the matched skills that have been independently verified (assessment, certificate, or employer-attested)." },
  ];
  return base.map((f) => (overrides[f.key] ? { ...f, ...overrides[f.key] } : f));
};

const overall = (factors: MatchFactor[]) =>
  Math.round(factors.reduce((acc, f) => acc + f.score * f.weight, 0));

export const recommendedJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    company: "Northwind Technologies",
    companyLogo: "NW",
    location: "Lagos, Nigeria",
    remote: "hybrid",
    type: "full-time",
    category: "Engineering",
    salary: { min: 6500, max: 9500, currency: "USD", period: "month" },
    postedAt: "2026-10-01",
    status: "published",
    description:
      "Lead the next generation of our customer-facing analytics suite. You will partner with product and design to ship fast, accessible interfaces used by 40k+ daily active users across Sub-Saharan Africa.",
    requirements: [
      "5+ years of professional frontend experience",
      "Deep expertise in React and TypeScript",
      "Experience with Next.js SSR/ISR",
      "Strong understanding of accessibility (WCAG 2.1 AA)",
    ],
    responsibilities: [
      "Architect and ship product features end-to-end",
      "Own design-system contribution and governance",
      "Drive performance budget and Core Web Vitals",
      "Mentor mid-level engineers",
    ],
    skills: [
      { id: "r1", name: "React", category: "Frontend", proficiency: "expert", mandatory: true, weight: 0.9 },
      { id: "r2", name: "TypeScript", category: "Languages", proficiency: "advanced", mandatory: true, weight: 0.85 },
      { id: "r3", name: "Next.js", category: "Frontend", proficiency: "advanced", mandatory: true, weight: 0.8 },
      { id: "r4", name: "Tailwind CSS", category: "Styling", proficiency: "advanced", mandatory: false, weight: 0.6 },
      { id: "r5", name: "Node.js", category: "Backend", proficiency: "intermediate", mandatory: false, weight: 0.4 },
      { id: "r6", name: "GraphQL", category: "API", proficiency: "intermediate", mandatory: false, weight: 0.3 },
      { id: "r7", name: "AWS", category: "Cloud", proficiency: "intermediate", mandatory: false, weight: 0.25 },
    ],
    applicants: 47,
    views: 312,
    isSaved: false,
  },
  {
    id: "j2",
    title: "Frontend Engineer, Design Systems",
    company: "Cellulant Group",
    companyLogo: "CG",
    location: "Remote — Africa",
    remote: "remote",
    type: "full-time",
    category: "Engineering",
    salary: { min: 4500, max: 7000, currency: "USD", period: "month" },
    postedAt: "2026-09-26",
    status: "published",
    description:
      "Own the design system powering 12+ Cellulant products. You will translate brand and accessibility guidelines into reusable, typed components and partner with engineers across squads.",
    requirements: [
      "4+ years frontend experience",
      "Strong React and TypeScript skills",
      "Experience building or maintaining a design system",
      "Familiarity with Storybook and visual regression testing",
    ],
    responsibilities: [
      "Maintain and evolve the component library",
      "Drive accessibility audits and remediation",
      "Document patterns and contribution workflow",
      "Partner with product designers on tokens",
    ],
    skills: [
      { id: "r1", name: "React", category: "Frontend", proficiency: "advanced", mandatory: true, weight: 0.85 },
      { id: "r2", name: "TypeScript", category: "Languages", proficiency: "advanced", mandatory: true, weight: 0.8 },
      { id: "r3", name: "Tailwind CSS", category: "Styling", proficiency: "advanced", mandatory: true, weight: 0.7 },
      { id: "r4", name: "Storybook", category: "Tooling", proficiency: "intermediate", mandatory: true, weight: 0.6 },
      { id: "r5", name: "Figma", category: "Design", proficiency: "intermediate", mandatory: false, weight: 0.4 },
    ],
    applicants: 38,
    views: 201,
    isSaved: true,
  },
  {
    id: "j3",
    title: "Full-Stack Engineer (Node + React)",
    company: "Kuda Microfinance",
    companyLogo: "KD",
    location: "Abuja, Nigeria",
    remote: "hybrid",
    type: "full-time",
    category: "Engineering",
    salary: { min: 5000, max: 7500, currency: "USD", period: "month" },
    postedAt: "2026-09-20",
    status: "published",
    description:
      "Build the next generation of Kuda's SMB lending platform. You will work across the full stack to ship resilient financial products.",
    requirements: [
      "4+ years of full-stack experience",
      "Production Node.js and PostgreSQL experience",
      "React + TypeScript on the frontend",
      "Comfortable with event-driven architectures",
    ],
    responsibilities: [
      "Design and ship product features end-to-end",
      "Own service reliability and observability",
      "Collaborate with risk and compliance teams",
    ],
    skills: [
      { id: "r1", name: "React", category: "Frontend", proficiency: "advanced", mandatory: true, weight: 0.8 },
      { id: "r2", name: "Node.js", category: "Backend", proficiency: "advanced", mandatory: true, weight: 0.85 },
      { id: "r3", name: "PostgreSQL", category: "Database", proficiency: "advanced", mandatory: true, weight: 0.8 },
      { id: "r4", name: "TypeScript", category: "Languages", proficiency: "advanced", mandatory: true, weight: 0.75 },
      { id: "r5", name: "Docker", category: "DevOps", proficiency: "intermediate", mandatory: false, weight: 0.4 },
      { id: "r6", name: "Redis", category: "Cache", proficiency: "intermediate", mandatory: false, weight: 0.3 },
    ],
    applicants: 61,
    views: 412,
    isSaved: false,
  },
  {
    id: "j4",
    title: "Lead UI Engineer",
    company: "Paystack",
    companyLogo: "PS",
    location: "Remote — Worldwide",
    remote: "remote",
    type: "full-time",
    category: "Engineering",
    salary: { min: 8000, max: 12000, currency: "USD", period: "month" },
    postedAt: "2026-09-18",
    status: "published",
    description:
      "Lead the UI engineering effort for Paystack's merchant dashboard and checkout. Set the bar for performance, accessibility, and craft across the frontend organization.",
    requirements: [
      "7+ years of frontend experience",
      "Track record of leading frontend teams",
      "Deep React/TypeScript expertise",
      "Experience with payments or fintech is a plus",
    ],
    responsibilities: [
      "Set frontend architecture and standards",
      "Lead a team of 5 engineers",
      "Partner with security on PCI compliance",
    ],
    skills: [
      { id: "r1", name: "React", category: "Frontend", proficiency: "expert", mandatory: true, weight: 0.9 },
      { id: "r2", name: "TypeScript", category: "Languages", proficiency: "expert", mandatory: true, weight: 0.85 },
      { id: "r3", name: "Next.js", category: "Frontend", proficiency: "advanced", mandatory: true, weight: 0.75 },
      { id: "r4", name: "Webpack", category: "Tooling", proficiency: "advanced", mandatory: false, weight: 0.4 },
      { id: "r5", name: "Tailwind CSS", category: "Styling", proficiency: "advanced", mandatory: false, weight: 0.4 },
    ],
    applicants: 88,
    views: 624,
    isSaved: false,
  },
];

// Attach computed match explanations
const j1Factors = buildFactors({
  skill_match: { score: 92 },
  required_skill_match: { score: 96 },
  proficiency_match: { score: 88 },
  experience_match: { score: 95 },
  education_match: { score: 90 },
  verified_skills: { score: 80 },
});
recommendedJobs[0].matchScore = overall(j1Factors);
recommendedJobs[0].matchExplanation = {
  overall: overall(j1Factors),
  factors: j1Factors,
  matchingSkills: [
    { name: "React", proficiency: "expert", verified: true },
    { name: "TypeScript", proficiency: "advanced", verified: true },
    { name: "Next.js", proficiency: "advanced", verified: false },
    { name: "Tailwind CSS", proficiency: "advanced", verified: true },
    { name: "Node.js", proficiency: "intermediate", verified: false },
    { name: "GraphQL", proficiency: "intermediate", verified: false },
  ],
  missingSkills: [
    { name: "AWS", requiredProficiency: "intermediate", mandatory: false },
  ],
  recommendedSkills: ["AWS (EC2, S3, IAM basics)", "Storybook for component governance"],
  rationale:
    "You meet every mandatory skill at or above the requested proficiency, with 4 verified skills and 6+ years of directly relevant experience. The only gap is one preferred cloud skill, which the employer has marked as optional.",
};

const j2Factors = buildFactors({
  skill_match: { score: 84 },
  required_skill_match: { score: 80 },
  proficiency_match: { score: 86 },
  experience_match: { score: 90 },
  education_match: { score: 90 },
  verified_skills: { score: 75 },
});
recommendedJobs[1].matchScore = overall(j2Factors);
recommendedJobs[1].matchExplanation = {
  overall: overall(j2Factors),
  factors: j2Factors,
  matchingSkills: [
    { name: "React", proficiency: "expert", verified: true },
    { name: "TypeScript", proficiency: "advanced", verified: true },
    { name: "Tailwind CSS", proficiency: "advanced", verified: true },
    { name: "Figma", proficiency: "beginner", verified: false },
  ],
  missingSkills: [
    { name: "Storybook", requiredProficiency: "intermediate", mandatory: true },
  ],
  recommendedSkills: ["Storybook (1–2 day crash course)", "Visual regression testing with Chromatic"],
  rationale:
    "You cover 4 of 5 required skills, including the 3 mandatory ones. The Storybook requirement is mandatory and is your single blocker — picking it up will raise your match score into the 90s.",
};

const j3Factors = buildFactors({
  skill_match: { score: 70 },
  required_skill_match: { score: 65 },
  proficiency_match: { score: 62 },
  experience_match: { score: 78 },
  education_match: { score: 90 },
  verified_skills: { score: 50 },
});
recommendedJobs[2].matchScore = overall(j3Factors);
recommendedJobs[2].matchExplanation = {
  overall: overall(j3Factors),
  factors: j3Factors,
  matchingSkills: [
    { name: "React", proficiency: "expert", verified: true },
    { name: "TypeScript", proficiency: "advanced", verified: true },
    { name: "Node.js", proficiency: "intermediate", verified: false },
    { name: "PostgreSQL", proficiency: "intermediate", verified: false },
  ],
  missingSkills: [
    { name: "Docker", requiredProficiency: "intermediate", mandatory: false },
    { name: "Redis", requiredProficiency: "intermediate", mandatory: false },
  ],
  recommendedSkills: ["Docker fundamentals", "Redis caching patterns", "Deepen Node.js to advanced"],
  rationale:
    "You meet all mandatory skills but your proficiency on the backend mandatory skills (Node.js, PostgreSQL) is below the requested advanced level. Advancing both to advanced would lift your overall match into the high 80s.",
};

const j4Factors = buildFactors({
  skill_match: { score: 88 },
  required_skill_match: { score: 95 },
  proficiency_match: { score: 92 },
  experience_match: { score: 88 },
  education_match: { score: 90 },
  verified_skills: { score: 80 },
});
recommendedJobs[3].matchScore = overall(j4Factors);
recommendedJobs[3].matchExplanation = {
  overall: overall(j4Factors),
  factors: j4Factors,
  matchingSkills: [
    { name: "React", proficiency: "expert", verified: true },
    { name: "TypeScript", proficiency: "advanced", verified: true },
    { name: "Next.js", proficiency: "advanced", verified: false },
    { name: "Tailwind CSS", proficiency: "advanced", verified: true },
  ],
  missingSkills: [
    { name: "Webpack", requiredProficiency: "advanced", mandatory: false },
  ],
  recommendedSkills: ["Webpack 5 advanced configuration", "Frontend team leadership reading"],
  rationale:
    "Strong match on every mandatory skill at expert/advanced level. The preferred Webpack skill is optional; your existing build-tooling experience counts as partial coverage.",
};

// ============================================================
// PUBLIC JOB LISTINGS (for guest view)
// ============================================================
export const publicJobs: Job[] = [
  recommendedJobs[0],
  recommendedJobs[1],
  recommendedJobs[2],
  recommendedJobs[3],
  {
    id: "p5",
    title: "Product Designer",
    company: "Yellow Card",
    companyLogo: "YC",
    location: "Cape Town, South Africa",
    remote: "hybrid",
    type: "full-time",
    category: "Design",
    salary: { min: 4000, max: 6000, currency: "USD", period: "month" },
    postedAt: "2026-09-29",
    status: "published",
    description: "Drive product design for the leading African crypto exchange. You'll partner with research and engineering to ship experiences used by 200k+ customers.",
    requirements: ["4+ years product design", "Strong Figma skills", "Experience with design systems"],
    responsibilities: ["Own end-to-end design for product areas", "Conduct usability research", "Maintain design system"],
    skills: [
      { id: "d1", name: "Figma", category: "Design", proficiency: "expert", mandatory: true, weight: 0.85 },
      { id: "d2", name: "User Research", category: "Research", proficiency: "advanced", mandatory: false, weight: 0.5 },
    ],
    applicants: 53,
    views: 287,
  },
];

// ============================================================
// SEEKER APPLICATIONS
// ============================================================
export const seekerApplications: Application[] = [
  {
    id: "a1",
    job: { id: "j1", title: "Senior Frontend Engineer", company: "Northwind Technologies", companyLogo: "NW", location: "Lagos, Nigeria" },
    status: "interview",
    appliedAt: "2026-09-28",
    updatedAt: "2026-10-04",
    matchScore: 92,
    nextStep: { label: "Technical Interview", date: "2026-10-09 14:00 EAT", type: "interview" },
    timeline: [
      { status: "submitted", date: "2026-09-28", note: "Application submitted with tailored resume." },
      { status: "screening", date: "2026-09-29", note: "AI match score reviewed by recruiter." },
      { status: "shortlisted", date: "2026-10-01", note: "Shortlisted — moved to technical screen." },
      { status: "interview", date: "2026-10-04", note: "Technical interview scheduled for Oct 9." },
    ],
  },
  {
    id: "a2",
    job: { id: "j2", title: "Frontend Engineer, Design Systems", company: "Cellulant Group", companyLogo: "CG", location: "Remote — Africa" },
    status: "screening",
    appliedAt: "2026-09-27",
    updatedAt: "2026-09-30",
    matchScore: 84,
    nextStep: { label: "Recruiter call", date: "Awaiting scheduling", type: "decision" },
    timeline: [
      { status: "submitted", date: "2026-09-27", note: "Application submitted." },
      { status: "screening", date: "2026-09-30", note: "In recruiter screening queue." },
    ],
  },
  {
    id: "a3",
    job: { id: "j3", title: "Full-Stack Engineer", company: "Kuda Microfinance", companyLogo: "KD", location: "Abuja, Nigeria" },
    status: "shortlisted",
    appliedAt: "2026-09-22",
    updatedAt: "2026-09-28",
    matchScore: 70,
    nextStep: { label: "Hiring manager review", date: "2026-10-07", type: "decision" },
    timeline: [
      { status: "submitted", date: "2026-09-22", note: "Application submitted." },
      { status: "screening", date: "2026-09-25", note: "Resume reviewed." },
      { status: "shortlisted", date: "2026-09-28", note: "Moved to hiring manager review." },
    ],
  },
  {
    id: "a4",
    job: { id: "j4", title: "Lead UI Engineer", company: "Paystack", companyLogo: "PS", location: "Remote — Worldwide" },
    status: "rejected",
    appliedAt: "2026-09-15",
    updatedAt: "2026-09-24",
    matchScore: 88,
    timeline: [
      { status: "submitted", date: "2026-09-15", note: "Application submitted." },
      { status: "screening", date: "2026-09-18", note: "Resume reviewed." },
      { status: "rejected", date: "2026-09-24", note: "Role was filled internally. Recruiter encouraged re-applying for similar roles." },
    ],
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const seekerNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "interview",
    title: "Technical interview scheduled",
    message: "Northwind Technologies scheduled your technical interview for Oct 9, 14:00 EAT.",
    time: "2 hours ago",
    read: false,
    actionLabel: "View details",
  },
  {
    id: "n2",
    type: "match",
    title: "New high-match job: Lead UI Engineer at Paystack",
    message: "Your match score is 88%. This role closes in 5 days.",
    time: "Yesterday",
    read: false,
    actionLabel: "View job",
  },
  {
    id: "n3",
    type: "application",
    title: "Application status update",
    message: "Kuda Microfinance moved your application to Shortlisted.",
    time: "2 days ago",
    read: true,
    actionLabel: "View application",
  },
  {
    id: "n4",
    type: "message",
    title: "New message from Northwind Recruiter",
    message: "\"Hi Amara, looking forward to the technical interview...\"",
    time: "3 days ago",
    read: true,
    actionLabel: "Read message",
  },
  {
    id: "n5",
    type: "system",
    title: "Resume re-analysis complete",
    message: "We re-processed your resume. 2 new skills detected and added to your profile as pending verification.",
    time: "5 days ago",
    read: true,
  },
];

// ============================================================
// CONVERSATIONS (messages)
// ============================================================
export const seekerConversations: Conversation[] = [
  {
    id: "c1",
    participantName: "Northwind Recruiter",
    participantRole: "Talent Acquisition · Northwind",
    participantInitials: "NW",
    participantColor: "oklch(0.6 0.18 240)",
    lastMessage: "Looking forward to the technical interview on Thursday!",
    lastTime: "2h",
    unread: 2,
    messages: [
      { id: "m1", sender: "them", text: "Hi Amara, thanks for applying to Northwind. Your match score is one of the strongest in our pipeline.", time: "10:21" },
      { id: "m2", sender: "me", text: "Thank you! Really excited about the role and the work your team is doing on the analytics suite.", time: "10:35" },
      { id: "m3", sender: "them", text: "We'd love to move forward with a technical interview. Are you available Thursday afternoon?", time: "10:42" },
      { id: "m4", sender: "me", text: "Thursday 14:00 EAT works perfectly for me.", time: "10:50" },
      { id: "m5", sender: "them", text: "Booked. You'll receive a calendar invite with a Zoom link shortly.", time: "11:02" },
      { id: "m6", sender: "them", text: "Looking forward to the technical interview on Thursday!", time: "11:03" },
    ],
  },
  {
    id: "c2",
    participantName: "Cellulant HR",
    participantRole: "HR · Cellulant Group",
    participantInitials: "CG",
    participantColor: "oklch(0.65 0.18 152)",
    lastMessage: "We're reviewing your application and will be in touch next week.",
    lastTime: "1d",
    unread: 0,
    messages: [
      { id: "m1", sender: "them", text: "Hi Amara, thanks for your interest in the design systems role.", time: "Yesterday 14:10" },
      { id: "m2", sender: "me", text: "Thanks! Happy to share more about my design-system work at Twiga if helpful.", time: "Yesterday 14:30" },
      { id: "m3", sender: "them", text: "We're reviewing your application and will be in touch next week.", time: "Yesterday 16:00" },
    ],
  },
];

// ============================================================
// SKILL GAP ANALYSIS
// ============================================================
export const skillGapAnalysis: SkillGapItem[] = [
  {
    skill: "AWS",
    requiredProficiency: "intermediate",
    currentProficiency: null,
    gap: 3,
    jobsAvailable: 18,
    recommendedResources: [
      { title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", duration: "6h", type: "Course" },
      { title: "AWS for Frontend Engineers", provider: "Frontend Masters", duration: "4h", type: "Course" },
    ],
  },
  {
    skill: "Storybook",
    requiredProficiency: "intermediate",
    currentProficiency: null,
    gap: 3,
    jobsAvailable: 12,
    recommendedResources: [
      { title: "Storybook official tutorial", provider: "storybook.js.org", duration: "3h", type: "Tutorial" },
      { title: "Component-Driven Development", provider: "Chromatic Learn", duration: "5h", type: "Course" },
    ],
  },
  {
    skill: "Node.js",
    requiredProficiency: "advanced",
    currentProficiency: "intermediate",
    gap: 1,
    jobsAvailable: 26,
    recommendedResources: [
      { title: "Node.js: Advanced Concepts", provider: "Udemy", duration: "22h", type: "Course" },
      { title: "Production-Grade Node.js", provider: "Frontend Masters", duration: "8h", type: "Course" },
    ],
  },
  {
    skill: "PostgreSQL",
    requiredProficiency: "advanced",
    currentProficiency: "intermediate",
    gap: 1,
    jobsAvailable: 22,
    recommendedResources: [
      { title: "PostgreSQL for Developers", provider: "PG Exercises", duration: "10h", type: "Practice" },
      { title: "Advanced SQL Patterns", provider: "DataCamp", duration: "6h", type: "Course" },
    ],
  },
  {
    skill: "Docker",
    requiredProficiency: "intermediate",
    currentProficiency: null,
    gap: 3,
    jobsAvailable: 15,
    recommendedResources: [
      { title: "Docker for Developers", provider: "KodeKloud", duration: "5h", type: "Course" },
    ],
  },
];

// ============================================================
// EMPLOYER DASHBOARD
// ============================================================
export const employerJobs: Job[] = [
  {
    ...recommendedJobs[0],
    applicants: 47,
    views: 312,
  },
  {
    id: "ej2",
    title: "Backend Engineer (Go)",
    company: "Northwind Technologies",
    companyLogo: "NW",
    location: "Lagos, Nigeria",
    remote: "hybrid",
    type: "full-time",
    category: "Engineering",
    salary: { min: 5500, max: 8000, currency: "USD", period: "month" },
    postedAt: "2026-09-12",
    status: "published",
    description: "Build scalable backend services in Go for our analytics platform.",
    requirements: ["4+ years backend", "Production Go experience", "Postgres + Kafka"],
    responsibilities: ["Design and ship services", "Own reliability"],
    skills: [
      { id: "b1", name: "Go", category: "Languages", proficiency: "advanced", mandatory: true, weight: 0.9 },
      { id: "b2", name: "PostgreSQL", category: "Database", proficiency: "advanced", mandatory: true, weight: 0.8 },
      { id: "b3", name: "Kafka", category: "Messaging", proficiency: "intermediate", mandatory: false, weight: 0.5 },
    ],
    applicants: 34,
    views: 218,
  },
  {
    id: "ej3",
    title: "Product Manager, Growth",
    company: "Northwind Technologies",
    companyLogo: "NW",
    location: "Lagos, Nigeria",
    remote: "hybrid",
    type: "full-time",
    category: "Product",
    salary: { min: 6000, max: 9000, currency: "USD", period: "month" },
    postedAt: "2026-10-04",
    status: "draft",
    description: "Drive growth experiments across our analytics products.",
    requirements: ["5+ years PM experience", "Strong experimentation background"],
    responsibilities: ["Own growth roadmap", "Run experiments"],
    skills: [
      { id: "p1", name: "Product Strategy", category: "Product", proficiency: "expert", mandatory: true, weight: 0.9 },
      { id: "p2", name: "A/B Testing", category: "Analytics", proficiency: "advanced", mandatory: true, weight: 0.7 },
    ],
    applicants: 0,
    views: 0,
  },
  {
    id: "ej4",
    title: "Data Engineer",
    company: "Northwind Technologies",
    companyLogo: "NW",
    location: "Remote — Africa",
    remote: "remote",
    type: "full-time",
    category: "Data",
    salary: { min: 5000, max: 7500, currency: "USD", period: "month" },
    postedAt: "2026-08-30",
    status: "closed",
    description: "Build and operate our data warehouse and ETL pipelines.",
    requirements: ["4+ years data engineering", "Strong SQL + Python", "Airflow experience"],
    responsibilities: ["Own data warehouse", "Build pipelines"],
    skills: [
      { id: "de1", name: "Python", category: "Languages", proficiency: "advanced", mandatory: true, weight: 0.85 },
      { id: "de2", name: "Airflow", category: "Orchestration", proficiency: "intermediate", mandatory: true, weight: 0.7 },
    ],
    applicants: 41,
    views: 276,
  },
];

// ============================================================
// CANDIDATES FOR EMPLOYER
// ============================================================
export const candidates: Candidate[] = [
  {
    id: "ca1",
    name: "Amara Okafor",
    initials: "AO",
    title: "Senior Frontend Engineer",
    location: "Nairobi, Kenya",
    experienceYears: 6,
    education: "B.Sc. Computer Science",
    topSkills: [
      { name: "React", proficiency: "expert", verified: true },
      { name: "TypeScript", proficiency: "advanced", verified: true },
      { name: "Next.js", proficiency: "advanced", verified: false },
      { name: "Tailwind CSS", proficiency: "advanced", verified: true },
    ],
    matchScore: 92,
    matchingSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "GraphQL"],
    missingSkills: ["AWS (optional)"],
    verifiedSkills: 4,
    applicationStatus: "interview",
    appliedAt: "2026-09-28",
    contactUnlocked: true,
    avatarColor: "oklch(0.55 0.22 285)",
  },
  {
    id: "ca2",
    name: "Tunde Bello",
    initials: "TB",
    title: "Frontend Engineer",
    location: "Lagos, Nigeria",
    experienceYears: 5,
    education: "B.Sc. Software Engineering",
    topSkills: [
      { name: "React", proficiency: "advanced", verified: true },
      { name: "TypeScript", proficiency: "advanced", verified: true },
      { name: "Next.js", proficiency: "advanced", verified: true },
      { name: "Tailwind CSS", proficiency: "intermediate", verified: false },
    ],
    matchScore: 86,
    matchingSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    missingSkills: ["AWS (optional)"],
    verifiedSkills: 3,
    applicationStatus: "shortlisted",
    appliedAt: "2026-09-29",
    contactUnlocked: false,
    avatarColor: "oklch(0.6 0.18 240)",
  },
  {
    id: "ca3",
    name: "Fatima Zahra",
    initials: "FZ",
    title: "Full-Stack Developer",
    location: "Casablanca, Morocco",
    experienceYears: 4,
    education: "Engineering degree in CS",
    topSkills: [
      { name: "React", proficiency: "advanced", verified: true },
      { name: "TypeScript", proficiency: "intermediate", verified: false },
      { name: "Next.js", proficiency: "intermediate", verified: false },
      { name: "Node.js", proficiency: "advanced", verified: true },
    ],
    matchScore: 74,
    matchingSkills: ["React", "TypeScript", "Next.js"],
    missingSkills: ["Tailwind CSS proficiency", "AWS (optional)"],
    verifiedSkills: 2,
    applicationStatus: "screening",
    appliedAt: "2026-09-30",
    contactUnlocked: false,
    avatarColor: "oklch(0.65 0.2 330)",
  },
  {
    id: "ca4",
    name: "Kwame Mensah",
    initials: "KM",
    title: "Senior Software Engineer",
    location: "Accra, Ghana",
    experienceYears: 8,
    education: "M.Sc. Computer Science",
    topSkills: [
      { name: "React", proficiency: "expert", verified: true },
      { name: "TypeScript", proficiency: "expert", verified: true },
      { name: "Next.js", proficiency: "advanced", verified: true },
      { name: "Tailwind CSS", proficiency: "advanced", verified: true },
    ],
    matchScore: 81,
    matchingSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    missingSkills: ["GraphQL (preferred)"],
    verifiedSkills: 4,
    applicationStatus: "submitted",
    appliedAt: "2026-10-01",
    contactUnlocked: false,
    avatarColor: "oklch(0.6 0.18 152)",
  },
  {
    id: "ca5",
    name: "Zainab Ibrahim",
    initials: "ZI",
    title: "Frontend Engineer",
    location: "Abuja, Nigeria",
    experienceYears: 3,
    education: "B.Sc. Computer Science",
    topSkills: [
      { name: "React", proficiency: "intermediate", verified: true },
      { name: "TypeScript", proficiency: "intermediate", verified: false },
      { name: "Tailwind CSS", proficiency: "advanced", verified: false },
    ],
    matchScore: 62,
    matchingSkills: ["React", "TypeScript", "Tailwind CSS"],
    missingSkills: ["Next.js", "AWS (optional)"],
    verifiedSkills: 1,
    applicationStatus: "submitted",
    appliedAt: "2026-10-02",
    contactUnlocked: false,
    avatarColor: "oklch(0.7 0.2 75)",
  },
  {
    id: "ca6",
    name: "Lerato Mokoena",
    initials: "LM",
    title: "Frontend Engineer",
    location: "Johannesburg, South Africa",
    experienceYears: 5,
    education: "B.Sc. Information Systems",
    topSkills: [
      { name: "React", proficiency: "advanced", verified: true },
      { name: "TypeScript", proficiency: "advanced", verified: true },
      { name: "Next.js", proficiency: "advanced", verified: false },
    ],
    matchScore: 78,
    matchingSkills: ["React", "TypeScript", "Next.js"],
    missingSkills: ["Tailwind CSS proficiency", "AWS (optional)"],
    verifiedSkills: 2,
    applicationStatus: "shortlisted",
    appliedAt: "2026-09-27",
    contactUnlocked: true,
    avatarColor: "oklch(0.6 0.2 200)",
  },
];

export const employerNotifications: NotificationItem[] = [
  {
    id: "en1",
    type: "application",
    title: "5 new applications for Senior Frontend Engineer",
    message: "2 applicants scored above 85% match. Review them in the candidate ranking.",
    time: "1 hour ago",
    read: false,
    actionLabel: "Review candidates",
  },
  {
    id: "en2",
    type: "interview",
    title: "Interview confirmed with Amara Okafor",
    message: "Technical interview scheduled for Oct 9, 14:00 EAT.",
    time: "3 hours ago",
    read: false,
    actionLabel: "View schedule",
  },
  {
    id: "en3",
    type: "system",
    title: "Job draft auto-saved",
    message: "Your draft \"Product Manager, Growth\" was auto-saved.",
    time: "Yesterday",
    read: true,
  },
];

export const employerConversations: Conversation[] = [
  {
    id: "ec1",
    participantName: "Amara Okafor",
    participantRole: "Candidate · Senior Frontend Engineer",
    participantInitials: "AO",
    participantColor: "oklch(0.55 0.22 285)",
    lastMessage: "Thursday 14:00 EAT works perfectly for me.",
    lastTime: "2h",
    unread: 1,
    messages: [
      { id: "m1", sender: "me", text: "Hi Amara, thanks for applying. Your match score is one of the strongest in our pipeline.", time: "10:21" },
      { id: "m2", sender: "them", text: "Thank you! Really excited about the role and the work your team is doing.", time: "10:35" },
      { id: "m3", sender: "me", text: "We'd love to move forward with a technical interview. Are you available Thursday afternoon?", time: "10:42" },
      { id: "m4", sender: "them", text: "Thursday 14:00 EAT works perfectly for me.", time: "10:50" },
    ],
  },
  {
    id: "ec2",
    participantName: "Tunde Bello",
    participantRole: "Candidate · Frontend Engineer",
    participantInitials: "TB",
    participantColor: "oklch(0.6 0.18 240)",
    lastMessage: "Thanks for the shortlist — looking forward to next steps.",
    lastTime: "1d",
    unread: 0,
    messages: [
      { id: "m1", sender: "me", text: "Hi Tunde, we've shortlisted you and will reach out about next steps shortly.", time: "Yesterday 09:10" },
      { id: "m2", sender: "them", text: "Thanks for the shortlist — looking forward to next steps.", time: "Yesterday 09:30" },
    ],
  },
];

// ============================================================
// ADMIN DATA
// ============================================================
export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Amara Okafor", email: "amara.okafor@gmail.com", role: "seeker", status: "active", joinedAt: "2024-08-12", lastActive: "2 minutes ago", avatarColor: "oklch(0.55 0.22 285)", title: "Senior Frontend Engineer" },
  { id: "u2", name: "David Chen", email: "d.chen@northwind.tech", role: "employer", status: "active", joinedAt: "2024-06-22", lastActive: "10 minutes ago", avatarColor: "oklch(0.6 0.18 240)", company: "Northwind Technologies" },
  { id: "u3", name: "Tunde Bello", email: "tunde.bello@outlook.com", role: "seeker", status: "active", joinedAt: "2024-09-01", lastActive: "1 hour ago", avatarColor: "oklch(0.6 0.18 152)", title: "Frontend Engineer" },
  { id: "u4", name: "Yellow Card", email: "admin@yellowcard.io", role: "employer", status: "pending", joinedAt: "2026-10-02", lastActive: "3 days ago", avatarColor: "oklch(0.7 0.2 75)", company: "Yellow Card" },
  { id: "u5", name: "Fatima Zahra", email: "fatima.z@gmail.com", role: "seeker", status: "active", joinedAt: "2025-01-15", lastActive: "5 hours ago", avatarColor: "oklch(0.65 0.2 330)", title: "Full-Stack Developer" },
  { id: "u6", name: "Paystack", email: "talent@paystack.com", role: "employer", status: "active", joinedAt: "2024-03-12", lastActive: "30 minutes ago", avatarColor: "oklch(0.6 0.2 200)", company: "Paystack" },
  { id: "u7", name: "Kwame Mensah", email: "kwame.m@gmail.com", role: "seeker", status: "suspended", joinedAt: "2024-11-08", lastActive: "2 weeks ago", avatarColor: "oklch(0.6 0.18 240)", title: "Senior Software Engineer" },
  { id: "u8", name: "Cellulant Group", email: "hr@cellulant.com", role: "employer", status: "active", joinedAt: "2024-05-19", lastActive: "1 day ago", avatarColor: "oklch(0.65 0.18 152)", company: "Cellulant Group" },
  { id: "u9", name: "Zainab Ibrahim", email: "zainab.i@yahoo.com", role: "seeker", status: "active", joinedAt: "2025-03-22", lastActive: "4 hours ago", avatarColor: "oklch(0.7 0.2 75)", title: "Frontend Engineer" },
  { id: "u10", name: "Kuda Microfinance", email: "careers@kuda.com", role: "employer", status: "active", joinedAt: "2024-04-03", lastActive: "6 hours ago", avatarColor: "oklch(0.55 0.22 285)", company: "Kuda Microfinance" },
];

export const skillOntology: SkillOntologyItem[] = [
  { id: "so1", name: "React", category: "Frontend", aliases: ["ReactJS", "React.js"], related: ["Next.js", "React Native", "Redux"], proficiencyDistribution: { beginner: 12, intermediate: 38, advanced: 35, expert: 15 }, usageCount: 1247, verifiedCount: 412 },
  { id: "so2", name: "TypeScript", category: "Languages", aliases: ["TS"], related: ["JavaScript", "TypeORM"], proficiencyDistribution: { beginner: 8, intermediate: 32, advanced: 42, expert: 18 }, usageCount: 1102, verifiedCount: 388 },
  { id: "so3", name: "Next.js", category: "Frontend", aliases: ["NextJS", "Next JS"], related: ["React", "Vercel", "Remix"], proficiencyDistribution: { beginner: 18, intermediate: 40, advanced: 30, expert: 12 }, usageCount: 743, verifiedCount: 198 },
  { id: "so4", name: "Node.js", category: "Backend", aliases: ["Node", "NodeJS"], related: ["Express", "NestJS", "Fastify"], proficiencyDistribution: { beginner: 22, intermediate: 45, advanced: 25, expert: 8 }, usageCount: 891, verifiedCount: 244 },
  { id: "so5", name: "PostgreSQL", category: "Database", aliases: ["Postgres", "PG"], related: ["MySQL", "SQLite", "Prisma"], proficiencyDistribution: { beginner: 30, intermediate: 42, advanced: 22, expert: 6 }, usageCount: 624, verifiedCount: 142 },
  { id: "so6", name: "GraphQL", category: "API", aliases: ["GQL"], related: ["Apollo", "Hasura", "REST"], proficiencyDistribution: { beginner: 38, intermediate: 40, advanced: 18, expert: 4 }, usageCount: 388, verifiedCount: 78 },
  { id: "so7", name: "Tailwind CSS", category: "Styling", aliases: ["Tailwind"], related: ["CSS", "PostCSS", "Styled Components"], proficiencyDistribution: { beginner: 24, intermediate: 38, advanced: 28, expert: 10 }, usageCount: 567, verifiedCount: 132 },
  { id: "so8", name: "AWS", category: "Cloud", aliases: ["Amazon Web Services"], related: ["EC2", "S3", "Lambda"], proficiencyDistribution: { beginner: 45, intermediate: 36, advanced: 14, expert: 5 }, usageCount: 712, verifiedCount: 168 },
  { id: "so9", name: "Docker", category: "DevOps", aliases: [], related: ["Kubernetes", "Containerd"], proficiencyDistribution: { beginner: 40, intermediate: 38, advanced: 16, expert: 6 }, usageCount: 524, verifiedCount: 121 },
  { id: "so10", name: "Go", category: "Languages", aliases: ["Golang"], related: ["Rust", "C"], proficiencyDistribution: { beginner: 36, intermediate: 40, advanced: 18, expert: 6 }, usageCount: 412, verifiedCount: 98 },
];

export const activityLogs: ActivityLog[] = [
  { id: "al1", user: "Amara Okafor", action: "Applied to", target: "Senior Frontend Engineer @ Northwind", type: "application", time: "2026-10-04 14:22", ip: "41.90.64.12", status: "success" },
  { id: "al2", user: "David Chen", action: "Published job", target: "Senior Frontend Engineer", type: "job", time: "2026-10-01 09:10", ip: "102.89.34.10", status: "success" },
  { id: "al3", user: "System", action: "AI match computation", target: "Job j1 · 47 candidates", type: "ai", time: "2026-10-01 09:11", ip: "—", status: "success" },
  { id: "al4", user: "Yellow Card", action: "Employer signup", target: "Pending verification", type: "auth", time: "2026-10-02 11:33", ip: "196.21.45.2", status: "warning" },
  { id: "al5", user: "Kwame Mensah", action: "Resume upload failed", target: "corrupted PDF", type: "application", time: "2026-10-03 16:48", ip: "154.122.18.9", status: "error" },
  { id: "al6", user: "Priya Sharma", action: "Updated skill ontology", target: "Added \"Bun\" as alias of JavaScript runtime", type: "admin", time: "2026-10-03 18:02", ip: "10.0.0.4", status: "success" },
  { id: "al7", user: "Cellulant HR", action: "Shortlisted candidate", target: "Tunde Bello", type: "application", time: "2026-10-04 08:15", ip: "102.176.78.4", status: "success" },
  { id: "al8", user: "System", action: "Skill verification batch", target: "128 verifications completed", type: "ai", time: "2026-10-04 02:00", ip: "—", status: "success" },
  { id: "al9", user: "Tunde Bello", action: "Message sent", target: "Conversation with Northwind", type: "message", time: "2026-10-04 09:30", ip: "102.89.34.55", status: "success" },
  { id: "al10", user: "Paystack", action: "Closed job posting", target: "Lead UI Engineer", type: "job", time: "2026-10-03 12:00", ip: "52.214.32.1", status: "warning" },
];

// ============================================================
// AI RESUME ANALYSIS (extracted from uploaded resume)
// ============================================================
export const resumeAnalysis = {
  fileName: "Amara_Okafor_Resume_2026.pdf",
  fileSize: "248 KB",
  uploadedAt: "2026-10-04 11:42",
  processingSteps: [
    { label: "Resume uploaded", status: "complete" as const, detail: "248 KB · PDF" },
    { label: "Document processing & OCR", status: "complete" as const, detail: "12 pages, 4,210 tokens extracted" },
    { label: "Skill extraction (NLP)", status: "complete" as const, detail: "11 raw skills detected" },
    { label: "Skill normalization", status: "complete" as const, detail: "9 skills matched to ontology" },
    { label: "Education parsing", status: "complete" as const, detail: "2 education entries" },
    { label: "Experience parsing", status: "complete" as const, detail: "3 experience entries" },
    { label: "Proficiency inference", status: "complete" as const, detail: "Inferred from years & context" },
    { label: "Verification eligibility", status: "complete" as const, detail: "4 skills flagged for verification" },
  ],
  extractedSkills: [
    { raw: "React.js", normalized: "React", confidence: 0.98, proficiency: "expert" as const, source: "explicit + contextual" },
    { raw: "TypeScript", normalized: "TypeScript", confidence: 0.95, proficiency: "advanced" as const, source: "explicit" },
    { raw: "Next.js", normalized: "Next.js", confidence: 0.92, proficiency: "advanced" as const, source: "explicit" },
    { raw: "Tailwind", normalized: "Tailwind CSS", confidence: 0.9, proficiency: "advanced" as const, source: "explicit + contextual" },
    { raw: "Node", normalized: "Node.js", confidence: 0.88, proficiency: "intermediate" as const, source: "contextual" },
    { raw: "GraphQL", normalized: "GraphQL", confidence: 0.82, proficiency: "intermediate" as const, source: "contextual" },
    { raw: "Jest & RTL", normalized: "Jest", confidence: 0.85, proficiency: "intermediate" as const, source: "explicit" },
    { raw: "Postgres", normalized: "PostgreSQL", confidence: 0.78, proficiency: "intermediate" as const, source: "contextual" },
    { raw: "Figma", normalized: "Figma", confidence: 0.7, proficiency: "beginner" as const, source: "contextual" },
  ],
  extractedEducation: seekerEducation,
  extractedExperience: seekerExperience,
};

// ============================================================
// SEEKER DASHBOARD STATS
// ============================================================
export const seekerDashboardStats = {
  profileCompletion: 78,
  newRecommendations: 4,
  activeApplications: 3,
  interviewsScheduled: 1,
  averageMatchScore: 84,
  unreadNotifications: 2,
};

// ============================================================
// EMPLOYER DASHBOARD STATS
// ============================================================
export const employerDashboardStats = {
  activeJobs: 2,
  totalApplicants: 81,
  shortlisted: 2,
  interviewsThisWeek: 1,
  averageMatchScore: 79,
  pendingActions: 5,
};

// ============================================================
// ADMIN DASHBOARD STATS
// ============================================================
export const adminDashboardStats = {
  totalUsers: 4_872,
  jobSeekers: 3_914,
  employers: 958,
  activeJobs: 1_247,
  totalApplications: 18_421,
  matchComputations: 142_980,
  verifiedSkills: 6_124,
  pendingEmployers: 7,
  systemUptime: 99.97,
};
