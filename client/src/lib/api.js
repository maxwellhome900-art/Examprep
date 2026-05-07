const base = "";

export async function fetchExams() {
  const res = await fetch(`${base}/api/exams`);
  if (!res.ok) throw new Error("Failed to load exams");
  return res.json();
}

export async function fetchExam(id) {
  const res = await fetch(`${base}/api/exams/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to load exam");
  return res.json();
}

export async function fetchFlashcardDecks() {
  const res = await fetch(`${base}/api/flashcards`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg =
      typeof data.error === "string"
        ? data.error
        : `Could not load flashcards (HTTP ${res.status}). Is the API running on port 3001?`;
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchAiConfig() {
  const res = await fetch(`${base}/api/ai-config`);
  if (!res.ok) throw new Error("Failed to load AI configuration");
  return res.json();
}

export async function generateSummaryQuiz(payload) {
  const res = await fetch(`${base}/api/generate-summary-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studyNotes: payload.studyNotes,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : "Generation failed.";
    throw new Error(msg);
  }

  return data;
}
