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
- `npm run build:docs` (builds to `docs/` for GitHub Pages and copies `404.html`)

## Getting started

```bash
# install deps (if not already)
PATH="$PWD/.local-node/bin:$PATH" npm install

# start dev server
PATH="$PWD/.local-node/bin:$PATH" npm run dev
```

Exercises and workouts live in `src/data/`. Logs are stored in `localStorage`.

## GitHub Pages (serve from main/docs)

```bash
# rebuild to docs/ using local Node 20
PATH="$PWD/.local-node/bin:$PATH" npm run build:docs

# commit and push docs/ to main
git add docs
git commit -m "Build docs for Pages"
git push origin main
```

Then in GitHub → Settings → Pages, set Source: `Deploy from a branch`, Branch: `main`, Folder: `/docs`. Your URL will be `https://<your-username>.github.io/WorkoutApp/`.
