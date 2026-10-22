# MP6 Japanese Learning Research Platform

Chinese participant exam, English research administration, and an English analysis workspace for Chinese-background Japanese learners. Copyright: 廖鹏宇 (Pengyu Liao).

## Start locally

Requires Node.js 22.12+ (Node 24 recommended).

```bash
npm install
npm run setup
npm run dev
```

Open http://localhost:3000/ for the Chinese exam and http://localhost:3000/admin/ for administration. `npm run setup` generates **random credentials** in `.env.local` without overwriting an existing file. Open `.env.local` and use its `ADMIN_PASSWORD` to sign in. Add your Gemini key to `GEMINI_API_KEY=` in this same file, then restart the server. Never send keys to participants, use `NEXT_PUBLIC_` for a secret, or commit `.env.local`.

For a different local port, set `PORT` and update `APP_ORIGIN` to match. Devices on the same network can use the host computer's LAN address if the server/firewall and `APP_ORIGIN` allow it. Local HTTP is intended for development; use HTTPS for an internet study.

```bash
npm run test
npm run typecheck
npm run build
npm start
```

## Run a collection round

1. Sign in to `/admin/`. Under **Settings**, set the protocol before the first participant consents. Defaults: 120-minute learning window, 25-minute tests, delayed test after 7 days.
2. Check the 45 original items in **Question Bank**. Three forms contain 15 items each: three per dimension. Human review and pilot checking are necessary; these are not validated JLPT items or equated tests.
3. In **Participants**, create participant codes, usually 10 for a feasibility pilot. Choose one condition or balanced random allocation across `fixed`, `corrective` and `guided`. Download the private invitation sheet immediately. Only code hashes are stored; use **Replace code** for lost codes.
4. Give participants the exam URL and their individual codes. They consent, complete the pre-test, six learning tasks, immediate post-test, questionnaire and the delayed test when available. AI assistance is confined to the learning workflow, not test screens.
5. In **Scoring**, review writing and unmatched recall. An unmatched recall is missing until human review, not automatically wrong. Rate 0–4 with a rater identifier and note. Blinding hides participant/stage labels, but is not a full independent double-rating system.
6. In **Exports**, download results CSV and a private JSON backup. Empty stages and unreviewed scores remain empty. Downloaded backups and invitation sheets contain research material; do not add them to the public repository.
7. Load fully scored complete cases into the analysis dashboard. For an immediate-only or condition comparison, use the raw export and a prespecified analysis outside the complete-case dashboard.

The invitation count is configurable and does not justify a research sample size. Balanced allocation randomly orders the assigned conditions, with counts differing by at most one per invitation batch; form order rotates within each condition. This is a pilot allocation aid, not a concealed stratified randomization service. Keep one batch per study to preserve the intended allocation balance.

## Persistence and operational behavior

Local records persist in `.research-data/study.json`, excluded from Git. The server serializes writes and atomically replaces the file. Back up this directory privately; run only one Node process when using file storage. The app supports 200 enrolled IDs in the bundled static participant-detail routes.

