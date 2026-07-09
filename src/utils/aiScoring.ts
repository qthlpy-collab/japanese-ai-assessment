import type { AssessmentTask, ScoreResult } from '../types';
import { scoreAnswer } from './scoring';

export async function evaluateAnswer(task: AssessmentTask, answer: string): Promise<ScoreResult & { source: string }> {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ task, answer })
    });

    if (!response.ok) {
      throw new Error(`AI evaluation failed with status ${response.status}`);
    }

    const result = (await response.json()) as ScoreResult;
    return { ...normalizeResult(task, result), source: 'Real AI evaluation' };
  } catch (error) {
    console.warn('Falling back to simulated scoring:', error);
    return { ...scoreAnswer(task, answer), source: 'Simulated fallback' };
  }
}

function normalizeResult(task: AssessmentTask, result: ScoreResult): ScoreResult {
  const dimensions = {
    taskCompletion: clampScore(result.dimensions.taskCompletion, 5),
    grammarAccuracy: clampScore(result.dimensions.grammarAccuracy, 5),
    vocabularyAppropriateness: clampScore(result.dimensions.vocabularyAppropriateness, 5),
    politenessKeigo: clampScore(result.dimensions.politenessKeigo, 5),
    fluencyCompleteness: clampScore(result.dimensions.fluencyCompleteness, 5)
  };

  return {
    taskId: task.id,
    track: task.track,
    overall: clampScore(result.overall, 100),
    dimensions,
    risk: ['Low', 'Medium', 'High'].includes(result.risk) ? result.risk : 'Medium',
    strengths: ensureList(result.strengths, 'The response gives enough language for assessment.'),
    weaknesses: ensureList(result.weaknesses, 'More natural Japanese expression can be improved.'),
    errorTypes: ensureList(result.errorTypes, 'General task-based expression risk'),
    suggestion: result.suggestion || 'Add more complete task details and use natural Japanese expressions.',
    sampleAnswer: result.sampleAnswer || task.sampleAnswer,
    chineseExplanation: result.chineseExplanation || task.chineseNote
  };
}

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(Number(value) || 0)));
}

function ensureList(value: string[] | undefined, fallback: string) {
  return Array.isArray(value) && value.length > 0 ? value : [fallback];
}
