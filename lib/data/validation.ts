import type { Participant } from './types';
import { csvFields } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const numericFields = csvFields.filter(
  (field) => !['participantId', 'ageGroup', 'japaneseLevel', 'aiExperience'].includes(field)
);
const scoreFields = numericFields.filter((field) => !field.toString().startsWith('responseTime'));
const questionnaireFields = [
  'perceivedUsefulness',
  'feedbackClarity',
  'learningEngagement',
  'confidenceImprovement',
  'cognitiveLoad',
  'intentionToReuse'
];

export function validateParticipants(rows: Partial<Participant>[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    csvFields.forEach((field) => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        errors.push(`Row ${rowNumber}: missing ${String(field)}`);
      }
    });

    if (row.participantId) {
      if (ids.has(row.participantId)) errors.push(`Row ${rowNumber}: duplicate participantId ${row.participantId}`);
      ids.add(row.participantId);
    }

    numericFields.forEach((field) => {
      const value = Number(row[field]);
      if (!Number.isFinite(value)) {
        errors.push(`Row ${rowNumber}: ${String(field)} must be numeric`);
        return;
      }
      if (scoreFields.includes(field) && !questionnaireFields.includes(String(field)) && (value < 0 || value > 100)) {
        errors.push(`Row ${rowNumber}: ${String(field)} must be in 0-100`);
      }
      if (questionnaireFields.includes(String(field)) && (value < 1 || value > 5)) {
        errors.push(`Row ${rowNumber}: ${String(field)} must be in 1-5`);
      }
      if (String(field).startsWith('responseTime') && value < 0) {
        errors.push(`Row ${rowNumber}: ${String(field)} cannot be negative`);
      }
    });
  });

  if (rows.length < 5) warnings.push('The dataset is very small; inferential results should be interpreted cautiously.');

  return { valid: errors.length === 0, errors, warnings };
}
