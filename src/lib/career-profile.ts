import type { CareerAgentProfile } from "@/lib/career-agent";

export const defaultCareerProfile: CareerAgentProfile = {
  fullName: "Himanshu Singh",
  headline: "International Business Development and Foreign Markets Leader",
  currentRole: "Assistant Director – Foreign Markets",
  location: "Niš, Serbia",
  targetLocations: ["Niš", "Nis", "Serbia", "Europe", "European Union", "Remote Europe", "Remote", "Netherlands", "Germany", "Poland", "Romania", "Slovenia", "Slovakia", "Malta", "Estonia", "Latvia", "Lithuania", "Sweden", "Greece"],
  targetRoles: [
    "international business development",
    "business development manager",
    "business development director",
    "commercial manager",
    "sales director",
    "foreign markets",
    "partnerships manager",
    "market development",
    "country manager",
    "regional manager"
  ],
  targetWorkModes: ["remote", "hybrid", "onsite"],
  minimumNetMonthlyEur: 1800,
  summary: "My experience combines international business development, B2B partnerships, recycling and environmental projects, commercial research, supplier and buyer development, proposal preparation, negotiation support and cross-border stakeholder coordination across Europe, the United States, Latin America and India.",
  skills: [
    "international business development",
    "B2B sales",
    "market research",
    "partnership development",
    "lead generation",
    "commercial strategy",
    "proposal writing",
    "negotiation",
    "recycling",
    "waste management",
    "e-waste",
    "project coordination",
    "recruitment",
    "human resources"
  ],
  industries: ["recycling", "environmental services", "waste management", "manufacturing", "technology", "consulting", "staffing"],
  email: process.env.CAREER_AGENT_SENDER_EMAIL ?? "hrj107@gmail.com",
  resumeUrl: process.env.CAREER_AGENT_RESUME_URL
};