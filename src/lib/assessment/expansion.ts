export type ExpansionAnswer = 1 | 2 | 3 | 4 | 5;
export type ExpansionAnswers = Record<string, ExpansionAnswer>;

export type ExpansionAssessment = {
  id:
    | "relationship-intelligence"
    | "career-alignment"
    | "growth-systems"
    | "attachment-style"
    | "emotional-intelligence"
    | "communication-style"
    | "leadership-style";
  title: string;
  eyebrow: string;
  description: string;
  estimatedMinutes: number;
  pricePaise: number;
  priceLabel: string;
  dimensions: { id: string; label: string; description: string }[];
  questions: {
    id: string;
    prompt: string;
    dimension: string;
    reverse?: boolean;
  }[];
  profiles: {
    dimension: string;
    title: string;
    subtitle: string;
    summary: string;
  }[];
  affiliateCategory: "relationships" | "career" | "growth";
};

export type ExpansionReport = {
  assessmentId: ExpansionAssessment["id"];
  completedAt: string;
  title: string;
  subtitle: string;
  summary: string;
  dimensions: { id: string; label: string; score: number; description: string }[];
  strengths: string[];
  watchouts: string[];
  dimensionInsights: { id: string; interpretation: string; growthEdge: string }[];
  stressPattern: string;
  realLifeScenarios: { title: string; insight: string }[];
  actionPlan: string[];
  sevenDayPlan: string[];
  thirtyDayRoadmap: string[];
  affiliateCategory: ExpansionAssessment["affiliateCategory"];
};

const questions = (
  rows: [string, string, string, boolean?][]
): ExpansionAssessment["questions"] =>
  rows.map(([id, prompt, dimension, reverse]) => ({ id, prompt, dimension, reverse }));

