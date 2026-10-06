// Domain types for the SkillMatch AI platform

export type Role = "guest" | "seeker" | "employer" | "admin";

export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type VerificationStatus = "verified" | "pending" | "unverified";

export type ApplicationStatus =
  | "submitted"
  | "screening"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type JobStatus = "draft" | "published" | "closed" | "paused";

export type MatchFactorKey =
  | "skill_match"
  | "required_skill_match"
  | "proficiency_match"
  | "experience_match"
  | "education_match"
  | "verified_skills";

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: ProficiencyLevel;
  verified: VerificationStatus;
  yearsOfExperience?: number;
}

export interface SkillRequirement {
  id: string;
  name: string;
  category: string;
  proficiency: ProficiencyLevel;
  mandatory: boolean;
  weight: number; // 0..1
}

export interface MatchFactor {
  key: MatchFactorKey;
  label: string;
  score: number; // 0..100
  weight: number; // 0..1
  description: string;
}

export interface JobMatchExplanation {
  overall: number; // 0..100
  factors: MatchFactor[];
  matchingSkills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  missingSkills: { name: string; requiredProficiency: ProficiencyLevel; mandatory: boolean }[];
  recommendedSkills: string[];
  rationale: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  verified: boolean;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string; // or "Present"
  description: string;
  current: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: "onsite" | "hybrid" | "remote";
  type: "full-time" | "part-time" | "contract" | "internship";
  category: string;
  salary: { min: number; max: number; currency: string; period: "year" | "month" | "hour" };
  postedAt: string;
  status: JobStatus;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: SkillRequirement[];
  applicants: number;
  views: number;
  matchScore?: number;
  matchExplanation?: JobMatchExplanation;
  isSaved?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  title: string;
  location: string;
  experienceYears: number;
  education: string;
  topSkills: { name: string; proficiency: ProficiencyLevel; verified: boolean }[];
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  verifiedSkills: number;
  applicationStatus: ApplicationStatus;
  appliedAt: string;
  contactUnlocked: boolean;
  avatarColor: string;
}

export interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    location: string;
  };
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  nextStep?: { label: string; date: string; type: "interview" | "task" | "decision" };
  timeline: { status: ApplicationStatus; date: string; note: string }[];
}

export interface NotificationItem {
  id: string;
  type: "application" | "message" | "interview" | "system" | "match";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

export interface ConversationMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantInitials: string;
  participantColor: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ConversationMessage[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
  lastActive: string;
  avatarColor: string;
  company?: string;
  title?: string;
  initials?: string;
}

export interface SkillOntologyItem {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  related: string[];
  proficiencyDistribution: { beginner: number; intermediate: number; advanced: number; expert: number };
  usageCount: number;
  verifiedCount: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  type: "auth" | "job" | "application" | "ai" | "admin" | "message";
  time: string;
  ip: string;
  status: "success" | "warning" | "error";
}

export interface SkillGapItem {
  skill: string;
  requiredProficiency: ProficiencyLevel;
  currentProficiency: ProficiencyLevel | null;
  gap: number; // 0..3 (level difference)
  jobsAvailable: number;
  recommendedResources: { title: string; provider: string; duration: string; type: string }[];
}
