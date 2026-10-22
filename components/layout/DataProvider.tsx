'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Participant } from '@/lib/data/types';
import { enrichParticipants } from '@/lib/data/transformations';

interface ExperimentDataContextValue {
  rawParticipants: Participant[];
  participants: ReturnType<typeof enrichParticipants>;
  dataSource: 'empty' | 'imported';
  setImportedParticipants: (participants: Participant[]) => void;
  resetToDefaultDataset: () => void;
}

const ExperimentDataContext = createContext<ExperimentDataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [rawParticipants, setRawParticipants] = useState<Participant[]>([]);
  const [dataSource, setDataSource] = useState<'empty' | 'imported'>('empty');
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
          setRawParticipants([]);
          setDataSource('empty');
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
