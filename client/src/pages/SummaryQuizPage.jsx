import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FlashDeck from "../components/FlashDeck.jsx";
import { fetchAiConfig, fetchFlashcardDecks, generateSummaryQuiz } from "../lib/api.js";
import "./Page.css";

export default function SummaryQuizPage() {
  const [notes, setNotes] = useState("");
  const [decks, setDecks] = useState([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [decksError, setDecksError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [usedModel, setUsedModel] = useState("");
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAiConfig()
      .then((cfg) => {
        if (cancelled) return;
        if (cfg?.model) setUsedModel(cfg.model);
        setConfigError(null);
      })
      .catch((e) => {
        if (!cancelled) setConfigError(e.message ?? String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDecksLoading(true);
    fetchFlashcardDecks()
      .then((data) => {
        if (!cancelled) {
          setDecks(Array.isArray(data) ? data : []);
          setDecksError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setDecksError(e.message ?? String(e));
      })
      .finally(() => {
        if (!cancelled) setDecksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setError(null);
    setSummary(null);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmittedAnswers({});

    setLoading(true);
    try {
      const data = await generateSummaryQuiz({ studyNotes: notes });
      setSummary(data.summary ?? null);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setUsedModel(data.model ?? usedModel);
    } catch (e) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const score = useMemo(
    () =>
      questions.reduce((acc, q, index) => {
        const selected = submittedAnswers[index];
        return selected === q.correctIndex ? acc + 1 : acc;
      }, 0),
    [questions, submittedAnswers],
  );

  function clearOutput() {
    setSummary(null);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setError(null);
  }

  function handleSelect(questionIndex, optionIndex) {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmitQuestion(questionIndex) {
    const selected = selectedAnswers[questionIndex];
    if (typeof selected !== "number") return;
    setSubmittedAnswers((prev) => ({ ...prev, [questionIndex]: selected }));
  }

  const hasGenerateOutput = Boolean(loading || error || summary || questions.length > 0);

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Back to CertPrep
      </Link>
      <section className="page-hero page-hero--dramatic">
        <p className="page-eyebrow page-eyebrow--row">
          <span className="ai-chip">Gemini engine</span>
          <span className="page-eyebrow-rest">Linux+ · CertPrep</span>
        </p>
        <h1 className="page-title page-title--gradient">Summary, quiz &amp; flashcards</h1>
        <div className="tagline-stack">
          <p className="tagline-line">
            Paste raw notes—Gemini on the server spins up a structured summary and <strong>10</strong> fresh
            multiple-choice questions in one shot.
          </p>
          <p className="tagline-line tagline-line--accent">
            Everything lands inline under Generate: read, answer, iterate—then flip bundled Linux+ cards for lightning
            recall.
          </p>
        </div>
        <p className="hero-sparkle">
          Your API key stays server-side; CertPrep simply orchestrates the sparkle between you and the model.
        </p>
      </section>

      {configError && <p className="toast-inline warn">Could not reach API config ({configError}). Is the backend running?</p>}

      <div className="panel study-workspace">
        <span className="panel-kicker">CertPrep generator</span>
        <h2 className="panel-title">Study content</h2>
        <label className="form-label" htmlFor="study-notes">
          Lecture notes, objectives, or textbook snippets
        </label>
        <textarea
          id="study-notes"
          className="textarea textarea--study"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste Linux+ notes, commands, objectives, or troubleshooting steps..."
          disabled={loading}
        />

        <div className="button-row button-row--actions">
          <button type="button" className="btn btn-primary btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleGenerate} disabled={loading}>
            Regenerate
          </button>
          <button type="button" className="btn btn-ghost" onClick={clearOutput} disabled={loading}>
            Clear output
          </button>
        </div>

        <p className="hint hint--tight">
          Linux+ scoped output · server-side Google AI · your key never leaves the backend
        </p>

        {hasGenerateOutput && (
          <div className="generate-results" aria-live="polite">
            {error && (
              <div className="generate-error" role="alert">
                {error}
              </div>
            )}

            {loading && (
              <div className="generate-loading">
                <div className="generate-loading__spinner" aria-hidden />
                <span>CertPrep is building your summary and 10 questions…</span>
              </div>
            )}

            {!loading && summary && (
              <div className="generate-block">
                <div className="generate-block__title">
                  Summary
                  {usedModel && <span className="pill pill--inline">Model · {usedModel}</span>}
                </div>
                <article className="md-out md-out--summary prose-dark">
                  <h3>{summary.title}</h3>
                  {(summary.sections ?? []).map((section, i) => (
                    <section key={`${section.heading}-${i}`}>
                      <h4>{section.heading}</h4>
                      <ul>
                        {(section.bullets ?? []).map((bullet, j) => (
                          <li key={`${j}-${bullet.slice(0, 18)}`}>{bullet}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </article>
              </div>
            )}

            {!loading && questions.length > 0 && (
              <div className="generate-block">
                <div className="generate-block__title">
                  Quiz
                  <span className="pill pill--inline">
                    Score {score} / {questions.length}
                  </span>
                </div>
                <div className="quiz-list">
                  {questions.map((q, qIndex) => {
                    const submitted = submittedAnswers[qIndex];
                    return (
                      <article key={q.id ?? `q-${qIndex}`} className="quiz-card">
                        <h3 className="quiz-card__q">
                          <span className="quiz-card__num">{qIndex + 1}</span>
                          {q.question}
                        </h3>
                        <ul className="options">
                          {(q.options ?? []).map((opt, i) => {
                            let cls = "option-btn";
                            if (selectedAnswers[qIndex] === i) cls += " selected";
                            if (typeof submitted === "number") {
                              if (i === q.correctIndex) cls += " correct";
                              else if (submitted === i) cls += " incorrect";
                            }
                            return (
                              <li key={i}>
                                <button
                                  type="button"
                                  className={cls}
                                  onClick={() => handleSelect(qIndex, i)}
                                  disabled={typeof submitted === "number"}
                                >
                                  <strong className="option-letter">{String.fromCharCode(65 + i)}.</strong>
                                  {opt}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {typeof submitted === "number" ? (
                          <p className="quiz-explain">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={typeof selectedAnswers[qIndex] !== "number"}
                            onClick={() => handleSubmitQuestion(qIndex)}
                          >
                            Submit answer
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel flashcards-panel">
        <div className="panel-heading-row">
          <h2 className="panel-title" style={{ margin: 0 }}>
            Linux+ flashcards
          </h2>
          <span className="pill">Memorization</span>
        </div>
        <p className="panel-sub">
          Bundled Linux+ library served by the API (commands, FHS, permissions, systemd, networking, packages, storage,
          security, scripting, containers, troubleshooting, kernel). Flip the card, then step through with Previous / Next.
        </p>
        {decksLoading && <p className="empty-state">Loading flashcards…</p>}
        {decksError && <p className="error">{decksError}</p>}
        {!decksLoading && !decksError && decks.length === 0 && <p className="empty-state">No flashcard decks yet.</p>}
        {!decksLoading && !decksError && decks.length > 0 && (
          <div className="flashcards-grid">
            {decks.map((deck) => (
              <FlashDeck key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
