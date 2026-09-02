import { describe, expect, it } from 'vitest';
import { examQuestions } from '../data/examTasks';
import {
  canExportParticipant,
  defaultQuestionnaire,
  recordToParticipantRow,
  scoreQuestion,
  scoreStage
} from '../lib/exam/scoring';
import type { ParticipantExamRecord, ParticipantProfile } from '../lib/exam/types';

const profile: ParticipantProfile = {
  participantId: 'P01',
  ageGroup: '20-24',
  japaneseLevel: 'N4',
  aiExperience: 'Low'
};

function correctAnswers(stage: 'Pre' | 'Post' | 'Delayed') {
  return Object.fromEntries(
    examQuestions
      .filter((question) => question.stage === stage)
      .map((question) => [
        question.id,
        question.correctAnswer ?? `${question.expectedKeywords.join(' ')} です。よろしくお願いいたします。`
      ])
  );
}

describe('exam scoring and export', () => {
  it('scores multiple choice questions transparently', () => {
    const question = examQuestions.find((item) => item.id === 'pre-recognition-1')!;
    expect(scoreQuestion(question, question.correctAnswer!)).toBe(20);
    expect(scoreQuestion(question, 'wrong option')).toBe(0);
  });

  it('exports completed exam records using 0-100 analysis fields', () => {
    const record: ParticipantExamRecord = {
      profile,
      stages: {
        Pre: scoreStage(profile, 'Pre', correctAnswers('Pre'), '2026-01-01T00:00:00.000Z'),
        Post: scoreStage(profile, 'Post', correctAnswers('Post'), '2026-01-01T00:00:00.000Z'),
        Delayed: scoreStage(profile, 'Delayed', correctAnswers('Delayed'), '2026-01-01T00:00:00.000Z')
      },
      questionnaire: defaultQuestionnaire()
    };

    expect(canExportParticipant(record)).toBe(true);
    const row = recordToParticipantRow(record)!;
    expect(row.vocabularyRecognitionPre).toBe(100);
    expect(row.grammarPost).toBe(100);
    expect(row.vocabularyRecallDelayed).toBeGreaterThanOrEqual(80);
    expect(row.responseTimePre).toBeGreaterThan(0);
    expect(row.perceivedUsefulness).toBe(3);
  });
});
