import type { AssessmentTask } from '../types';

export const tasks: AssessmentTask[] = [
  {
    id: 'academic-research-intro',
    track: 'academic',
    title: 'Research Topic Introduction',
    scenario: 'You are meeting your professor for the first time and need to explain your research idea.',
    instruction: 'Write 3-5 Japanese sentences introducing your research topic, purpose, and reason for choosing it.',
    hint: 'Try to include 研究, 目的, 方法, 課題, 分析, and polite endings.',
    keywords: ['研究', '目的', '方法', '課題', '分析', '理由'],
    sampleAnswer:
      '私は中国人学習者の日本語敬語使用について研究したいと考えています。研究の目的は、大学場面で起こりやすい表現上の問題を分析することです。このテーマを選んだ理由は、自然な敬語使用が学習者の学術的なコミュニケーションに大きく関係しているからです。',
    chineseNote: '注意说明研究目的、方法和选择理由，不要只写“我想研究日本语”。'
  },
  {
    id: 'academic-email',
    track: 'academic',
    title: 'Formal Email to a Professor',
    scenario: 'You need to write an email to a professor asking for a meeting.',
    instruction: 'Write a short formal Japanese email requesting a meeting.',
    hint: 'Use 件名, 先生, お忙しいところ, ご都合, よろしくお願いいたします.',
    keywords: ['先生', 'お忙しい', 'ご都合', '面談', 'お願いいたします', '失礼いたします'],
    sampleAnswer:
      '田中先生\n\nお忙しいところ失礼いたします。日本語教育研究についてご相談したく、来週ご都合のよろしい時間に面談をお願いできますでしょうか。ご確認のほど、よろしくお願いいたします。',
    chineseNote: '邮件任务需要敬语、称呼和明确请求，语气要比普通会话更正式。'
  },
  {
    id: 'academic-summary',
    track: 'academic',
    title: 'Academic Paragraph Summary',
    scenario:
      'You read a short academic-style paragraph about Japanese learning difficulties among Chinese learners.',
    instruction: 'Summarize the main idea in Japanese.',
    hint: 'Mention the main point, not every detail. Words like 要約すると and 重要である are useful.',
    keywords: ['要約', '学習者', '特徴', '課題', '重要', '語彙'],
    sampleAnswer:
      '要約すると、中国人学習者は漢字語彙の理解に強みを持つ一方で、助詞や自然な語順、敬語の使い分けに課題がある。そのため、文法知識だけでなく、場面に応じた運用能力を評価することが重要である。',
    chineseNote: '摘要不是翻译全文，而是抓住中心观点和对学习者的意义。'
  },
  {
    id: 'daily-hospital',
    track: 'daily',
    title: 'Hospital Reception',
    scenario: 'You are at a hospital reception desk.',
    instruction: 'Explain your symptoms, how long you have had them, and ask to see a doctor.',
    hint: 'Include 痛い, 熱, 咳, 症状, 医者, 予約, or 診察.',
    keywords: ['痛い', '熱', '咳', '症状', '医者', '診察'],
    sampleAnswer:
      'すみません、昨日から喉が痛くて、少し熱もあります。咳も出ているので、医者に診ていただきたいです。今日診察を受けることはできますか。',
    chineseNote: '医院场景要说清症状、持续时间和请求，不要只说“病気です”。'
  },
  {
    id: 'daily-housing',
    track: 'daily',
    title: 'Apartment Inquiry',
    scenario: 'You are asking a real estate agent about an apartment.',
    instruction: 'Ask about rent, location, initial fees, and whether foreigners can apply.',
    hint: 'Use 家賃, 駅, 初期費用, 外国人, 申し込み.',
    keywords: ['家賃', '駅', '初期費用', '外国人', '申し込み', '場所'],
    sampleAnswer:
      'この部屋の家賃はいくらですか。また、駅からどのくらいかかりますか。初期費用と、外国人でも申し込みできるかどうかを教えていただけますか。',
    chineseNote: '租房任务有多个信息点，回答中最好逐一询问。'
  },
  {
    id: 'daily-job-interview',
    track: 'daily',
    title: 'Part-Time Job Interview',
    scenario: 'You are in a part-time job interview.',
    instruction: 'Introduce yourself and explain your available working hours.',
    hint: 'Mention 自己紹介, 勤務時間, アルバイト, 経験, 週, 時.',
    keywords: ['自己紹介', '勤務時間', 'アルバイト', '経験', '週', '時間'],
    sampleAnswer:
      'はじめまして、李明と申します。現在大学で日本語を勉強しています。アルバイトの経験はまだ少ないですが、まじめに働きたいです。平日は午後6時以降、週末は一日勤務できます。',
    chineseNote: '面试中需要自我介绍、工作时间和态度，语气自然礼貌即可。'
  }
];

export const trackInfo = {
  academic: {
    title: 'Academic Japanese Assessment',
    description: 'Evaluate Japanese used in university, research, seminar, and professor communication contexts.',
    samples: ['Research topic explanation', 'Formal email writing', 'Academic text summary']
  },
  daily: {
    title: 'Daily Life Japanese Assessment',
    description: 'Evaluate practical Japanese for living, working, and solving daily problems in Japan.',
    samples: ['Hospital reception', 'Housing inquiry', 'Part-time job interview']
  }
};
