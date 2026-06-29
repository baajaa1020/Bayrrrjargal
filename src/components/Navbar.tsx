import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onScrollTo: (elementId: string) => void;
  activeSection: string;
}

export default function Navbar({ onScrollTo, activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Нүүр" },
    { id: "about", label: "Тухай" },
    { id: "services", label: "Тусгай" },
    { id: "game", label: "Тоглоом 🎮" },
    { id: "testimonials", label: "Амжилт" },
    { id: "contact", label: "Холбоо барих" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-background/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#home" 
          onClick={(e) => {
            e.preventDefault();
            onScrollTo("home");
          }}
          className="text-2xl sm:text-3xl tracking-tight text-white focus:outline-none"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          id="nav-logo"
        >
          Velorah<sup className="text-xs font-normal">®</sup>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onScrollTo(item.id);
              }}
              className={`text-sm tracking-wide transition-colors duration-200 hover:text-white ${
                activeSection === item.id ? "text-white font-medium" : "text-neutral-400"
              }`}
              id={`nav-link-${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => onScrollTo("game")}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-white hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            id="nav-cta-btn"
          >
            Бөмбөг ойлгох ⚡
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
            id="nav-mobile-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-background/95 backdrop-blur-xl px-6 py-6 space-y-4 animate-fade-rise" id="nav-mobile-menu">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onScrollTo(item.id);
                  setIsOpen(false);
                }}
                className={`text-base py-1 transition-colors ${
                  activeSection === item.id ? "text-white font-medium pl-2 border-l-2 border-white" : "text-neutral-400"
                }`}
                id={`nav-mobile-link-${item.id}`}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                onScrollTo("game");
                setIsOpen(false);
              }}
              className="liquid-glass w-full rounded-full py-3 text-center text-sm font-medium text-white hover:scale-[1.02] transition-all cursor-pointer"
              id="nav-mobile-cta"
            >
              Тоглоом эхлүүлэх
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
