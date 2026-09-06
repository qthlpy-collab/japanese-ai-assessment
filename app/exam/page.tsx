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
const aiExperienceOptions = [
  { value: 'None', label: '无' },
  { value: 'Low', label: '较少' },
  { value: 'Medium', label: '一般' },
  { value: 'High', label: '较多' }
];

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
  if (stage === 'Pre') return '前测';
  if (stage === 'Post') return '即时后测';
  if (stage === 'Delayed') return '延迟后测';
  return '学习体验问卷';
}

function questionTypeLabel(type: string) {
  if (type === 'multiple-choice') return '选择题';
  if (type === 'short-answer') return '简答题';
  if (type === 'situational-writing') return '情境写作';
  if (type === 'conversation-response') return '对话应答';
  return type;
}

export default function StandaloneExamPage() {
  const { setImportedParticipants } = useExperimentData();
  const [records, setRecords] = useState<ParticipantExamRecord[]>(createInitialRecords);
  const [selectedParticipantId, setSelectedParticipantId] = useState('P01');
  const [selectedStage, setSelectedStage] = useState<ExamStage | 'Questionnaire'>('Pre');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse>(defaultQuestionnaire);
  const [startedAt, setStartedAt] = useState(new Date().toISOString());
  const [notice, setNotice] = useState('系统已就绪。请选择参与者编号并开始答题。');

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
  const selectedSummary = completionSummary(selectedRecord);

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
    const missingCount = currentQuestions.filter((question) => !answers[question.id]?.trim()).length;
    if (missingCount > 0) {
      setNotice(`还有 ${missingCount} 题未完成。请完成本部分所有题目后再保存。`);
      return;
    }
    const submission = scoreStage(selectedRecord.profile, selectedStage, answers, startedAt);
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: selectedRecord.profile, stages: { ...record.stages, [selectedStage]: submission } }
          : record
      )
    );
    setNotice(`${selectedParticipantId} 的${stageName(selectedStage)}已保存。总分：${submission.totalScore}/100。`);
  }

  function saveQuestionnaire() {
    setRecords((current) =>
      current.map((record) =>
        record.profile.participantId === selectedParticipantId
          ? { ...record, profile: selectedRecord.profile, questionnaire }
          : record
      )
    );
    setNotice(`${selectedParticipantId} 的学习体验问卷已保存。`);
  }

  function exportCsv() {
    if (!exportRows.length) {
      setNotice('暂无可导出的完整记录。请至少完成一名参与者的前测、即时后测、延迟后测和问卷。');
      return;
    }
    downloadFile('mp6-collected-exam-data.csv', participantsToCsv(exportRows), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    downloadFile('mp6-raw-exam-answers.json', JSON.stringify(records, null, 2), 'application/json;charset=utf-8');
  }

  function loadIntoAnalysis() {
    if (!exportRows.length) {
      setNotice('暂无可载入分析系统的数据。请至少完成一名参与者的完整记录。');
      return;
    }
    setImportedParticipants(exportRows);
    setNotice(`已将 ${exportRows.length} 名参与者的完整记录载入分析系统。`);
  }

  function resetAll() {
    const next = createInitialRecords();
    setRecords(next);
    setSelectedParticipantId('P01');
    setSelectedStage('Pre');
    setAnswers({});
    setQuestionnaire(defaultQuestionnaire());
    window.localStorage.removeItem(storageKey);
    setNotice('本机浏览器中的考试记录已清空。');
  }

  return (
    <main className="min-h-screen bg-[#c0c0c0] p-2 text-black md:p-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="mx-auto max-w-[980px] border-4 border-[#808080] bg-[#fffff0] p-1 shadow-[6px_6px_0_#404040]">
        <table className="w-full border-collapse border-2 border-black bg-white text-sm">
          <tbody>
            <tr>
              <td className="border-2 border-black bg-[#000080] p-2 text-center text-white">
                <h1 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: 'Times New Roman, serif' }}>
                  MP6 日语学习实验考试系统
                </h1>
                <p className="text-xs">独立考试网页 - 面向参与者答题与研究数据采集</p>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-black bg-[#ffff99] p-2 text-center text-xs font-bold text-[#800000]">
                注意：本页面用于收集参与者真实答题数据。完成后请导出 CSV 并妥善保存。
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-[#e8e8e8] text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2">
                <b>预计参与者：</b>10 人
              </td>
              <td className="border border-black p-2">
                <b>可导出记录：</b>{readyCount}/10
              </td>
              <td className="border border-black p-2">
                <b>CSV 行数：</b>{exportRows.length}
              </td>
              <td className="border border-black p-2">
                <b>评分方式：</b>规则模板自动评分
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 border-2 border-black bg-[#ffffff] p-2 text-xs">
          <b>当前状态：</b> {notice}
          <br />
          <a className="text-[#0000ee] underline" href="#bank">
            查看题库与字段映射
          </a>
          {' | '}
          <Link className="text-[#0000ee] underline" href="/">
            打开数据分析系统
          </Link>
        </div>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-[#ffffcc] text-xs">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold">使用流程</td>
              <td className="border border-black p-2">
                1. 选择参与者编号 → 2. 核对基本信息 → 3. 完成前测 → 4. AI 学习后完成即时后测 → 5. 数日后完成延迟后测 →
                6. 填写问卷 → 7. 导出 CSV 或载入分析系统。
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-[#f5f5f5] text-sm">
          <tbody>
            <tr className="align-top">
              <td className="w-full border border-black p-2 md:w-[250px]">
                <div className="border-2 border-[#808080] bg-[#dcdcdc] p-1 font-bold">参与者列表</div>
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
                        {summary.exportReady ? '可导出' : `${summary.completeStages}/3 已完成`}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border border-black bg-white p-2">
                  <b>{selectedRecord.profile.participantId} 基本信息</b>
                  <label className="mt-2 block text-xs">
                    年龄段
                    <input
                      className="mt-1 w-full border-2 border-[#808080] bg-white px-1"
                      value={selectedRecord.profile.ageGroup}
                      onChange={(event) => updateProfile('ageGroup', event.target.value)}
                    />
                  </label>
                  <label className="mt-2 block text-xs">
                    日语水平
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
                    AI 使用经验
                    <select
                      className="mt-1 w-full border-2 border-[#808080] bg-white px-1"
                      value={selectedRecord.profile.aiExperience}
                      onChange={(event) => updateProfile('aiExperience', event.target.value)}
                    >
                      {aiExperienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid gap-1">
                  <button className="border-2 border-black bg-[#ffff99] px-2 py-1 font-bold" onClick={exportCsv} type="button">
                    导出 CSV 数据
                  </button>
                  <button className="border-2 border-black bg-[#ddddff] px-2 py-1" onClick={exportJson} type="button">
                    导出原始答案 JSON
                  </button>
                  <button className="border-2 border-black bg-[#ccffcc] px-2 py-1" onClick={loadIntoAnalysis} type="button">
                    载入分析系统
                  </button>
                  <button className="border-2 border-black bg-[#ffcccc] px-2 py-1" onClick={resetAll} type="button">
                    清空本机记录
                  </button>
                </div>
              </td>

              <td className="border border-black p-2">
                <div className="mb-2 border-2 border-[#808080] bg-[#dcdcdc] p-1 font-bold">考试部分选择</div>
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
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">当前参与者</td>
                      <td className="border border-black p-1">{selectedRecord.profile.participantId}</td>
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">当前部分</td>
                      <td className="border border-black p-1">{stageName(selectedStage)}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">完成进度</td>
                      <td className="border border-black p-1">{selectedSummary.completeStages}/3 个测试部分</td>
                      <td className="border border-black bg-[#eeeeee] p-1 font-bold">问卷状态</td>
                      <td className="border border-black p-1">{selectedSummary.questionnaireComplete ? '已完成' : '未完成'}</td>
                    </tr>
                  </tbody>
                </table>

                <table className="mb-3 w-full border-collapse border border-black bg-white text-xs">
                  <thead>
                    <tr className="bg-[#dcdcdc]">
                      <th className="border border-black p-1 text-left">已保存部分</th>
                      <th className="border border-black p-1 text-left">总分</th>
                      <th className="border border-black p-1 text-left">答题时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageKeys.map((stage) => {
                      const submission = selectedRecord.stages[stage];
                      return (
                        <tr key={stage}>
                          <td className="border border-black p-1">{stageName(stage)}</td>
                          <td className="border border-black p-1">{submission ? `${submission.totalScore}/100` : '未保存'}</td>
                          <td className="border border-black p-1">{submission ? `${submission.elapsedSeconds} 秒` : '未记录'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {selectedStage !== 'Questionnaire' ? (
                  <div>
                    <p className="mb-3 border border-black bg-[#ffffcc] p-2 text-xs">
                      {examStages.find((stage) => stage.key === selectedStage)?.purpose} 打开本部分后会自动记录答题时间。参与者完成所有题目后，请点击“保存本部分”。
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
                                对应字段：{targetField(question.stage, question.dimension)}
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
                          <b>评分说明：</b>{question.scoringNote} 原始题目分值为 {question.maxScore} 分，导出时换算为 0-100 分。
                        </p>
                      </div>
                    ))}

                    <button className="border-4 border-black bg-[#00ff00] px-4 py-2 font-bold" onClick={saveStage} type="button">
                      保存本部分
                    </button>
                    <button
                      className="ml-2 border-2 border-black bg-[#eeeeee] px-3 py-2"
                      onClick={() => {
                        setStartedAt(new Date().toISOString());
                        setNotice(`${selectedRecord.profile.participantId} 的计时已重新开始。`);
                      }}
                      type="button"
                    >
                      重新计时
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-black bg-white p-2">
                    <p className="mb-2 bg-[#ffffcc] p-2 text-xs">李克特量表：1 = 非常不同意，5 = 非常同意。</p>
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
                      保存问卷
                    </button>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="mt-2 w-full border-collapse border-2 border-black bg-white text-xs">
          <caption id="bank" className="border-2 border-b-0 border-black bg-[#800000] p-1 text-left font-bold text-white">
            可直接使用的考试题库与数据字段映射
          </caption>
          <thead>
            <tr className="bg-[#dcdcdc]">
              <th className="border border-black p-1 text-left">阶段</th>
              <th className="border border-black p-1 text-left">题目</th>
              <th className="border border-black p-1 text-left">数据字段</th>
              <th className="border border-black p-1 text-left">题型</th>
            </tr>
          </thead>
          <tbody>
            {examQuestions.map((question) => (
              <tr key={question.id}>
                <td className="border border-black p-1">{stageName(question.stage)}</td>
                <td className="border border-black p-1">{question.title}</td>
                <td className="border border-black p-1">{targetField(question.stage, question.dimension)}</td>
                <td className="border border-black p-1">{questionTypeLabel(question.type)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-2 border-2 border-black bg-[#ffff99] p-2 text-center text-xs">
          版权所有：廖鹏宇。数据在导出前仅保存在当前浏览器。
        </p>
      </div>
    </main>
  );
}
