export type DimensionId = "depth" | "agency" | "connection" | "adaptability";

export type AnswerValue = 1 | 2 | 3 | 4 | 5;

export type AssessmentOption = {
  label: string;
  value: AnswerValue;
};

export type DimensionWeight = {
  dimension: DimensionId;
  weight: number;
  reverse?: boolean;
};

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: AssessmentOption[];
  weights: DimensionWeight[];
};

export type AssessmentDefinition = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: AssessmentQuestion[];
};

export type AssessmentAnswers = Record<string, AnswerValue>;

export type DimensionScore = {
  id: DimensionId;
  label: string;
  score: number;
  band: "low" | "balanced" | "high";
};

export type PersonalityProfile = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
};

export type PersonalityReport = {
  assessmentId: string;
  completedAt: string;
  dimensions: DimensionScore[];
  profile: PersonalityProfile;
  strongestDimension: DimensionScore;
  balancingDimension: DimensionScore;
  strengths: string[];
  watchouts: string[];
  communicationStyle: string;
  decisionStyle: string;
  idealEnvironment: string;
  stressPattern: string;
  relationshipInsight: string;
  workInsight: string;
  combinationInsight: string;
  actionPlan: string[];
  sevenDayPlan: string[];
  thirtyDayRoadmap: string[];
};
