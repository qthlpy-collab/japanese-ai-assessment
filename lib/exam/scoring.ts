import { examQuestions } from '../../data/examTasks';
import { memoryDimensions, questionnaireItems } from '../../config/assessmentWeights';
import { retentionRate } from '../statistics/descriptive';
import type {
  ExamDimension,
  ExamQuestion,
  ExamStage,
  ExamSubmission,
  ParticipantExamRecord,
  ParticipantExportRow,
  ParticipantProfile,
  QuestionnaireResponse
} from './types';

const dimensions = memoryDimensions.map((dimension) => dimension.key) as ExamDimension[];
const politeExpressionPattern =
  /\u3067\u3059|\u307e\u3059|\u304a\u9858|\u3044\u305f\u3060|\u7533\u3057\u307e\u3059|\u3067\u3057\u3087\u3046\u304b/;

export function scoreQuestion(question: ExamQuestion, answer: string) {
  const normalized = answer.trim();
  if (!normalized) return 0;

  if (question.type === 'multiple-choice') {
    return normalized === question.correctAnswer ? question.maxScore : 0;
  }

  const keywordHits = question.expectedKeywords.filter((keyword) => normalized.includes(keyword)).length;
  const keywordScore = (keywordHits / Math.max(1, question.expectedKeywords.length)) * question.maxScore;
  const lengthBonus = normalized.length >= 45 ? 2 : normalized.length >= 20 ? 1 : 0;
  const politenessBonus = politeExpressionPattern.test(normalized) ? 2 : 0;
  return Math.min(question.maxScore, Math.round(keywordScore + lengthBonus + politenessBonus));
}

export function scoreStage(profile: ParticipantProfile, stage: ExamStage, answers: Record<string, string>, startedAt: string) {
  const questions = examQuestions.filter((question) => question.stage === stage);
  const rawScores = Object.fromEntries(dimensions.map((dimension) => [dimension, 0])) as Record<ExamDimension, number>;

  questions.forEach((question) => {
    rawScores[question.dimension] += scoreQuestion(question, answers[question.id] ?? '');
  });

  const scores = Object.fromEntries(
    dimensions.map((dimension) => [dimension, Math.min(100, Math.round(rawScores[dimension] * 5))])
  ) as Record<ExamDimension, number>;
  const submittedAt = new Date().toISOString();
  const elapsedSeconds = Math.max(1, Math.round((Date.parse(submittedAt) - Date.parse(startedAt)) / 1000));
  const totalScore = Math.round(dimensions.reduce((sum, dimension) => sum + scores[dimension], 0) / dimensions.length);

  return {
    profile,
    answers,
    startedAt,
    submittedAt,
    elapsedSeconds,
    scores,
    totalScore
  } satisfies ExamSubmission;
}

export function canExportParticipant(record: ParticipantExamRecord) {
  return Boolean(record.stages.Pre && record.stages.Post && record.stages.Delayed && record.questionnaire);
}

export function recordToParticipantRow(record: ParticipantExamRecord): ParticipantExportRow | null {
  if (!canExportParticipant(record)) return null;
  const pre = record.stages.Pre!;
  const post = record.stages.Post!;
  const delayed = record.stages.Delayed!;
  const questionnaire = record.questionnaire!;

  return {
    participantId: record.profile.participantId,
    ageGroup: record.profile.ageGroup,
    japaneseLevel: record.profile.japaneseLevel,
    aiExperience: record.profile.aiExperience,
    vocabularyRecognitionPre: pre.scores.vocabularyRecognition,
    vocabularyRecognitionPost: post.scores.vocabularyRecognition,
    vocabularyRecognitionDelayed: delayed.scores.vocabularyRecognition,
    vocabularyRecallPre: pre.scores.vocabularyRecall,
    vocabularyRecallPost: post.scores.vocabularyRecall,
    vocabularyRecallDelayed: delayed.scores.vocabularyRecall,
    contextualUsagePre: pre.scores.contextualUsage,
    contextualUsagePost: post.scores.contextualUsage,
    contextualUsageDelayed: delayed.scores.contextualUsage,
    conversationPre: pre.scores.conversation,
    conversationPost: post.scores.conversation,
    conversationDelayed: delayed.scores.conversation,
    grammarPre: pre.scores.grammar,
    grammarPost: post.scores.grammar,
    grammarDelayed: delayed.scores.grammar,
    responseTimePre: pre.elapsedSeconds,
    responseTimePost: post.elapsedSeconds,
    responseTimeDelayed: delayed.elapsedSeconds,
    perceivedUsefulness: questionnaire.perceivedUsefulness,
    feedbackClarity: questionnaire.feedbackClarity,
    learningEngagement: questionnaire.learningEngagement,
    confidenceImprovement: questionnaire.confidenceImprovement,
    cognitiveLoad: questionnaire.cognitiveLoad,
    intentionToReuse: questionnaire.intentionToReuse
  };
}

export function recordsToParticipantRows(records: ParticipantExamRecord[]) {
  return records.map(recordToParticipantRow).filter((row): row is ParticipantExportRow => Boolean(row));
}

export function defaultQuestionnaire(): QuestionnaireResponse {
  return Object.fromEntries(questionnaireItems.map((item) => [item.key, 3])) as unknown as QuestionnaireResponse;
}

export function completionSummary(record: ParticipantExamRecord) {
  const completeStages = (['Pre', 'Post', 'Delayed'] as ExamStage[]).filter((stage) => record.stages[stage]).length;
  const retention =
    record.stages.Post && record.stages.Delayed
      ? retentionRate(record.stages.Delayed.totalScore, record.stages.Post.totalScore)
      : null;
  return {
    completeStages,
    questionnaireComplete: Boolean(record.questionnaire),
    exportReady: canExportParticipant(record),
    retention
  };
}
