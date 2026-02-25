import { Zap, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-gradient">ΗΛΕΚΤΡΟΚΑΛΥΨΗ</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/ilektrokalypsi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a href="mailto:ilektrokalypsi@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              ilektrokalypsi@gmail.com
            </a>
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ΗΛΕΚΤΡΟΚΑΛΥΨΗ. Με επιφύλαξη παντός δικαιώματος.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
