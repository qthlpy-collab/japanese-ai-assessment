import type { MemoryDimensionKey } from '@/lib/data/types';

export const assessmentWeights: Record<MemoryDimensionKey, number> = {
  vocabularyRecognition: 0.2,
  vocabularyRecall: 0.2,
  contextualUsage: 0.2,
  conversation: 0.2,
  grammar: 0.2
};

export const memoryDimensions: { key: MemoryDimensionKey; label: string; shortLabel: string }[] = [
  { key: 'vocabularyRecognition', label: 'Vocabulary Recognition Memory', shortLabel: 'Recognition' },
  { key: 'vocabularyRecall', label: 'Vocabulary Recall Memory', shortLabel: 'Recall' },
  { key: 'contextualUsage', label: 'Contextual Usage Memory', shortLabel: 'Contextual' },
  { key: 'conversation', label: 'Conversational Response Memory', shortLabel: 'Conversation' },
  { key: 'grammar', label: 'Grammar and Form Memory', shortLabel: 'Grammar' }
];

export const questionnaireItems = [
  { key: 'perceivedUsefulness', label: 'Perceived Usefulness' },
  { key: 'feedbackClarity', label: 'Feedback Clarity' },
  { key: 'learningEngagement', label: 'Learning Engagement' },
  { key: 'confidenceImprovement', label: 'Confidence Improvement' },
  { key: 'cognitiveLoad', label: 'Cognitive Load' },
  { key: 'intentionToReuse', label: 'Intention to Reuse' }
] as const;
