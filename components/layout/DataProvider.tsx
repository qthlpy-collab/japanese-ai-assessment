'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { simulatedParticipants } from '@/data/simulatedParticipants';
import type { Participant } from '@/lib/data/types';
import { enrichParticipants } from '@/lib/data/transformations';

interface ExperimentDataContextValue {
  rawParticipants: Participant[];
  participants: ReturnType<typeof enrichParticipants>;
  dataSource: 'simulated' | 'imported';
  setImportedParticipants: (participants: Participant[]) => void;
  resetToSimulated: () => void;
}

const ExperimentDataContext = createContext<ExperimentDataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [rawParticipants, setRawParticipants] = useState<Participant[]>(simulatedParticipants);
  const [dataSource, setDataSource] = useState<'simulated' | 'imported'>('simulated');
  const participants = useMemo(() => enrichParticipants(rawParticipants), [rawParticipants]);

  return (
    <ExperimentDataContext.Provider
      value={{
        rawParticipants,
        participants,
        dataSource,
        setImportedParticipants: (next) => {
          setRawParticipants(next);
          setDataSource('imported');
        },
        resetToSimulated: () => {
          setRawParticipants(simulatedParticipants);
          setDataSource('simulated');
        }
      }}
    >
      {children}
    </ExperimentDataContext.Provider>
  );
}

export function useExperimentData() {
  const value = useContext(ExperimentDataContext);
  if (!value) throw new Error('useExperimentData must be used within DataProvider');
  return value;
}
