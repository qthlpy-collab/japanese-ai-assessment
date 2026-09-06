import type { ExamQuestion, ExamStage } from '@/lib/exam/types';

export const examStages: { key: ExamStage; label: string; purpose: string }[] = [
  { key: 'Pre', label: '前测', purpose: '用于记录 AI 辅助学习前的日语基础表现。' },
  { key: 'Post', label: '即时后测', purpose: '用于记录 AI 辅助学习结束后立即产生的短期变化。' },
  { key: 'Delayed', label: '延迟后测', purpose: '用于记录数日后相关表现是否仍然保持。' }
];

export const examQuestions: ExamQuestion[] = [
  {
    id: 'pre-recognition-1',
    stage: 'Pre',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: '词汇识别：学术词汇',
    prompt: '请选择「課題」在学术语境中最合适的意思。',
    options: ['需要解决的主题或问题', '兼职工作的工资', '医院预约', '电车换乘'],
    correctAnswer: '需要解决的主题或问题',
    expectedKeywords: ['topic', 'problem', 'issue', 'task'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecognitionPre。'
  },
  {
    id: 'pre-recall-1',
    stage: 'Pre',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: '词汇回忆：研究相关词汇',
    prompt: '请写出表示“研究目的、方法、分析、结果”的日语词语或短语。',
    expectedKeywords: ['目的', '方法', '分析', '結果', '研究'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecallPre。'
  },
  {
    id: 'pre-context-1',
    stage: 'Pre',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: '语境使用：初次见导师',
    prompt: '请用 2-3 句日语向教授介绍你的研究主题。',
    expectedKeywords: ['研究', '目的', 'です', 'ます', '理由'],
    maxScore: 20,
    scoringNote: '本题对应 contextualUsagePre。'
  },
  {
    id: 'pre-conversation-1',
    stage: 'Pre',
    dimension: 'conversation',
    type: 'conversation-response',
    title: '对话应答：医院前台',
    prompt: '请用日语回答：今日はどうされましたか。',
    expectedKeywords: ['痛い', '熱', '咳', '診察', '昨日', 'から', 'お願いします'],
    maxScore: 20,
    scoringNote: '本题对应 conversationPre。'
  },
  {
    id: 'pre-grammar-1',
    stage: 'Pre',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: '语法形式：助词选择',
    prompt: '请选择最合适的助词：図書館（　）資料を調べました。',
    options: ['で', 'に', 'を', 'が'],
    correctAnswer: 'で',
    expectedKeywords: ['で'],
    maxScore: 20,
    scoringNote: '本题对应 grammarPre。'
  },
  {
    id: 'post-recognition-1',
    stage: 'Post',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: '词汇识别：学术搭配',
    prompt: '请选择最自然的日语搭配。',
    options: ['データを分析する', 'データを洗濯する', 'データを予約する', 'データを乗り換える'],
    correctAnswer: 'データを分析する',
    expectedKeywords: ['データを分析する', '分析'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecognitionPost。'
  },
  {
    id: 'post-recall-1',
    stage: 'Post',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: '词汇回忆：正式邮件表达',
    prompt: '请写出用于礼貌请求教授面谈的日语表达。',
    expectedKeywords: ['先生', '面談', 'ご都合', 'お忙しい', 'お願いいたします'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecallPost。'
  },
  {
    id: 'post-context-1',
    stage: 'Post',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: '语境使用：正式邮件',
    prompt: '请写一封简短的日语正式邮件，向教授请求面谈。',
    expectedKeywords: ['先生', 'お忙しい', '面談', 'ご都合', 'よろしくお願いいたします'],
    maxScore: 20,
    scoringNote: '本题对应 contextualUsagePost。'
  },
  {
    id: 'post-conversation-1',
    stage: 'Post',
    dimension: 'conversation',
    type: 'conversation-response',
    title: '对话应答：租房咨询',
    prompt: '请用日语向房产中介询问房租、到车站距离、初期费用以及外国人是否可以申请。',
    expectedKeywords: ['家賃', '駅', '初期費用', '外国人', '申し込み', '教えて'],
    maxScore: 20,
    scoringNote: '本题对应 conversationPost。'
  },
  {
    id: 'post-grammar-1',
    stage: 'Post',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: '语法形式：敬语表达',
    prompt: '请选择最礼貌的请求表达。',
    options: ['教えてください', '教えていただけますでしょうか', '教えろ', '教える？'],
    correctAnswer: '教えていただけますでしょうか',
    expectedKeywords: ['教えていただけますでしょうか'],
    maxScore: 20,
    scoringNote: '本题对应 grammarPost。'
  },
  {
    id: 'delayed-recognition-1',
    stage: 'Delayed',
    dimension: 'vocabularyRecognition',
    type: 'multiple-choice',
    title: '词汇识别：延迟词汇',
    prompt: '请选择「初期費用」最合适的意思。',
    options: ['入住时的初始费用', '研究限制', '身体症状', '课堂讨论'],
    correctAnswer: '入住时的初始费用',
    expectedKeywords: ['initial', 'cost', '費用'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecognitionDelayed。'
  },
  {
    id: 'delayed-recall-1',
    stage: 'Delayed',
    dimension: 'vocabularyRecall',
    type: 'short-answer',
    title: '词汇回忆：生活场景词汇',
    prompt: '请写出表示“症状、房租、初期费用、工作时间”的日语词语或表达。',
    expectedKeywords: ['症状', '家賃', '初期費用', '勤務時間', '熱', '咳'],
    maxScore: 20,
    scoringNote: '本题对应 vocabularyRecallDelayed。'
  },
  {
    id: 'delayed-context-1',
    stage: 'Delayed',
    dimension: 'contextualUsage',
    type: 'situational-writing',
    title: '语境使用：学术总结',
    prompt: '请用日语概括：中文背景学习者可能较快识别汉字词汇，但助词和敬语仍然较难。',
    expectedKeywords: ['中国人学習者', '漢字', '助詞', '敬語', '課題', '要約'],
    maxScore: 20,
    scoringNote: '本题对应 contextualUsageDelayed。'
  },
  {
    id: 'delayed-conversation-1',
    stage: 'Delayed',
    dimension: 'conversation',
    type: 'conversation-response',
    title: '对话应答：兼职面试',
    prompt: '请用日语进行自我介绍，并说明你可以工作的时间。',
    expectedKeywords: ['申します', '大学', 'アルバイト', '勤務', '平日', '週末'],
    maxScore: 20,
    scoringNote: '本题对应 conversationDelayed。'
  },
  {
    id: 'delayed-grammar-1',
    stage: 'Delayed',
    dimension: 'grammar',
    type: 'multiple-choice',
    title: '语法形式：助词与语序',
    prompt: '请选择最自然的日语句子。',
    options: [
      '先生に研究計画を説明します。',
      '先生を研究計画に説明します。',
      '研究計画が先生を説明します。',
      '説明します先生に研究計画を。'
    ],
    correctAnswer: '先生に研究計画を説明します。',
    expectedKeywords: ['先生に研究計画を説明します。'],
    maxScore: 20,
    scoringNote: '本题对应 grammarDelayed。'
  }
];

export const questionnairePrompts = [
  { key: 'perceivedUsefulness', label: '我认为 AI 学习环节对日语学习有帮助。' },
  { key: 'feedbackClarity', label: '我认为系统反馈清楚、容易理解。' },
  { key: 'learningEngagement', label: '我在学习过程中保持了较高参与度。' },
  { key: 'confidenceImprovement', label: '学习后我更有信心使用日语。' },
  { key: 'cognitiveLoad', label: '我觉得学习过程需要较高的脑力投入。' },
  { key: 'intentionToReuse', label: '我以后愿意继续使用类似系统。' }
] as const;
