'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileJson, Play, RefreshCcw, Save, UploadCloud } from 'lucide-react';
import { examQuestions, examStages, questionnairePrompts } from '@/data/examTasks';
import { simulatedParticipants } from '@/data/simulatedParticipants';
import { useExperimentData } from '@/components/layout/DataProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { participantsToCsv } from '@/lib/data/parser';
import {
  canExportParticipant,
  completionSummary,
  defaultQuestionnaire,
  recordsToParticipantRows,
  scoreStage
} from '@/lib/exam/scoring';
import type { ExamQuestion, ExamStage, ParticipantExamRecord, ParticipantProfile, QuestionnaireResponse } from '@/lib/exam/types';

const storageKey = 'mp6-exam-records-v1';
const participantIds = Array.from({ length: 10 }, (_, index) => `P${String(index + 1).padStart(2, '0')}`);
const stageKeys: ExamStage[] = ['Pre', 'Post', 'Delayed'];

function createInitialRecords(): ParticipantExamRecord[] {
  return participantIds.map((participantId, index) => {
    const sample = simulatedParticipants[index];
    return {
      profile: {
        participantId,
        ageGroup: sample?.ageGroup ?? '20-24',
        japaneseLevel: sample?.japaneseLevel ?? 'N4',
        aiExperience: sample?.aiExperience ?? 'Low'
      },
      stages: {}
    };
  });
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusLabel(record: ParticipantExamRecord) {
  const summary = completionSummary(record);
  if (summary.exportReady) return 'Ready';
  return `${summary.completeStages}/3 tests`;
}

function scoreLabel(question: ExamQuestion) {
  const targetField =
    question.stage === 'Pre'
      ? `${question.dimension}Pre`
      : question.stage === 'Post'
        ? `${question.dimension}Post`
        : `${question.dimension}Delayed`;
  return `${question.maxScore} raw points, exported as 0-100 ${targetField}`;
}

export default function ExamCollectionPage() {
  const { setImportedParticipants } = useExperimentData();
  const [records, setRecords] = useState<ParticipantExamRecord[]>(createInitialRecords);
  const [selectedParticipantId, setSelectedParticipantId] = useState('P01');
  const [selectedStage, setSelectedStage] = useState<ExamStage | 'Questionnaire'>('Pre');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState(new Date().toISOString());
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse>(defaultQuestionnaire);
  const [message, setMessage] = useState('Local collection mode. Data is stored in this browser until exported.');

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      setRecords(JSON.parse(stored) as ParticipantExamRecord[]);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [records]);

  const selectedRecord = records.find((record) => record.profile.participantId === selectedParticipantId) ?? records[0];
  const currentQuestions = useMemo(
    () => (selectedStage === 'Questionnaire' ? [] : examQuestions.filter((question) => question.stage === selectedStage)),
    [selectedStage]
  );
  const exportRows = useMemo(() => recordsToParticipantRows(records), [records]);
  const readyCount = records.filter(canExportParticipant).length;

  useEffect(() => {
    if (!selectedRecord) return;
    if (selectedStage === 'Questionnaire') {
      setQuestionnaire(selectedRecord.questionnaire ?? defaultQuestionnaire());
      return;
    }
    const submission = selectedRecord.stages[selectedStage];
    setAnswers(submission?.answers ?? {});
    setStartedAt(submission?.startedAt ?? new Date().toISOString());
  }, [selectedParticipantId, selectedStage, selectedRecord]);

  function updateProfile(field: keyof ParticipantProfile, value: string) {
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: { ...record.profile, [field]: value } }
          : record
      )
    );
  }

  function saveStage() {
    if (selectedStage === 'Questionnaire') return;
    const submission = scoreStage(selectedRecord.profile, selectedStage, answers, startedAt);
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: selectedRecord.profile, stages: { ...record.stages, [selectedStage]: submission } }
          : record
      )
    );
    setMessage(`${selectedParticipantId} ${selectedStage} saved. Total score: ${submission.totalScore}/100.`);
  }

  function saveQuestionnaire() {
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: selectedRecord.profile, questionnaire }
          : record
      )
    );
    setMessage(`${selectedParticipantId} questionnaire saved.`);
  }

  function resetTimer() {
    setStartedAt(new Date().toISOString());
    setMessage(`${selectedParticipantId} ${selectedStage} timer restarted.`);
  }

  function resetCollection() {
    const next = createInitialRecords();
    setRecords(next);
    setSelectedParticipantId('P01');
    setSelectedStage('Pre');
    setAnswers({});
    setQuestionnaire(defaultQuestionnaire());
    window.localStorage.removeItem(storageKey);
    setMessage('Exam collection reset to ten blank participant records.');
  }

  function exportCsv() {
    if (!exportRows.length) {
      setMessage('No complete participant records are ready for CSV export yet.');
      return;
    }
    downloadFile('mp6-real-exam-export.csv', participantsToCsv(exportRows), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    downloadFile('mp6-exam-raw-records.json', JSON.stringify(records, null, 2), 'application/json;charset=utf-8');
  }

  function loadIntoAnalysis() {
    if (!exportRows.length) {
      setMessage('Complete at least one participant before loading data into analysis.');
      return;
    }
    setImportedParticipants(exportRows);
    setMessage(`${exportRows.length} participant row(s) loaded into the dashboard and analysis pages.`);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 bg-[#e7f1ed] text-[var(--primary)]">REAL DATA COLLECTION PROTOTYPE</Badge>
          <h2 className="text-3xl font-black tracking-tight">Exam Collection</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
            A browser-based exam site for roughly ten participants. Each task is reverse-mapped to the research variables used by
            the analysis system, so completed answers can be exported directly as MP6 experiment data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            <FileJson size={16} />
            Export Raw JSON
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </Button>
          <Button onClick={loadIntoAnalysis}>
            <UploadCloud size={16} />
            Load to Analysis
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Participants</CardDescription>
            <CardTitle>10 planned</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Export ready</CardDescription>
            <CardTitle>{readyCount}/10</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>CSV rows</CardDescription>
            <CardTitle>{exportRows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Scoring</CardDescription>
            <CardTitle>Rule-based</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="rounded-lg border border-[#f0d8c8] bg-[#fff8f3] p-4 text-sm text-[#7a4221]">
        {message} Open-ended answers are scored by a transparent keyword template. Review exported CSV before treating it as final
        research data.
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>Select a participant and track completion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {records.map((record) => {
                const summary = completionSummary(record);
                return (
                  <button
                    key={record.profile.participantId}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      record.profile.participantId === selectedParticipantId
                        ? 'border-[var(--primary)] bg-[#e7f1ed]'
                        : 'border-[var(--border)] bg-white hover:bg-[var(--muted)]'
                    }`}
                    onClick={() => setSelectedParticipantId(record.profile.participantId)}
                    type="button"
                  >
                    <span className="block font-bold">{record.profile.participantId}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{statusLabel(record)}</span>
                    {summary.exportReady ? <CheckCircle2 className="mt-1 text-[#1d6f54]" size={15} /> : null}
                  </button>
                );
              })}
            </div>
            <Button className="w-full" variant="outline" onClick={resetCollection}>
              <RefreshCcw size={16} />
              Reset Collection
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedRecord.profile.participantId} Profile</CardTitle>
              <CardDescription>Basic grouping variables exported with every participant row.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold">
                Age group
                <Input value={selectedRecord.profile.ageGroup} onChange={(event) => updateProfile('ageGroup', event.target.value)} />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Japanese level
                <Select
                  value={selectedRecord.profile.japaneseLevel}
                  onChange={(event) => updateProfile('japaneseLevel', event.target.value)}
                >
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm font-semibold">
                AI experience
                <Select value={selectedRecord.profile.aiExperience} onChange={(event) => updateProfile('aiExperience', event.target.value)}>
                  {['None', 'Low', 'Medium', 'High'].map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </Select>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Test Session</CardTitle>
                  <CardDescription>Complete each stage separately. Response time is recorded in seconds.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...stageKeys, 'Questionnaire' as const].map((stage) => (
                    <Button
                      key={stage}
                      size="sm"
                      variant={selectedStage === stage ? 'default' : 'outline'}
                      onClick={() => setSelectedStage(stage)}
                    >
                      {stage}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedStage !== 'Questionnaire' ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[var(--muted)] p-3 text-sm">
                    <span>{examStages.find((stage) => stage.key === selectedStage)?.purpose}</span>
                    <Button size="sm" variant="outline" onClick={resetTimer}>
                      <Play size={15} />
                      Restart Timer
                    </Button>
                  </div>

                  {currentQuestions.map((question) => (
                    <div key={question.id} className="rounded-lg border border-[var(--border)] p-4">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{question.title}</h3>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{question.prompt}</p>
                        </div>
                        <Badge className="border border-[var(--border)] bg-white">{scoreLabel(question)}</Badge>
                      </div>
                      {question.type === 'multiple-choice' ? (
                        <div className="grid gap-2">
                          {question.options?.map((option) => (
                            <label key={option} className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-3 text-sm">
                              <input
                                checked={answers[question.id] === option}
                                name={question.id}
                                onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                                type="radio"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          className="min-h-28 w-full rounded-lg border border-[var(--border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#b9d3c9]"
                          onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                          placeholder="Type the participant answer here..."
                          value={answers[question.id] ?? ''}
                        />
                      )}
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">{question.scoringNote}</p>
                    </div>
                  ))}

                  <Button onClick={saveStage}>
                    <Save size={16} />
                    Save {selectedStage}
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-[var(--muted)] p-3 text-sm">
                    Likert scale: 1 = strongly disagree, 5 = strongly agree.
                  </div>
                  <div className="grid gap-3">
                    {questionnairePrompts.map((item) => (
                      <label
                        key={item.key}
                        className="grid gap-3 rounded-lg border border-[var(--border)] p-4 text-sm md:grid-cols-[1fr_160px] md:items-center"
                      >
                        <span className="font-semibold">{item.label}</span>
                        <Select
                          value={String(questionnaire[item.key])}
                          onChange={(event) =>
                            setQuestionnaire((current) => ({ ...current, [item.key]: Number(event.target.value) }))
                          }
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </Select>
                      </label>
                    ))}
                  </div>
                  <Button onClick={saveQuestionnaire}>
                    <Save size={16} />
                    Save Questionnaire
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
