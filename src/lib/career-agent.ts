import "server-only";

export type CareerAgentProfile = {
  fullName: string;
  headline: string;
  currentRole: string;
  location: string;
  targetLocations: string[];
  targetRoles: string[];
  targetWorkModes: Array<"remote" | "hybrid" | "onsite">;
  minimumNetMonthlyEur?: number;
  summary: string;
  skills: string[];
  industries: string[];
  email: string;
  resumeUrl?: string;
};

export type Opportunity = {
  id: string;
  kind: "job" | "company" | "client";
  title: string;
  organisation: string;
  location?: string;
  sourceUrl: string;
  source: string;
  contactEmail?: string;
  description?: string;
  discoveredAt: string;
};

export type MatchDecision = {
  score: number;
  reasons: string[];
  eligible: boolean;
};

const blockedLocalParts = new Set([
  "privacy",
  "legal",
  "abuse",
  "security",
  "webmaster",
  "noreply",
  "no-reply",
  "donotreply"
]);

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSafeBusinessContact(email: string): boolean {
  const normalised = normaliseEmail(email);
  const [local, domain] = normalised.split("@");
  if (!local || !domain || !domain.includes(".")) return false;
  if (blockedLocalParts.has(local)) return false;
  return !normalised.endsWith("@example.com");
}

export function scoreOpportunity(profile: CareerAgentProfile, opportunity: Opportunity): MatchDecision {
  const haystack = `${opportunity.title} ${opportunity.organisation} ${opportunity.location ?? ""} ${opportunity.description ?? ""}`.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  const roleMatches = profile.targetRoles.filter((role) => haystack.includes(role.toLowerCase()));
  if (roleMatches.length) {
    score += Math.min(45, 25 + roleMatches.length * 10);
    reasons.push(`Role match: ${roleMatches.join(", ")}`);
  }

  const locationMatches = profile.targetLocations.filter((location) => haystack.includes(location.toLowerCase()));
  if (locationMatches.length || haystack.includes("remote")) {
    score += 20;
    reasons.push(locationMatches.length ? `Location match: ${locationMatches.join(", ")}` : "Remote opportunity");
  }

  const skillMatches = profile.skills.filter((skill) => haystack.includes(skill.toLowerCase()));
  if (skillMatches.length) {
    score += Math.min(25, skillMatches.length * 5);
    reasons.push(`Skills: ${skillMatches.slice(0, 5).join(", ")}`);
  }

  const industryMatches = profile.industries.filter((industry) => haystack.includes(industry.toLowerCase()));
  if (industryMatches.length) {
    score += 10;
    reasons.push(`Industry: ${industryMatches.join(", ")}`);
  }

  const contactable = Boolean(opportunity.contactEmail && isSafeBusinessContact(opportunity.contactEmail));
  if (contactable) score += 5;

  score = Math.min(100, score);
  return { score, reasons, eligible: score >= 55 && Boolean(opportunity.sourceUrl) };
}

export function followUpDue(lastSentAt: Date, followUpNumber: number, now = new Date()): boolean {
  const delays = [7, 14] as const;
  const delayDays = delays[followUpNumber];
  if (!delayDays) return false;
  const dueAt = new Date(lastSentAt);
  dueAt.setUTCDate(dueAt.getUTCDate() + delayDays);
  return now >= dueAt;
}

export function applicationSubject(profile: CareerAgentProfile, opportunity: Opportunity): string {
  if (opportunity.kind === "client") return `${profile.fullName} — international business development support`;
  return `Application: ${opportunity.title} — ${profile.fullName}`;
}

export function applicationEmail(profile: CareerAgentProfile, opportunity: Opportunity, reasons: string[]): string {
  const fit = reasons.length ? reasons.slice(0, 2).join("; ") : "my international business development and market-expansion background";
  return [
    `Dear Hiring Team,`,
    ``,
    `I am writing regarding the ${opportunity.title} opportunity at ${opportunity.organisation}. I currently work as ${profile.currentRole} in ${profile.location}, with hands-on responsibility for international partnerships, market development, commercial outreach and cross-border projects.`,
    ``,
    `The role appears relevant because of ${fit}. ${profile.summary}`,
    ``,
    `I would welcome the opportunity to discuss how my experience could support ${opportunity.organisation}. My profile and CV are included for review.`,
    ``,
    `Best regards,`,
    profile.fullName,
    profile.email
  ].join("\n");
}

export function followUpEmail(profile: CareerAgentProfile, opportunity: Opportunity, followUpNumber: number): string {
  const final = followUpNumber >= 1;
  return [
    `Dear Hiring Team,`,
    ``,
    final
      ? `I wanted to send one final, brief follow-up regarding my application for ${opportunity.title} at ${opportunity.organisation}.`
      : `I wanted to follow up on my application for ${opportunity.title} at ${opportunity.organisation}.`,
    ``,
    `I remain interested and would be glad to share any additional information that may help your review.`,
    ``,
    final ? `I understand priorities change, so I will not send further follow-ups after this message.` : `Thank you for your time and consideration.`,
    ``,
    `Best regards,`,
    profile.fullName,
    profile.email
  ].join("\n");
}
