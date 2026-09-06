'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { experimentParticipants } from '@/data/experimentParticipants';
import type { Participant } from '@/lib/data/types';
import { enrichParticipants } from '@/lib/data/transformations';

interface ExperimentDataContextValue {
  rawParticipants: Participant[];
  participants: ReturnType<typeof enrichParticipants>;
  dataSource: 'round-one' | 'imported';
  setImportedParticipants: (participants: Participant[]) => void;
  resetToDefaultDataset: () => void;
}

const ExperimentDataContext = createContext<ExperimentDataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [rawParticipants, setRawParticipants] = useState<Participant[]>(experimentParticipants);
  const [dataSource, setDataSource] = useState<'round-one' | 'imported'>('round-one');
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
        resetToDefaultDataset: () => {
          setRawParticipants(experimentParticipants);
          setDataSource('round-one');
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
