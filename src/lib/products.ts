export type RevenueProduct = {
  slug: string;
  title: string;
  eyebrow: string;
  pricePaise: number;
  description: string;
  audience: string;
  outcome: string;
  relatedAssessment: string;
  features: string[];
  questions: { id: string; label: string; options: string[] }[];
};

export const revenueProducts: RevenueProduct[] = [
  {
    slug: "career-accelerator",
    title: "Career Accelerator",
    eyebrow: "Career outcome system",
    pricePaise: 49900,
    description: "Turn your working-style insight into a focused 90-day career plan.",
    audience: "Students, job seekers, career switchers and working professionals",
    outcome: "A personalised career direction, skill-gap plan, job-search system and communication toolkit.",
    relatedAssessment: "career-alignment",
    features: ["Career-fit priorities", "Skill-gap analysis", "90-day learning roadmap", "Resume and LinkedIn strategy", "Interview preparation", "Application tracker framework"],
    questions: [
      { id: "stage", label: "Current career stage", options: ["Student", "Job seeker", "Working professional", "Career switcher"] },
      { id: "goal", label: "Main 90-day goal", options: ["Get first job", "Change role", "Earn promotion", "Build high-value skill"] },
      { id: "constraint", label: "Biggest constraint", options: ["Clarity", "Skills", "Confidence", "Time", "Opportunities"] },
      { id: "style", label: "Preferred work style", options: ["Independent", "Collaborative", "Structured", "Flexible"] }
    ]
  },
  {
    slug: "personal-life-os",
    title: "Personal Life OS",
    eyebrow: "Personal operating system",
    pricePaise: 69900,
    description: "A unified system for decisions, habits, communication, relationships and stress.",
    audience: "Adults who want practical self-development instead of isolated personality labels",
    outcome: "A personalised manual for how you operate, recover, communicate and grow over 90 days.",
    relatedAssessment: "personality-dna",
    features: ["Personal blueprint", "Decision framework", "Stress manual", "Communication playbook", "Habit architecture", "90-day roadmap"],
    questions: [
      { id: "priority", label: "Main life priority", options: ["Career", "Relationships", "Confidence", "Habits", "Balance"] },
      { id: "pressure", label: "What happens under pressure?", options: ["Overthink", "Act too quickly", "Withdraw", "Seek reassurance"] },
      { id: "change", label: "Preferred change style", options: ["Small daily steps", "Clear weekly targets", "Accountability", "Flexible experiments"] },
      { id: "support", label: "Most useful support", options: ["Structure", "Clarity", "Encouragement", "Challenge"] }
    ]
  },
  {
    slug: "founder-os",
    title: "Founder OS",
    eyebrow: "Founder performance system",
    pricePaise: 99900,
    description: "Translate leadership and decision patterns into a practical founder execution system.",
    audience: "Founders, freelancers, business owners and aspiring entrepreneurs",
    outcome: "A founder manual covering priorities, delegation, decision-making, risk and sustainable execution.",
    relatedAssessment: "leadership-style",
    features: ["Founder strengths", "Execution blockers", "Delegation system", "Decision rules", "Team communication", "90-day founder roadmap"],
    questions: [
      { id: "stage", label: "Business stage", options: ["Idea", "Early customers", "Growing", "Established"] },
      { id: "blocker", label: "Main blocker", options: ["Focus", "Sales", "Execution", "Delegation", "Consistency"] },
      { id: "team", label: "Current team", options: ["Solo", "2–5 people", "6–20 people", "20+ people"] },
      { id: "risk", label: "Typical risk pattern", options: ["Too cautious", "Too fast", "Avoid decisions", "Take on everything"] }
    ]
  },
  {
    slug: "couple-compatibility",
    title: "Couple Compatibility",
    eyebrow: "Relationship action report",
    pricePaise: 59900,
    description: "Compare two people’s communication needs, conflict patterns and repair preferences.",
    audience: "Couples who want a practical conversation framework—not a compatibility verdict",
    outcome: "A shared communication map, friction forecast, repair plan and four-week relationship practice.",
    relatedAssessment: "relationship-intelligence",
    features: ["Communication differences", "Emotional needs", "Conflict triggers", "Repair preferences", "Boundary conversation", "Four-week practice plan"],
    questions: [
      { id: "stage", label: "Relationship stage", options: ["Dating", "Committed", "Married", "Long-distance"] },
      { id: "conflict", label: "Most common conflict", options: ["Communication", "Time", "Trust", "Family", "Money"] },
      { id: "response", label: "Typical response", options: ["Discuss immediately", "Need space", "Seek reassurance", "Avoid conflict"] },
      { id: "goal", label: "Main relationship goal", options: ["Better communication", "More security", "Repair conflict", "Plan future"] }
    ]
  }
];

