import type { ExamQuestion, ExamStage } from '@/lib/exam/types';

export const examStages: { key: ExamStage; label: string; purpose: string }[] = [
  { key: 'Pre', label: 'Pre-test', purpose: 'Measure baseline performance before AI-assisted learning.' },
  { key: 'Post', label: 'Immediate Post-test', purpose: 'Measure short-term change immediately after the learning session.' },
  { key: 'Delayed', label: 'Delayed Post-test', purpose: 'Measure whether observed gains are retained after several days.' }
];

export const examQuestions: ExamQuestion[] = [
  {
    id: 'pre-recognition-1',
    stage: 'Pre',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: 'Recognition: Academic Vocabulary',
    prompt: 'Choose the best meaning of 「課題」 in an academic Japanese context.',
    options: ['topic or problem to be addressed', 'a part-time job salary', 'a hospital reservation', 'a train transfer'],
    correctAnswer: 'topic or problem to be addressed',
    expectedKeywords: ['topic', 'problem', 'issue', 'task'],
    maxScore: 20,
    scoringNote: 'Recognition item mapped to vocabularyRecognitionPre.'
  },
  {
    id: 'pre-recall-1',
    stage: 'Pre',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: 'Recall: Research Vocabulary',
    prompt: 'Write Japanese words or phrases for research purpose, method, analysis, and result.',
    expectedKeywords: ['目的', '方法', '分析', '結果', '研究'],
    maxScore: 20,
    scoringNote: 'Active recall item mapped to vocabularyRecallPre.'
  },
  {
    id: 'pre-context-1',
    stage: 'Pre',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: 'Contextual Usage: Professor Meeting',
    prompt: 'Write 2-3 Japanese sentences explaining your research topic to a professor.',
    expectedKeywords: ['研究', '目的', 'です', 'ます', '理由'],
    maxScore: 20,
    scoringNote: 'Contextual writing item mapped to contextualUsagePre.'
  },
  {
    id: 'pre-conversation-1',
    stage: 'Pre',
    dimension: 'conversation',
    type: 'conversation-response',
    title: 'Conversation: Hospital Reception',
    prompt: 'Respond in Japanese: 今日はどうされましたか。',
    expectedKeywords: ['痛い', '熱', '咳', '診察', '昨日', 'から', 'お願いします'],
    maxScore: 20,
    scoringNote: 'Conversation response item mapped to conversationPre.'
  },
  {
    id: 'pre-grammar-1',
    stage: 'Pre',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: 'Grammar: Particle Choice',
    prompt: 'Choose the best particle: 図書館（　）資料を調べました。',
    options: ['で', 'に', 'を', 'が'],
    correctAnswer: 'で',
    expectedKeywords: ['で'],
    maxScore: 20,
    scoringNote: 'Grammar form item mapped to grammarPre.'
  },
  {
    id: 'post-recognition-1',
    stage: 'Post',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: 'Recognition: Academic Collocation',
    prompt: 'Choose the most natural collocation.',
    options: ['データを分析する', 'データを洗濯する', 'データを予約する', 'データを乗り換える'],
    correctAnswer: 'データを分析する',
    expectedKeywords: ['データを分析する', '分析'],
    maxScore: 20,
    scoringNote: 'Recognition item mapped to vocabularyRecognitionPost.'
  },
  {
    id: 'post-recall-1',
    stage: 'Post',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: 'Recall: Formal Email Vocabulary',
    prompt: 'Write Japanese expressions useful for politely asking a professor for a meeting.',
    expectedKeywords: ['先生', '面談', 'ご都合', 'お忙しい', 'お願いいたします'],
    maxScore: 20,
    scoringNote: 'Recall item mapped to vocabularyRecallPost.'
  },
  {
    id: 'post-context-1',
    stage: 'Post',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: 'Contextual Usage: Formal Email',
    prompt: 'Write a short formal Japanese email asking a professor for a meeting.',
    expectedKeywords: ['先生', 'お忙しい', '面談', 'ご都合', 'よろしくお願いいたします'],
    maxScore: 20,
    scoringNote: 'Contextual item mapped to contextualUsagePost.'
  },
  {
    id: 'post-conversation-1',
    stage: 'Post',
    dimension: 'conversation',
    type: 'conversation-response',
    title: 'Conversation: Housing Inquiry',
    prompt: 'Ask a real estate agent about rent, station distance, initial fees, and whether foreigners can apply.',
    expectedKeywords: ['家賃', '駅', '初期費用', '外国人', '申し込み', '教えて'],
    maxScore: 20,
    scoringNote: 'Conversation item mapped to conversationPost.'
  },
  {
    id: 'post-grammar-1',
    stage: 'Post',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: 'Grammar: Keigo Form',
    prompt: 'Choose the most polite request.',
    options: ['教えてください', '教えていただけますでしょうか', '教えろ', '教える？'],
    correctAnswer: '教えていただけますでしょうか',
    expectedKeywords: ['教えていただけますでしょうか'],
    maxScore: 20,
    scoringNote: 'Grammar item mapped to grammarPost.'
  },
  {
    id: 'delayed-recognition-1',
    stage: 'Delayed',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: 'Recognition: Delayed Vocabulary',
    prompt: 'Choose the best meaning of 「初期費用」.',
    options: ['initial move-in cost', 'research limitation', 'medical symptom', 'class discussion'],
    correctAnswer: 'initial move-in cost',
    expectedKeywords: ['initial', 'cost', '費用'],
    maxScore: 20,
    scoringNote: 'Delayed item mapped to vocabularyRecognitionDelayed.'
  },
  {
    id: 'delayed-recall-1',
    stage: 'Delayed',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: 'Recall: Daily-life Vocabulary',
    prompt: 'Write Japanese words or expressions for symptoms, rent, initial fees, and work schedule.',
    expectedKeywords: ['症状', '家賃', '初期費用', '勤務時間', '熱', '咳'],
    maxScore: 20,
    scoringNote: 'Delayed item mapped to vocabularyRecallDelayed.'
  },
  {
    id: 'delayed-context-1',
    stage: 'Delayed',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: 'Contextual Usage: Academic Summary',
    prompt: 'Summarize in Japanese: Chinese learners may recognize kanji vocabulary quickly, but particles and keigo remain difficult.',
    expectedKeywords: ['中国人学習者', '漢字', '助詞', '敬語', '課題', '要約'],
    maxScore: 20,
    scoringNote: 'Delayed item mapped to contextualUsageDelayed.'
  },
  {
    id: 'delayed-conversation-1',
    stage: 'Delayed',
    dimension: 'conversation',
    type: 'conversation-response',
    title: 'Conversation: Job Interview',
    prompt: 'Introduce yourself and explain your available working hours in a part-time job interview.',
    expectedKeywords: ['申します', '大学', 'アルバイト', '勤務', '平日', '週末'],
    maxScore: 20,
    scoringNote: 'Delayed item mapped to conversationDelayed.'
  },
  {
    id: 'delayed-grammar-1',
    stage: 'Delayed',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: 'Grammar: Particle and Word Order',
    prompt: 'Choose the most natural sentence.',
    options: [
      '先生に研究計画を説明します。',
      '先生を研究計画に説明します。',
      '研究計画が先生を説明します。',
      '説明します先生に研究計画を。'
    ],
    correctAnswer: '先生に研究計画を説明します。',
    expectedKeywords: ['先生に研究計画を説明します。'],
    maxScore: 20,
    scoringNote: 'Delayed item mapped to grammarDelayed.'
  }
];

export const questionnairePrompts = [
  { key: 'perceivedUsefulness', label: 'The AI learning session was useful for Japanese study.' },
  { key: 'feedbackClarity', label: 'The feedback was clear and easy to understand.' },
  { key: 'learningEngagement', label: 'I felt engaged during the learning session.' },
  { key: 'confidenceImprovement', label: 'I feel more confident using Japanese after the session.' },
  { key: 'cognitiveLoad', label: 'The learning process required high mental effort.' },
  { key: 'intentionToReuse', label: 'I would like to use this system again.' }
] as const;