export const expansionAssessments: ExpansionAssessment[] = [
  {
    id: "relationship-intelligence",
    title: "Relationship Intelligence",
    eyebrow: "Relationships",
    description:
      "Understand your communication, boundaries, emotional availability and conflict-repair habits.",
    estimatedMinutes: 6,
    pricePaise: 9900,
    priceLabel: "Free preview · ₹99 full",
    affiliateCategory: "relationships",
    dimensions: [
      { id: "communication", label: "Clear communication", description: "How directly and calmly you express needs." },
      { id: "boundaries", label: "Healthy boundaries", description: "How well you protect limits without shutting people out." },
      { id: "security", label: "Emotional security", description: "How steadily you respond to closeness, uncertainty and distance." },
      { id: "repair", label: "Conflict repair", description: "How effectively you recover after tension or disagreement." }
    ],
    questions: questions([
      ["r1", "I can explain what I need without expecting the other person to guess.", "communication"],
      ["r2", "I can say no without feeling that I must justify myself for a long time.", "boundaries"],
      ["r3", "A delayed reply rarely makes me assume the relationship is in danger.", "security"],
      ["r4", "After conflict, I can return to the issue without trying to win.", "repair"],
      ["r5", "I ask clarifying questions before reacting to an ambiguous message.", "communication"],
      ["r6", "I stay in uncomfortable situations because I fear disappointing people.", "boundaries", true],
      ["r7", "I can enjoy closeness without losing my own routines and priorities.", "security"],
      ["r8", "I can apologise specifically instead of giving a vague apology.", "repair"],
      ["r9", "I can discuss difficult topics without using silence as punishment.", "communication"],
      ["r10", "I recognise when empathy has turned into over-responsibility.", "boundaries"],
      ["r11", "I can ask for reassurance directly instead of testing someone.", "security"],
      ["r12", "I focus on changing the pattern, not only ending the argument.", "repair"]
    ]),
    profiles: [
      {
        dimension: "communication",
        title: "The Clear Connector",
        subtitle: "Direct, thoughtful and emotionally specific",
        summary: "Your strongest relationship advantage is your ability to make inner experience understandable without creating unnecessary drama."
      },
      {
        dimension: "boundaries",
        title: "The Grounded Partner",
        subtitle: "Care without self-abandonment",
        summary: "You are at your best when connection includes respect, personal space and clear limits."
      },
      {
        dimension: "security",
        title: "The Steady Heart",
        subtitle: "Closeness without constant alarm",
        summary: "You tend to create trust through consistency and a balanced response to emotional uncertainty."
      },
      {
        dimension: "repair",
        title: "The Relationship Repairer",
        subtitle: "Conflict becomes information",
        summary: "You are most effective when tension is treated as a problem to understand and repair rather than a contest to win."
      }
    ]
  },
  {
    id: "career-alignment",
    title: "Career Alignment",
    eyebrow: "Career",
    description:
      "Identify the work environment, motivation pattern and decision style most likely to support sustainable performance.",
    estimatedMinutes: 6,
    pricePaise: 9900,
    priceLabel: "Free preview · ₹99 full",
    affiliateCategory: "career",
    dimensions: [
      { id: "autonomy", label: "Autonomy", description: "How much ownership and freedom you need." },
      { id: "mastery", label: "Mastery drive", description: "How strongly learning and competence motivate you." },
      { id: "impact", label: "Meaningful impact", description: "How important visible usefulness is to your motivation." },
      { id: "structure", label: "Structure fit", description: "How much predictability and process support your best work." }
    ],
    questions: questions([
      ["c1", "I perform best when I can choose how to reach the outcome.", "autonomy"],
      ["c2", "Learning a difficult skill is rewarding even before it produces money.", "mastery"],
      ["c3", "I lose motivation when I cannot see who benefits from my work.", "impact"],
      ["c4", "Clear routines help me protect energy and focus.", "structure"],
      ["c5", "Micromanagement reduces the quality of my work.", "autonomy"],
      ["c6", "I regularly seek feedback that helps me improve a specific skill.", "mastery"],
      ["c7", "I want my work to solve a problem that feels real.", "impact"],
      ["c8", "Too many fixed procedures make me feel trapped.", "structure", true],
      ["c9", "I am comfortable being accountable for an outcome I control.", "autonomy"],
      ["c10", "I enjoy becoming known for a clear area of expertise.", "mastery"],
      ["c11", "Recognition matters less to me than knowing the work was useful.", "impact"],
      ["c12", "I can stay consistent when expectations and priorities are explicit.", "structure"]
    ]),
    profiles: [
      {
        dimension: "autonomy",
        title: "The Independent Operator",
        subtitle: "Ownership creates energy",
        summary: "You are likely to perform best when outcomes are clear but your route to achieving them remains flexible."
      },
      {
        dimension: "mastery",
        title: "The Craft Builder",
        subtitle: "Depth before applause",
        summary: "You are motivated by competence, improvement and the satisfaction of becoming genuinely good at something."
      },
      {
        dimension: "impact",
        title: "The Purpose Driver",
        subtitle: "Useful work sustains effort",
        summary: "You are most engaged when your work has a visible effect on people, customers or a problem you care about."
      },
      {
        dimension: "structure",
        title: "The Reliable Systems Thinker",
        subtitle: "Clarity protects performance",
        summary: "You tend to do strong work when priorities, expectations and repeatable processes reduce unnecessary noise."
      }
    ]
  },
  {
    id: "growth-systems",
    title: "Growth Systems",
    eyebrow: "Self growth",
    description:
      "Measure consistency, self-awareness, recovery and environment design—the systems behind lasting change.",
    estimatedMinutes: 6,
    pricePaise: 9900,
    priceLabel: "Free preview · ₹99 full",
    affiliateCategory: "growth",
    dimensions: [
      { id: "consistency", label: "Consistency", description: "How reliably you repeat useful actions." },
      { id: "awareness", label: "Self-awareness", description: "How accurately you notice patterns and triggers." },
      { id: "recovery", label: "Recovery skill", description: "How effectively you restart after setbacks." },
      { id: "environment", label: "Environment design", description: "How well your surroundings support desired behaviour." }
    ],
    questions: questions([
      ["g1", "I make important habits small enough to repeat on difficult days.", "consistency"],
      ["g2", "I can identify the situation that usually triggers an unhelpful pattern.", "awareness"],
      ["g3", "A missed day does not normally become a missed week.", "recovery"],
      ["g4", "I remove friction from behaviours I want to repeat.", "environment"],
      ["g5", "I track progress through behaviour rather than mood.", "consistency"],
      ["g6", "I know which emotions most often change my decisions.", "awareness"],
      ["g7", "After a setback, I focus on the next useful action.", "recovery"],
      ["g8", "My phone and workspace are arranged to protect focus.", "environment"],
      ["g9", "I rely on motivation more than a repeatable routine.", "consistency", true],
      ["g10", "I review what worked instead of only judging the outcome.", "awareness"],
      ["g11", "I can restart without using shame as fuel.", "recovery"],
      ["g12", "People around me generally support the habits I am building.", "environment"]
    ]),
    profiles: [
      {
        dimension: "consistency",
        title: "The Steady Builder",
        subtitle: "Progress through repetition",
        summary: "Your strongest growth advantage is the ability to turn intention into repeatable action."
      },
      {
        dimension: "awareness",
        title: "The Pattern Observer",
        subtitle: "Insight before intervention",
        summary: "You improve by noticing the conditions behind behaviour rather than relying on vague self-judgement."
      },
      {
        dimension: "recovery",
        title: "The Resilient Restarter",
        subtitle: "Setbacks do not become identity",
        summary: "Your strength is returning to useful action without demanding a perfect record."
      },
      {
        dimension: "environment",
        title: "The Environment Architect",
        subtitle: "Design beats willpower",
        summary: "You grow fastest when your surroundings make desired actions easier and distractions less automatic."
      }
    ]
  }
  ,
  {
    id: "attachment-style",
    title: "Attachment Style",
    eyebrow: "Relationships",
    description: "Explore how you respond to closeness, distance, reassurance and emotional risk.",
    estimatedMinutes: 5,
    pricePaise: 7900,
    priceLabel: "Free preview · ₹79 full",
    affiliateCategory: "relationships",
    dimensions: [
      { id: "security", label: "Secure relating", description: "Comfort with closeness and independence." },
      { id: "anxiety", label: "Reassurance sensitivity", description: "How strongly uncertainty activates concern." },
      { id: "avoidance", label: "Distance protection", description: "How strongly distance is used for safety." },
      { id: "repair", label: "Relational repair", description: "Ability to reconnect after disconnection." }
    ],
    questions: questions([
      ["as1","I can depend on someone without feeling weak.","security"],
      ["as2","Uncertainty in a relationship quickly occupies my attention.","anxiety"],
      ["as3","When someone gets very close, I sometimes want to pull away.","avoidance"],
      ["as4","I can discuss hurt without threatening the relationship.","repair"],
      ["as5","I am comfortable giving and receiving reassurance.","security"],
      ["as6","I frequently check for signs that someone is losing interest.","anxiety"],
      ["as7","I prefer handling emotional problems alone.","avoidance"],
      ["as8","After distance, I can reconnect without pretending nothing happened.","repair"],
      ["as9","I can maintain my identity inside a close relationship.","security"],
      ["as10","A slow response can feel like rejection.","anxiety"],
      ["as11","I minimise my needs to avoid depending on people.","avoidance"],
      ["as12","I can name what would help rebuild trust.","repair"]
    ]),
    profiles: [
      { dimension:"security", title:"The Secure Connector", subtitle:"Closeness with stability", summary:"You tend to balance trust, autonomy and direct reassurance." },
      { dimension:"anxiety", title:"The Vigilant Connector", subtitle:"Connection feels highly significant", summary:"You notice relational signals quickly and benefit from direct reassurance skills." },
      { dimension:"avoidance", title:"The Independent Protector", subtitle:"Distance creates safety", summary:"You preserve autonomy strongly and may need gradual, explicit emotional communication." },
      { dimension:"repair", title:"The Repair-Oriented Partner", subtitle:"Reconnection is a skill", summary:"You focus on rebuilding safety after emotional disruption." }
    ]
  },
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence",
    eyebrow: "Self awareness",
    description: "Assess emotional recognition, regulation, empathy and constructive expression.",
    estimatedMinutes: 5,
    pricePaise: 7900,
    priceLabel: "Free preview · ₹79 full",
    affiliateCategory: "growth",
    dimensions: [
      { id:"recognition", label:"Emotion recognition", description:"How clearly you identify emotional states." },
      { id:"regulation", label:"Emotional regulation", description:"How well you respond without being controlled by emotion." },
      { id:"empathy", label:"Empathic accuracy", description:"How carefully you understand another perspective." },
      { id:"expression", label:"Constructive expression", description:"How effectively you communicate emotion." }
    ],
    questions: questions([
      ["ei1","I can name what I feel beyond simply good or bad.","recognition"],
      ["ei2","I can pause before acting on a strong emotion.","regulation"],
      ["ei3","I check my interpretation before assuming what someone feels.","empathy"],
      ["ei4","I can express disappointment without attacking character.","expression"],
      ["ei5","I notice physical signs of stress early.","recognition"],
      ["ei6","I recover from emotional intensity without suppressing it.","regulation"],
      ["ei7","I can understand a perspective I do not agree with.","empathy"],
      ["ei8","I explain emotional impact with specific examples.","expression"],
      ["ei9","I can separate anger from the need underneath it.","recognition"],
      ["ei10","My mood rarely determines every decision I make.","regulation"],
      ["ei11","I notice when empathy turns into assumption.","empathy"],
      ["ei12","I can ask for support without blaming someone.","expression"]
    ]),
    profiles: [
      { dimension:"recognition", title:"The Emotional Observer", subtitle:"Clarity begins with naming", summary:"You notice emotional signals and translate them into specific needs." },
      { dimension:"regulation", title:"The Calm Responder", subtitle:"Feeling without losing direction", summary:"You can experience emotion while protecting deliberate action." },
      { dimension:"empathy", title:"The Perspective Reader", subtitle:"Understanding before judgment", summary:"You naturally examine context and another person’s viewpoint." },
      { dimension:"expression", title:"The Honest Communicator", subtitle:"Emotion becomes usable language", summary:"You turn internal experience into clearer conversation." }
    ]
  },
  {
    id: "communication-style",
    title: "Communication Style",
    eyebrow: "Communication",
    description: "Discover how you balance directness, listening, emotional context and assertiveness.",
    estimatedMinutes: 5,
    pricePaise: 7900,
    priceLabel: "Free preview · ₹79 full",
    affiliateCategory: "relationships",
    dimensions: [
      { id:"directness", label:"Directness", description:"How clearly you state the central point." },
      { id:"listening", label:"Active listening", description:"How deeply you understand before responding." },
      { id:"context", label:"Emotional context", description:"How well you account for tone and impact." },
      { id:"assertiveness", label:"Assertiveness", description:"How firmly you protect your position respectfully." }
    ],
    questions: questions([
      ["cs1","I state the main point early in a conversation.","directness"],
      ["cs2","I can summarise someone’s view before giving mine.","listening"],
      ["cs3","I consider timing and emotional state before raising an issue.","context"],
      ["cs4","I can disagree without becoming passive or aggressive.","assertiveness"],
      ["cs5","People usually know what I am asking for.","directness"],
      ["cs6","I ask questions instead of planning my reply while someone speaks.","listening"],
      ["cs7","I notice when correct words still create unnecessary harm.","context"],
      ["cs8","I can repeat a boundary when pressure continues.","assertiveness"],
      ["cs9","I avoid vague hints when a direct request would be clearer.","directness"],
      ["cs10","I check whether I understood the intended meaning.","listening"],
      ["cs11","I adapt tone without hiding the truth.","context"],
      ["cs12","I can say what I want while respecting another person’s choice.","assertiveness"]
    ]),
    profiles: [
      { dimension:"directness", title:"The Clear Speaker", subtitle:"The point does not get lost", summary:"You reduce confusion by making requests and conclusions understandable." },
      { dimension:"listening", title:"The Deep Listener", subtitle:"Understanding creates influence", summary:"Your strength is making people feel accurately heard." },
      { dimension:"context", title:"The Context-Aware Communicator", subtitle:"Tone and timing matter", summary:"You recognise that delivery shapes whether truth can be received." },
      { dimension:"assertiveness", title:"The Respectful Advocate", subtitle:"Firm without hostility", summary:"You protect needs and boundaries while preserving dignity." }
    ]
  },
  {
    id: "leadership-style",
    title: "Leadership Style",
    eyebrow: "Leadership",
    description: "Explore direction-setting, coaching, decision ownership and team trust.",
    estimatedMinutes: 5,
    pricePaise: 7900,
    priceLabel: "Free preview · ₹79 full",
    affiliateCategory: "career",
    dimensions: [
      { id:"vision", label:"Direction setting", description:"How clearly you create focus and priorities." },
      { id:"coaching", label:"Coaching orientation", description:"How strongly you develop other people." },
      { id:"decisiveness", label:"Decisiveness", description:"How effectively you make and own decisions." },
      { id:"trust", label:"Team trust", description:"How well you create safety and accountability." }
    ],
    questions: questions([
      ["ls1","I can translate a broad goal into clear priorities.","vision"],
      ["ls2","I ask questions that help someone find their own solution.","coaching"],
      ["ls3","I can make a timely decision with incomplete information.","decisiveness"],
      ["ls4","People can raise problems with me without fear of punishment.","trust"],
      ["ls5","I explain why a priority matters, not only what to do.","vision"],
      ["ls6","I give feedback that is specific and usable.","coaching"],
      ["ls7","I take responsibility when a decision produces a poor result.","decisiveness"],
      ["ls8","I set standards without humiliating people.","trust"],
      ["ls9","I protect the team from constantly changing priorities.","vision"],
      ["ls10","I notice when guidance has turned into micromanagement.","coaching"],
      ["ls11","I know which decisions need speed and which need consultation.","decisiveness"],
      ["ls12","I recognise contributions and address repeated underperformance.","trust"]
    ]),
    profiles: [
      { dimension:"vision", title:"The Direction Setter", subtitle:"Clarity creates momentum", summary:"You help people understand what matters and why." },
      { dimension:"coaching", title:"The Development Leader", subtitle:"Growth multiplies performance", summary:"You lead by improving capability rather than controlling every move." },
      { dimension:"decisiveness", title:"The Accountable Decider", subtitle:"Movement with ownership", summary:"You create momentum by deciding and taking responsibility." },
      { dimension:"trust", title:"The Trust Builder", subtitle:"Safety and standards coexist", summary:"You build teams where honesty, dignity and accountability reinforce each other." }
    ]
  }

];

