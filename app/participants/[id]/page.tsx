'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { memoryDimensions, questionnaireItems } from '@/config/assessmentWeights';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperimentData } from '@/components/layout/DataProvider';
import { getScore, dimensionGain, dimensionRetention } from '@/lib/data/transformations';
import { round, gainCategory } from '@/lib/statistics/descriptive';
import { generateParticipantSummary } from '@/lib/reports/summaryGenerator';
import { ParticipantRadarChart } from '@/components/charts/ParticipantRadarChart';

export default function ParticipantDetailPage() {
  const params = useParams<{ id: string }>();
  const { participants } = useExperimentData();
  const participant = participants.find((p) => p.participantId === params.id);
  if (!participant) return <div className="text-sm text-[var(--muted-foreground)]">Participant not found.</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/participants"><ArrowLeft size={16} /> Back to participants</Link>
      </Button>

      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Participant {participant.participantId}</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">{participant.ageGroup} · {participant.japaneseLevel} · AI experience: {participant.aiExperience}</p>
        </div>
        <Badge>Total gain: {round(participant.totalGain)}</Badge>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <ParticipantRadarChart participant={participant} />
        <Card>
          <CardHeader>
            <CardTitle>Rule-based Diagnostic Summary</CardTitle>
            <CardDescription>Generated from observed scores only. It does not claim causation.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{generateParticipantSummary(participant)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memory Dimension Detail</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {['Dimension', 'Pre', 'Post', 'Delayed', 'Gain', 'Gain Category', 'Retention'].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-bold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memoryDimensions.map((dimension) => {
                const gain = dimensionGain(participant, dimension.key);
                return (
                  <tr key={dimension.key} className="border-b border-[var(--border)]">
                    <td className="px-3 py-3 font-semibold">{dimension.label}</td>
                    <td className="px-3 py-3">{getScore(participant, dimension.key, 'Pre')}</td>
                    <td className="px-3 py-3">{getScore(participant, dimension.key, 'Post')}</td>
                    <td className="px-3 py-3">{getScore(participant, dimension.key, 'Delayed')}</td>
                    <td className="px-3 py-3">{gain}</td>
                    <td className="px-3 py-3">{gainCategory(gain)}</td>
                    <td className="px-3 py-3">{round(dimensionRetention(participant, dimension.key))}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Reduced response time does not necessarily indicate improved language quality.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[var(--muted)] p-4"><p className="text-sm">Pre</p><b>{participant.responseTimePre}s</b></div>
            <div className="rounded-lg bg-[var(--muted)] p-4"><p className="text-sm">Post</p><b>{participant.responseTimePost}s</b></div>
            <div className="rounded-lg bg-[var(--muted)] p-4"><p className="text-sm">Delayed</p><b>{participant.responseTimeDelayed}s</b></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {questionnaireItems.map((item) => (
              <div key={item.key} className="flex justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <span>{item.label}</span>
                <b>{participant[item.key]}</b>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
