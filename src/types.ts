export type Track = 'academic' | 'daily';

export type ScoreDimension =
  | 'taskCompletion'
  | 'grammarAccuracy'
  | 'vocabularyAppropriateness'
  | 'politenessKeigo'
  | 'fluencyCompleteness';

export type ErrorRisk = 'Low' | 'Medium' | 'High';

export interface AssessmentTask {
  id: string;
  track: Track;
  title: string;
  scenario: string;
  instruction: string;
  hint: string;
  keywords: string[];
  sampleAnswer: string;
  chineseNote: string;
}

export interface ScoreResult {
  taskId: string;
  track: Track;
  overall: number;
  dimensions: Record<ScoreDimension, number>;
  risk: ErrorRisk;
  strengths: string[];
  weaknesses: string[];
  errorTypes: string[];
  suggestion: string;
  sampleAnswer: string;
  chineseExplanation: string;
}

export interface StoredAnswer {
  task: AssessmentTask;
  answer: string;
  result: ScoreResult;
}