export function getExpansionAssessment(id: string) {
  return expansionAssessments.find((assessment) => assessment.id === id);
}

function band(score: number) {
  if (score >= 70) return "high";
  if (score < 42) return "developing";
  return "balanced";
}

function dimensionInterpretation(label: string, description: string, score: number) {
  const level = band(score);
  if (level === "high") {
    return `${label} is a visible strength in your current answers. ${description} You are likely to use this pattern naturally, especially when you feel safe and clear about the situation.`;
  }
  if (level === "developing") {
    return `${label} is currently less automatic for you. ${description} This does not mean inability; it suggests the skill may require more deliberate structure, practice or reassurance.`;
  }
  return `${label} appears balanced rather than extreme. ${description} You can often use this capacity when the context supports it, without relying on it in every situation.`;
}

function growthEdge(label: string, score: number) {
  if (score >= 70) return `Use ${label.toLowerCase()} deliberately, but notice when a strength becomes overused or rigid.`;
  if (score < 42) return `Choose one small, repeatable behaviour that makes ${label.toLowerCase()} easier under pressure.`;
  return `Identify the situations where ${label.toLowerCase()} is strongest and recreate those conditions intentionally.`;
}

function stressCopy(assessment: ExpansionAssessment, strongest: string, weakest: string) {
  const map: Record<ExpansionAssessment["id"], string> = {
    "relationship-intelligence": `Under relational stress, your ${strongest.toLowerCase()} pattern may become overused while ${weakest.toLowerCase()} becomes harder to access. Pause before messaging, separate facts from fears and make one direct request.`,
    "career-alignment": `Under work stress, you may chase the condition represented by ${strongest.toLowerCase()} while neglecting ${weakest.toLowerCase()}. Recheck priorities, decision authority and energy before making a major move.`,
    "growth-systems": `Under stress, your strongest growth skill may continue working while ${weakest.toLowerCase()} collapses first. Build a minimum version of the habit that survives low-energy days.`,
    "attachment-style": `Under attachment stress, protective strategies can become louder than your actual need. Name whether you need reassurance, time, clarity or a boundary before acting.`,
    "emotional-intelligence": `Under emotional pressure, recognition and regulation can separate. Slow the sequence: notice the feeling, name the need, then choose the response.`,
    "communication-style": `Under communication stress, your usual style may become sharper, quieter or less flexible. State the observable issue, the impact and one specific request.`,
    "leadership-style": `Under leadership stress, strengths can become control, avoidance or rushed decisions. Clarify the decision, invite the right input and communicate ownership.`
  };
  return map[assessment.id];
}

