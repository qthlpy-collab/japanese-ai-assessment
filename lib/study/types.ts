export const dimensions = ['vocabularyRecognition', 'vocabularyRecall', 'contextualUsage', 'conversation', 'grammar'] as const;
export type Dimension = typeof dimensions[number];
export const stages = ['Pre', 'Post', 'Delayed'] as const;
export type Stage = typeof stages[number];
export type Condition = 'fixed' | 'corrective' | 'guided';
export type Form = 'A' | 'B' | 'C';
export interface Question {
  id: string; form: Form; dimension: Dimension; prompt: string;
  kind: 'choice' | 'recall' | 'writing'; options?: string[];
  answers: string[]; reference: string; rubric: string; source: 'authored' | 'ai';
}
export type PublicQuestion = Omit<Question, 'answers' | 'reference' | 'rubric'>;
export interface Attempt {
  id: string; stage: Stage; form: Form; questions: Question[];
  startedAt: string; deadline: string; submittedAt?: string; timedOut?: boolean;
  answers: Record<string, string>; scores: Record<string, number | null>;
  ratings: Record<string, { score: number; rater: string; at: string; note: string }>;
  updatedAt: string;
}
export interface FeedbackLog { taskId: string; input: string; feedback: string; at: string; model: string; condition: Condition }
export interface Learner {
  id: string; tokenHash: string; condition: Condition; formOrder: Form[];
  profile?: { ageGroup: string; japaneseLevel: string; aiExperience: string };
  consentAt?: string; attempts: Partial<Record<Stage, Attempt>>;
  learningStartedAt?: string; learningCompletedAt?: string; feedback: FeedbackLog[];
  questionnaire?: Record<string, number>;
}
export interface StudySettings {
  title: string; accepting: boolean; learningMinutes: number; examMinutes: number;
  delayedDays: number; requireDelayed: boolean;
}
export interface Audit { at: string; action: string; subject: string }
export interface StudyState {
  version: 1; settings: StudySettings; bank: Question[]; drafts: Question[];
  learners: Learner[]; audit: Audit[];
}
export interface LearnerView {
  id: string; condition: Condition; consentAt?: string; profile?: Learner['profile'];
  attempts: Partial<Record<Stage, Omit<Attempt, 'questions' | 'scores' | 'ratings'> & { questions: PublicQuestion[] }>>;
  learningStartedAt?: string; learningCompletedAt?: string; feedback: FeedbackLog[];
  questionnaire?: Record<string, number>; settings: StudySettings; delayedAvailableAt?: string;
}
export const surveyKeys = ['perceivedUsefulness', 'feedbackClarity', 'learningEngagement', 'confidenceImprovement', 'cognitiveLoad', 'intentionToReuse'] as const;
