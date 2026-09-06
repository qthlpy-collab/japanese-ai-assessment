'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperimentData } from '@/components/layout/DataProvider';
import { generateResultsSummary } from '@/lib/reports/summaryGenerator';
import { dimensionAnalyses, questionnaireDistribution } from '@/lib/statistics/analysis';
import { round } from '@/lib/statistics/descriptive';

export default function ResultsPage() {
  const { participants } = useExperimentData();
  const summary = generateResultsSummary(participants);
  const analyses = dimensionAnalyses(participants);
  const questionnaire = questionnaireDistribution(participants);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Automatic Results Summary</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Generated from the currently loaded dataset for research report drafting.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report-ready English Summary</CardTitle>
          <CardDescription>The wording avoids causal claims and emphasizes small-sample research limitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-7 text-[var(--muted-foreground)]">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wilcoxon Result Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyses.map((item) => (
              <div key={item.key} className="rounded-lg border border-[var(--border)] p-3 text-sm">
                <b>{item.shortLabel}</b>
                <p>W={round(item.postPre.w)}, p={round(item.rawP, 3)}, Holm p={round(item.holmAdjustedP, 3)}, r={round(item.effectSize, 2)} ({item.effectInterpretation})</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire Findings</CardTitle>
            <CardDescription>Likert items are summarized with median, IQR, and top-box percentage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionnaire.map((item) => (
              <div key={item.item} className="rounded-lg border border-[var(--border)] p-3 text-sm">
                <b>{item.item}</b>
                <p>Median={round(item.median)}, IQR={round(item.iqr)}, 4-or-5={round(item.topBox)}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
