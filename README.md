# AI-Based Japanese Proficiency Assessment and Learning Evaluation System

This project is a complete MP6 educational experiment data analysis system for Chinese learners of Japanese. It supports a single-group pre-test, AI-assisted learning session, immediate post-test, delayed post-test, and questionnaire workflow.

The default dataset is simulated and is intended to demonstrate the analysis workflow, not prove educational effectiveness.

## Research Design

The system is designed for approximately 10 participants:

1. Pre-test
2. AI Learning Session, approximately two hours
3. Immediate Post-test
4. Delayed Post-test, if feasible
5. Learner Experience Questionnaire

The analysis focuses on short-term changes in:

- Vocabulary Recognition Memory
- Vocabulary Recall Memory
- Contextual Usage Memory
- Conversational Response Memory
- Grammar and Form Memory
- Response time
- Learner experience questionnaire responses

## Technology Stack

- Next.js 15
- TypeScript
- React
- Tailwind CSS
- shadcn/ui-style local components
- Recharts
- Papa Parse
- Vitest
- GitHub Actions-ready
- Vercel-compatible deployment

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test

```bash
npm run test
```

## Production Build

```bash
npm run build
```

## CSV Schema

The sample CSV is available at:

```text
public/data/simulated-learning-data.csv
```

Required fields:

```text
participantId,
ageGroup,
japaneseLevel,
aiExperience,
vocabularyRecognitionPre,
vocabularyRecognitionPost,
vocabularyRecognitionDelayed,
vocabularyRecallPre,
vocabularyRecallPost,
vocabularyRecallDelayed,
contextualUsagePre,
contextualUsagePost,
contextualUsageDelayed,
conversationPre,
conversationPost,
conversationDelayed,
grammarPre,
grammarPost,
grammarDelayed,
responseTimePre,
responseTimePost,
responseTimeDelayed,
perceivedUsefulness,
feedbackClarity,
learningEngagement,
confidenceImprovement,
cognitiveLoad,
intentionToReuse
```

Score fields use 0-100. Questionnaire fields use 1-5 Likert values. Response time is measured in seconds.

## Statistical Methods

Descriptive statistics include:

- N
- Mean
- Median
- Standard deviation
- Minimum
- Maximum
- Interquartile range
- Mean gain
- Median gain
- Percentage change

Individual gain score:

```text
Gain Score = Post-test - Pre-test
```

Classification:

- Improved: gain > 0
- No Change: gain = 0
- Declined: gain < 0

Retention rate:

```text
Retention Rate = Delayed Post-test Score / Immediate Post-test Score * 100%
```

If immediate post-test is 0, the app returns null to avoid division by zero.

## Wilcoxon Signed-Rank Test

Because of the small sample size, the Wilcoxon signed-rank test is treated as the primary inferential analysis.

The implementation uses a normal approximation. Zero differences are removed, and tied absolute differences receive average ranks. The interface reports:

- W statistic
- Effective sample size
- p-value
- Statistical significance at alpha = 0.05
- Direction of median change
- Effect size r

Effect size:

```text
r = |Z| / sqrt(N)
```

Interpretation:

- r < 0.10: negligible
- 0.10-0.29: small
- 0.30-0.49: medium
- 0.50 or above: large

## Multiple Comparisons

The app displays raw p-values and Holm-adjusted p-values. Results are not interpreted from p-values alone.

## Questionnaire Analysis

Likert items are summarized using:

- Median
- Interquartile range
- Frequency distribution
- Percentage selecting 4 or 5

Single Likert items are not treated as continuous outcomes for complex inference.

## Simulated Data Disclaimer

The top of the dashboard displays:

```text
DEMONSTRATION WITH SIMULATED DATA
```

The included dataset is fixed and manually specified to represent plausible variation. It should be replaced with real experimental data before reporting actual study results.

## Deployment

### Vercel

This project is Vercel-compatible:

```bash
npm run build
```

Then import the GitHub repository in Vercel.

### GitHub

A normal GitHub workflow can run:

```bash
npm install
npm run test
npm run build
```

For static GitHub Pages, Next.js needs additional static export configuration. Vercel is recommended for this version.

## Limitations

- Simulated default data
- Small sample size
- No control group
- Short two-hour intervention
- Possible test familiarity effect
- Possible ceiling effects among higher-level learners
- Self-report questionnaire bias
- Reduced response time does not necessarily indicate improved language quality
- Correlation does not establish causation

## Future Work

- Replace simulated data with real experimental CSV files
- Add authenticated researcher accounts
- Add long-term delayed post-test tracking
- Add anonymized student IDs
- Add PDF report export
- Add teacher/class dashboards
- Add optional AI-assisted qualitative feedback coding
