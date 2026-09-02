import type { Participant } from '@/lib/data/types';

export type ExamStage = 'Pre' | 'Post' | 'Delayed';
export type ExamDimension = 'vocabularyRecognition' | 'vocabularyRecall' | 'contextualUsage' | 'conversation' | 'grammar';
export type ExamQuestionType = 'multiple-choice' | 'short-answer' | 'situational-writing' | 'conversation-response';

export interface ExamQuestion {
  id: string;
  stage: ExamStage;
  dimension: ExamDimension;
  type: ExamQuestionType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  expectedKeywords: string[];
  maxScore: number;
  scoringNote: string;
}

export interface QuestionnaireResponse {
  perceivedUsefulness: number;
  feedbackClarity: number;
  learningEngagement: number;
  confidenceImprovement: number;
  cognitiveLoad: number;
  intentionToReuse: number;
}

export interface ParticipantProfile {
  participantId: string;
  ageGroup: string;
  japaneseLevel: string;
  aiExperience: string;
}

export interface ExamSubmission {
  profile: ParticipantProfile;
  answers: Record<string, string>;
  startedAt: string;
  submittedAt: string;
  elapsedSeconds: number;
  scores: Record<ExamDimension, number>;
  totalScore: number;
}

export interface ParticipantExamRecord {
  profile: ParticipantProfile;
  stages: Partial<Record<ExamStage, ExamSubmission>>;
  questionnaire?: QuestionnaireResponse;
}

export type ParticipantExportRow = Participant;
