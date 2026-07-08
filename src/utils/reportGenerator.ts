import type { ScoreDimension, StoredAnswer } from '../types';

const labels: Record<ScoreDimension, string> = {
  taskCompletion: 'Task Completion',
  grammarAccuracy: 'Grammar Accuracy',
  vocabularyAppropriateness: 'Vocabulary',
  politenessKeigo: 'Politeness / Keigo',
  fluencyCompleteness: 'Fluency'
};

export function generateReport(answers: StoredAnswer[]) {
  const emptyScores = {
    taskCompletion: 0,
    grammarAccuracy: 0,
    vocabularyAppropriateness: 0,
    politenessKeigo: 0,
    fluencyCompleteness: 0
  };

  if (answers.length === 0) {
    return {
      totalScore: 0,
      academicScore: 0,
      dailyScore: 0,
      dimensionScores: emptyScores,
      strongestSkill: 'No data yet',
      weakestSkill: 'No data yet',
      frequentErrors: ['Complete assessment tasks to generate a diagnosis.'],
      diagnosis: 'No assessment result has been submitted yet.',
      materials: ['Start with one academic task and one daily-life task.']
    };
  }

  const dimensionScores = { ...emptyScores };
  answers.forEach(({ result }) => {
    Object.entries(result.dimensions).forEach(([key, value]) => {
      dimensionScores[key as ScoreDimension] += value;
    });
  });

  Object.keys(dimensionScores).forEach((key) => {
    dimensionScores[key as ScoreDimension] = Math.round(
      (dimensionScores[key as ScoreDimension] / answers.length) * 20
    );
  });

  const totalScore = Math.round(answers.reduce((sum, answer) => sum + answer.result.overall, 0) / answers.length);
  const academicScore = averageTrack(answers, 'academic');
  const dailyScore = averageTrack(answers, 'daily');
  const sortedDimensions = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]) as [ScoreDimension, number][];
  const frequentErrors = answers.flatMap((answer) => answer.result.errorTypes);
  const errorCounts = frequentErrors.reduce<Record<string, number>>((acc, error) => {
    acc[error] = (acc[error] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalScore,
    academicScore,
    dailyScore,
    dimensionScores,
    strongestSkill: labels[sortedDimensions[0][0]],
    weakestSkill: labels[sortedDimensions[sortedDimensions.length - 1][0]],
    frequentErrors: Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([error]) => error),
    diagnosis:
      'The learner shows potential strength in kanji-based vocabulary recognition, while task completion, particle control, keigo selection, and natural daily-life responses should be practiced in context.',
    materials: suggestMaterials(sortedDimensions[sortedDimensions.length - 1][0], frequentErrors)
  };
}

function averageTrack(answers: StoredAnswer[], track: 'academic' | 'daily') {
  const filtered = answers.filter((answer) => answer.task.track === track);
  if (filtered.length === 0) return 0;
  return Math.round(filtered.reduce((sum, answer) => sum + answer.result.overall, 0) / filtered.length);
}

function suggestMaterials(weakest: ScoreDimension, errors: string[]) {
  const materials = ['Task-based answer expansion practice', 'Chinese-Japanese kanji word comparison'];
  if (weakest === 'politenessKeigo' || errors.some((error) => error.includes('keigo'))) {
    materials.unshift('Keigo rewriting practice');
  }
  if (weakest === 'grammarAccuracy' || errors.some((error) => error.includes('particle'))) {
    materials.unshift('Particle practice: は／が／を／に／で');
  }
  if (weakest === 'taskCompletion') {
    materials.unshift('Scenario checklist training');
  }
  return materials.slice(0, 5);
}
