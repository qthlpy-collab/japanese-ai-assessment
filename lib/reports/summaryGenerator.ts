import { memoryDimensions, questionnaireItems } from '@/config/assessmentWeights';
import type { EnrichedParticipant } from '@/lib/data/types';
import { getScore } from '@/lib/data/transformations';
import { describe, median, mean, round } from '@/lib/statistics/descriptive';
import { interpretEffectSize, wilcoxonEffectSize } from '@/lib/statistics/effectSize';
import { wilcoxonSignedRank } from '@/lib/statistics/wilcoxon';

export function generateParticipantSummary(participant: EnrichedParticipant) {
  const gains = memoryDimensions.map((dimension) => ({
    label: dimension.shortLabel,
    gain: getScore(participant, dimension.key, 'Post') - getScore(participant, dimension.key, 'Pre'),
    retention: getScore(participant, dimension.key, 'Delayed') - getScore(participant, dimension.key, 'Post')
  }));
  const strongest = [...gains].sort((a, b) => b.gain - a.gain)[0];
  const weakest = [...gains].sort((a, b) => a.gain - b.gain)[0];
  const retentionLoss = gains.filter((item) => item.retention < 0).length;

  return `Participant ${participant.participantId} showed the strongest immediate observed change in ${strongest.label}, while ${weakest.label} showed the most limited change. Delayed results suggest ${retentionLoss >= 3 ? 'partial retention loss across several dimensions' : 'relatively stable retention in most dimensions'}. This summary describes observed data only and does not claim that the AI system caused the change.`;
}

export function generateResultsSummary(participants: EnrichedParticipant[]) {
  const n = participants.length;
  const totalPreMedian = round(median(participants.map((p) => p.totalPre)));
  const totalPostMedian = round(median(participants.map((p) => p.totalPost)));
  const totalDelayedMedian = round(median(participants.map((p) => p.totalDelayed)));
  const totalGainMean = round(mean(participants.map((p) => p.totalGain)));
  const retentionMean = round(mean(participants.map((p) => p.totalRetentionRate)));

  const dimensionSentences = memoryDimensions
    .map((dimension) => {
      const pre = participants.map((p) => getScore(p, dimension.key, 'Pre'));
      const post = participants.map((p) => getScore(p, dimension.key, 'Post'));
      const test = wilcoxonSignedRank(pre, post);
      const r = wilcoxonEffectSize(test.z, test.n);
      return `${dimension.shortLabel}: median ${round(median(pre))} to ${round(median(post))}, W=${round(test.w)}, p=${round(test.pValue, 3)}, r=${round(r, 2)} (${interpretEffectSize(r)}).`;
    })
    .join(' ');

  const satisfaction = questionnaireItems.map((item) => {
    const values = participants.map((p) => p[item.key]);
    const topBox = (values.filter((value) => value >= 4).length / values.length) * 100;
    return `${item.label}: median ${round(median(values))}, ${round(topBox)}% selected 4 or 5`;
  });

  const totalStats = describe(participants.map((p) => p.totalGain));

  return `In the current round-one dataset, ${n} Chinese-background Japanese learners completed a single-group pre-test, AI-assisted learning session, immediate post-test, and delayed post-test workflow. The median total memory score increased from ${totalPreMedian} before learning to ${totalPostMedian} immediately after the session, with a mean total gain of ${totalGainMean}. The delayed median score was ${totalDelayedMedian}, and the average total retention rate was ${retentionMean}%. Changes by memory dimension were as follows: ${dimensionSentences} The mean total gain was ${round(totalStats.mean)} with an interquartile range of ${round(totalStats.iqr)}. Questionnaire responses were generally positive: ${satisfaction.join('; ')}. Because the dataset includes only ten participants, lacks a control group, and represents a short two-hour intervention, the findings should not be interpreted as proving AI effectiveness or establishing long-term educational impact.`;
}
