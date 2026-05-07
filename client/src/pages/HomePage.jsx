import CardLink from "../components/CardLink.jsx";
import "./Page.css";

export default function HomePage() {
  return (
    <div className="page">
      <section className="page-hero page-hero--dramatic">
        <p className="page-eyebrow page-eyebrow--row">
          <span className="ai-chip">Gemini inside</span>
          <span className="page-eyebrow-rest">CertPrep · Linux+</span>
        </p>
        <h1 className="page-title page-title--gradient">Your Linux+ command center</h1>
        <div className="tagline-stack">
          <p className="tagline-line">
            One sleek hub where Google Gemini drafts summaries and quizzes while you drill exams, cards, and live labs.
          </p>
          <p className="tagline-line tagline-line--accent">
            The AI never sleeps on your objectives—feed it notes, get structured output, then prove it under exam
            conditions.
          </p>
        </div>
        <p className="hero-sparkle">
          Built for momentum: less tab-hopping, more reps—from first read-through to final confidence pass.
        </p>
      </section>

      <section className="hub-grid" aria-label="Study options">
        <CardLink
          to="/summary-quiz"
          title="Summary, Quiz & Flashcards"
          description="Drop in notes—Gemini returns a polished summary, a 25-question quiz, plus flip-ready Linux+ decks."
          icon="✨"
        />
        <CardLink
          to="/exams"
          title="Exams"
          description="Timed-style Linux+ runs served from your server bundle—pure focus, zero noise."
          icon="🗂️"
        />
        <CardLink
          to="/labs"
          title="Labs"
          description="Hands-on paths from browser VMs to guided playgrounds—muscle memory meets theory."
          icon="⌨️"
        />
      </section>
    </div>
  );
}
