import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLabWelcome, runLabCommand } from "../lib/labScenarios.js";
import "./Page.css";

export default function LabSimulationPage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const welcome = useMemo(() => getLabWelcome(scenarioId ?? ""), [scenarioId]);
  const [lines, setLines] = useState(() => [
    `── ${welcome.title} ──`,
    ...(Array.isArray(welcome.banner) ? welcome.banner : [welcome.banner]),
    "",
    "Type `help` to see available commands.",
  ]);
  const [input, setInput] = useState("");

  function append(chunk) {
    setLines((prev) => [...prev, chunk]);
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    append(`$ ${raw}`);
    setInput("");

    const out = runLabCommand(scenarioId ?? "", raw);
    if (out === "__EXIT__") {
      append("Session closed.");
      navigate("/labs");
      return;
    }
    if (out === "__CLEAR__") {
      setLines([]);
      return;
    }
    if (out) {
      append(out);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <Link className="page-back" to="/labs" style={{ margin: 0 }}>
          ← Labs home
        </Link>
        <span className="pill">Scenario: {scenarioId}</span>
      </header>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="terminal"
          style={{
            minHeight: 360,
            border: "none",
            borderRadius: 0,
            margin: 0,
          }}
        >
          {lines.map((row, i) => (
            <p key={`${i}-${String(row).slice(0, 24)}`} className="terminal-line terminal-out">
              {row}
            </p>
          ))}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          style={{
            borderTop: "1px solid var(--border)",
            padding: "0.85rem 1rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            background: "var(--bg-elevated)",
          }}
        >
          <span className="terminal-prompt" style={{ fontFamily: "var(--mono)" }}>
            $
          </span>
          <input
            className="cli-input"
            style={{ background: "#05080c" }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="help"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Simulated terminal input"
          />
          <button type="submit" className="btn btn-primary">
            Enter
          </button>
        </form>
      </div>

      <p className="hint">
        Outputs are mocked for studying real command shapes — they are not attached to live infrastructure. Pair this
        with packet tracer, cloud sandboxes, or vendor labs for full fidelity.
      </p>
    </div>
  );
}