function scenarios(assessment: ExpansionAssessment, strongest: string, weakest: string) {
  const maps: Record<ExpansionAssessment["id"], { title: string; insight: string }[]> = {
    "relationship-intelligence": [
      { title: "During conflict", insight: `Lead with ${strongest.toLowerCase()}, then deliberately protect ${weakest.toLowerCase()} before trying to resolve the issue.` },
      { title: "When needs differ", insight: "Describe the need and boundary without treating disagreement as rejection." },
      { title: "After disconnection", insight: "Repair requires acknowledgement, a changed behaviour and enough time for trust to update." }
    ],
    "career-alignment": [
      { title: "Evaluating a job", insight: `Score the role on ${strongest.toLowerCase()} and ${weakest.toLowerCase()}, not only salary or title.` },
      { title: "Feeling stuck", insight: "Separate a role problem, manager problem, skill gap and energy problem before resigning." },
      { title: "Choosing growth", insight: "Prefer an experiment that creates evidence over a dramatic decision based only on frustration." }
    ],
    "growth-systems": [
      { title: "After a missed week", insight: "Restart with the minimum action and remove the friction that caused the break." },
      { title: "When motivation drops", insight: `Use ${strongest.toLowerCase()} to support ${weakest.toLowerCase()} instead of waiting to feel ready.` },
      { title: "Building consistency", insight: "Measure returns and repetitions, not a perfect streak." }
    ],
    "attachment-style": [
      { title: "A delayed response", insight: "Pause before converting uncertainty into a story about rejection or loss of interest." },
      { title: "Needing space", insight: "Explain what space means, how long you need and when you will reconnect." },
      { title: "Asking for reassurance", insight: "A direct request is healthier than testing, chasing or withdrawing." }
    ],
    "emotional-intelligence": [
      { title: "Strong anger", insight: "Identify the boundary, disappointment or fear underneath the intensity." },
      { title: "Another person is upset", insight: "Check your interpretation before assuming you understand the cause." },
      { title: "A difficult conversation", insight: "Name impact and need without using emotion as proof that your interpretation is correct." }
    ],
    "communication-style": [
      { title: "Giving feedback", insight: "Use one observable example, explain impact and agree on the next behaviour." },
      { title: "Setting a boundary", insight: "Be clear enough to be understood and calm enough to be heard." },
      { title: "Being misunderstood", insight: "Check meaning before repeating the same message with more intensity." }
    ],
    "leadership-style": [
      { title: "A team misses the target", insight: "Separate unclear direction, capability, capacity and accountability before reacting." },
      { title: "A fast decision", insight: `Use ${strongest.toLowerCase()} without excluding the input needed to protect ${weakest.toLowerCase()}.` },
      { title: "Giving ownership", insight: "Define outcome, constraints and review points—then avoid taking the work back." }
    ]
  };
  return maps[assessment.id];
}
export function buildExpansionReport(
  assessment: ExpansionAssessment,
  answers: ExpansionAnswers,
  completedAt = new Date().toISOString()
): ExpansionReport {
  const expected = assessment.questions.map((question) => question.id);
  if (
    Object.keys(answers).length !== expected.length ||
    expected.some((id) => ![1, 2, 3, 4, 5].includes(answers[id]))
  ) {
    throw new Error("A complete valid answer set is required.");
  }

  const totals = Object.fromEntries(
    assessment.dimensions.map((dimension) => [dimension.id, { earned: 0, count: 0 }])
  ) as Record<string, { earned: number; count: number }>;

  for (const question of assessment.questions) {
    const raw = answers[question.id];
    const value = question.reverse ? 6 - raw : raw;
    totals[question.dimension].earned += value - 1;
    totals[question.dimension].count += 1;
  }

  const dimensions = assessment.dimensions.map((dimension) => {
    const total = totals[dimension.id];
    return {
      ...dimension,
      score: Math.round((total.earned / (total.count * 4)) * 100)
    };
  });

  const ordered = [...dimensions].sort((a, b) => b.score - a.score);
  const strongest = ordered[0];
  const weakest = ordered[ordered.length - 1];
  const profile = assessment.profiles.find((item) => item.dimension === strongest.id)!;

  return {
    assessmentId: assessment.id,
    completedAt,
    title: profile.title,
    subtitle: profile.subtitle,
    summary: profile.summary,
    dimensions,
    strengths: [
      `${strongest.label} is currently your clearest advantage and is likely to appear naturally when the context feels safe.`,
      `${ordered[1].label} gives your strongest pattern useful balance and prevents it from becoming one-dimensional.`,
      `Your current pattern suggests that improvement will be faster when you build on existing strengths instead of copying a system designed for someone else.`,
      `You have a clear starting point: use ${strongest.label.toLowerCase()} deliberately in one real situation rather than treating the result as an abstract label.`
    ],
    watchouts: [
      `${weakest.label} may become the limiting factor when pressure is high or support is unclear.`,
      `Your strongest dimension can become overused; a strength without context can turn into rigidity, avoidance or over-responsibility.`,
      "A score describes your current answers, not a permanent identity, diagnosis or guaranteed outcome."
    ],
    dimensionInsights: dimensions.map((item) => ({
      id: item.id,
      interpretation: dimensionInterpretation(item.label, item.description, item.score),
      growthEdge: growthEdge(item.label, item.score)
    })),
    stressPattern: stressCopy(assessment, strongest.label, weakest.label),
    realLifeScenarios: scenarios(assessment, strongest.label, weakest.label),
    actionPlan: [
      `Use one existing ${strongest.label.toLowerCase()} strength in a real decision this week.`,
      `Choose one small behaviour that strengthens ${weakest.label.toLowerCase()}.`,
      `Ask one trusted person where they see your ${strongest.label.toLowerCase()} helping—and where it becomes overused.`,
      "Repeat the assessment after four to six weeks and compare behaviour, not only scores."
    ],
    sevenDayPlan: [
      "Day 1: Write one recent situation that reflects your strongest dimension.",
      "Day 2: Notice one trigger connected to your weakest dimension.",
      "Day 3: Practise one direct request, boundary or decision statement.",
      "Day 4: Change one environmental cue that makes the desired behaviour easier.",
      "Day 5: Use the report in one real conversation or work decision.",
      "Day 6: Ask for one specific piece of feedback.",
      "Day 7: Review behaviour, friction and progress without judging your identity."
    ],
    thirtyDayRoadmap: [
      "Week 1 — Observe: track triggers, strengths and repeated situations.",
      "Week 2 — Practise: repeat one small skill linked to the lowest score.",
      "Week 3 — Apply: use the insight in a real relationship, career or growth decision.",
      "Week 4 — Integrate: review evidence, adjust the plan and choose the next measurable behaviour."
    ],
    affiliateCategory: assessment.affiliateCategory
  };
}
