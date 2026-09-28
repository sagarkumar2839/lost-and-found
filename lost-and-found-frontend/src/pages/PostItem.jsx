import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { itemService } from "../api/mockService";
import { useAuth } from "../context/AuthContext";
import "./PostItem.css";

const FALLBACK_IMAGES = {
  lost: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80",
  found: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=600&q=80",
};

export default function PostItem() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
    imagePreview: null,
    imageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update("imageFile", file); // raw File object sent to the backend
    const reader = new FileReader();
    reader.onload = () => update("imagePreview", reader.result); // just for on-screen preview
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Give your post a short title.";
    if (!form.category) next.category = "Choose a category.";
    if (!form.description.trim()) next.description = "Add a description with useful detail.";
    if (!form.location.trim()) next.location = "Where was it lost or found?";
    if (!form.date) next.date = "Pick a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/post" } } });
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newItem = await itemService.create({
        type: form.type,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        imageFile: form.imageFile,
        image: form.imageFile ? null : FALLBACK_IMAGES[form.type],
      });
      navigate(`/items/${newItem.id}`);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to post item. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container post-item">
      <div className="post-item__header">
        <h1>Post an item</h1>
        <p>The more specific detail you give, the faster it gets matched.</p>
      </div>

      <form className="post-item__form" onSubmit={handleSubmit}>
        <div className="post-item__type-select">
          <button
            type="button"
            className={`type-option ${form.type === "lost" ? "type-option--lost-active" : ""}`}
            onClick={() => update("type", "lost")}
          >
            <span className="type-option__dot type-option__dot--lost" />
            I lost something
          </button>
          <button
            type="button"
            className={`type-option ${form.type === "found" ? "type-option--found-active" : ""}`}
            onClick={() => update("type", "found")}
          >
            <span className="type-option__dot type-option__dot--found" />
            I found something
          </button>
        </div>

        <div className={`field ${errors.title ? "field--error" : ""}`}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder={form.type === "lost" ? "e.g. Navy blue backpack" : "e.g. Set of keys with red keychain"}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
          {errors.title && <span className="field__error-text">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className={`field ${errors.category ? "field--error" : ""}`}>
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Select a category</option>
              {itemService.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <span className="field__error-text">{errors.category}</span>}
          </div>

          <div className={`field ${errors.date ? "field--error" : ""}`}>
            <label htmlFor="date">Date {form.type === "lost" ? "lost" : "found"}</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
            {errors.date && <span className="field__error-text">{errors.date}</span>}
          </div>
        </div>

        <div className={`field ${errors.location ? "field--error" : ""}`}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Central Library, 2nd floor"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
          {errors.location && <span className="field__error-text">{errors.location}</span>}
        </div>

        <div className={`field ${errors.description ? "field--error" : ""}`}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Color, brand, contents, distinguishing marks — anything that would help someone recognize it."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <span className="field__hint">
            Tip: hold back one identifying detail — ask claimants to name it before you confirm a match.
          </span>
          {errors.description && <span className="field__error-text">{errors.description}</span>}
        </div>

        <div className="field">
          <label>Photo (optional)</label>
          <label className="post-item__image-upload">
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="Preview" />
            ) : (
              <>
                <ImagePlus size={22} />
                <span>Click to upload a photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>

        {errors.submit && <div className="alert alert--error">{errors.submit}</div>}

        {!isAuthenticated && (
          <div className="alert alert--error">
            You'll need to log in before this post goes live — your progress won't be lost.
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? "Posting…" : isAuthenticated ? "Publish post" : "Log in and publish"}
        </button>
      </form>
    </div>
  );
}
