import { Link } from "react-router-dom";
import "./Page.css";

export default function LabsPage() {
  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Back to hub
      </Link>
      <section className="page-hero page-hero--dramatic">
        <p className="page-eyebrow page-eyebrow--row">
          <span className="ai-chip">Hands-on mode</span>
          <span className="page-eyebrow-rest">Linux+ · CertPrep</span>
        </p>
        <h1 className="page-title page-title--gradient">Linux+ labs</h1>
        <div className="tagline-stack">
          <p className="tagline-line">
            Spin up a real Debian userspace in the browser, then graduate into curated external ranges when you crave
            deeper chaos.
          </p>
          <p className="tagline-line tagline-line--accent">
            Muscle memory wins exams—this lane is where theory becomes typed commands and confident recoveries.
          </p>
        </div>
      </section>

      <div className="panel webvm-feature">
        <div className="panel-heading-row">
          <h2 className="panel-title" style={{ margin: 0 }}>
            WebVM — Linux in the browser
          </h2>
          <span className="pill">CheerpX / WebAssembly</span>
        </div>
        <p className="panel-sub" style={{ marginBottom: "1rem" }}>
          <a href="https://github.com/leaningtech/webvm" target="_blank" rel="noreferrer noopener">
            WebVM
          </a>{" "}
          is an in-browser Linux VM used at{" "}
          <a href="https://webvm.io" target="_blank" rel="noreferrer noopener">
            webvm.io
          </a>
          . Open the embedded CertPrep view (same origin as your app may affect framing—fallback buttons provided) or
          launch the public site in a new tab. Optional graphical Alpine environment:{" "}
          <a href="https://webvm.io/alpine.html" target="_blank" rel="noreferrer noopener">
            webvm.io/alpine.html
          </a>
          .
        </p>
        <div className="button-row" style={{ marginTop: 0 }}>
          <Link className="btn btn-primary" to="/labs/webvm">
            Open WebVM in CertPrep
          </Link>
          <a className="btn btn-ghost" href="https://webvm.io/" target="_blank" rel="noreferrer noopener">
            Open webvm.io (new tab)
          </a>
          <a className="btn btn-ghost" href="https://webvm.io/alpine.html" target="_blank" rel="noreferrer noopener">
            Alpine desktop (new tab)
          </a>
        </div>
      </div>

      <div className="panel">
        <h2>Beginner</h2>
        <div className="resource-grid">
          {[
            {
              title: "Linux Journey",
              description: "Beginner command line, filesystem navigation, and permissions exercises.",
              url: "https://linuxjourney.com/",
            },
            {
              title: "OverTheWire Bandit",
              description: "Step-by-step shell practice with basic Linux commands and file operations.",
              url: "https://overthewire.org/wargames/bandit/",
            },
          ].map((lab) => (
            <article key={lab.title} className="resource-card">
              <h3>{lab.title}</h3>
              <p>{lab.description}</p>
              <a className="btn btn-ghost btn-sm" href={lab.url} target="_blank" rel="noreferrer noopener">
                Open lab
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Intermediate</h2>
        <div className="resource-grid">
          {[
            {
              title: "KillerCoda",
              description: "Guided Linux scenarios for package management, services, and shell tasks.",
              url: "https://killercoda.com/",
            },
            {
              title: "Play with Docker",
              description: "Practice Linux shell and service management in temporary cloud environments.",
              url: "https://labs.play-with-docker.com/",
            },
          ].map((lab) => (
            <article key={lab.title} className="resource-card">
              <h3>{lab.title}</h3>
              <p>{lab.description}</p>
              <a className="btn btn-ghost btn-sm" href={lab.url} target="_blank" rel="noreferrer noopener">
                Open lab
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Advanced</h2>
        <div className="resource-grid">
          {[
            {
              title: "Hack The Box",
              description: "Advanced Linux troubleshooting, networking, and security hardening workflows.",
              url: "https://www.hackthebox.com/",
            },
            {
              title: "TryHackMe Linux rooms",
              description: "Objective-focused Linux security and administration tasks with guided labs.",
              url: "https://tryhackme.com/",
            },
          ].map((lab) => (
            <article key={lab.title} className="resource-card">
              <h3>{lab.title}</h3>
              <p>{lab.description}</p>
              <a className="btn btn-ghost btn-sm" href={lab.url} target="_blank" rel="noreferrer noopener">
                Open lab
              </a>
            </article>
          ))}
        </div>
      </div>

      <p className="hint" style={{ marginTop: "-0.75rem" }}>
        Focus areas: CLI usage, package management, system services, and user/group management.
      </p>
    </div>
  );
}
