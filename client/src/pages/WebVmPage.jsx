import { Link } from "react-router-dom";
import "./Page.css";

export default function WebVmPage() {
  return (
    <div className="page webvm-page">
      <header className="webvm-header">
        <Link className="page-back" to="/labs" style={{ marginBottom: 0 }}>
          ← Labs
        </Link>
        <div className="webvm-header-actions">
          <a className="btn btn-ghost btn-sm" href="https://webvm.io/" target="_blank" rel="noreferrer noopener">
            Open webvm.io
          </a>
          <a
            className="btn btn-ghost btn-sm"
            href="https://webvm.io/alpine.html"
            target="_blank"
            rel="noreferrer noopener"
          >
            Alpine desktop
          </a>
        </div>
      </header>

      <section className="webvm-intro panel">
        <h1 className="page-title page-title--gradient" style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>
          WebVM — Linux in the browser
        </h1>
        <p className="page-lead" style={{ margin: 0 }}>
          <a href="https://github.com/leaningtech/webvm" target="_blank" rel="noreferrer noopener">
            WebVM
          </a>{" "}
          runs a Debian userspace in WebAssembly (CheerpX). If the frame below stays blank (some browsers block
          embedding), use <strong>Open webvm.io</strong>. Networking features may require Tailscale per upstream docs.
        </p>
      </section>

      <div className="webvm-frame-wrap">
        <iframe
          title="WebVM — Linux virtual machine in the browser"
          className="webvm-iframe"
          src="https://webvm.io/"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="clipboard-read; clipboard-write; cross-origin-isolated; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads allow-pointer-lock"
        />
      </div>
    </div>
  );
}
