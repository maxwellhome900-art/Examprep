import { useState } from "react";
import "./FlashDeck.css";

export default function FlashDeck({ deck }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = deck.cards ?? [];
  const card = cards[idx];

  if (!card) {
    return (
      <article className="flash-deck">
        <header className="flash-deck__head">
          <span className="flash-deck__badge">Deck</span>
          <div>
            <h3 className="flash-deck__title">{deck.title}</h3>
            <p className="flash-deck__desc empty-state">This deck has no cards yet.</p>
          </div>
        </header>
      </article>
    );
  }

  function next(delta) {
    setFlipped(false);
    setIdx((i) => {
      const n = i + delta;
      if (n < 0) return cards.length - 1;
      if (n >= cards.length) return 0;
      return n;
    });
  }

  return (
    <article className="flash-deck">
      <header className="flash-deck__head">
        <span className="flash-deck__badge">Deck</span>
        <div>
          <h3 className="flash-deck__title">{deck.title}</h3>
          {deck.description && <p className="flash-deck__desc">{deck.description}</p>}
        </div>
      </header>

      <div className="flash-deck__card-wrap">
        <span className="flash-deck__side-label">{flipped ? "Answer" : "Prompt"}</span>
        <button
          type="button"
          className={`flash-card ${flipped ? "flipped" : ""}`}
          onClick={() => setFlipped((v) => !v)}
          aria-label={flipped ? "Show prompt side" : "Show answer side"}
        >
          <div className="flash-card-inner">
            <div className="flash-face front">{card.front}</div>
            <div className="flash-face back">{card.back}</div>
          </div>
        </button>
      </div>

      <div className="flash-deck__meta">
        <span className="flash-deck__counter">
          Card {idx + 1} of {cards.length}
        </span>
        <div
          className="flash-deck__bar"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={cards.length}
          aria-valuenow={idx + 1}
          aria-label={`Card ${idx + 1} of ${cards.length}`}
        >
          <div className="flash-deck__bar-fill" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
        </div>
      </div>

      <div className="flash-deck__footer">
        <p className="flash-deck__hint">Tap card to flip · keyboard-friendly</p>
        <button type="button" className="btn btn-ghost" onClick={() => next(-1)}>
          Previous
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => next(1)}>
          Next
        </button>
      </div>
    </article>
  );
}
