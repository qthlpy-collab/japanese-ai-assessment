'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrichedParticipant } from '@/lib/data/types';
import { dimensionStageRows } from '@/lib/statistics/analysis';
import { ChartFrame } from './ChartFrame';

export function RetentionChart({ participants }: { participants: EnrichedParticipant[] }) {
  const data = dimensionStageRows(participants).map(({ dimension, Post, Delayed }) => ({ dimension, Post, Delayed }));
  return (
    <ChartFrame title="Retention: Post vs Delayed" description={`Delayed post-test compared with immediate post-test, N=${participants.length}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dimension" label={{ value: 'Memory dimension', position: 'insideBottom', offset: -4 }} />
          <YAxis domain={[0, 100]} label={{ value: 'Mean score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Post" fill="#173b2f" />
          <Bar dataKey="Delayed" fill="#c94c32" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
