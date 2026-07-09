import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const responseSchema = {
  name: 'japanese_assessment_feedback',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      overall: { type: 'number', minimum: 0, maximum: 100 },
      dimensions: {
        type: 'object',
        additionalProperties: false,
        properties: {
          taskCompletion: { type: 'number', minimum: 0, maximum: 5 },
          grammarAccuracy: { type: 'number', minimum: 0, maximum: 5 },
          vocabularyAppropriateness: { type: 'number', minimum: 0, maximum: 5 },
          politenessKeigo: { type: 'number', minimum: 0, maximum: 5 },
          fluencyCompleteness: { type: 'number', minimum: 0, maximum: 5 }
        },
        required: [
          'taskCompletion',
          'grammarAccuracy',
          'vocabularyAppropriateness',
          'politenessKeigo',
          'fluencyCompleteness'
        ]
      },
      risk: { type: 'string', enum: ['Low', 'Medium', 'High'] },
      strengths: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
      weaknesses: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
      errorTypes: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
      suggestion: { type: 'string' },
      sampleAnswer: { type: 'string' },
      chineseExplanation: { type: 'string' }
    },
    required: [
      'overall',
      'dimensions',
      'risk',
      'strengths',
      'weaknesses',
      'errorTypes',
      'suggestion',
      'sampleAnswer',
      'chineseExplanation'
    ]
  },
  strict: true
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  const { task, answer } = req.body ?? {};
  if (!task || typeof answer !== 'string') {
    return res.status(400).json({ error: 'Missing task or answer.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: responseSchema
      },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Japanese proficiency assessor for Chinese learners. Score task-based Japanese answers fairly and return only valid JSON matching the schema. Pay attention to task completion, particles, Chinese transfer, kanji vocabulary, keigo, and naturalness.'
        },
        {
          role: 'user',
          content: JSON.stringify(
            {
              task: {
                id: task.id,
                track: task.track,
                title: task.title,
                scenario: task.scenario,
                instruction: task.instruction,
                keywords: task.keywords
              },
              learnerAnswer: answer,
              scoringScale: {
                dimensions: '0-5',
                overall: '0-100',
                risk: 'Low, Medium, or High'
              },
              feedbackLanguage:
                'Strengths, weaknesses, errorTypes, and suggestion in English. sampleAnswer in Japanese. chineseExplanation in simplified Chinese.'
            },
            null,
            2
          )
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'The AI response was empty.' });
    }

    const parsed = JSON.parse(content);
    return res.status(200).json({
      taskId: task.id,
      track: task.track,
      ...parsed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown OpenAI API error';
    return res.status(500).json({ error: message });
  }
}
