'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { memoryDimensions } from '@/config/assessmentWeights';
import type { EnrichedParticipant } from '@/lib/data/types';
import { getScore } from '@/lib/data/transformations';
import { ChartFrame } from './ChartFrame';

export function ParticipantRadarChart({ participant }: { participant: EnrichedParticipant }) {
  const data = memoryDimensions.map((dimension) => ({
    dimension: dimension.shortLabel,
    Pre: getScore(participant, dimension.key, 'Pre'),
    Post: getScore(participant, dimension.key, 'Post'),
    Delayed: getScore(participant, dimension.key, 'Delayed')
  }));
  return (
    <ChartFrame title={`Radar Chart: ${participant.participantId}`} description="Five memory dimensions across test stages.">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Radar dataKey="Pre" stroke="#7b8f86" fill="#7b8f86" fillOpacity={0.12} />
          <Radar dataKey="Post" stroke="#173b2f" fill="#173b2f" fillOpacity={0.2} />
          <Radar dataKey="Delayed" stroke="#c94c32" fill="#c94c32" fillOpacity={0.16} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
