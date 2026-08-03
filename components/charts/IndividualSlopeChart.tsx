'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import type { EnrichedParticipant, MemoryDimensionKey } from '@/lib/data/types';
import { getScore } from '@/lib/data/transformations';
import { ChartFrame } from './ChartFrame';

export function IndividualSlopeChart({
  participants,
  dimension = 'vocabularyRecognition'
}: {
  participants: EnrichedParticipant[];
  dimension?: MemoryDimensionKey;
}) {
  const data = [
    { stage: 'Pre', ...Object.fromEntries(participants.map((p) => [p.participantId, getScore(p, dimension, 'Pre')])) },
    { stage: 'Post', ...Object.fromEntries(participants.map((p) => [p.participantId, getScore(p, dimension, 'Post')])) }
  ];
  const colors = ['#173b2f', '#c94c32', '#168a75', '#d98c18', '#365c99', '#8a4770', '#65736d', '#8c5c2f', '#3d7d8b', '#943f4d'];
  return (
    <ChartFrame title="Individual Slope Chart" description={`Pre to post change for vocabulary recognition, N=${participants.length}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" label={{ value: 'Test stage', position: 'insideBottom', offset: -4 }} />
          <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {participants.map((participant, index) => (
            <Line
              key={participant.participantId}
              dataKey={participant.participantId}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
