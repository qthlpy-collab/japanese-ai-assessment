import { memoryDimensions, questionnaireItems } from '@/config/assessmentWeights';
import type { EnrichedParticipant, MemoryDimensionKey } from '@/lib/data/types';
import { dimensionGain, dimensionRetention, getScore } from '@/lib/data/transformations';
import { describe, gain, median, mean, percentageChange, round } from './descriptive';
import { wilcoxonSignedRank } from './wilcoxon';
import { wilcoxonEffectSize, interpretEffectSize } from './effectSize';
import { holmCorrection } from './holmCorrection';
import { spearmanCorrelation } from './spearman';

export function dashboardMetrics(participants: EnrichedParticipant[]) {
  const satisfactionValues = participants.map((p) => p.intentionToReuse);
  return {
    participantCount: participants.length,
    averageTotalPre: mean(participants.map((p) => p.totalPre)) ?? 0,
    averageTotalPost: mean(participants.map((p) => p.totalPost)) ?? 0,
    averageTotalGain: mean(participants.map((p) => p.totalGain)) ?? 0,
    averageRetentionRate: mean(participants.map((p) => p.totalRetentionRate)) ?? 0,
    averageResponseTimeReduction: mean(participants.map((p) => p.responseTimeReduction)) ?? 0,
    satisfactionMedian: median(satisfactionValues) ?? 0,
    satisfactionTopBox: (satisfactionValues.filter((v) => v >= 4).length / Math.max(1, satisfactionValues.length)) * 100
  };
}

export function dimensionStageRows(participants: EnrichedParticipant[]) {
  return memoryDimensions.map((dimension) => ({
    dimension: dimension.shortLabel,
    Pre: round(mean(participants.map((p) => getScore(p, dimension.key, 'Pre')))) ?? 0,
    Post: round(mean(participants.map((p) => getScore(p, dimension.key, 'Post')))) ?? 0,
    Delayed: round(mean(participants.map((p) => getScore(p, dimension.key, 'Delayed')))) ?? 0,
    n: participants.length
  }));
}

export function dimensionAnalyses(participants: EnrichedParticipant[]) {
  const base = memoryDimensions.map((dimension) => {
    const pre = participants.map((p) => getScore(p, dimension.key, 'Pre'));
    const post = participants.map((p) => getScore(p, dimension.key, 'Post'));
    const delayed = participants.map((p) => getScore(p, dimension.key, 'Delayed'));
    const gains = participants.map((p) => dimensionGain(p, dimension.key));
    const postPre = wilcoxonSignedRank(pre, post);
    const delayedPost = wilcoxonSignedRank(post, delayed);
    const delayedPre = wilcoxonSignedRank(pre, delayed);
    const effectSize = wilcoxonEffectSize(postPre.z, postPre.n);
    return {
      key: dimension.key,
      label: dimension.label,
      shortLabel: dimension.shortLabel,
      pre: describe(pre),
      post: describe(post),
      delayed: describe(delayed),
      meanGain: mean(gains),
      medianGain: median(gains),
      percentageChange: percentageChange(mean(post) ?? 0, mean(pre) ?? 0),
      retentionRate: mean(participants.map((p) => dimensionRetention(p, dimension.key))),
      postPre,
      delayedPost,
      delayedPre,
      effectSize,
      effectInterpretation: interpretEffectSize(effectSize),
      rawP: postPre.pValue,
      holmAdjustedP: postPre.pValue,
      significantAfterHolm: false
    };
  });

  const adjusted = holmCorrection(base.map((item) => ({ label: item.key, pValue: item.rawP })));
  return base.map((item) => {
    const match = adjusted.find((a) => a.label === item.key)!;
    return { ...item, holmAdjustedP: match.adjustedP, significantAfterHolm: match.significantAfterHolm };
  });
}

export function gainDistributionRows(participants: EnrichedParticipant[]) {
  return participants.flatMap((participant) =>
    memoryDimensions.map((dimension) => ({
      participantId: participant.participantId,
      dimension: dimension.shortLabel,
      gain: dimensionGain(participant, dimension.key)
    }))
  );
}

export function slopeRows(participants: EnrichedParticipant[], dimension: MemoryDimensionKey = 'vocabularyRecognition') {
  return participants.flatMap((participant) => [
    { participantId: participant.participantId, stage: 'Pre', score: getScore(participant, dimension, 'Pre') },
    { participantId: participant.participantId, stage: 'Post', score: getScore(participant, dimension, 'Post') }
  ]);
}

export function questionnaireDistribution(participants: EnrichedParticipant[]) {
  return questionnaireItems.map((item) => {
    const values = participants.map((p) => p[item.key]);
    return {
      item: item.label,
      '1': values.filter((value) => value === 1).length,
      '2': values.filter((value) => value === 2).length,
      '3': values.filter((value) => value === 3).length,
      '4': values.filter((value) => value === 4).length,
      '5': values.filter((value) => value === 5).length,
      median: median(values),
      iqr: describe(values).iqr,
      topBox: (values.filter((value) => value >= 4).length / Math.max(1, values.length)) * 100
    };
  });
}

export function responseTimeRows(participants: EnrichedParticipant[]) {
  return [
    { stage: 'Pre', seconds: round(mean(participants.map((p) => p.responseTimePre))) ?? 0 },
    { stage: 'Post', seconds: round(mean(participants.map((p) => p.responseTimePost))) ?? 0 },
    { stage: 'Delayed', seconds: round(mean(participants.map((p) => p.responseTimeDelayed))) ?? 0 }
  ];
}

export function correlationRows(participants: EnrichedParticipant[]) {
  const contextualGain = participants.map((p) => gain(p.contextualUsagePost, p.contextualUsagePre));
  const conversationGain = participants.map((p) => gain(p.conversationPost, p.conversationPre));
  return [
    {
      relationship: 'learningEngagement vs totalGain',
      rho: spearmanCorrelation(
        participants.map((p) => p.learningEngagement),
        participants.map((p) => p.totalGain)
      )
    },
    {
      relationship: 'feedbackClarity vs contextualUsageGain',
      rho: spearmanCorrelation(
        participants.map((p) => p.feedbackClarity),
        contextualGain
      )
    },
    {
      relationship: 'confidenceImprovement vs conversationGain',
      rho: spearmanCorrelation(
        participants.map((p) => p.confidenceImprovement),
        conversationGain
      )
    },
    {
      relationship: 'cognitiveLoad vs totalGain',
      rho: spearmanCorrelation(
        participants.map((p) => p.cognitiveLoad),
        participants.map((p) => p.totalGain)
      )
    },
    {
      relationship: 'responseTimeReduction vs conversationGain',
      rho: spearmanCorrelation(
        participants.map((p) => p.responseTimeReduction),
        conversationGain
      )
    }
  ];
}
