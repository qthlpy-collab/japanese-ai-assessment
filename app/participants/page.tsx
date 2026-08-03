'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExperimentData } from '@/components/layout/DataProvider';
import { round } from '@/lib/statistics/descriptive';

export default function ParticipantsPage() {
  const { participants } = useExperimentData();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Participant Overview</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Click a participant to inspect individual gains, retention, response time, questionnaire responses, and radar chart.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {participants.map((participant) => (
          <Card key={participant.participantId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{participant.participantId}</CardTitle>
                <Badge>{participant.japaneseLevel}</Badge>
              </div>
              <CardDescription>{participant.ageGroup} · AI experience: {participant.aiExperience}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-[var(--muted)] p-3"><p>Pre</p><b>{round(participant.totalPre)}</b></div>
                <div className="rounded-lg bg-[var(--muted)] p-3"><p>Post</p><b>{round(participant.totalPost)}</b></div>
                <div className="rounded-lg bg-[var(--muted)] p-3"><p>Gain</p><b>{round(participant.totalGain)}</b></div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/participants/${participant.participantId}`}>View detail</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
