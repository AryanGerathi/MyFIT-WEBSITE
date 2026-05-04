import { Link } from "react-router-dom";
import { Dumbbell, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30 mt-20">
      <div className="container-app py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-accent text-white">
              <Dumbbell size={18} />
            </span>
            <span className="font-display font-bold text-xl">
              My<span className="text-accent">Fit</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            India's marketplace for elite fitness creators. Train 1-on-1, transform fast.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-accent transition">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-accent transition">Contact</Link></li>
            <li><Link to="/help" className="hover:text-accent transition">Help Center</Link></li>
            <li><Link to="/terms" className="hover:text-accent transition">Terms & Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Follow</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition">
              <Twitter size={16} />
            </a>
            <a href="#" aria-label="Youtube" className="grid h-9 w-9 place-items-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition">
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © 2025 MyFit. All rights reserved.
      </div>
    </footer>
  );
}