'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dimensionStageRows } from '@/lib/statistics/analysis';
import type { EnrichedParticipant } from '@/lib/data/types';
import { ChartFrame } from './ChartFrame';

export function GroupBarChart({ participants }: { participants: EnrichedParticipant[] }) {
  return (
    <ChartFrame title="Mean Memory Scores by Stage" description={`Grouped bar chart, N=${participants.length}. Y-axis starts at 0.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dimensionStageRows(participants)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dimension" label={{ value: 'Memory dimension', position: 'insideBottom', offset: -4 }} />
          <YAxis domain={[0, 100]} label={{ value: 'Mean score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Pre" fill="#7b8f86" />
          <Bar dataKey="Post" fill="#173b2f" />
          <Bar dataKey="Delayed" fill="#c94c32" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
