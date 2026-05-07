import { Link } from "react-router-dom";
import "./CardLink.css";

export default function CardLink({ to, title, description, icon }) {
  return (
    <Link to={to} className="card-link">
      <div className="card-link-icon" aria-hidden>
        {icon}
      </div>
      <div className="card-link-body">
        <h2 className="card-link-title">{title}</h2>
        <p className="card-link-desc">{description}</p>
      </div>
      <span className="card-link-chevron" aria-hidden>
        →
      </span>
    </Link>
  );
}
