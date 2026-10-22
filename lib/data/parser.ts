'use client';

import Papa from 'papaparse';
import type { Participant } from './types';
import { csvFields } from './types';
import { validateParticipants } from './validation';

const numericFields = csvFields.filter(
  (field) => !['participantId', 'ageGroup', 'japaneseLevel', 'aiExperience'].includes(field)
);

export function parseParticipantCsv(file: File): Promise<{ rows: Participant[]; errors: string[]; warnings: string[] }> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parseErrors = result.errors.map((error) => error.message);
        const rows = result.data.map((raw) => {
          const row: Record<string, string | number> = {};
          csvFields.forEach((field) => {
            row[field] = numericFields.includes(field) ? raw[field]?.trim() ? Number(raw[field]) : NaN : raw[field];
          });
          return row as unknown as Participant;
        });
        const validation = validateParticipants(rows);
        resolve({ rows, errors: [...parseErrors, ...validation.errors], warnings: validation.warnings });
      },
      error: (error) => resolve({ rows: [], errors: [error.message], warnings: [] })
    });
  });
}

export function participantsToCsv(rows: Participant[]) {
  return Papa.unparse(rows, { columns: csvFields as string[] });
}
