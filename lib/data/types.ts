export type MemoryDimensionKey =
  | 'vocabularyRecognition'
  | 'vocabularyRecall'
  | 'contextualUsage'
  | 'conversation'
  | 'grammar';

export type TestStage = 'Pre' | 'Post' | 'Delayed';

export interface Participant {
  participantId: string;
  ageGroup: string;
  japaneseLevel: string;
  aiExperience: string;
  vocabularyRecognitionPre: number;
  vocabularyRecognitionPost: number;
  vocabularyRecognitionDelayed: number;
  vocabularyRecallPre: number;
  vocabularyRecallPost: number;
  vocabularyRecallDelayed: number;
  contextualUsagePre: number;
  contextualUsagePost: number;
  contextualUsageDelayed: number;
  conversationPre: number;
  conversationPost: number;
  conversationDelayed: number;
  grammarPre: number;
  grammarPost: number;
  grammarDelayed: number;
  responseTimePre: number;
  responseTimePost: number;
  responseTimeDelayed: number;
  perceivedUsefulness: number;
  feedbackClarity: number;
  learningEngagement: number;
  confidenceImprovement: number;
  cognitiveLoad: number;
  intentionToReuse: number;
}

export interface EnrichedParticipant extends Participant {
  totalPre: number;
  totalPost: number;
  totalDelayed: number;
  totalGain: number;
  totalRetentionRate: number | null;
  responseTimeReduction: number;
}

export const csvFields: (keyof Participant)[] = [
  'participantId',
  'ageGroup',
  'japaneseLevel',
  'aiExperience',
  'vocabularyRecognitionPre',
  'vocabularyRecognitionPost',
  'vocabularyRecognitionDelayed',
  'vocabularyRecallPre',
  'vocabularyRecallPost',
  'vocabularyRecallDelayed',
  'contextualUsagePre',
  'contextualUsagePost',
  'contextualUsageDelayed',
  'conversationPre',
  'conversationPost',
  'conversationDelayed',
  'grammarPre',
  'grammarPost',
  'grammarDelayed',
  'responseTimePre',
  'responseTimePost',
  'responseTimeDelayed',
  'perceivedUsefulness',
  'feedbackClarity',
  'learningEngagement',
  'confidenceImprovement',
  'cognitiveLoad',
  'intentionToReuse'
];
