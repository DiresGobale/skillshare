// Semantic Skill Ontology — maps raw skill names to canonical forms,
// synonyms, and related skills. Used by the AI matching engine to:
// 1. Normalize extracted skills (e.g. "React.js" → "React")
// 2. Detect semantic matches even when exact strings differ (e.g. "TS" → "TypeScript")
// 3. Identify related skills for skill-gap analysis and recommendations
// 4. Power explainable AI match scores
//
// This is a lightweight in-memory knowledge graph (no external DB needed).
// In production, this would be backed by a vector database or graph DB.

export interface SkillNode {
  canonical: string;       // normalized name, e.g. "React"
  aliases: string[];       // synonyms / alternate spellings, e.g. ["React.js", "ReactJS", "React JS"]
  category: string;        // e.g. "Frontend", "Backend", "DevOps"
  related: string[];       // semantically related canonical skills, e.g. ["Redux", "Next.js", "Vue"]
  description: string;     // short description for explainability
  defaultProficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

// The canonical skill graph
const SKILL_GRAPH: SkillNode[] = [
  // ---- Frontend ----
  { canonical: "React", aliases: ["React.js", "ReactJS", "React JS", "Reactjs"], category: "Frontend", related: ["Redux", "Next.js", "React Native", "TypeScript"], description: "JavaScript library for building user interfaces", defaultProficiency: "intermediate" },
  { canonical: "Vue", aliases: ["Vue.js", "VueJS", "Vue JS", "Vuejs"], category: "Frontend", related: ["Vuex", "Nuxt", "Pinia"], description: "Progressive JavaScript framework", defaultProficiency: "intermediate" },
  { canonical: "Angular", aliases: ["AngularJS", "Angular 2", "ng"], category: "Frontend", related: ["RxJS", "TypeScript", "NgRx"], description: "TypeScript-based web application framework", defaultProficiency: "intermediate" },
  { canonical: "Next.js", aliases: ["Nextjs", "Next JS", "Next"], category: "Frontend", related: ["React", "Vercel", "SSR"], description: "React framework with SSR and SSG", defaultProficiency: "advanced" },
  { canonical: "Svelte", aliases: ["SvelteKit", "Svelte JS"], category: "Frontend", related: ["SvelteKit", "Vite"], description: "Compile-time reactive UI framework", defaultProficiency: "intermediate" },
  { canonical: "Tailwind CSS", aliases: ["Tailwind", "TailwindCSS"], category: "Frontend", related: ["PostCSS", "CSS", "React"], description: "Utility-first CSS framework", defaultProficiency: "intermediate" },
  { canonical: "CSS", aliases: ["CSS3", "Cascading Style Sheets"], category: "Frontend", related: ["Tailwind CSS", "SASS", "HTML"], description: "Styling language for web pages", defaultProficiency: "intermediate" },
  { canonical: "HTML", aliases: ["HTML5", "HyperText Markup Language"], category: "Frontend", related: ["CSS", "JavaScript"], description: "Markup language for web pages", defaultProficiency: "intermediate" },
  { canonical: "SASS", aliases: ["SCSS", "Sass"], category: "Frontend", related: ["CSS", "Tailwind CSS"], description: "CSS preprocessor", defaultProficiency: "intermediate" },
  { canonical: "Redux", aliases: ["Redux.js", "Redux Toolkit", "RTK"], category: "Frontend", related: ["React", "Vuex", "State Management"], description: "Predictable state container for JavaScript apps", defaultProficiency: "intermediate" },

  // ---- Languages ----
  { canonical: "JavaScript", aliases: ["JS", "ECMAScript", "ES6", "ES2015", "Vanilla JS"], category: "Languages", related: ["TypeScript", "Node.js", "React"], description: "High-level programming language for web", defaultProficiency: "intermediate" },
  { canonical: "TypeScript", aliases: ["TS", "Typescript"], category: "Languages", related: ["JavaScript", "React", "Angular", "Node.js"], description: "Typed superset of JavaScript", defaultProficiency: "intermediate" },
  { canonical: "Python", aliases: ["Python3", "py", "Python 3"], category: "Languages", related: ["Django", "Flask", "FastAPI", "Pandas", "NumPy"], description: "High-level programming language", defaultProficiency: "intermediate" },
  { canonical: "Go", aliases: ["Golang", "Go lang"], category: "Languages", related: ["Docker", "Kubernetes", "Microservices"], description: "Statically typed compiled language by Google", defaultProficiency: "intermediate" },
  { canonical: "Java", aliases: ["Java SE", "Java EE", "J2EE"], category: "Languages", related: ["Spring", "Spring Boot", "Maven", "Gradle"], description: "Object-oriented programming language", defaultProficiency: "intermediate" },
  { canonical: "C#", aliases: ["CSharp", "C Sharp", ".NET", "DotNet"], category: "Languages", related: [".NET Core", "ASP.NET", "Xamarin"], description: "Object-oriented language for .NET", defaultProficiency: "intermediate" },
  { canonical: "PHP", aliases: ["PHP8", "Laravel PHP"], category: "Languages", related: ["Laravel", "Symfony", "WordPress"], description: "Server-side scripting language", defaultProficiency: "intermediate" },
  { canonical: "Ruby", aliases: ["Ruby on Rails", "Rails", "RoR"], category: "Languages", related: ["Rails", "Sinatra"], description: "Dynamic programming language", defaultProficiency: "intermediate" },
  { canonical: "Rust", aliases: ["Rustlang"], category: "Languages", related: ["WebAssembly", "Systems Programming"], description: "Systems programming language focused on safety", defaultProficiency: "advanced" },
  { canonical: "Kotlin", aliases: ["Kotlinlang"], category: "Languages", related: ["Java", "Android", "Spring"], description: "Modern JVM language", defaultProficiency: "intermediate" },
  { canonical: "Swift", aliases: ["SwiftLang"], category: "Languages", related: ["iOS", "Objective-C", "Xcode"], description: "Programming language for Apple platforms", defaultProficiency: "intermediate" },
  { canonical: "SQL", aliases: ["MySQL", "PostgreSQL", "T-SQL", "PL/SQL", "Structured Query Language"], category: "Languages", related: ["PostgreSQL", "MySQL", "Database", "Database Design"], description: "Query language for relational databases", defaultProficiency: "intermediate" },

  // ---- Backend ----
  { canonical: "Node.js", aliases: ["Node", "NodeJS", "Node js", "Express"], category: "Backend", related: ["JavaScript", "Express", "NestJS", "TypeScript"], description: "JavaScript runtime for server-side development", defaultProficiency: "intermediate" },
  { canonical: "Express", aliases: ["Express.js", "ExpressJS"], category: "Backend", related: ["Node.js", "JavaScript"], description: "Web application framework for Node.js", defaultProficiency: "intermediate" },
  { canonical: "NestJS", aliases: ["Nest", "Nest.js"], category: "Backend", related: ["Node.js", "TypeScript", "Express"], description: "Progressive Node.js framework", defaultProficiency: "advanced" },
  { canonical: "Django", aliases: ["Django REST", "Django Framework"], category: "Backend", related: ["Python", "Flask", "REST API"], description: "Python web framework", defaultProficiency: "intermediate" },
  { canonical: "Flask", aliases: ["Flask Framework"], category: "Backend", related: ["Python", "Django"], description: "Lightweight Python web framework", defaultProficiency: "intermediate" },
  { canonical: "FastAPI", aliases: ["Fast API", "Fastapi"], category: "Backend", related: ["Python", "Pydantic", "Async"], description: "Modern Python web framework", defaultProficiency: "advanced" },
  { canonical: "Spring Boot", aliases: ["Spring", "SpringBoot", "Spring Framework"], category: "Backend", related: ["Java", "Maven", "Microservices"], description: "Java application framework", defaultProficiency: "advanced" },
  { canonical: "GraphQL", aliases: ["GQL", "Apollo GraphQL"], category: "Backend", related: ["Apollo", "REST API", "TypeScript"], description: "Query language for APIs", defaultProficiency: "intermediate" },
  { canonical: "REST API", aliases: ["REST", "RESTful", "RESTful API", "API", "APIs"], category: "Backend", related: ["HTTP", "JSON", "GraphQL", "OpenAPI"], description: "Architectural style for web APIs", defaultProficiency: "intermediate" },
  { canonical: "Microservices", aliases: ["Microservice", "Micro-services", "Service Oriented Architecture", "SOA"], category: "Backend", related: ["Docker", "Kubernetes", "API Gateway", "gRPC"], description: "Distributed services architecture", defaultProficiency: "advanced" },

  // ---- Database ----
  { canonical: "PostgreSQL", aliases: ["Postgres", "PostgreSQL DB", "PG"], category: "Database", related: ["SQL", "MySQL", "Database", "Prisma"], description: "Open-source relational database", defaultProficiency: "intermediate" },
  { canonical: "MySQL", aliases: ["MariaDB", "MyISAM"], category: "Database", related: ["SQL", "PostgreSQL", "Database"], description: "Open-source relational database", defaultProficiency: "intermediate" },
  { canonical: "MongoDB", aliases: ["Mongo", "Mongoose"], category: "Database", related: ["NoSQL", "Node.js", "Express"], description: "Document-oriented NoSQL database", defaultProficiency: "intermediate" },
  { canonical: "Redis", aliases: ["Redis Cache", "Redis DB"], category: "Database", related: ["Caching", "NoSQL", "Session Management"], description: "In-memory data store", defaultProficiency: "intermediate" },
  { canonical: "Firebase", aliases: ["Firestore", "Firebase Auth", "Firebase DB"], category: "Database", related: ["Real-time Database", "Google Cloud", "Authentication"], description: "Google's mobile and web development platform", defaultProficiency: "intermediate" },
  { canonical: "Prisma", aliases: ["Prisma ORM", "Prisma Client"], category: "Database", related: ["PostgreSQL", "TypeScript", "Node.js"], description: "Type-safe ORM for Node.js and TypeScript", defaultProficiency: "intermediate" },

  // ---- DevOps & Cloud ----
  { canonical: "Docker", aliases: ["Docker Container", "Dockerfile", "Containerization"], category: "DevOps", related: ["Kubernetes", "Container", "CI/CD"], description: "Container platform", defaultProficiency: "intermediate" },
  { canonical: "Kubernetes", aliases: ["K8s", "Kubernetes Cluster", "Helm"], category: "DevOps", related: ["Docker", "Container Orchestration", "Cloud Native"], description: "Container orchestration platform", defaultProficiency: "advanced" },
  { canonical: "AWS", aliases: ["Amazon Web Services", "EC2", "S3", "Lambda", "Amazon AWS"], category: "DevOps", related: ["Cloud", "Cloud Computing", "Azure", "GCP"], description: "Amazon's cloud computing platform", defaultProficiency: "advanced" },
  { canonical: "Azure", aliases: ["Microsoft Azure", "Azure Cloud", "Azure DevOps"], category: "DevOps", related: ["Cloud", "AWS", "GCP", ".NET"], description: "Microsoft's cloud computing platform", defaultProficiency: "advanced" },
  { canonical: "GCP", aliases: ["Google Cloud", "Google Cloud Platform", "Google Cloud Compute"], category: "DevOps", related: ["Cloud", "AWS", "Azure", "Firebase"], description: "Google's cloud computing platform", defaultProficiency: "advanced" },
  { canonical: "CI/CD", aliases: ["CI", "CD", "Continuous Integration", "Continuous Deployment", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI"], category: "DevOps", related: ["Docker", "DevOps", "Automation"], description: "Continuous integration and deployment", defaultProficiency: "advanced" },
  { canonical: "Linux", aliases: ["Unix", "Bash", "Shell", "Shell Scripting", "Ubuntu", "Debian", "CentOS"], category: "DevOps", related: ["DevOps", "Server Administration", "Docker"], description: "Open-source operating system", defaultProficiency: "intermediate" },
  { canonical: "Nginx", aliases: ["NGINX", "Nginx Server"], category: "DevOps", related: ["Load Balancer", "Reverse Proxy", "Web Server"], description: "Web server and reverse proxy", defaultProficiency: "intermediate" },

  // ---- Testing ----
  { canonical: "Jest", aliases: ["Jest.js", "Jest Testing"], category: "Testing", related: ["JavaScript", "React", "Unit Testing"], description: "JavaScript testing framework", defaultProficiency: "intermediate" },
  { canonical: "Cypress", aliases: ["Cypress.io", "Cypress Testing"], category: "Testing", related: ["E2E Testing", "JavaScript", "React"], description: "End-to-end testing framework", defaultProficiency: "intermediate" },
  { canonical: "Selenium", aliases: ["Selenium WebDriver", "Selenium IDE"], category: "Testing", related: ["E2E Testing", "Automation", "Browser Testing"], description: "Browser automation testing tool", defaultProficiency: "intermediate" },
  { canonical: "PyTest", aliases: ["pytest", "Python Testing"], category: "Testing", related: ["Python", "Unit Testing"], description: "Python testing framework", defaultProficiency: "intermediate" },

  // ---- Data ----
  { canonical: "Pandas", aliases: ["pandas", "Python Pandas"], category: "Data", related: ["Python", "NumPy", "Data Analysis"], description: "Python data manipulation library", defaultProficiency: "intermediate" },
  { canonical: "NumPy", aliases: ["numpy", "Numeric Python"], category: "Data", related: ["Python", "Pandas", "Data Analysis"], description: "Numerical computing library for Python", defaultProficiency: "intermediate" },
  { canonical: "TensorFlow", aliases: ["TF", "Tensorflow"], category: "Data", related: ["Machine Learning", "Python", "Deep Learning", "Keras"], description: "Machine learning framework", defaultProficiency: "advanced" },
  { canonical: "PyTorch", aliases: ["Torch", "pytorch"], category: "Data", related: ["Machine Learning", "Python", "Deep Learning"], description: "Deep learning framework", defaultProficiency: "advanced" },
  { canonical: "Machine Learning", aliases: ["ML", "Machine Learning", "Deep Learning", "AI", "Artificial Intelligence"], category: "Data", related: ["Python", "TensorFlow", "PyTorch", "NLP"], description: "AI field of training models from data", defaultProficiency: "advanced" },
  { canonical: "Data Analysis", aliases: ["Analytics", "Data Analytics", "Data Science", "Business Intelligence"], category: "Data", related: ["Python", "SQL", "Pandas", "Tableau"], description: "Analyzing data to extract insights", defaultProficiency: "intermediate" },

  // ---- Mobile ----
  { canonical: "React Native", aliases: ["RN", "ReactNative"], category: "Mobile", related: ["React", "JavaScript", "TypeScript"], description: "Cross-platform mobile framework", defaultProficiency: "intermediate" },
  { canonical: "Flutter", aliases: ["Dart", "Flutter Framework"], category: "Mobile", related: ["Dart", "Mobile Development"], description: "Google's cross-platform UI toolkit", defaultProficiency: "intermediate" },
  { canonical: "iOS", aliases: ["iOS Development", "Swift iOS", "Xcode"], category: "Mobile", related: ["Swift", "Objective-C", "Mobile Development"], description: "Apple's mobile operating system development", defaultProficiency: "intermediate" },
  { canonical: "Android", aliases: ["Android Development", "Android SDK", "Kotlin Android"], category: "Mobile", related: ["Kotlin", "Java", "Mobile Development"], description: "Google's mobile operating system development", defaultProficiency: "intermediate" },

  // ---- Tools & Concepts ----
  { canonical: "Git", aliases: ["GitHub", "GitLab", "Bitbucket", "Version Control", "VCS"], category: "Tools", related: ["CI/CD", "Collaboration"], description: "Distributed version control system", defaultProficiency: "intermediate" },
  { canonical: "Agile", aliases: ["Scrum", "Kanban", "Agile Methodology", "SAFe"], category: "Tools", related: ["Project Management", "Jira", "Sprint"], description: "Iterative project management methodology", defaultProficiency: "intermediate" },
  { canonical: "Jira", aliases: ["Atlassian Jira", "JIRA"], category: "Tools", related: ["Agile", "Project Management"], description: "Project and issue tracking tool", defaultProficiency: "beginner" },
  { canonical: "Figma", aliases: ["Figma Design", "Figma UI"], category: "Tools", related: ["UI/UX Design", "Design", "Prototyping"], description: "Collaborative interface design tool", defaultProficiency: "beginner" },
  { canonical: "Webpack", aliases: ["Webpack Bundler", "Webpack 5"], category: "Tools", related: ["JavaScript", "Build Tools", "Vite"], description: "Module bundler for JavaScript", defaultProficiency: "intermediate" },
  { canonical: "Vite", aliases: ["Vite JS", "Vite Build"], category: "Tools", related: ["JavaScript", "Build Tools", "Webpack"], description: "Modern build tool and dev server", defaultProficiency: "intermediate" },
];

// ---- Lookup indexes (built once at module load) ----

// Maps every alias (lowercase) → canonical node
const ALIAS_INDEX: Map<string, SkillNode> = new Map();
// Maps canonical (lowercase) → node
const CANONICAL_INDEX: Map<string, SkillNode> = new Map();

for (const node of SKILL_GRAPH) {
  CANONICAL_INDEX.set(node.canonical.toLowerCase(), node);
  ALIAS_INDEX.set(node.canonical.toLowerCase(), node);
  for (const alias of node.aliases) {
    ALIAS_INDEX.set(alias.toLowerCase(), node);
  }
}

/**
 * Normalize a raw skill name to its canonical form.
 * Returns the original string if no match is found.
 *
 * Examples:
 *   normalizeSkill("React.js") → "React"
 *   normalizeSkill("TS") → "TypeScript"
 *   normalizeSkill("K8s") → "Kubernetes"
 *   normalizeSkill("Postgres") → "PostgreSQL"
 *   normalizeSkill("Custom Skill") → "Custom Skill" (unchanged)
 */
export function normalizeSkill(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const node = ALIAS_INDEX.get(lower);
  return node?.canonical ?? raw.trim();
}

/**
 * Find a SkillNode by any name (canonical or alias).
 * Returns null if not found.
 */
export function findSkillNode(name: string): SkillNode | null {
  const lower = name.trim().toLowerCase();
  return ALIAS_INDEX.get(lower) ?? null;
}

/**
 * Check if two skill names are semantically the same (same canonical form).
 *
 * Examples:
 *   areSameSkill("React.js", "React") → true
 *   areSameSkill("TS", "TypeScript") → true
 *   areSameSkill("React", "Vue") → false
 */
export function areSameSkill(a: string, b: string): boolean {
  const nodeA = findSkillNode(a);
  const nodeB = findSkillNode(b);
  if (nodeA && nodeB) return nodeA.canonical === nodeB.canonical;
  // Fall back to case-insensitive exact match
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Check if two skills are related (same canonical OR in each other's related list).
 * This enables semantic NLP matching — e.g. "React" matches "Redux" as related.
 *
 * Examples:
 *   areRelatedSkills("React", "Redux") → true
 *   areRelatedSkills("Docker", "Kubernetes") → true
 *   areRelatedSkills("React", "Python") → false
 */
export function areRelatedSkills(a: string, b: string): boolean {
  if (areSameSkill(a, b)) return true;
  const nodeA = findSkillNode(a);
  const nodeB = findSkillNode(b);
  if (!nodeA || !nodeB) return false;
  return nodeA.related.includes(nodeB.canonical) || nodeB.related.includes(nodeA.canonical);
}

/**
 * Get the semantic similarity score between two skills (0-1).
 * - 1.0 if same skill (same canonical form)
 * - 0.7 if directly related (in each other's related list)
 * - 0.4 if in the same category
 * - 0.0 otherwise
 */
export function skillSimilarity(a: string, b: string): number {
  if (areSameSkill(a, b)) return 1.0;
  const nodeA = findSkillNode(a);
  const nodeB = findSkillNode(b);
  if (!nodeA || !nodeB) return 0;
  if (nodeA.canonical === nodeB.canonical) return 1.0;
  if (nodeA.related.includes(nodeB.canonical) || nodeB.related.includes(nodeA.canonical)) return 0.7;
  if (nodeA.category === nodeB.category) return 0.4;
  return 0;
}

/**
 * Find the best semantic match for a required skill from a list of candidate skills.
 * Returns { skill, similarity } or null if no match found (similarity < threshold).
 *
 * This enables fuzzy matching — e.g. a job requiring "React" will match a
 * candidate who has "React.js" or even "Redux" (with lower similarity).
 */
export function findBestMatch(
  requiredSkill: string,
  candidateSkills: string[],
  threshold = 0.7
): { skill: string; similarity: number } | null {
  let best: { skill: string; similarity: number } | null = null;
  for (const cand of candidateSkills) {
    const sim = skillSimilarity(requiredSkill, cand);
    if (sim >= threshold && (!best || sim > best.similarity)) {
      best = { skill: cand, similarity: sim };
    }
  }
  return best;
}

/**
 * Get all related skills for a given skill (for skill-gap analysis and recommendations).
 */
export function getRelatedSkills(skill: string): string[] {
  const node = findSkillNode(skill);
  return node?.related ?? [];
}

/**
 * Get the category for a given skill.
 */
export function getSkillCategory(skill: string): string {
  return findSkillNode(skill)?.category ?? "General";
}

/**
 * Get a human-readable description for a skill (for explainability).
 */
export function getSkillDescription(skill: string): string {
  return findSkillNode(skill)?.description ?? "";
}

/**
 * Get all canonical skill names (for autocomplete, validation, etc.)
 */
export function getAllCanonicalSkills(): string[] {
  return SKILL_GRAPH.map((n) => n.canonical);
}

/**
 * Get all categories.
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(SKILL_GRAPH.map((n) => n.category)));
}
