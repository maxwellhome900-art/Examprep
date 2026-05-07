import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExams } from "../lib/api.js";
import "./Page.css";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totals = useMemo(() => {
    const q = exams.reduce((sum, e) => sum + (Array.isArray(e.questions) ? e.questions.length : 0), 0);
    const mins = exams.reduce((sum, e) => sum + (typeof e.timeMinutes === "number" ? e.timeMinutes : 0), 0);
    return { questions: q, minutes: mins };
  }, [exams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const e = await fetchExams();
        if (!cancelled) setExams(e);
      } catch (err) {
        if (!cancelled) setError(err.message ?? String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page page--exams">
      <Link className="page-back" to="/">
        ← Back to hub
      </Link>
      <section className="page-hero page-hero--dramatic">
        <p className="page-eyebrow page-eyebrow--row">
          <span className="ai-chip">AI study suite</span>
          <span className="page-eyebrow-rest">Linux+ · CertPrep</span>
        </p>
        <h1 className="page-title page-title--gradient">Practice exams</h1>
        <div className="tagline-stack">
          <p className="tagline-line">
            Full-length sessions that feel like the real room—crisp stems, four choices, instant feedback.
          </p>
          <p className="tagline-line tagline-line--accent">
            CertPrep pairs your curated exam bank with Gemini-powered summaries elsewhere in the app—one brain trust for
            Linux+.
          </p>
        </div>
        <p className="hero-sparkle">
          Turn pressure into progress: every run sharpens timing, recall, and confidence before you sit the official
          exam.
        </p>
      </section>

      <div className="panel exams-panel">
        <header className="exams-panel__head">
          <div>
            <h2 className="exams-panel__title">Your session lineup</h2>
            <p className="exams-panel__sub">
              Each card is a full run—launch when you want exam-day intensity with on-the-spot scoring.
            </p>
          </div>
          {!loading && !error && exams.length > 0 && (
            <div className="exams-stats" aria-label="Exam bundle summary">
              <div className="exams-stat">
                <span className="exams-stat__val">{exams.length}</span>
                <span className="exams-stat__lbl">Exams</span>
              </div>
              <div className="exams-stat">
                <span className="exams-stat__val">{totals.questions}</span>
                <span className="exams-stat__lbl">Questions</span>
              </div>
              {totals.minutes > 0 && (
                <div className="exams-stat">
                  <span className="exams-stat__val">{totals.minutes}</span>
                  <span className="exams-stat__lbl">Mins total</span>
                </div>
              )}
            </div>
          )}
        </header>

        {loading && (
          <ul className="exam-skeleton-list" aria-busy="true" aria-label="Loading exams">
            {[0, 1, 2].map((i) => (
              <li key={i} className="exam-skeleton-card" />
            ))}
          </ul>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && !error && exams.length === 0 && (
          <p className="empty-state empty-state--glass">
            No practice exams are loaded yet. When your bundle is ready, they will appear here automatically.
          </p>
        )}

        {!loading && !error && exams.length > 0 && (
          <ul className="exam-list">
            {exams.map((exam, index) => {
              const n = Array.isArray(exam.questions) ? exam.questions.length : 0;
              return (
                <li key={exam.id} className="exam-card">
                  <div className="exam-card__index" aria-hidden>
                    {index + 1}
                  </div>
                  <div className="exam-card__main">
                    <h3 className="exam-card__title">{exam.title}</h3>
                    {exam.description ? <p className="exam-card__desc">{exam.description}</p> : null}
                    <div className="exam-card__meta">
                      {n > 0 && (
                        <span className="exam-meta-pill">
                          <span className="exam-meta-pill__ico" aria-hidden>
                            ◆
                          </span>
                          {n} question{n === 1 ? "" : "s"}
                        </span>
                      )}
                      {exam.timeMinutes != null && (
                        <span className="exam-meta-pill exam-meta-pill--time">
                          <span className="exam-meta-pill__ico" aria-hidden>
                            ⏱
                          </span>
                          ~{exam.timeMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  <Link className="btn btn-primary exam-card__start" to={`/exams/${exam.id}`}>
                    <span>Launch</span>
                    <span className="exam-card__start-arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
