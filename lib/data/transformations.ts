import { assessmentWeights, memoryDimensions } from '@/config/assessmentWeights';
import type { EnrichedParticipant, MemoryDimensionKey, Participant } from './types';
import { gain, retentionRate } from '@/lib/statistics/descriptive';

export function getScore(participant: Participant, dimension: MemoryDimensionKey, stage: 'Pre' | 'Post' | 'Delayed') {
  return participant[`${dimension}${stage}` as keyof Participant] as number;
}

export function calculateTotal(participant: Participant, stage: 'Pre' | 'Post' | 'Delayed') {
  return memoryDimensions.reduce(
    (sum, dimension) => sum + getScore(participant, dimension.key, stage) * assessmentWeights[dimension.key],
    0
  );
}

export function enrichParticipant(participant: Participant): EnrichedParticipant {
  const totalPre = calculateTotal(participant, 'Pre');
  const totalPost = calculateTotal(participant, 'Post');
  const totalDelayed = calculateTotal(participant, 'Delayed');
  return {
    ...participant,
    totalPre,
    totalPost,
    totalDelayed,
    totalGain: gain(totalPost, totalPre),
    totalRetentionRate: retentionRate(totalDelayed, totalPost),
    responseTimeReduction: participant.responseTimePre - participant.responseTimePost
  };
}

export function enrichParticipants(participants: Participant[]) {
  return participants.map(enrichParticipant);
}

export function dimensionGain(participant: Participant, dimension: MemoryDimensionKey) {
  return getScore(participant, dimension, 'Post') - getScore(participant, dimension, 'Pre');
}

export function dimensionRetention(participant: Participant, dimension: MemoryDimensionKey) {
  return retentionRate(getScore(participant, dimension, 'Delayed'), getScore(participant, dimension, 'Post'));
}