export function getRevenueProduct(slug: string) {
  return revenueProducts.find((item) => item.slug === slug);
}

export function buildProductReport(product: RevenueProduct, answers: Record<string, string>) {
  const values = product.questions.map((question) => ({
    label: question.label,
    answer: answers[question.id] ?? "Not provided"
  }));
  const answer = (id: string) => answers[id] ?? "your selected priority";

  return {
    assessmentId: product.slug,
    title: product.title,
    subtitle: product.outcome,
    summary: `This personalised ${product.title} converts your selected priorities into a practical execution system. It is educational guidance, not a guaranteed outcome.`,
    completedAt: new Date().toISOString(),
    dimensions: values.map((item, index) => ({
      id: `priority-${index + 1}`,
      label: item.label,
      score: 65 + ((index * 9) % 28),
      description: item.answer
    })),
    strengths: [
      `Your plan is anchored around ${answer(product.questions[0].id).toLowerCase()}.`,
      `The system accounts for ${answer(product.questions[2].id).toLowerCase()} as a real constraint rather than assuming unlimited time or confidence.`,
      "Your roadmap uses small evidence-producing actions instead of relying only on motivation."
    ],
    watchouts: [
      `The biggest risk is treating ${answer(product.questions[1].id).toLowerCase()} as an identity rather than a problem that can be designed around.`,
      "A plan becomes useful only when reviewed against real behaviour and results."
    ],
    dimensionInsights: values.map((item) => ({
      id: item.label,
      interpretation: `${item.label}: ${item.answer}. This preference shapes the sequence, pace and support built into your plan.`,
      growthEdge: "Test this preference in one real decision and adjust using evidence."
    })),
    stressPattern: `When progress feels uncertain, you may over-focus on ${answer(product.questions[2].id).toLowerCase()}. Use a minimum next action, a review date and one clear success measure.`,
    realLifeScenarios: [
      { title: "This week", insight: `Choose one action connected to ${answer(product.questions[0].id).toLowerCase()} that can be completed in under 60 minutes.` },
      { title: "When blocked", insight: `Reduce the impact of ${answer(product.questions[2].id).toLowerCase()} by changing the environment, timeline or support—not by judging yourself.` },
      { title: "At review", insight: "Keep what produced evidence, remove what created friction and set the next measurable outcome." }
    ],
    actionPlan: product.features.map((feature, index) => `${index + 1}. Build and apply your ${feature.toLowerCase()} using the selected priorities.`),
    sevenDayPlan: Array.from({ length: 7 }, (_, index) => `Day ${index + 1}: complete one focused action, record the result and protect the next step.`),
    thirtyDayRoadmap: [
      "Week 1 — Clarify the outcome, baseline and constraints.",
      "Week 2 — Build the core system and complete two real-world experiments.",
      "Week 3 — Collect feedback, remove friction and strengthen the weakest process.",
      "Week 4 — Review evidence and commit to the next 60-day direction."
    ],
    affiliateCategory: product.slug === "couple-compatibility" ? "relationship" : product.slug === "career-accelerator" ? "career" : "growth"
  };
}
