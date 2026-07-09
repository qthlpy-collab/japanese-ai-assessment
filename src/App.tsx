import { useMemo, useState } from 'react';
import { BookOpen, ClipboardCheck, FileText, GraduationCap, HomeIcon, Sparkles } from 'lucide-react';
import { AssessmentTask, StoredAnswer, Track } from './types';
import { tasks, trackInfo } from './data/tasks';
import { evaluateAnswer } from './utils/aiScoring';
import { generateReport } from './utils/reportGenerator';

type Page = 'home' | 'tracks' | 'assessment' | 'report' | 'materials' | 'about';

const navItems: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'tracks', label: 'Tracks' },
  { page: 'assessment', label: 'Assessment' },
  { page: 'report', label: 'Report' },
  { page: 'materials', label: 'Materials' },
  { page: 'about', label: 'About' }
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedTrack, setSelectedTrack] = useState<Track>('academic');
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);

  const report = useMemo(() => generateReport(answers), [answers]);

  const startTrack = (track: Track) => {
    setSelectedTrack(track);
    setPage('assessment');
  };

  const saveAnswer = async (task: AssessmentTask, answer: string) => {
    const result = await evaluateAnswer(task, answer);
    setAnswers((current) => {
      const next = current.filter((item) => item.task.id !== task.id);
      return [...next, { task, answer, result }];
    });
    return result;
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setPage('home')} aria-label="Go to home">
          <GraduationCap size={24} />
          <span>AI Japanese Assessment</span>
        </button>
        <nav className="main-nav">
          {navItems.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? 'active' : ''}
              onClick={() => setPage(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'tracks' && <TrackSelection selectedTrack={selectedTrack} onStart={startTrack} />}
        {page === 'assessment' && (
          <AssessmentPage selectedTrack={selectedTrack} answers={answers} onTrackChange={setSelectedTrack} onSubmit={saveAnswer} />
        )}
        {page === 'report' && <ReportPage answers={answers} report={report} onNavigate={setPage} />}
        {page === 'materials' && <LearningMaterialsPage report={report} />}
        {page === 'about' && <AboutPage />}
      </main>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Master Project MP6 Prototype</p>
        <h1>AI-Based Japanese Proficiency Assessment System for Chinese Learners</h1>
        <p>
          An AI-based Japanese proficiency assessment prototype for Chinese learners, using academic and daily-life task
          scenarios.
        </p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => onNavigate('tracks')}>
            <ClipboardCheck size={18} />
            Start Assessment
          </button>
          <button className="secondary-button" onClick={() => onNavigate('report')}>
            <FileText size={18} />
            View Diagnostic Report
          </button>
          <button className="ghost-button" onClick={() => onNavigate('about')}>
            <BookOpen size={18} />
            About Project
          </button>
        </div>
      </div>
      <div className="hero-panel">
        <div>
          <span>Assessment Tracks</span>
          <strong>Academic + Daily Life</strong>
        </div>
        <div>
          <span>Feedback Focus</span>
          <strong>Task, grammar, vocabulary, keigo, fluency</strong>
        </div>
        <div>
          <span>Learner Lens</span>
          <strong>Chinese transfer risks and kanji advantages</strong>
        </div>
      </div>
    </section>
  );
}

