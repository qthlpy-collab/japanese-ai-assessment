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
  if(!participants.length)return 'No reviewed complete-case records are loaded. Collect and score responses before generating a results summary.';
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

  return `The currently loaded complete-case dataset contains ${n} participants. The median total score was ${totalPreMedian} at pre-test and ${totalPostMedian} at immediate post-test, with a mean gain of ${totalGainMean}. The delayed median was ${totalDelayedMedian}; average delayed/immediate retention was ${retentionMean}%. ${dimensionSentences} The gain interquartile range was ${round(totalStats.iqr)}. Questionnaire results: ${satisfaction.join('; ')}. These pooled within-participant comparisons do not estimate differences between feedback conditions. Missing and unreviewed cases are excluded from this dashboard. Confirm dataset provenance, form equivalence, learning duration and the planned comparison before interpreting results. Small samples, test familiarity, ceiling effects, self-report bias and a short intervention limit conclusions. Report adjusted p-values alongside effect sizes and uncertainty; statistical detectability alone does not establish educational importance.`;
}
