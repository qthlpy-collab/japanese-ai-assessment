'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExperimentData } from '@/components/layout/DataProvider';
import { dimensionAnalyses, correlationRows } from '@/lib/statistics/analysis';
import { round } from '@/lib/statistics/descriptive';
import { EffectSizeChart } from '@/components/charts/EffectSizeChart';
import { GainDistributionChart } from '@/components/charts/GainDistributionChart';
import { IndividualSlopeChart } from '@/components/charts/IndividualSlopeChart';

export default function AnalysisPage() {
  const { participants } = useExperimentData();
  const analyses = dimensionAnalyses(participants);
  const correlations = correlationRows(participants);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Memory Dimension Analysis</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Wilcoxon signed-rank tests are treated as the primary inferential analysis because of the small paired sample.
          P-values use a normal approximation with zero differences removed and average ranks for ties.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <EffectSizeChart participants={participants} />
        <IndividualSlopeChart participants={participants} />
        <GainDistributionChart participants={participants} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dimension Statistics</CardTitle>
          <CardDescription>Raw p-values and Holm-adjusted p-values are shown for multiple comparison transparency.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {[
                  'Dimension',
                  'Pre Mean / Median',
                  'Post Mean / Median',
                  'Delayed Mean / Median',
                  'Mean Gain',
                  'Median Gain',
                  '% Change',
                  'Retention',
                  'W',
                  'N',
                  'Raw p',
                  'Holm p',
                  'r',
                  'Effect',
                  'Direction'
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-bold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyses.map((item) => (
                <tr key={item.key} className="border-b border-[var(--border)]">
                  <td className="px-3 py-3 font-semibold">{item.shortLabel}</td>
                  <td className="px-3 py-3">{round(item.pre.mean)} / {round(item.pre.median)}</td>
                  <td className="px-3 py-3">{round(item.post.mean)} / {round(item.post.median)}</td>
                  <td className="px-3 py-3">{round(item.delayed.mean)} / {round(item.delayed.median)}</td>
                  <td className="px-3 py-3">{round(item.meanGain)}</td>
                  <td className="px-3 py-3">{round(item.medianGain)}</td>
                  <td className="px-3 py-3">{round(item.percentageChange)}%</td>
                  <td className="px-3 py-3">{round(item.retentionRate)}%</td>
                  <td className="px-3 py-3">{round(item.postPre.w)}</td>
                  <td className="px-3 py-3">{item.postPre.n}</td>
                  <td className="px-3 py-3">{round(item.rawP, 3)}</td>
                  <td className="px-3 py-3">{round(item.holmAdjustedP, 3)}</td>
                  <td className="px-3 py-3">{round(item.effectSize, 2)}</td>
                  <td className="px-3 py-3"><Badge>{item.effectInterpretation}</Badge></td>
                  <td className="px-3 py-3">{item.postPre.direction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exploratory Spearman Correlations</CardTitle>
          <CardDescription>Correlation does not establish causation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {correlations.map((row) => (
              <div key={row.relationship} className="rounded-lg border border-[var(--border)] p-4">
                <p className="font-semibold">{row.relationship}</p>
                <p className="text-2xl font-black">rho = {round(row.rho, 2) ?? 'n/a'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
