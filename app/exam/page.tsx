'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { examQuestions, examStages, questionnairePrompts } from '@/data/examTasks';
import { experimentParticipants } from '@/data/experimentParticipants';
import { useExperimentData } from '@/components/layout/DataProvider';
import { participantsToCsv } from '@/lib/data/parser';
import {
  canExportParticipant,
  completionSummary,
  defaultQuestionnaire,
  recordsToParticipantRows,
  scoreStage
} from '@/lib/exam/scoring';
import type { ExamStage, ParticipantExamRecord, ParticipantProfile, QuestionnaireResponse } from '@/lib/exam/types';

const storageKey = 'mp6-standalone-exam-records-v2';
const participantIds = Array.from({ length: 10 }, (_, index) => `P${String(index + 1).padStart(2, '0')}`);
const stageKeys: ExamStage[] = ['Pre', 'Post', 'Delayed'];

function createInitialRecords(): ParticipantExamRecord[] {
  return participantIds.map((participantId, index) => {
    const sample = experimentParticipants[index];
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

function targetField(stage: ExamStage, dimension: string) {
  return stage === 'Pre' ? `${dimension}Pre` : stage === 'Post' ? `${dimension}Post` : `${dimension}Delayed`;
}

function stageName(stage: ExamStage | 'Questionnaire') {
  if (stage === 'Pre') return 'PRE TEST';
  if (stage === 'Post') return 'IMMEDIATE POST TEST';
  if (stage === 'Delayed') return 'DELAYED POST TEST';
  return 'QUESTIONNAIRE';
}

export default function StandaloneExamPage() {
  const { setImportedParticipants } = useExperimentData();
  const [records, setRecords] = useState<ParticipantExamRecord[]>(createInitialRecords);
  const [selectedParticipantId, setSelectedParticipantId] = useState('P01');
  const [selectedStage, setSelectedStage] = useState<ExamStage | 'Questionnaire'>('Pre');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse>(defaultQuestionnaire);
  const [startedAt, setStartedAt] = useState(new Date().toISOString());
  const [notice, setNotice] = useState('READY. Please select participant and begin the test.');

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
    setNotice(`${selectedParticipantId} ${stageName(selectedStage)} SAVED. Total score = ${submission.totalScore}/100.`);
  }

  function saveQuestionnaire() {
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: selectedRecord.profile, questionnaire }
          : record
      )
    );
    setNotice(`${selectedParticipantId} QUESTIONNAIRE SAVED.`);
  }

  function exportCsv() {
    if (!exportRows.length) {
      setNotice('NO COMPLETE PARTICIPANT ROWS. Complete Pre, Post, Delayed, and Questionnaire first.');
      return;
    }
    downloadFile('mp6-collected-exam-data.csv', participantsToCsv(exportRows), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    downloadFile('mp6-raw-exam-answers.json', JSON.stringify(records, null, 2), 'application/json;charset=utf-8');
  }

  function loadIntoAnalysis() {
    if (!exportRows.length) {
      setNotice('NO DATA LOADED. Complete at least one participant record first.');
      return;
    }
    setImportedParticipants(exportRows);
    setNotice(`${exportRows.length} COMPLETE ROW(S) LOADED INTO ANALYSIS PAGES.`);
  }

  function resetAll() {
    const next = createInitialRecords();
    setRecords(next);
    setSelectedParticipantId('P01');
    setSelectedStage('Pre');
    setAnswers({});
    setQuestionnaire(defaultQuestionnaire());
    window.localStorage.removeItem(storageKey);
    setNotice('ALL LOCAL EXAM RECORDS CLEARED.');
  }

  return (
    <main className="min-h-screen bg-[#c0c0c0] p-2 text-black md:p-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto max-w-[980px] border-4 border-[#808080] bg-[#fffff0] p-1 shadow-[6px_6px_0_#404040]">
        <table className="w-full border-collapse border-2 border-black bg-white text-sm">
          <tbody>
            <tr>
              <td className="border-2 border-black bg-[#000080] p-2 text-center text-white">
                <h1 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: 'Times New Roman, serif' }}>
                  MP6 JAPANESE EXAM WEB PAGE
                </h1>
                <p className="text-xs">Standalone participant test site - best viewed at 800x600</p>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-black bg-[#ffff99] p-2 text-center text-xs font-bold text-[#800000]">
                NOTICE: This page collects real participant answers in this browser. Export CSV after the test.
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-[#e8e8e8] text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2">
                <b>Participants planned:</b> 10
              </td>
              <td className="border border-black p-2">
                <b>Export ready:</b> {readyCount}/10
              </td>
              <td className="border border-black p-2">
                <b>CSV rows:</b> {exportRows.length}
              </td>
              <td className="border border-black p-2">
                <b>Scoring:</b> transparent rule template
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 border-2 border-black bg-[#ffffff] p-2 text-xs">
          <b>STATUS:</b> {notice}
          <br />
          <a className="text-[#0000ee] underline" href="#bank">
            Jump to question bank
          </a>
          {' | '}
          <Link className="text-[#0000ee] underline" href="/">
            Open analysis system
          </Link>
        </div>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-[#f5f5f5] text-sm">
          <tbody>
            <tr className="align-top">
              <td className="w-full border border-black p-2 md:w-[250px]">
                <div className="border-2 border-[#808080] bg-[#dcdcdc] p-1 font-bold">PARTICIPANT LIST</div>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {records.map((record) => {
                    const summary = completionSummary(record);
                    return (
                      <button
                        className={`border-2 px-2 py-1 text-left text-xs ${
                          record.profile.participantId === selectedParticipantId
                            ? 'border-black bg-[#000080] text-white'
                            : 'border-[#808080] bg-[#eeeeee] text-black'
                        }`}
                        key={record.profile.participantId}
                        onClick={() => setSelectedParticipantId(record.profile.participantId)}
                        type="button"
                      >
                        <b>{record.profile.participantId}</b>
                        <br />
                        {summary.exportReady ? 'READY' : `${summary.completeStages}/3 TESTS`}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border border-black bg-white p-2">
                  <b>{selectedRecord.profile.participantId} PROFILE</b>
                  <label className="mt-2 block text-xs">
                    Age Group
                    <input
                      className="mt-1 w-full border-2 border-[#808080] bg-white px-1"
                      value={selectedRecord.profile.ageGroup}
                      onChange={(event) => updateProfile('ageGroup', event.target.value)}
                    />
                  </label>
                  <label className="mt-2 block text-xs">
                    Japanese Level
                    <select
                      className="mt-1 w-full border-2 border-[#808080] bg-white px-1"
                      value={selectedRecord.profile.japaneseLevel}
                      onChange={(event) => updateProfile('japaneseLevel', event.target.value)}
                    >
                      {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label className="mt-2 block text-xs">
                    AI Experience
                    <select
                      className="mt-1 w-full border-2 border-[#808080] bg-white px-1"
                      value={selectedRecord.profile.aiExperience}
                      onChange={(event) => updateProfile('aiExperience', event.target.value)}
                    >
                      {['None', 'Low', 'Medium', 'High'].map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid gap-1">
                  <button className="border-2 border-black bg-[#ffff99] px-2 py-1 font-bold" onClick={exportCsv} type="button">
                    EXPORT CSV
                  </button>
                  <button className="border-2 border-black bg-[#ddddff] px-2 py-1" onClick={exportJson} type="button">
                    EXPORT RAW JSON
                  </button>
                  <button className="border-2 border-black bg-[#ccffcc] px-2 py-1" onClick={loadIntoAnalysis} type="button">
                    LOAD TO ANALYSIS
                  </button>
                  <button className="border-2 border-black bg-[#ffcccc] px-2 py-1" onClick={resetAll} type="button">
                    CLEAR LOCAL DATA
                  </button>
                </div>
              </td>

              <td className="border border-black p-2">
                <div className="mb-2 border-2 border-[#808080] bg-[#dcdcdc] p-1 font-bold">TEST MENU</div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {[...stageKeys, 'Questionnaire' as const].map((stage) => (
                    <button
                      className={`border-2 border-black px-3 py-1 text-xs font-bold ${
                        selectedStage === stage ? 'bg-[#000080] text-white' : 'bg-[#efefef] text-black'
                      }`}
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      type="button"
                    >
                      {stageName(stage)}
                    </button>
                  ))}
                </div>

                <table className="mb-3 w-full border-collapse border border-black bg-white text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">Current examinee</td>
                      <td className="border border-black p-1">{selectedRecord.profile.participantId}</td>
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">Current section</td>
                      <td className="border border-black p-1">{stageName(selectedStage)}</td>
                    </tr>
                  </tbody>
                </table>

                {selectedStage !== 'Questionnaire' ? (
                  <div>
                    <p className="mb-3 border border-black bg-[#ffffcc] p-2 text-xs">
                      {examStages.find((stage) => stage.key === selectedStage)?.purpose} Response time starts when this section is
                      opened. Press SAVE SECTION when the participant finishes.
                    </p>

                    {currentQuestions.map((question, index) => (
                      <div className="mb-3 border-2 border-black bg-white p-2" key={question.id}>
                        <table className="mb-2 w-full border-collapse text-xs">
                          <tbody>
                            <tr>
                              <td className="border border-black bg-[#000080] p-1 font-bold text-white">
                                Q{index + 1}. {question.title}
                              </td>
                              <td className="w-[220px] border border-black bg-[#eeeeee] p-1">
                                Target: {targetField(question.stage, question.dimension)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="mb-2 text-sm">{question.prompt}</p>
                        {question.type === 'multiple-choice' ? (
                          <div className="grid gap-1">
                            {question.options?.map((option) => (
                              <label className="block border border-[#808080] bg-[#f7f7f7] p-1 text-sm" key={option}>
                                <input
                                  checked={answers[question.id] === option}
                                  className="mr-2"
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
                            className="h-28 w-full border-2 border-[#808080] bg-white p-1 text-sm"
                            onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                            value={answers[question.id] ?? ''}
                          />
                        )}
                        <p className="mt-2 text-[11px]">
                          <b>Scoring:</b> {question.scoringNote} Raw item score is {question.maxScore}; exported score is scaled to
                          0-100.
                        </p>
                      </div>
                    ))}

                    <button className="border-4 border-black bg-[#00ff00] px-4 py-2 font-bold" onClick={saveStage} type="button">
                      SAVE SECTION
                    </button>
                    <button
                      className="ml-2 border-2 border-black bg-[#eeeeee] px-3 py-2"
                      onClick={() => {
                        setStartedAt(new Date().toISOString());
                        setNotice(`${selectedRecord.profile.participantId} timer restarted.`);
                      }}
                      type="button"
                    >
                      RESTART TIMER
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-black bg-white p-2">
                    <p className="mb-2 bg-[#ffffcc] p-2 text-xs">Likert scale: 1 = strongly disagree, 5 = strongly agree.</p>
                    {questionnairePrompts.map((item) => (
                      <label className="mb-2 grid gap-2 border border-[#808080] bg-[#f7f7f7] p-2 text-sm md:grid-cols-[1fr_120px]" key={item.key}>
                        <span>{item.label}</span>
                        <select
                          className="border-2 border-[#808080] bg-white px-1"
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
                        </select>
                      </label>
                    ))}
                    <button className="border-4 border-black bg-[#00ff00] px-4 py-2 font-bold" onClick={saveQuestionnaire} type="button">
                      SAVE QUESTIONNAIRE
                    </button>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-white text-xs">
          <caption id="bank" className="border-2 border-b-0 border-black bg-[#800000] p-1 text-left font-bold text-white">
            READY-TO-USE QUESTION BANK AND VARIABLE MAPPING
          </caption>
          <thead>
            <tr className="bg-[#dcdcdc]">
              <th className="border border-black p-1 text-left">Stage</th>
              <th className="border border-black p-1 text-left">Question</th>
              <th className="border border-black p-1 text-left">Variable</th>
              <th className="border border-black p-1 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {examQuestions.map((question) => (
              <tr key={question.id}>
                <td className="border border-black p-1">{question.stage}</td>
                <td className="border border-black p-1">{question.title}</td>
                <td className="border border-black p-1">{targetField(question.stage, question.dimension)}</td>
                <td className="border border-black p-1">{question.type}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-2 border-2 border-black bg-[#ffff99] p-2 text-center text-xs">
          Copyright 1999-style MP6 Exam Page. Data stays local until exported.
        </p>
      </div>
    </main>
  );
}
