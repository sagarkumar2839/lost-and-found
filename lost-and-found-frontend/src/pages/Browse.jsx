import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { itemService } from "../api/mockService";
import ItemCard from "../components/ItemCard";
import "./Browse.css";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const category = searchParams.get("category") || "all";

  const fetchItems = useCallback(() => {
    setLoading(true);
    itemService.getAll({ query, type, category }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [query, type, category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  return (
    <div className="container browse">
      <div className="browse__header">
        <h1>Browse listings</h1>
        <p>Search everything posted to the board, or narrow it down by type and category.</p>
      </div>

      <div className="browse__searchbar">
        <div className="browse__search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by item, description, or location…"
            value={query}
            onChange={(e) => updateParam("q", e.target.value)}
          />
        </div>
        <button
          className="btn btn--ghost browse__filter-toggle"
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className={`browse__filters ${showFilters ? "browse__filters--open" : ""}`}>
        <div className="browse__filter-group">
          <span className="browse__filter-label">Type</span>
          <div className="browse__pill-group">
            {["all", "lost", "found"].map((t) => (
              <button
                key={t}
                className={`pill ${type === t ? "pill--active" : ""}`}
                onClick={() => updateParam("type", t)}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="browse__filter-group">
          <span className="browse__filter-label">Category</span>
          <select value={category} onChange={(e) => updateParam("category", e.target.value)}>
            <option value="all">All categories</option>
            {itemService.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="browse__results-count">
        {loading ? "Searching…" : `${items.length} ${items.length === 1 ? "result" : "results"}`}
      </div>

      {loading ? (
        <div className="grid grid--items">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "4/4.6" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing matches yet</h3>
          <p>Try a different search term, or check back later — new posts show up all the time.</p>
        </div>
      ) : (
        <div className="grid grid--items">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
