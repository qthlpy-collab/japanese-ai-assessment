'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useExperimentData } from '@/components/layout/DataProvider';
import { participantsToCsv } from '@/lib/data/parser';
import { csvFields } from '@/lib/data/types';
import type { Participant } from '@/lib/data/types';

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataTablePage() {
  const { rawParticipants } = useExperimentData();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [participantId, setParticipantId] = useState('all');
  const [sortKey, setSortKey] = useState<keyof Participant>('participantId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const levels = [...new Set(rawParticipants.map((p) => p.japaneseLevel))];
  const ids = rawParticipants.map((p) => p.participantId);

  const filtered = useMemo(() => {
    return rawParticipants
      .filter((p) => level === 'all' || p.japaneseLevel === level)
      .filter((p) => participantId === 'all' || p.participantId === participantId)
      .filter((p) => JSON.stringify(p).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDirection === 'asc' ? result : -result;
      });
  }, [rawParticipants, level, participantId, query, sortKey, sortDirection]);

  const changeSort = (field: keyof Participant) => {
    if (field === sortKey) setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Data Table</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Search, sort, filter, and export the full experiment dataset.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Exports use the currently loaded dataset.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="Search all fields" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">All levels</option>
            {levels.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Select value={participantId} onChange={(e) => setParticipantId(e.target.value)}>
            <option value="all">All participants</option>
            {ids.map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <Button variant="outline" onClick={() => downloadFile('learning-data.csv', participantsToCsv(rawParticipants), 'text/csv')}>
            <Download size={16} /> CSV
          </Button>
          <Button variant="outline" onClick={() => downloadFile('learning-data.json', JSON.stringify(rawParticipants, null, 2), 'application/json')}>
            <Download size={16} /> JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[2200px] text-left text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[var(--border)]">
                {csvFields.map((field) => (
                  <th key={field} className="cursor-pointer px-3 py-3 font-bold" onClick={() => changeSort(field)}>
                    {field}{sortKey === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.participantId} className="border-b border-[var(--border)]">
                  {csvFields.map((field) => <td key={field} className="px-3 py-2">{row[field]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
