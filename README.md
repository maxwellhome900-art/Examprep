# CertPrep (ExamPrep)

CompTIA **Linux+** study app: React (Vite) client + Express API. Practice exams and flashcards load from the server filesystem; optional **Google Gemini** generates summaries and 25-question quizzes from your notes (API key stays on the server).

## Requirements

- Node.js 18+ (with npm)
- For AI features: a Google AI Studio / Gemini API key

## Quick start (development)

From the repository root:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **API environment** — copy [`server/.env.example`](server/.env.example) to `server/.env` and set at least one key name the server recognizes:

   - `GOOGLE_AI_API_KEY` (preferred), or `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`
   - Optional: `GOOGLE_AI_MODEL` / `GEMINI_MODEL` (see `.env.example` for defaults and examples)

3. **Run client + API together**

   ```bash
   npm run dev
   ```

   - **Client (Vite):** [http://127.0.0.1:5173](http://127.0.0.1:5173) — proxies `/api` to the server (see [`client/vite.config.js`](client/vite.config.js)).
   - **API (Express):** [http://127.0.0.1:3001](http://127.0.0.1:3001) — default `PORT` is `3001` (override with `PORT` in `server/.env`).

Run only the API or only the client:

```bash
npm run dev:server
npm run dev:client
```

## Data files (server)

| Path | Role |
|------|------|
| [`server/data/content.json`](server/data/content.json) | Base content; `exams` used if `exams.json` is missing or empty. |
| [`server/data/exams.json`](server/data/exams.json) | If the `exams` array is non-empty, it **replaces** exams from `content.json`. |
| [`server/data/data.txt`](server/data/data.txt) | Dion-style “Full-length Practice Exam … Results” export (optional source text). |
| [`server/lib/linuxPlusFlashcards.js`](server/lib/linuxPlusFlashcards.js) | Bundled Linux+ flashcard decks (injected at load time). |

### Building `exams.json` from `data.txt`

Save your Dion results export as `server/data/data.txt`, then from the **`server`** directory:

```bash
npm run import-exams
```

Restart the API so clients pick up changes (or rely on file mtime cache invalidation if enabled).

Shape reference: [`server/data/exams.example.json`](server/data/exams.example.json).

## Production build

From the repo root:

```bash
npm run start
```

This runs `npm run build` in `client/`, then starts the server with `NODE_ENV=production`. The server serves the built SPA from `client/dist` and the same `/api` routes.

Alternatively:

```bash
npm run build
npm run start:server
```

Set `NODE_ENV=production` when running the server so static hosting is enabled (see [`server/index.js`](server/index.js)).

## API smoke check

With the server listening on port 3001:

```bash
npm run smoke-api
```

(from repo root), or:

```bash
cd server && npm run smoke-api
```

Optional base URL:

```bash
node scripts/api-smoke.mjs http://127.0.0.1:3001
```

## Project layout

- [`client/`](client/) — React app (routes: hub, summary/quiz/flashcards, exams, labs, WebVM).
- [`server/`](server/) — Express API, Dion parser, import script, exam validation.

## License / attribution

Footer in the app shows **Copyright Mark@2026**. Third-party labs and WebVM link to their respective projects.
