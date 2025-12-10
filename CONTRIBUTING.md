# Contributing to Workout Logger

This is a mobile‑first React 18 + TypeScript + Vite + Tailwind app, “type: module”, with localStorage persistence, optional AI features (OpenAI + ExerciseDB), and Vercel serverless functions.

## Quick start
- Install deps (uses vendored Node 20 in `.local-node` if desired):
  ```bash
  PATH="$PWD/.local-node/bin:$PATH" npm install
  ```
- Frontend only: `PATH="$PWD/.local-node/bin:$PATH" npm run dev`
- Full stack (frontend + `/api/ai`): `PATH="$PWD/.local-node/bin:$PATH" vercel dev`

## Environment variables
Create `.env.local` (gitignored):
```
OPENAI_API_KEY=your_openai_key_here
VITE_EXERCISEDB_API_KEY=your_exercisedb_key_here
VITE_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
```
Add these in Vercel project settings for deployments. Keep secrets out of git.

## Project layout
- `src/App.tsx` — routing (React Router).
- `src/components/` — reusable UI (Button, Card, Tag, BottomNav, etc.).
- `src/pages/` — screens (Home, WorkoutDetailPage, ExerciseDetailPage, HistoryPage, WorkoutBuilderPage, AiBuilderPage, AiTestPage).
- `src/data/` — static data (`exercises.ts`, `workouts.ts`, generated `exerciseDbMapping.ts`). **Do not change exercise IDs**; many features rely on them.
- `src/context/ExerciseLogContext.tsx` — active workout state + logs persisted to localStorage.
- `src/storage.ts` — localStorage helpers (logs, custom exercises, builder drafts, AI plan cache, media cache).
- `src/ai/` — AI types/config/clients/prompts (`types.ts`, `config.ts`, `aiClient.ts`, `jsonClient.ts`, `workoutPlanning.ts`, `prompts/buildWorkoutPrompt.ts`).
- `api/ai.ts` — Vercel serverless function (OpenAI SDK).
- `scripts/` — mapping scripts for ExerciseDB.

## Key behaviors
- Logging: per-exercise logs and workout sessions stored in localStorage (`workoutLogsV1`, `workoutSessionsV1`). Start/end workout via `ExerciseLogContext`.
- Exercise detail: shows ExerciseDB metadata/media if available; instructions collapsible; media cached via `workoutGifCacheV1`.
- Workout Builder: manual builder at `/builder`; AI builder at `/ai-builder` (saves plan to localStorage and surfaces on Home).
- AI API: Only call `/api/ai` via `generateText` or `generateJson`. Do not call OpenAI directly from React. Provider defaults to OpenAI.
- ExerciseDB: Keep `EXERCISES` IDs intact. AI plans must use existing IDs. Media endpoints may need API key; cache via storage helpers.

## Running the API locally
`npm run dev` serves only frontend. Use `vercel dev` to run `/api/ai` locally. Test endpoints:
- `/ai-test` — simple prompt tester.
- `/ai-builder` — AI workout planner UI.

## Styling / UX
- TailwindCSS, mobile-first. Keep layouts concise, max widths ~ `max-w-3xl` with sensible spacing.
- Use existing components when possible.

## Linting / tooling
- `npm run lint` (ESLint).
- TypeScript strictness: keep types tight; prefer explicit interfaces already defined.

## Data constraints
- Exercise IDs are canonical; do not rename them.
- When adding AI-planned exercises, filter to known IDs (`EXERCISES`).
- Preserve existing storage keys to avoid data loss.

## Testing (manual)
- `/ai-test` for AI plumbing.
- `/ai-builder` generate a plan, ensure it saves/redirects home and links open exercise detail.
- Exercise detail media loads (cache + ExerciseDB).
- Workout start/end flow and history display.

## Submitting changes
- Keep PRs focused; document new env vars or migrations.
- If touching AI flows, verify `vercel dev` + `/ai-test` still works.
- Avoid committing secrets, `node_modules`, build artifacts. `.gitignore` already covers common cases.
