# Workout Logger

Mobile-first React + Vite + TypeScript + Tailwind app for logging workouts locally in the browser.

## Local Node 20 runner

Node 20.18.0 is vendored to `.local-node` so you can run without changing your system Node:

```bash
# from repo root
PATH="$PWD/.local-node/bin:$PATH" npm run dev
```

Convenience scripts:

- `npm run dev:local`
- `npm run build:local`
- `npm run preview:local`

## Getting started

```bash
# install deps (if not already)
PATH="$PWD/.local-node/bin:$PATH" npm install

# start dev server
PATH="$PWD/.local-node/bin:$PATH" npm run dev
```

Exercises and workouts live in `src/data/`. Logs are stored in `localStorage`.
