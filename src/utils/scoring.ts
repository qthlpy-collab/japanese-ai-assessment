import type { AssessmentTask, ScoreResult } from '../types';

const politeExpressions = ['です', 'ます', 'お願いいたします', 'お願いします', 'いただき', 'でしょうか', '申します'];
const academicVocabulary = ['研究', '目的', '方法', '課題', '分析', '要約', '重要', '学習者', '結果'];
const chineseTransferRisks = ['的', '了', '因为', '所以', '可以吗', '进行研究', '我的研究是', '有'];
const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'へ', 'から', 'まで', 'より'];

const clamp = (value: number) => Math.max(0, Math.min(5, value));

const countMatches = (text: string, words: string[]) => words.filter((word) => text.includes(word)).length;

export function scoreAnswer(task: AssessmentTask, answer: string): ScoreResult {
  const normalized = answer.trim();
  const length = normalized.length;
  const sentenceCount = (normalized.match(/[。！？!?]/g) ?? []).length || (length > 0 ? 1 : 0);
  const keywordHits = countMatches(normalized, task.keywords);
  const politeHits = countMatches(normalized, politeExpressions);
  const particleHits = countMatches(normalized, particles);
  const transferHits = countMatches(normalized, chineseTransferRisks);
  const academicHits = countMatches(normalized, academicVocabulary);

  const taskCompletion = clamp(1 + keywordHits + (length >= 65 ? 1 : 0) + (sentenceCount >= 3 ? 1 : 0));
  const grammarAccuracy = clamp(2 + Math.min(2, particleHits / 3) - transferHits * 0.8 + (length >= 30 ? 0.5 : -1));
  const vocabularyAppropriateness = clamp(
    1.5 + keywordHits * 0.7 + (task.track === 'academic' ? academicHits * 0.35 : 0) + (length >= 45 ? 0.5 : 0)
  );
  const politenessKeigo = clamp(1 + politeHits * 1.2 + (task.id.includes('email') ? -0.4 : 0));
  const fluencyCompleteness = clamp(1 + sentenceCount * 0.8 + (length >= 80 ? 1 : length >= 45 ? 0.5 : -0.5));

  const dimensions = {
    taskCompletion: Math.round(taskCompletion),
    grammarAccuracy: Math.round(grammarAccuracy),
    vocabularyAppropriateness: Math.round(vocabularyAppropriateness),
    politenessKeigo: Math.round(politenessKeigo),
    fluencyCompleteness: Math.round(fluencyCompleteness)
  };

  const average =
    Object.values(dimensions).reduce((sum, score) => sum + score, 0) / Object.values(dimensions).length;
  const risk = transferHits >= 2 || particleHits <= 1 ? 'High' : transferHits === 1 || average < 3 ? 'Medium' : 'Low';

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const errorTypes: string[] = [];

  if (politeHits > 0) strengths.push('You used polite Japanese endings or request expressions.');
  if (keywordHits >= 2) strengths.push('Your response includes scenario-relevant vocabulary.');
  if (task.track === 'academic' && academicHits >= 2) strengths.push('You used kanji-based academic vocabulary effectively.');
  if (sentenceCount >= 3) strengths.push('Your answer has enough sentence-level development for this task.');

  if (length < 35) {
    weaknesses.push('The answer is too short to fully complete the task.');
    errorTypes.push('Possible incomplete task response');
  }
  if (keywordHits < 2) {
    weaknesses.push('More task-specific details are needed.');
    errorTypes.push('Possible lack of scenario vocabulary');
  }
  if (politeHits === 0) {
    weaknesses.push('The response does not show enough polite or formal Japanese.');
    errorTypes.push('Possible underuse of keigo');
  }
  if (transferHits > 0 || particleHits <= 1) {
    weaknesses.push('Some expressions may reflect Chinese-style transfer or weak particle control.');
    errorTypes.push('Possible Chinese-style expression or particle risk');
  }

  if (strengths.length === 0) strengths.push('You attempted the task and provided a basis for diagnosis.');
  if (weaknesses.length === 0) weaknesses.push('The answer is generally clear; refine naturalness and detail for a higher score.');
  if (errorTypes.length === 0) errorTypes.push('Minor naturalness risk');

  return {
    taskId: task.id,
    track: task.track,
    overall: Math.round(average * 20),
    dimensions,
    risk,
    strengths,
    weaknesses,
    errorTypes,
    suggestion: buildSuggestion(task, dimensions),
    sampleAnswer: task.sampleAnswer,
    chineseExplanation: task.chineseNote
  };
}

function buildSuggestion(task: AssessmentTask, dimensions: ScoreResult['dimensions']) {
  if (dimensions.politenessKeigo <= 2) {
    return 'Add polite endings and request forms such as です／ます, いただけますか, and よろしくお願いいたします.';
  }
  if (dimensions.taskCompletion <= 2) {
    return 'Answer every part of the instruction and add concrete details for the situation.';
  }
  if (task.track === 'academic') {
    return 'Include the purpose, method, reason, or main argument so the academic task feels complete.';
  }
  return 'Use natural daily-life expressions and include the key information the listener needs.';
}
