import { describe, expect, it } from 'vitest';
import { simulatedParticipants } from '../data/simulatedParticipants';
import { validateParticipants } from '../lib/data/validation';

describe('CSV validation', () => {
  it('accepts simulated participant rows', () => {
    const result = validateParticipants(simulatedParticipants);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing values, range errors and duplicate IDs', () => {
    const bad = [
      { ...simulatedParticipants[0], participantId: 'P01', vocabularyRecognitionPre: 101 },
      { ...simulatedParticipants[1], participantId: 'P01', feedbackClarity: 6 },
      { ...simulatedParticipants[2], participantId: '' }
    ];
    const result = validateParticipants(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('duplicate participantId'))).toBe(true);
    expect(result.errors.some((error) => error.includes('vocabularyRecognitionPre'))).toBe(true);
    expect(result.errors.some((error) => error.includes('feedbackClarity'))).toBe(true);
  });
});
