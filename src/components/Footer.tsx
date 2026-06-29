interface FooterProps {
  onScrollTo: (elementId: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-white/5 bg-background relative z-10 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Logo & Copyright */}
        <div className="text-center md:text-left space-y-2">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onScrollTo("home");
            }}
            className="text-xl tracking-tight text-white focus:outline-none inline-block"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            id="footer-logo"
          >
            Velorah<sup className="text-[10px] font-normal">®</sup>
          </a>
          <p className="text-[11px] text-neutral-500 font-light">
            © {currentYear} Баяржаргал. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-400 font-light" id="footer-links">
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); onScrollTo("home"); }}
            className="hover:text-white transition-colors"
          >
            Нүүр хуудас
          </a>
          <a 
            href="#about" 
            onClick={(e) => { e.preventDefault(); onScrollTo("about"); }}
            className="hover:text-white transition-colors"
          >
            Миний тухай
          </a>
          <a 
            href="#services" 
            onClick={(e) => { e.preventDefault(); onScrollTo("services"); }}
            className="hover:text-white transition-colors"
          >
            Үйлчилгээнүүд
          </a>
          <a 
            href="#game" 
            onClick={(e) => { e.preventDefault(); onScrollTo("game"); }}
            className="hover:text-white transition-colors"
          >
            Волейбол Тоглоом
          </a>
          <a 
            href="#contact" 
            onClick={(e) => { e.preventDefault(); onScrollTo("contact"); }}
            className="hover:text-white transition-colors"
          >
            Холбоо барих
          </a>
        </div>

      </div>
    </footer>
  );
}
