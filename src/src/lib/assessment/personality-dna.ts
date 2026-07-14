import type {
  AssessmentDefinition,
  AssessmentOption,
  DimensionId,
  PersonalityProfile
} from "@/lib/assessment/types";

const agreementOptions: AssessmentOption[] = [
  { label: "Strongly disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly agree", value: 5 }
];

export const dimensionLabels: Record<DimensionId, string> = {
  depth: "Emotional depth",
  agency: "Independent agency",
  connection: "Relational connection",
  adaptability: "Adaptive flexibility"
};

export const personalityDnaAssessment: AssessmentDefinition = {
  id: "personality-dna",
  title: "Personality DNA",
  description:
    "A structured reflection across emotional depth, agency, connection and adaptability.",
  estimatedMinutes: 8,
  questions: [
    {
      id: "q1",
      prompt: "I usually notice emotional details that other people miss.",
      helper: "Think about tone, atmosphere and subtle changes in behaviour.",
      options: agreementOptions,
      weights: [{ dimension: "depth", weight: 1.3 }]
    },
    {
      id: "q2",
      prompt: "I can make an important decision even when others disagree.",
      options: agreementOptions,
      weights: [{ dimension: "agency", weight: 1.25 }]
    },
    {
      id: "q3",
      prompt: "I feel most fulfilled when I have a few deeply trusted relationships.",
      options: agreementOptions,
      weights: [
        { dimension: "connection", weight: 1.2 },
        { dimension: "depth", weight: 0.45 }
      ]
    },
    {
      id: "q4",
      prompt: "When plans change unexpectedly, I recover quickly.",
      options: agreementOptions,
      weights: [{ dimension: "adaptability", weight: 1.3 }]
    },
    {
      id: "q5",
      prompt: "I often reflect on why I reacted a certain way.",
      options: agreementOptions,
      weights: [{ dimension: "depth", weight: 1.2 }]
    },
    {
      id: "q6",
      prompt: "I prefer choosing my own method rather than following a standard process.",
      options: agreementOptions,
      weights: [{ dimension: "agency", weight: 1.15 }]
    },
    {
      id: "q7",
      prompt: "I naturally adjust how I communicate based on the person in front of me.",
      options: agreementOptions,
      weights: [
        { dimension: "adaptability", weight: 0.9 },
        { dimension: "connection", weight: 0.55 }
      ]
    },
    {
      id: "q8",
      prompt: "I need regular quiet time to understand what I am feeling.",
      options: agreementOptions,
      weights: [{ dimension: "depth", weight: 1.05 }]
    },
    {
      id: "q9",
      prompt: "I am comfortable taking responsibility for the direction of my life.",
      options: agreementOptions,
      weights: [{ dimension: "agency", weight: 1.3 }]
    },
    {
      id: "q10",
      prompt: "I usually sense what another person needs from a conversation.",
      options: agreementOptions,
      weights: [{ dimension: "connection", weight: 1.25 }]
    },
    {
      id: "q11",
      prompt: "I become frustrated when I cannot follow my original plan.",
      options: agreementOptions,
      weights: [{ dimension: "adaptability", weight: 1.15, reverse: true }]
    },
    {
      id: "q12",
      prompt: "I find it easy to ask for support before I feel overwhelmed.",
      options: agreementOptions,
      weights: [
        { dimension: "connection", weight: 1.0 },
        { dimension: "agency", weight: 0.35 }
      ]
    },
    {
      id: "q13",
      prompt: "I am drawn to ideas, art or conversations that have multiple layers.",
      options: agreementOptions,
      weights: [{ dimension: "depth", weight: 1.15 }]
    },
    {
      id: "q14",
      prompt: "I can change my opinion without feeling that I have lost myself.",
      options: agreementOptions,
      weights: [
        { dimension: "adaptability", weight: 1.1 },
        { dimension: "agency", weight: 0.35 }
      ]
    },
    {
      id: "q15",
      prompt: "I often put harmony ahead of saying what I actually want.",
      options: agreementOptions,
      weights: [
        { dimension: "connection", weight: 0.8 },
        { dimension: "agency", weight: 0.75, reverse: true }
      ]
    },
    {
      id: "q16",
      prompt: "I can stay emotionally present during a difficult conversation.",
      options: agreementOptions,
      weights: [
        { dimension: "depth", weight: 0.65 },
        { dimension: "connection", weight: 0.85 },
        { dimension: "adaptability", weight: 0.45 }
      ]
    }
  ]
};

export const personalityProfiles: PersonalityProfile[] = [
  {
    id: "reflective-builder",
    title: "The Reflective Builder",
    subtitle: "Depth with direction",
    summary:
      "You combine strong self-awareness with a practical need to shape your own path. You tend to think deeply before acting, then commit seriously once a direction feels meaningful."
  },
  {
    id: "adaptive-connector",
    title: "The Adaptive Connector",
    subtitle: "People-aware and flexible",
    summary:
      "You read people and situations quickly, then adjust without losing the thread of what matters. Your strength is helping different needs coexist."
  },
  {
    id: "independent-explorer",
    title: "The Independent Explorer",
    subtitle: "Autonomy with movement",
    summary:
      "You are energised by freedom, experimentation and the ability to choose your own route. You often learn fastest by trying, adjusting and moving again."
  },
  {
    id: "grounded-empath",
    title: "The Grounded Empath",
    subtitle: "Connection with emotional intelligence",
    summary:
      "You value emotional honesty and reliable connection. You tend to notice what people feel, while also wanting relationships to remain practical and respectful."
  },
  {
    id: "balanced-integrator",
    title: "The Balanced Integrator",
    subtitle: "Range without extremes",
    summary:
      "Your scores are relatively balanced, which means you can access multiple styles depending on the situation. Your advantage is range; your challenge is choosing deliberately rather than staying undecided."
  }
];