For production on Vercel, configure a Redis REST database (for example an Upstash free tier, subject to that provider's current quotas). The app uses optimistic compare-and-set transactions to prevent cross-request lost writes. **It refuses ephemeral file storage on Vercel.** No paid database is required by the code, but deployment still requires an account and credentials for persistent storage.

Attempts record server start/deadline/submission times and a snapshot of their question form. Answer changes are immutable after submission. Drafts autosave to the server and browser; stale writes from another tab are rejected. Closing the browser does not stop time. After expiry, the next save/submit finalizes the last server-saved answers and marks `timedOut`; there is no scheduled server job that submits an offline browser exactly at its deadline. Unsynchronized late answers are not accepted. Use one browser tab.

Learning feedback is limited to three requests per task and one request per participant per minute. Failures do not become fake AI responses. Gemini model/version settings and each feedback response are logged. The time window is wall-clock time; active engagement is not established solely by elapsed time. Written response tasks must not be described as a spoken fluency assessment.

## Online question generation

**AI Generation** calls Gemini on the server and creates three draft items for the selected form/dimension. Structured JSON is validated for field types, answer options and accepted responses. A researcher edits and approves each replacement in **Question Bank**. Imported JSON arrays also enter drafts. The blueprint stays at three items per dimension per form. The bank freezes once any pre-test starts, and protocol settings freeze after the first consent. Generation uses the configured API, not live web scraping; no official question-bank license is implied.

Implementation follows Google's [Generate Content documentation](https://ai.google.dev/api/generate-content) and [structured output guidance](https://ai.google.dev/gemini-api/docs/structured-output). Model availability and quotas depend on your Google account; change `GEMINI_MODEL` if necessary.

## Deployment

### Full service on Vercel

Import this GitHub repository into Vercel as a Next.js project. The defaults in `vercel.json` build the full application, including `pages/api/research.ts`. Do **not** set `GITHUB_PAGES=true` in Vercel.

Set these **server environment variables**, then deploy/redeploy:

| Variable | Meaning |
| --- | --- |
| `ADMIN_PASSWORD` | Unique password, at least 12 characters |
| `SESSION_SECRET` | Random string, at least 32 characters |
| `GEMINI_API_KEY` | Gemini server key; required for either AI condition and question generation |
| `GEMINI_MODEL` | Model id, default `gemini-2.5-flash` |
| `UPSTASH_REDIS_REST_URL` | Persistent Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST secret |
| `APP_ORIGIN` | Your exact production origin, e.g. `https://your-project.vercel.app` |
| `FRONTEND_ORIGIN` | Optional external frontend origin, e.g. `https://qthlpy-collab.github.io` |

Use the production URL for collection. Preview domains are not automatically allowed by CORS. The researcher session expires after 8 hours; participant codes remain valid until replaced or withdrawn. Keep the secret fixed across deployments to avoid invalidating sessions. Do not copy a real production database into a test deployment.

### GitHub Pages

The existing GitHub Actions workflow runs `npm run build:pages` and publishes the `.next-pages/` static export at `/japanese-ai-assessment/`. Pages hosts only the frontend, not the database or server key.

After deploying the service, set repository **Settings → Secrets and variables → Actions → Variables → `RESEARCH_API_URL`** to `https://your-project.vercel.app/api/research`, then rerun the Pages workflow. The server must allow `FRONTEND_ORIGIN=https://qthlpy-collab.github.io`. Without this variable the Pages login shows a clear connection message and cannot collect answers; it does not silently fall back to local-only collection.

### Your own server

Run `npm run build` then `npm start` behind an HTTPS reverse proxy. Preserve `.env.local` and `.research-data`, set `APP_ORIGIN` to your public origin, and use a single process with file storage or use Redis for multiple instances. See [Chinese operation guide](docs/使用说明.md).

## Data schema

Raw CSV preserves `participantId, ageGroup, japaneseLevel, aiExperience`, the five dimension score fields for `Pre`, `Post`, `Delayed`, response-time fields in seconds, and six 1–5 Likert responses. It also adds `condition`, form assignments, consent/learning/submission timestamps, timeout flags and review status. Scores are 0–100 per dimension; equal 20% weights are in `config/assessmentWeights.ts`. A per-item rating of 0–4 is normalized against the maximum for that dimension.

JSON backup includes raw answers, reference/rubric snapshots, rater notes, learning feedback/model names and an audit log. Access codes/passwords/API keys are not in the backup. Incomplete records remain available. Current analysis CSV import requires complete numeric fields and rejects blanks, duplicate participant IDs, out-of-range scores and non-integer Likert values. `lib/data/types.ts` defines this legacy complete-case schema.

`data/experimentParticipants.ts` and the older round-one CSV remain historical repository artifacts and are **not** loaded into the new collection round. Their provenance cannot be established by the app. Verify against original collected records before using any historical values as empirical evidence. No generated scores are automatically presented as new observed results.

## Statistical methods and limitations

- Descriptive sample N, mean, median, sample SD, quartile IQR and observed gains. Positive gain means improved observed score, with no invented significance threshold.
- Paired Wilcoxon: finite paired values only; zero differences excluded; average tied ranks; W is min(W+, W−). For effective N ≤ 20, dynamic programming calculates the exact conditional random-sign two-sided p-value, including ties. Otherwise, tie-corrected normal approximation, no continuity correction. Symmetry of differences matters for a location-shift interpretation; a small N alone does not justify every assumption.
- `r = |Z| / sqrt(N)` uses the normal-standardized signed-rank statistic with tied-rank variance; it is approximate even when p is exact. Report uncertainty and educational relevance alongside it.
- Holm adjustment shown for the five primary Pre/Post dimension tests. Other phase comparisons remain exploratory and need a separately declared multiplicity family.
- Spearman rho is exploratory; correlation does not establish causation. Likert items use median, IQR, distributions and top-box percentages.
- Retention is delayed/immediate ×100; zero immediate scores return null. The ratio may be unstable near zero and can exceed 100. Report absolute delayed scores too.
- Stage duration is total elapsed test time, not per-question retrieval latency. Reduced response time does not necessarily indicate improved language quality.
- The legacy dashboard pools conditions and uses complete cases. Within-condition significance tests cannot answer which condition is better. Prespecify a primary independent delayed outcome and a baseline-adjusted treatment contrast; justify the sample using precision/power and plausible effects, not a large noisy pilot gain.
- Equal blueprints do not prove equal form difficulty. Test familiarity, related learning/test content, ceiling effects and human-rating variation remain. Repeated scoring and independent rater agreement are future work.
- This open-source bank and browser-based timing are appropriate for supervised research piloting, not secure high-stakes examinations. External tool use cannot be reliably prevented by this software alone. Obtain institutional approval and consent as required by your actual study.

## Structure

`app/exam` Chinese participant UI; `app/admin` English operations; `app/dashboard`, `analysis`, `participants`, `results`, `import` English complete-case analysis. `data/studyBank.ts` server-side authored bank; `data/learningTasks.ts` public practice materials. `server/` authentication, Gemini, transactions and HTTP adapter; `pages/api/research.ts` Vercel/Next API; `lib/study/` validation, scoring and export; `tests/study.test.ts` collection workflow coverage.

## Verification and future work

`npm test` covers descriptive statistics, retention, Wilcoxon ties/zeros, Holm, Spearman, CSV validation, bank validation, authorization, stage order, immutable submission, missing scores, server deadlines, grading and withdrawal. `npm run test:e2e` runs browser checks after a local server is started. Do not run browser fixtures against a real study database. Future work includes validated parallel forms, independent double-rating, stage-specific analysis with missing data, confidence intervals, preregistered condition models, automated backup rotation and participant reminders.
