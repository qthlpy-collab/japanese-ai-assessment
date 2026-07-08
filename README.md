# AI-Based Japanese Proficiency Assessment System

A web prototype for MP6: an AI-style Japanese proficiency assessment system for Chinese learners.

The prototype uses task-based assessment inspired by IELTS and TOEFL, with two tracks:

- Academic Japanese Assessment
- Daily Life Japanese Assessment

The first version is frontend-only. It uses simulated rule-based AI scoring and does not require an API key or backend.

## Features

- Track selection for academic and daily-life Japanese tasks
- Six assessment tasks with Japanese answer input
- Simulated AI scoring across task completion, grammar, vocabulary, keigo, and fluency
- Chinese learner error-risk diagnosis
- AI-style feedback with strengths, weaknesses, error types, suggestions, sample answers, and Chinese explanations
- Diagnostic report with score bars and recommended learning materials
- GitHub Pages deployment workflow

## Local Commands

```bash
npm install
npm run dev
npm run build
```

## GitHub Pages

The Vite base path is configured in `vite.config.ts`:

```ts
base: '/japanese-ai-assessment/'
```

This should match the GitHub repository name. If the repository name changes, update the base path before deployment.

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
