import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildSummaryQuizPrompt } from "./lib/summaryQuizPrompt.js";
import { LINUX_PLUS_FLASHCARD_DECKS } from "./lib/linuxPlusFlashcards.js";
import { validateExams } from "./lib/validateExams.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const DATA_PATH = path.join(__dirname, "data", "content.json");
const EXAMS_JSON_PATH = path.join(__dirname, "data", "exams.json");
const isProd = process.env.NODE_ENV === "production";
const clientDist = path.join(__dirname, "..", "client", "dist");

function getGoogleAiKey() {
  const candidates = [
    process.env.GOOGLE_AI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ];
  for (const v of candidates) {
    const t = typeof v === "string" ? v.trim() : "";
    if (t) return t;
  }
  return "";
}

const GEMINI_MODEL_ALIASES = {
  gemini: "gemini-3-flash-preview",
  "gemini-3": "gemini-3-flash-preview",
  gemini3: "gemini-3-flash-preview",
  "gemini-3-flash": "gemini-3-flash-preview",
  "gemini-3-pro": "gemini-3-pro-preview",
  "gemini-1.5-flash": "gemini-3-flash-preview",
  "gemini-1.5-flash-latest": "gemini-3-flash-preview",
  "gemini-1.5-pro": "gemini-3-flash-preview",
  "gemini-1.5-pro-latest": "gemini-3-flash-preview",
  "gemini-pro": "gemini-3-flash-preview",
  "gemini-2.0-flash": "gemini-2.0-flash",
};

const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

function getGoogleAiModel() {
  const raw =
    process.env.GOOGLE_AI_MODEL ||
    process.env.GEMINI_MODEL ||
    DEFAULT_GEMINI_MODEL;
  let m = String(raw).trim() || DEFAULT_GEMINI_MODEL;
  const lower = m.toLowerCase();
  m = GEMINI_MODEL_ALIASES[lower] ?? m;
  return m;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

let contentCache = { key: null, data: null };
let lastExamValidationKey = null;

async function contentSourceKey() {
  let cStat;
  try {
    cStat = await stat(DATA_PATH);
  } catch {
    return null;
  }
  let ePart = "missing";
  try {
    const eStat = await stat(EXAMS_JSON_PATH);
    ePart = `${eStat.mtimeMs}:${eStat.size}`;
  } catch {
    ePart = "missing";
  }
  return `${cStat.mtimeMs}:${cStat.size}:${ePart}`;
}

function warnExamSchemaOnce(key, exams) {
  if (key === lastExamValidationKey) return;
  lastExamValidationKey = key;
  const { ok, errors } = validateExams(exams ?? []);
  if (ok) return;
  const sample = errors.slice(0, 8).join("\n  ");
  console.warn(`[CertPrep] Exam JSON validation issues (${errors.length} total):\n  ${sample}${errors.length > 8 ? "\n  …" : ""}`);
}

async function loadContent() {
  const key = await contentSourceKey();
  if (key && contentCache.key === key && contentCache.data) {
    return contentCache.data;
  }

  const raw = await readFile(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);

  data.flashcardDecks = LINUX_PLUS_FLASHCARD_DECKS;

  try {
    const examsRaw = await readFile(EXAMS_JSON_PATH, "utf-8");
    const examsDoc = JSON.parse(examsRaw);
    const list = Array.isArray(examsDoc) ? examsDoc : examsDoc?.exams;
    if (Array.isArray(list) && list.length > 0) {
      data.exams = list;
    }
  } catch {}

  if (key) {
    warnExamSchemaOnce(key, data.exams);
    contentCache = { key, data };
  }

  return data;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/content", async (_req, res) => {
  try {
    const data = await loadContent();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to load content", detail: String(e) });
  }
});

app.get("/api/exams", async (_req, res) => {
  try {
    const data = await loadContent();
    res.json(data.exams ?? []);
  } catch (e) {
    res.status(500).json({ error: "Failed to load exams", detail: String(e) });
  }
});

app.get("/api/exams/:id", async (req, res) => {
  try {
    const data = await loadContent();
    const exam = (data.exams ?? []).find((x) => x.id === req.params.id);
    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }
    res.json(exam);
  } catch (e) {
    res.status(500).json({ error: "Failed to load exam", detail: String(e) });
  }
});

app.get("/api/flashcards", async (_req, res) => {
  try {
    const data = await loadContent();
    res.json(data.flashcardDecks ?? []);
  } catch (e) {
    res.status(500).json({ error: "Failed to load flashcards", detail: String(e) });
  }
});

app.get("/api/ai-config", (_req, res) => {
  res.json({
    hasServerKey: Boolean(getGoogleAiKey()),
    model: getGoogleAiModel(),
  });
});

app.post("/api/generate-summary-quiz", async (req, res) => {
  const body = req.body ?? {};
  const studyNotes = typeof body.studyNotes === "string" ? body.studyNotes : "";
  const apiKey = getGoogleAiKey();

  if (!apiKey) {
    res.status(400).json({
      error:
        "No API key configured. Add GOOGLE_AI_API_KEY or GEMINI_API_KEY to server/.env (from Google AI Studio) and restart the server.",
    });
    return;
  }

  const model = getGoogleAiModel();
  const userContent = buildSummaryQuizPrompt(studyNotes);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const aiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    });

    const completion = await aiModel.generateContent(userContent);
    const text = completion.response.text()?.trim() ?? "";
    if (!text || !text.startsWith("{")) {
      res.status(502).json({ error: "The model returned an invalid response." });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res
        .status(502)
        .json({ error: "The model returned invalid JSON. Try again or set GOOGLE_AI_MODEL to a current Gemini model." });
      return;
    }
    const summary = parsed?.summary;
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    if (!summary || !Array.isArray(summary.sections)) {
      res.status(502).json({ error: "The model did not return a valid summary structure." });
      return;
    }
    if (questions.length !== 25) {
      res.status(502).json({ error: "The model did not return exactly 25 questions. Please regenerate." });
      return;
    }

    res.json({
      summary: {
        title: typeof summary.title === "string" && summary.title.trim() ? summary.title.trim() : "Linux+ Study Summary",
        sections: summary.sections
          .map((section) => ({
            heading:
              typeof section?.heading === "string" && section.heading.trim()
                ? section.heading.trim()
                : "Section",
            bullets: Array.isArray(section?.bullets)
              ? section.bullets.map((b) => String(b)).filter(Boolean)
              : [],
          }))
          .filter((section) => section.bullets.length > 0),
      },
      questions: questions.map((q, i) => ({
        id: `q${i + 1}`,
        question: String(q?.question ?? "").trim(),
        options: Array.isArray(q?.options) ? q.options.map((o) => String(o)) : [],
        correctIndex: Number.isInteger(q?.correctIndex) ? q.correctIndex : 0,
        explanation: String(q?.explanation ?? "").trim(),
      })),
      model,
    });
  } catch (e) {
    const statusCode = typeof e?.status === "number" ? e.status : 502;
    const message = e?.error?.message ?? e?.message ?? "Generation failed.";
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({ error: message });
  }
});

if (isProd) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => {
  console.log(`ExamPrep API http://127.0.0.1:${PORT}`);
});
server.requestTimeout = 600_000;
server.headersTimeout = 610_000;
server.keepAliveTimeout = 70_000;