function TrackSelection({ selectedTrack, onStart }: { selectedTrack: Track; onStart: (track: Track) => void }) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Track Selection</p>
        <h2>Choose an assessment context</h2>
      </div>
      <div className="track-grid">
        {(['academic', 'daily'] as Track[]).map((track) => (
          <article className={selectedTrack === track ? 'track-card selected' : 'track-card'} key={track}>
            <div className="card-icon">{track === 'academic' ? <GraduationCap /> : <HomeIcon />}</div>
            <h3>{trackInfo[track].title}</h3>
            <p>{trackInfo[track].description}</p>
            <ul>
              {trackInfo[track].samples.map((sample) => (
                <li key={sample}>{sample}</li>
              ))}
            </ul>
            <button className="primary-button" onClick={() => onStart(track)}>
              Start {track === 'academic' ? 'Academic' : 'Daily'} Tasks
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssessmentPage({
  selectedTrack,
  answers,
  onTrackChange,
  onSubmit
}: {
  selectedTrack: Track;
  answers: StoredAnswer[];
  onTrackChange: (track: Track) => void;
  onSubmit: (task: AssessmentTask, answer: string) => Promise<StoredAnswer['result']>;
}) {
  const visibleTasks = tasks.filter((task) => task.track === selectedTrack);
  const completed = answers.filter((answer) => answer.task.track === selectedTrack).length;

  return (
    <section className="page-section">
      <div className="assessment-toolbar">
        <div>
          <p className="eyebrow">Assessment</p>
          <h2>{trackInfo[selectedTrack].title}</h2>
        </div>
        <div className="segmented-control">
          <button className={selectedTrack === 'academic' ? 'active' : ''} onClick={() => onTrackChange('academic')}>
            Academic
          </button>
          <button className={selectedTrack === 'daily' ? 'active' : ''} onClick={() => onTrackChange('daily')}>
            Daily Life
          </button>
        </div>
      </div>
      <div className="progress-line">
        <span style={{ width: `${(completed / visibleTasks.length) * 100}%` }} />
      </div>
      <div className="task-list">
        {visibleTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            number={index + 1}
            storedAnswer={answers.find((answer) => answer.task.id === task.id)}
            onSubmit={onSubmit}
          />
        ))}
      </div>
    </section>
  );
}

function TaskCard({
  task,
  number,
  storedAnswer,
  onSubmit
}: {
  task: AssessmentTask;
  number: number;
  storedAnswer?: StoredAnswer;
  onSubmit: (task: AssessmentTask, answer: string) => Promise<StoredAnswer['result']>;
}) {
  const [answer, setAnswer] = useState(storedAnswer?.answer ?? '');
  const [result, setResult] = useState(storedAnswer?.result);
  const [isScoring, setIsScoring] = useState(false);

  return (
    <article className="task-card">
      <div className="task-header">
        <span>Task {number}</span>
        <h3>{task.title}</h3>
      </div>
      <div className="scenario-box">
        <strong>Scenario</strong>
        <p>{task.scenario}</p>
      </div>
      <p className="instruction">{task.instruction}</p>
      <p className="hint">Hint: {task.hint}</p>
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Write your answer in Japanese..."
      />
      <button
        className="primary-button"
        disabled={isScoring || answer.trim().length === 0}
        onClick={async () => {
          setIsScoring(true);
          const next = await onSubmit(task, answer);
          setResult(next);
          setIsScoring(false);
        }}
      >
        <Sparkles size={18} />
        {isScoring ? 'Scoring with AI...' : 'Submit for AI Feedback'}
      </button>
      {result && <FeedbackPanel result={result} />}
    </article>
  );
}

function FeedbackPanel({ result }: { result: StoredAnswer['result'] }) {
  return (
    <section className="feedback-panel">
      <div className="score-summary">
        <div>
          <span>Overall</span>
          <strong>{result.overall}</strong>
        </div>
        <div>
          <span>Chinese Learner Error Risk</span>
          <strong>{result.risk}</strong>
        </div>
        <div>
          <span>Scoring Source</span>
          <strong className="source-label">{result.source ?? 'AI evaluation'}</strong>
        </div>
      </div>
      <ScoreBars scores={result.dimensions} max={5} />
      <div className="feedback-grid">
        <FeedbackList title="Strengths" items={result.strengths} />
        <FeedbackList title="Weaknesses" items={result.weaknesses} />
        <FeedbackList title="Error Types" items={result.errorTypes} />
      </div>
      <div className="sample-answer">
        <strong>Suggested Improvement</strong>
        <p>{result.suggestion}</p>
        <strong>Improved Sample Answer</strong>
        <p lang="ja">{result.sampleAnswer}</p>
        <strong>Chinese Explanation</strong>
        <p>{result.chineseExplanation}</p>
      </div>
    </section>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBars({ scores, max = 100 }: { scores: Record<string, number>; max?: number }) {
  const names: Record<string, string> = {
    taskCompletion: 'Task Completion',
    grammarAccuracy: 'Grammar Accuracy',
    vocabularyAppropriateness: 'Vocabulary',
    politenessKeigo: 'Politeness / Keigo',
    fluencyCompleteness: 'Fluency'
  };

  return (
    <div className="score-bars">
      {Object.entries(scores).map(([key, value]) => (
        <div className="bar-row" key={key}>
          <span>{names[key] ?? key}</span>
          <div className="bar-track">
            <i style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function ReportPage({
  answers,
  report,
  onNavigate
}: {
  answers: StoredAnswer[];
  report: ReturnType<typeof generateReport>;
  onNavigate: (page: Page) => void;
}) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Diagnostic Report</p>
        <h2>Assessment profile for Chinese learners of Japanese</h2>
      </div>
      <div className="report-grid">
        <MetricCard label="Total Score" value={report.totalScore} />
        <MetricCard label="Academic Japanese" value={report.academicScore} />
        <MetricCard label="Daily Life Japanese" value={report.dailyScore} />
      </div>
      <article className="report-panel">
        <div className="report-two-column">
          <div>
            <h3>Skill Profile</h3>
            <ScoreBars scores={report.dimensionScores} />
          </div>
          <div>
            <h3>Diagnosis</h3>
            <p>{report.diagnosis}</p>
            <p>
              <strong>Strongest skill:</strong> {report.strongestSkill}
            </p>
            <p>
              <strong>Weakest skill:</strong> {report.weakestSkill}
            </p>
            <h4>Frequent Error Types</h4>
            <ul>
              {report.frequentErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <article className="report-panel">
        <h3>Suggested Next Learning Materials</h3>
        <div className="material-tags">
          {report.materials.map((material) => (
            <span key={material}>{material}</span>
          ))}
        </div>
        {answers.length === 0 && (
          <button className="primary-button" onClick={() => onNavigate('tracks')}>
            Start Assessment
          </button>
        )}
      </article>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>/ 100</small>
    </div>
  );
}

function LearningMaterialsPage({ report }: { report: ReturnType<typeof generateReport> }) {
  const exercises = [
    {
      title: 'Particle Practice',
      prompt: 'Choose the correct particle: 図書館（　）資料を調べました。 は / で / に',
      focus: 'は／が／を／に／で'
    },
    {
      title: 'Keigo Rewriting',
      prompt: 'Rewrite into polite Japanese: 来週先生に会いたいです。',
      focus: 'Request forms and professor communication'
    },
    {
      title: 'Chinese-Japanese Kanji Comparison',
      prompt: 'Compare the Chinese meaning and Japanese usage of 研究, 勉強, 検討, 相談.',
      focus: 'Avoid direct Chinese meaning transfer'
    },
    {
      title: 'Academic Email Template',
      prompt: 'Complete a short email with 件名, greeting, request, availability, and closing.',
      focus: 'Formal academic writing'
    },
    {
      title: 'Hospital Conversation',
      prompt: 'Explain symptoms, duration, and request a medical examination.',
      focus: 'Daily-life task completion'
    },
    {
      title: 'Housing Inquiry Dialogue',
      prompt: 'Ask about 家賃, 初期費用, 駅からの距離, and 外国人の申し込み.',
      focus: 'Practical inquiry skills'
    }
  ];

  return (
    <section className="page-section">
      <div className="section-heading">
        <p className="eyebrow">Learning Material Generation</p>
        <h2>Personalized practice after assessment</h2>
        <p>Current diagnostic priority: {report.weakestSkill}</p>
      </div>
      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <article className="exercise-card" key={exercise.title}>
            <span>{exercise.focus}</span>
            <h3>{exercise.title}</h3>
            <p>{exercise.prompt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="page-section readable">
      <p className="eyebrow">About Project</p>
      <h2>Research value</h2>
      <p>
        Traditional tests often check grammar and vocabulary separately, but real language ability requires completing
        tasks in meaningful contexts. This prototype applies a task-based assessment idea, similar to IELTS and TOEFL,
        to Japanese learning for Chinese learners.
      </p>
      <p>
        The system focuses on Chinese learners' specific difficulties and advantages: particle errors, kanji transfer,
        Chinese-style word order, keigo control, conversational completeness, and strength in recognizing Sino-Japanese
        academic vocabulary.
      </p>
      <p>
        In a future AI version, the same interface could connect to an evaluation model for richer scoring, error
        classification, diagnostic feedback, and personalized learning material generation.
      </p>
    </section>
  );
}
