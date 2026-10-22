import { dimensions, stages, surveyKeys, type Attempt, type Learner, type LearnerView, type Question, type Stage, type StudyState } from './types';
import { assessmentWeights } from '../../config/assessmentWeights';

export function initialState(bank: Question[] = []): StudyState {
  return { version: 1, settings: { title: '日语学习研究', accepting: true, learningMinutes: 120, examMinutes: 25, delayedDays: 7, requireDelayed: true }, bank: structuredClone(bank), drafts: [], learners: [], audit: [] };
}
export function normalize(value: string) { return value.normalize('NFKC').replace(/[\s。．.!！?？]/g, '').toLowerCase(); }
export function objectiveScore(q: Question, answer: string): number | null {
  if (!answer.trim()) return 0;
  if (q.kind === 'writing') return null;
  const correct = q.answers.some(a => normalize(a) === normalize(answer));
  // Unmatched free recall is reviewed, so valid spelling variants are not silently marked wrong.
  return correct ? 4 : q.kind === 'recall' ? null : 0;
}
export function scoreAttempt(a: Attempt) {
  a.scores = Object.fromEntries(a.questions.map(q => [q.id, a.ratings[q.id]?.score ?? objectiveScore(q, a.answers[q.id] ?? '')]));
}
export function attemptScores(a?: Attempt) {
  return Object.fromEntries(dimensions.map(d => {
    if (!a?.submittedAt) return [d, null];
    const qs = a.questions.filter(q => q.dimension === d);
    const values = qs.map(q => a.scores[q.id]);
    return [d, !qs.length || values.some(v => v === null || v === undefined) ? null : Math.round(values.reduce<number>((s, v) => s + (v ?? 0), 0) / (qs.length * 4) * 10000) / 100];
  })) as Record<typeof dimensions[number], number | null>;
}
export function totalScore(a?: Attempt) {
  const scores=attemptScores(a);
  if(dimensions.some(d=>scores[d]===null))return null;
  return Math.round(dimensions.reduce((sum,d)=>sum+scores[d]!*assessmentWeights[d],0)*100)/100;
}
export function delayedAt(l: Learner, state: StudyState) {
  const post = l.attempts.Post?.submittedAt;
  return post ? new Date(Date.parse(post) + state.settings.delayedDays * 86400000).toISOString() : undefined;
}
export function canStart(l: Learner, stage: Stage, s: StudyState, now = Date.now()) {
  if (!s.settings.accepting) throw new Error('当前未开放考试。请联系研究者。');
  if (!l.consentAt || !l.profile) throw new Error('请先阅读研究说明并填写资料。');
  if (stage === 'Post' && (!l.attempts.Pre?.submittedAt || !l.learningCompletedAt)) throw new Error('请先完成前测和学习环节。');
  if (stage === 'Delayed' && (!l.attempts.Post?.submittedAt || !delayedAt(l, s) || now < Date.parse(delayedAt(l, s)!))) throw new Error('延迟后测尚未到开放时间。');
}
export function publicView(l: Learner, s: StudyState): LearnerView {
  const attempts: LearnerView['attempts'] = {};
  for (const stage of stages) {
    const a = l.attempts[stage];
    if (a) {
      const { scores: _s, ratings: _r, questions, ...rest } = a;
      attempts[stage] = { ...rest, questions: questions.map(({ answers: _a, reference: _ref, rubric: _ru, ...q }) => q) };
    }
  }
  return { id: l.id, condition: l.condition, consentAt: l.consentAt, profile: l.profile, attempts, learningStartedAt: l.learningStartedAt, learningCompletedAt: l.learningCompletedAt, feedback: l.feedback, questionnaire: l.questionnaire, settings: s.settings, delayedAvailableAt: delayedAt(l, s) };
}
export function validateQuestion(value: unknown): Question {
  if (!value || typeof value !== 'object') throw new Error('Question must be an object.');
  const q = value as Question;
  if (typeof q.id !== 'string' || !/^[a-zA-Z0-9_-]{1,90}$/.test(q.id) || !['A','B','C'].includes(q.form) || !dimensions.includes(q.dimension) || !['choice','recall','writing'].includes(q.kind)) throw new Error('Invalid question id, form, dimension or kind.');
  for (const field of ['prompt','reference','rubric'] as const) if (typeof q[field] !== 'string' || !q[field].trim() || q[field].length > 4000) throw new Error(`Invalid ${field}.`);
  if (!Array.isArray(q.answers) || !q.answers.length || q.answers.some(a => typeof a !== 'string' || !a.trim() || a.length > 1000)) throw new Error('Expected nonempty accepted answers.');
  if (q.kind === 'choice' && (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.some(o => typeof o !== 'string' || !o.trim() || o.length > 1000) || q.answers.some(a => !q.options!.includes(a)))) throw new Error('Choice items need four distinct options containing the answer.');
  if (q.kind !== 'choice' && q.options !== undefined) delete q.options;
  return { ...q, source: q.source === 'ai' ? 'ai' : 'authored' };
}
export function validateBank(bank: Question[]) {
  if (bank.length > 300) throw new Error('Maximum 300 items.');
  const ids = new Set<string>();
  bank.forEach(q => { validateQuestion(q); if(ids.has(q.id)) throw new Error('Duplicate item id.'); ids.add(q.id); });
  for (const form of ['A','B','C']) for (const d of dimensions) if (bank.filter(q => q.form === form && q.dimension === d).length !== 3) throw new Error('Each form must contain exactly three items per dimension (15 items). Replace items instead of adding to a live form.');
}
export function validateSurvey(v: unknown): Record<string, number> {
  if (!v || typeof v !== 'object') throw new Error('请完成全部问卷项目。');
  const values = v as Record<string, number>;
  for (const k of surveyKeys) if (!Number.isInteger(values[k]) || values[k] < 1 || values[k] > 5) throw new Error('每项问卷都需要选择 1–5 分。');
  return Object.fromEntries(surveyKeys.map(k => [k, values[k]]));
}
export function exportRows(s: StudyState) {
  return s.learners.map(l => {
    const row: Record<string, string | number | null> = { participantId: l.id, ageGroup: l.profile?.ageGroup ?? '', japaneseLevel: l.profile?.japaneseLevel ?? '', aiExperience: l.profile?.aiExperience ?? '', condition: l.condition, consentAt: l.consentAt ?? '', learningStartedAt: l.learningStartedAt ?? '', learningCompletedAt: l.learningCompletedAt ?? '' };
    for (const stage of stages) {
      const a = l.attempts[stage];
      const scores = attemptScores(a);
      for (const d of dimensions) row[`${d}${stage}`] = scores[d];
      row[`total${stage}`]=totalScore(a);
      row[`responseTime${stage}`] = a?.submittedAt ? Math.max(0,(Math.min(Date.parse(a.submittedAt), Date.parse(a.deadline))-Date.parse(a.startedAt))/1000) : null;
      row[`form${stage}`] = a?.form ?? '';
      row[`submitted${stage}`] = a?.submittedAt ?? '';
      row[`timedOut${stage}`] = a?.timedOut ? 'yes' : 'no';
    }
    for(const k of surveyKeys) row[k] = l.questionnaire?.[k] ?? null;
    row.totalGain=typeof row.totalPost==='number' && typeof row.totalPre==='number' ? Math.round((row.totalPost-row.totalPre)*100)/100 : null;
    row.totalRetentionRate=typeof row.totalDelayed==='number' && typeof row.totalPost==='number' && row.totalPost!==0 ? Math.round(row.totalDelayed/row.totalPost*10000)/100 : null;
    row.reviewStatus = stages.filter(st => l.attempts[st]?.submittedAt).some(st => Object.values(attemptScores(l.attempts[st])).some(v => v === null)) ? 'pending' : 'complete';
    return row;
  });
}
