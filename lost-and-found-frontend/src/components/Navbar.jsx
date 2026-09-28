import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Feather } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/browse", label: "Browse" },
    { to: "/browse?type=lost", label: "Lost" },
    { to: "/browse?type=found", label: "Found" },
  ];

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <Feather size={20} strokeWidth={2.2} />
          <span>Fig &amp; Thread</span>
        </Link>

        <nav className="navbar__links navbar__links--desktop">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                "navbar__link" + (isActive ? " navbar__link--active" : "")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions navbar__actions--desktop">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__link">
                My posts
              </Link>
              <span className="navbar__user">Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Log out
              </button>
              <Link to="/post" className="btn btn--primary btn--sm">
                Post an item
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Log in
              </Link>
              <Link to="/post" className="btn btn--primary btn--sm">
                Post an item
              </Link>
            </>
          )}
        </div>

        <button
          className="navbar__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="navbar__mobile">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="navbar__mobile-divider" />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                My posts
              </Link>
              <button className="navbar__mobile-logout" onClick={handleLogout}>
                Log out ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
          )}
          <Link
            to="/post"
            className="btn btn--primary btn--sm navbar__mobile-cta"
            onClick={() => setOpen(false)}
          >
            Post an item
          </Link>
        </div>
      )}
    </header>
  );
}
