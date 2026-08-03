'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrichedParticipant } from '@/lib/data/types';
import { dimensionAnalyses } from '@/lib/statistics/analysis';
import { ChartFrame } from './ChartFrame';

export function EffectSizeChart({ participants }: { participants: EnrichedParticipant[] }) {
  const data = dimensionAnalyses(participants).map((item) => ({
    dimension: item.shortLabel,
    r: Number(item.effectSize.toFixed(2)),
    interpretation: item.effectInterpretation
  }));
  return (
    <ChartFrame title="Wilcoxon Effect Sizes" description={`Effect size r = |Z| / sqrt(N), N=${participants.length}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dimension" label={{ value: 'Memory dimension', position: 'insideBottom', offset: -4 }} />
          <YAxis domain={[0, 1]} label={{ value: 'Effect size r', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="r" fill="#173b2f" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
