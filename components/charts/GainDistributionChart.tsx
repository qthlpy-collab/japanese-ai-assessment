'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrichedParticipant } from '@/lib/data/types';
import { gainDistributionRows } from '@/lib/statistics/analysis';
import { ChartFrame } from './ChartFrame';

export function GainDistributionChart({ participants }: { participants: EnrichedParticipant[] }) {
  return (
    <ChartFrame title="Individual Gain Score Distribution" description={`Gain score = Post-test minus Pre-test, N=${participants.length}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={gainDistributionRows(participants)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="participantId" label={{ value: 'Participant', position: 'insideBottom', offset: -4 }} />
          <YAxis label={{ value: 'Gain score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="gain" fill="#168a75" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
