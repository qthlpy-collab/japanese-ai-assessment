# AI-Based Japanese Proficiency Assessment System

A web prototype for MP6: an AI-style Japanese proficiency assessment system for Chinese learners.

The prototype uses task-based assessment inspired by IELTS and TOEFL, with two tracks:

- Academic Japanese Assessment
- Daily Life Japanese Assessment

The app can run in two modes:

- Real AI scoring through a Vercel Serverless Function at `api/evaluate.ts`
- Simulated fallback scoring when the API route or API key is unavailable

## Features

- Track selection for academic and daily-life Japanese tasks
- Six assessment tasks with Japanese answer input
- Simulated AI scoring across task completion, grammar, vocabulary, keigo, and fluency
- Chinese learner error-risk diagnosis
- AI-style feedback with strengths, weaknesses, error types, suggestions, sample answers, and Chinese explanations
- Diagnostic report with score bars and recommended learning materials
- GitHub Pages deployment workflow
- Vercel API route for secure OpenAI API calls

## Local Commands

```bash
npm install
npm run dev
npm run build
```

## Real AI Scoring

Do not put your API key in React source code, GitHub Pages, or any committed file.

For local Vercel development, create a local `.env` file:

```bash
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-4.1-mini
```

For Vercel deployment, add the key in:

```text
Vercel Project -> Settings -> Environment Variables
```

Add:

```text
OPENAI_API_KEY = your_real_key_here
OPENAI_MODEL = gpt-4.1-mini
```

The frontend calls `/api/evaluate`. On Vercel this route is handled by `api/evaluate.ts`, so the key stays on the server. On GitHub Pages, this API route does not exist, so the app falls back to simulated scoring.

## GitHub Pages

The Vite base path is configured in `vite.config.ts`:

```ts
base: '/japanese-ai-assessment/'
```

This should match the GitHub repository name. If the repository name changes, update the base path before deployment.

GitHub Pages is static hosting only. It can show the prototype, but real OpenAI scoring requires Vercel or another serverless/backend host.

## Deployment Steps

```bash
git init
git add .
git commit -m "Initial AI Japanese assessment prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/japanese-ai-assessment.git
git push -u origin main
```

Then enable GitHub Pages:

Repository Settings -> Pages -> Source: GitHub Actions

Final URL format:

```text
https://YOUR_USERNAME.github.io/japanese-ai-assessment/
```
