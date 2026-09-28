import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { itemService } from "../api/mockService";
import ItemCard from "../components/ItemCard";
import "./Home.css";

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemService.getAll().then((all) => {
      setRecent(all.slice(0, 6));
      setStats({
        lost: all.filter((i) => i.type === "lost" && i.status === "open").length,
        found: all.filter((i) => i.type === "found" && i.status === "open").length,
        resolved: all.filter((i) => i.status === "resolved").length,
      });
      setLoading(false);
    });
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <h1 className="hero__headline">
              Lost something?
              <br />
              Someone nearby may have found it.
            </h1>
            <p className="hero__sub">
              Fig &amp; Thread is a neighborhood board for reuniting people with
              what they've misplaced — a backpack left on a bus, keys from a
              park bench, a wallet at the food court. Post it, browse it, get
              it back.
            </p>
            <div className="hero__actions">
              <Link to="/browse" className="btn btn--primary">
                <Search size={17} /> Browse listings
              </Link>
              <Link to="/post" className="btn btn--secondary">
                Post an item
              </Link>
            </div>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-number hero__stat-number--lost">{stats.lost}</span>
              <span className="hero__stat-label">items reported lost</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-number hero__stat-number--found">{stats.found}</span>
              <span className="hero__stat-label">items waiting to be claimed</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-number">{stats.resolved}</span>
              <span className="hero__stat-label">reunited with their owners</span>
            </div>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="how__grid">
            <div className="how__step">
              <div className="how__icon">
                <Search size={20} />
              </div>
              <h3>Search the board</h3>
              <p>Filter by category, location, or date to see if your item has already turned up.</p>
            </div>
            <div className="how__step">
              <div className="how__icon">
                <MessageCircle size={20} />
              </div>
              <h3>Reach out directly</h3>
              <p>Found a match? Send a claim message with details only the owner would know.</p>
            </div>
            <div className="how__step">
              <div className="how__icon">
                <CheckCircle2 size={20} />
              </div>
              <h3>Mark it resolved</h3>
              <p>Once an item finds its way home, close the post so others know it's settled.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="recent">
        <div className="container">
          <div className="recent__header">
            <h2 className="section-title">Recently posted</h2>
            <Link to="/browse" className="recent__see-all">
              See all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid--items">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: "4/4.6" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid--items">
              {recent.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
