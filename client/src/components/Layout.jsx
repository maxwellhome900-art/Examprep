import { Link, NavLink, useLocation } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/labs/webvm");

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-brand">
          <span className="layout-brand-mark" aria-hidden>
            <span className="layout-brand-mark-inner" />
          </span>
          <span className="layout-brand-text">
            <span className="layout-brand-name">CertPrep</span>
            <span className="layout-brand-tag">Linux+ exam preparation</span>
          </span>
        </Link>
        {!hideNav && (
          <nav className="layout-nav" aria-label="Primary">
            <NavLink className="layout-nav-link" to="/summary-quiz">
              Summary &amp; Quiz
            </NavLink>
            <NavLink className="layout-nav-link" to="/exams">
              Exams
            </NavLink>
            <NavLink className="layout-nav-link" to="/labs">
              Labs
            </NavLink>
          </nav>
        )}
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <p className="layout-footer-copy">Copyright Mark@2026</p>
      </footer>
    </div>
  );
}
