import { describe, expect, it } from 'vitest';
import { experimentParticipants } from '../data/experimentParticipants';
import { validateParticipants } from '../lib/data/validation';

describe('CSV validation', () => {
  it('accepts experiment participant rows', () => {
    const result = validateParticipants(experimentParticipants);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing values, range errors and duplicate IDs', () => {
    const bad = [
      { ...experimentParticipants[0], participantId: 'P01', vocabularyRecognitionPre: 101 },
      { ...experimentParticipants[1], participantId: 'P01', feedbackClarity: 6 },
      { ...experimentParticipants[2], participantId: '' }
    ];
    const result = validateParticipants(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('duplicate participantId'))).toBe(true);
    expect(result.errors.some((error) => error.includes('vocabularyRecognitionPre'))).toBe(true);
    expect(result.errors.some((error) => error.includes('feedbackClarity'))).toBe(true);
  });
});
