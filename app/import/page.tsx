'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperimentData } from '@/components/layout/DataProvider';
import { parseParticipantCsv } from '@/lib/data/parser';
import type { Participant } from '@/lib/data/types';

export default function ImportPage() {
  const { setImportedParticipants, resetToDefaultDataset } = useExperimentData();
  const [previewRows, setPreviewRows] = useState<Participant[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const onFile = async (file?: File) => {
    if (!file) return;
    const parsed = await parseParticipantCsv(file);
    setPreviewRows(parsed.rows);
    setErrors(parsed.errors);
    setWarnings(parsed.warnings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">CSV Import</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Upload experimental data to replace the current browser-session dataset.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>Refresh the browser to return to the default round-one dataset, or use the reset button below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white p-8 text-center">
            <Upload className="mb-3 text-[var(--primary)]" />
            <span className="font-semibold">Choose CSV file</span>
            <span className="text-sm text-[var(--muted-foreground)]">Required schema matches public/data/round1-ai-conversation-grammar-data.csv</span>
            <input className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => onFile(event.target.files?.[0])} />
          </label>
          <div className="flex gap-3">
            <Button disabled={errors.length > 0 || previewRows.length === 0} onClick={() => setImportedParticipants(previewRows)}>
              Confirm and Load Dataset
            </Button>
            <Button variant="outline" onClick={resetToDefaultDataset}>Restore Default Dataset</Button>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-[#f1b8bf] bg-[#fff3f4]">
          <CardHeader><CardTitle>Validation Errors</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm">{errors.map((error) => <li key={error}>{error}</li>)}</ul></CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-[#f0d39f] bg-[#fff9ed]">
          <CardHeader><CardTitle>Warnings</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></CardContent>
        </Card>
      )}

      {previewRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{previewRows.length} rows parsed.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead><tr>{['ID', 'Level', 'Recognition Pre', 'Recognition Post', 'Total fields'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody>
                {previewRows.slice(0, 8).map((row) => (
                  <tr key={row.participantId} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">{row.participantId}</td>
                    <td className="px-3 py-2">{row.japaneseLevel}</td>
                    <td className="px-3 py-2">{row.vocabularyRecognitionPre}</td>
                    <td className="px-3 py-2">{row.vocabularyRecognitionPost}</td>
                    <td className="px-3 py-2">{Object.keys(row).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
