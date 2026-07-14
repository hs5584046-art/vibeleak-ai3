export type GrowthChannel = "seo" | "content" | "backlink" | "social" | "ads";
export type GrowthStatus = "draft" | "approved" | "published" | "rejected";

export type GrowthItem = {
  id: string;
  channel: GrowthChannel;
  title: string;
  objective: string;
  targetUrl: string;
  content: string;
  metadata: Record<string, unknown>;
  status: GrowthStatus;
  priority: number;
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
};

type FunnelCounts = Record<string, number>;

const priorityPages = [
  {
    title: "Personality DNA",
    url: "/assessments/personality-dna",
    angle: "A practical personality report with free preview and optional deep report."
  },
  {
    title: "Career Alignment",
    url: "/assessments/career-alignment",
    angle: "Help students and professionals understand the work environment that fits them."
  },
  {
    title: "Attachment Style",
    url: "/assessments/attachment-style",
    angle: "Explore reassurance, closeness, boundaries and repair without permanent labels."
  },
  {
    title: "Emotional Intelligence",
    url: "/assessments/emotional-intelligence",
    angle: "Measure recognition, regulation, empathy and constructive expression."
  }
] as const;

const backlinkTargets = [
  "career guidance newsletters",
  "student resource pages",
  "personal-development blogs",
  "HR and leadership newsletters",
  "relationship education resources",
  "remote-work and career communities"
] as const;

function dailyIndex(date: Date, length: number) {
  const key = Number(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`
  );
  return key % length;
}

function funnelDiagnosis(counts: FunnelCounts) {
  const starts = counts.assessment_started ?? 0;
  const completions = counts.assessment_completed ?? 0;
  const checkouts = counts.checkout_started ?? 0;
  const purchases = counts.payment_submitted ?? 0;

  if (starts < 20) {
    return {
      bottleneck: "traffic",
      instruction: "Prioritise distribution and high-intent landing-page discovery."
    };
  }
  if (completions / Math.max(starts, 1) < 0.45) {
    return {
      bottleneck: "completion",
      instruction: "Prioritise assessment-start messaging, mobile friction and progress clarity."
    };
  }
  if (checkouts / Math.max(completions, 1) < 0.08) {
    return {
      bottleneck: "preview-to-checkout",
      instruction: "Prioritise premium value proof and result-specific locked insights."
    };
  }
  if (purchases / Math.max(checkouts, 1) < 0.2) {
    return {
      bottleneck: "checkout",
      instruction: "Prioritise payment trust, clarity and faster report access."
    };
  }
  return {
    bottleneck: "scale",
    instruction: "Increase distribution around the strongest converting assessment."
  };
}

export function buildDailyGrowthPlan(
  counts: FunnelCounts,
  date = new Date()
): Omit<GrowthItem, "id" | "createdAt" | "updatedAt">[] {
  const page = priorityPages[dailyIndex(date, priorityPages.length)];
  const backlinkCategory = backlinkTargets[dailyIndex(date, backlinkTargets.length)];
  const diagnosis = funnelDiagnosis(counts);
  const day = date.toISOString().slice(0, 10);

  return [
    {
      channel: "seo",
      title: `Improve search snippet for ${page.title}`,
      objective: `Address the current ${diagnosis.bottleneck} bottleneck. ${diagnosis.instruction}`,
      targetUrl: page.url,
      content: `SEO review brief for ${page.title}: verify the page answers one primary search intent, includes a concise free-vs-premium explanation, links to two relevant guides, and uses a title that communicates the user outcome rather than only the assessment name.`,
      metadata: {
        checklist: [
          "Inspect Search Console impressions and CTR",
          "Review title and meta description",
          "Confirm internal links",
          "Check mobile introduction and CTA",
          "Avoid changing a page without evidence"
        ]
      },
      status: "draft",
      priority: 100,
      scheduledFor: day
    },
    {
      channel: "content",
      title: `Publish one evidence-led guide supporting ${page.title}`,
      objective: "Build topical authority and create a natural internal-link destination.",
      targetUrl: page.url,
      content: `Content brief: write a practical guide around the main problem solved by ${page.title}. Include a real-life example, one exercise, limitations, a related assessment CTA and two credible primary or expert sources where the topic requires factual support.`,
      metadata: {
        minimumWords: 1200,
        requiredSections: ["problem", "example", "framework", "exercise", "limitations", "related assessment"]
      },
      status: "draft",
      priority: 90,
      scheduledFor: day
    },
    {
      channel: "backlink",
      title: `Outreach to relevant ${backlinkCategory}`,
      objective: "Earn one relevant editorial mention rather than mass low-quality links.",
      targetUrl: page.url,
      content: `Subject: Useful free self-assessment resource for your readers\n\nHello,\n\nI noticed your work around ${backlinkCategory}. VibeLytix offers a free ${page.title} preview designed around ${page.angle.toLowerCase()} If it genuinely improves your resource page or an upcoming article, here is the page: {{PUBLIC_URL}}${page.url}\n\nI can also provide a concise original explanation or worksheet for your readers. No link exchange is required.\n\nRegards,\nVibeLytix`,
      metadata: {
        opportunityType: "editorial outreach",
        rules: [
          "Send only to clearly relevant publishers",
          "Personalise the opening",
          "Do not buy undisclosed links",
          "Do not automate comments or forum spam",
          "Track replies and follow up once"
        ]
      },
      status: "draft",
      priority: 80,
      scheduledFor: day
    },
    {
      channel: "social",
      title: `Create a shareable ${page.title} insight`,
      objective: "Create brand discovery and referral visits through useful native content.",
      targetUrl: page.url,
      content: `Post draft:\n\nA personality or career score is useful only when it changes a real decision.\n\nTry this: identify one pattern that helps you, one situation where it becomes overused, and one small behaviour to test this week.\n\n${page.title} gives a free personalised preview. Premium depth is optional.\n\n{{PUBLIC_URL}}${page.url}`,
      metadata: {
        variants: ["LinkedIn text post", "Instagram carousel", "WhatsApp status", "Pinterest vertical graphic"],
        disclosure: "Do not imply diagnosis or guaranteed accuracy."
      },
      status: "draft",
      priority: 70,
      scheduledFor: day
    },
    {
      channel: "ads",
      title: `Run a zero-spend organic promotion campaign for ${page.title}`,
      objective: "Distribute the page through free, permissionless web-discovery protocols and relevant editorial outreach.",
      targetUrl: page.url,
      content: `Zero-spend campaign copy\n\nHeadline 1: Discover Your ${page.title}\nHeadline 2: Free Personal Preview\nHeadline 3: Detailed Report From ₹79\nDescription 1: Complete a short assessment and see a useful personal preview before deciding whether to unlock more.\nDescription 2: One-time pricing. No subscription. Educational self-reflection, not a diagnosis.\n\nNegative keyword ideas: jobs, salary, free download, PDF answers, clinical diagnosis, medical test.`,
      metadata: {
        approvalRequired: false,
        spend: 0,
        distribution: ["RSS", "WebSub", "IndexNow", "editorial outreach"],
        conversionEvent: "approved premium report",
        rules: [
          "Use only open protocols or explicitly permitted mechanisms",
          "Never create fake accounts or bypass moderation",
          "Do not mass-post comments or forum spam",
          "Measure referral visits and approved premium reports"
        ]
      },
      status: "draft",
      priority: 60,
      scheduledFor: day
    }
  ];
}
