# Workout Logger

Mobile-first React 18 + TypeScript + Vite + Tailwind app for logging workouts locally in the browser, with optional AI-powered workout planning.

## Local Node runner

Node 20 is vendored to `.local-node` so you can run without changing your system Node:

```bash
PATH="$PWD/.local-node/bin:$PATH" npm install
PATH="$PWD/.local-node/bin:$PATH" npm run dev
```

Convenience scripts:

- `npm run dev:local`
- `npm run build:local`
- `npm run preview:local`
- `npm run build:docs`

## AI plumbing (Phase 1)

- Shared types/config in `src/ai/`.
- Serverless API: `api/ai.ts` (OpenAI via `OPENAI_API_KEY`).
- Frontend clients: `generateText` (`src/ai/aiClient.ts`) and `generateJson` (`src/ai/jsonClient.ts`).
- Prompt builder/types for planning: `src/ai/workoutPlanning.ts`, `src/ai/prompts/buildWorkoutPrompt.ts`.
- AI Builder page: `/ai-builder` collects context, calls `/api/ai`, saves the plan locally, redirects home, and shows the plan card with links to exercises.

### Env vars

Local (`.env.local`, gitignored) and Vercel env:
```
OPENAI_API_KEY=your_openai_key_here
VITE_EXERCISEDB_API_KEY=your_exercisedb_key_here
VITE_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
```

## Running the API locally

`npm run dev` serves only the frontend. To run the serverless API locally, use Vercel dev:
```bash
npm install -g vercel   # or npx vercel
PATH="$PWD/.local-node/bin:$PATH" vercel dev
```
Then open the printed URL (e.g., http://localhost:3000/ai-test or /ai-builder). `/ai-test` is a simple sanity check for the AI endpoint.

## Data and logging

- Static exercises: `src/data/exercises.ts` (with optional ExerciseDB metadata).
- Workout templates: `src/data/workouts.ts`.
- Logs and active workout sessions are persisted in `localStorage` via `ExerciseLogContext`.

## Deploy (GitHub Pages, optional)

```bash
PATH="$PWD/.local-node/bin:$PATH" npm run build:docs
git add docs
git commit -m "Build docs for Pages"
git push origin main
```
Then set Pages source to `main` / `docs`.
