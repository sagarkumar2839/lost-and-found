import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { itemService } from "../api/mockService";
import { useAuth } from "../context/AuthContext";
import "./ItemDetail.css";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    itemService
      .getById(id)
      .then(setItem)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/items/${id}` } } });
      return;
    }
    if (!message.trim()) return;
    setSending(true);
    await itemService.submitClaim(id, message);
    setSending(false);
    setSent(true);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="container item-detail">
        <div className="skeleton" style={{ height: 400, marginBottom: 24 }} />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="container empty-state">
        <h3>This post doesn't exist anymore</h3>
        <p>It may have been removed or resolved and taken down.</p>
        <Link to="/browse" className="btn btn--secondary" style={{ marginTop: 20 }}>
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="container item-detail">
      <Link to="/browse" className="item-detail__back">
        <ArrowLeft size={16} /> Back to listings
      </Link>

      <div className="item-detail__grid">
        <div className="item-detail__image-wrap">
          <img src={item.image} alt={item.title} className="item-detail__image" />
          {item.status === "resolved" && (
            <div className="item-detail__resolved-banner">
              <CheckCircle2 size={16} /> This item has been resolved
            </div>
          )}
        </div>

        <div className="item-detail__info">
          <span className={`tag ${item.type === "lost" ? "tag--lost" : "tag--found"}`}>
            <span className="tag__dot" />
            {item.type === "lost" ? "Lost item" : "Found item"}
          </span>

          <h1 className="item-detail__title">{item.title}</h1>
          <p className="item-detail__category">{item.category}</p>

          <div className="item-detail__meta">
            <div>
              <MapPin size={16} />
              <span>{item.location}</span>
            </div>
            <div>
              <Calendar size={16} />
              <span>{formatDate(item.date)}</span>
            </div>
          </div>

          <p className="item-detail__description">{item.description}</p>

          <div className="item-detail__poster card">
            <span className="item-detail__poster-label">Posted by</span>
            <span className="item-detail__poster-name">{item.postedBy.name}</span>
          </div>

          {item.status !== "resolved" && (
            <div className="item-detail__claim card">
              <h3>
                {item.type === "lost" ? "Think you found this?" : "Is this yours?"}
              </h3>
              {sent ? (
                <div className="alert alert--success">
                  Your message was sent to {item.postedBy.name}. They'll reach out to
                  verify details and arrange a handoff.
                </div>
              ) : (
                <form onSubmit={handleClaim}>
                  <div className="field">
                    <label htmlFor="claim-message">
                      {item.type === "lost"
                        ? "Describe where and when you found it, plus a detail that confirms it's a match"
                        : "Describe the item to confirm it's yours (a detail only the owner would know)"}
                    </label>
                    <textarea
                      id="claim-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. I found this near the entrance around 6pm. It has a small tear on the left strap."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
                    <Send size={16} />
                    {sending
                      ? "Sending…"
                      : isAuthenticated
                      ? "Send message"
                      : "Log in to send message"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
