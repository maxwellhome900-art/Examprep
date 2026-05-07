import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchExam } from "../lib/api.js";
import "./Page.css";

export default function ExamRunnerPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchExam(examId);
        if (!cancelled) setExam(data);
      } catch (e) {
        if (!cancelled) setError(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const questions = exam?.questions ?? [];
  const total = questions.length;
  const question = questions[qIndex];
  const isLast = qIndex >= total - 1;

  function resetQuestionView() {
    setSelected(null);
    setRevealed(false);
  }

  function handleCheck() {
    if (selected == null || !question) return;
    setRevealed(true);
    if (selected === question.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (isLast) {
      setComplete(true);
      return;
    }
    setQIndex((i) => i + 1);
    resetQuestionView();
  }

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading exam…</p>
      </div>
    );
  }

  if (error || !exam || total === 0) {
    return (
      <div className="page">
        <p className="error">{error ?? "Exam not found or has no questions."}</p>
        <Link to="/exams" className="btn btn-ghost" style={{ marginTop: "1rem" }}>
          Back to exams
        </Link>
      </div>
    );
  }

  if (complete) {
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <div className="page exam-runner">
        <div className="panel">
          <h1 className="page-title" style={{ fontSize: "1.5rem" }}>
            Exam complete
          </h1>
          <p className="page-lead">
            You answered <strong>{score}</strong> of <strong>{total}</strong> questions correctly ({pct}%).
          </p>
          <p className="hint">
            Each item was scored when you pressed “Check answer.” Review the explanations, then run the session again
            whenever you want another pass.
          </p>
          <div className="button-row">
            <Link className="btn btn-primary" to="/exams">
              Back to exams &amp; flashcards
            </Link>
            <Link className="btn btn-ghost" to="/">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page exam-runner">
      <Link className="page-back" to="/exams">
        ← Exit to list
      </Link>
      <div className="score-bar">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.35rem", margin: 0 }}>
            {exam.title}
          </h1>
          <p className="hint" style={{ margin: "0.25rem 0 0" }}>
            Question {qIndex + 1} of {total}
          </p>
        </div>
        <span className="pill">
          Correct: {score} / {total}
        </span>
      </div>

      <div className="panel">
        <p style={{ marginTop: 0, fontSize: "1.05rem" }}>{question.question}</p>
        <ul className="options">
          {question.options.map((opt, i) => {
            let cls = "option-btn";
            if (selected === i) cls += " selected";
            if (revealed) {
              if (i === question.correctIndex) cls += " correct";
              else if (selected === i) cls += " incorrect";
            }
            return (
              <li key={i}>
                <button
                  type="button"
                  className={cls}
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                >
                  <strong style={{ marginRight: "0.5rem" }}>{String.fromCharCode(65 + i)}.</strong>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {!revealed && (
          <div className="button-row">
            <button type="button" className="btn btn-primary" onClick={handleCheck} disabled={selected == null}>
              Check answer
            </button>
          </div>
        )}

        {revealed && (
          <>
            <p
              style={{
                margin: "1rem 0 0",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                background: "rgba(61, 156, 245, 0.08)",
                border: "1px solid var(--border)",
              }}
            >
              <strong>Explanation:</strong> {question.explanation}
            </p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {isLast ? "View results" : "Next question"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
