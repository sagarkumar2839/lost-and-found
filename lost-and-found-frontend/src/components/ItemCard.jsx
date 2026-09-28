import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import "./ItemCard.css";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ItemCard({ item }) {
  const isResolved = item.status === "resolved";

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-card__image-wrap">
        <img src={item.image} alt={item.title} className="item-card__image" loading="lazy" />
        <span className={`tag item-card__tag ${item.type === "lost" ? "tag--lost" : "tag--found"}`}>
          <span className="tag__dot" />
          {item.type === "lost" ? "Lost" : "Found"}
        </span>
        {isResolved && <div className="item-card__resolved-overlay">Resolved</div>}
      </div>
      <div className="item-card__body">
        <p className="item-card__category">{item.category}</p>
        <h3 className="item-card__title">{item.title}</h3>
        <div className="item-card__meta">
          <span>
            <MapPin size={13} /> {item.location}
          </span>
          <span>
            <Calendar size={13} /> {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
