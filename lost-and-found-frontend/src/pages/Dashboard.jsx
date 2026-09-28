import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, Plus } from "lucide-react";
import { itemService } from "../api/mockService";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    itemService.getMine().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolve = async (id) => {
    await itemService.updateStatus(id, "resolved");
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    await itemService.remove(id);
    refresh();
  };

  return (
    <div className="container dashboard">
      <div className="dashboard__header">
        <div>
          <h1>My posts</h1>
          <p>Signed in as {user?.email}</p>
        </div>
        <Link to="/post" className="btn btn--primary">
          <Plus size={17} /> New post
        </Link>
      </div>

      {loading ? (
        <div className="dashboard__list">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 96 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>You haven't posted anything yet</h3>
          <p>Lost something or found something? Post it so the community can help.</p>
          <Link to="/post" className="btn btn--secondary" style={{ marginTop: 20 }}>
            Post your first item
          </Link>
        </div>
      ) : (
        <div className="dashboard__list">
          {items.map((item) => (
            <div key={item.id} className="dashboard__row card">
              <img src={item.image} alt={item.title} className="dashboard__thumb" />
              <div className="dashboard__row-info">
                <div className="dashboard__row-top">
                  <span className={`tag ${item.type === "lost" ? "tag--lost" : "tag--found"}`}>
                    <span className="tag__dot" />
                    {item.type === "lost" ? "Lost" : "Found"}
                  </span>
                  {item.status === "resolved" && (
                    <span className="tag tag--resolved">Resolved</span>
                  )}
                </div>
                <Link to={`/items/${item.id}`} className="dashboard__row-title">
                  {item.title}
                </Link>
                <span className="dashboard__row-meta">
                  {item.location} · Posted {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="dashboard__row-actions">
                {item.status !== "resolved" && (
                  <button className="btn btn--ghost btn--sm" onClick={() => handleResolve(item.id)}>
                    <CheckCircle2 size={15} /> Mark resolved
                  </button>
                )}
                <button className="btn btn--danger btn--sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
