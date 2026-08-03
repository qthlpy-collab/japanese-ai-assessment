'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrichedParticipant } from '@/lib/data/types';
import { responseTimeRows } from '@/lib/statistics/analysis';
import { ChartFrame } from './ChartFrame';

export function ResponseTimeChart({ participants }: { participants: EnrichedParticipant[] }) {
  return (
    <ChartFrame
      title="Average Response Time"
      description="Reduced response time does not necessarily indicate improved language quality."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={responseTimeRows(participants)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" label={{ value: 'Test stage', position: 'insideBottom', offset: -4 }} />
          <YAxis domain={[0, 'dataMax + 20']} label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="seconds" fill="#365c99" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
