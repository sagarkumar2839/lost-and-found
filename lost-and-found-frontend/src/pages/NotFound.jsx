import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container empty-state" style={{ padding: "120px 20px" }}>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn--secondary" style={{ marginTop: 20 }}>
        Back to home
      </Link>
    </div>
  );
}
