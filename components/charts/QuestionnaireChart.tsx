'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EnrichedParticipant } from '@/lib/data/types';
import { questionnaireDistribution } from '@/lib/statistics/analysis';
import { ChartFrame } from './ChartFrame';

export function QuestionnaireChart({ participants }: { participants: EnrichedParticipant[] }) {
  return (
    <ChartFrame title="Questionnaire Likert Distribution" description={`Frequency distribution for 1-5 Likert items, N=${participants.length}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={questionnaireDistribution(participants)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="item" tick={false} label={{ value: 'Questionnaire item', position: 'insideBottom', offset: -4 }} />
          <YAxis allowDecimals={false} label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="1" stackId="a" fill="#c73a4a" />
          <Bar dataKey="2" stackId="a" fill="#d98c18" />
          <Bar dataKey="3" stackId="a" fill="#a8b2ad" />
          <Bar dataKey="4" stackId="a" fill="#168a75" />
          <Bar dataKey="5" stackId="a" fill="#173b2f" />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
