import { Feather } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Feather size={18} />
          <span>Fig &amp; Thread</span>
        </div>
        <p className="footer__tagline">
          A community board for the things we lose and the things we find.
        </p>
        <p className="footer__copy">© 2026 Fig &amp; Thread. Built for neighbors helping neighbors.</p>
      </div>
    </footer>
  );
}
