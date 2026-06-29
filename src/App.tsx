/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Game from "./components/Game";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import IdolCoachChat from "./components/IdolCoachChat";
import MeAIChat from "./components/MeAIChat";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [isIdolChatOpen, setIsIdolChatOpen] = useState(false);

  // Smooth scroll handler
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Intersection Observer to detect active section for Navbar links
  useEffect(() => {
    const sections = ["home", "about", "services", "game", "testimonials", "contact"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { 
            // Trigger when section occupies 40% of the screen height
            threshold: 0.4 
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-white selection:bg-white/10 selection:text-white overflow-hidden">
      {/* Atmospheric Background Theme Elements */}
      <div className="absolute inset-0 z-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

      {/* Sticky Navigation */}
      <Navbar 
        onScrollTo={handleScrollTo} 
        activeSection={activeSection} 
        onOpenIdolChat={() => setIsIdolChatOpen(true)} 
      />

      {/* Hero Landing Section */}
      <Hero onScrollTo={handleScrollTo} />

      {/* Main Content Layout */}
      <main className="relative">
        {/* Personal Profile Section */}
        <About />

        {/* Custom Services Grid */}
        <Services />

        {/* Volleyball Keep-Up Game Section */}
        <Game />

        {/* Key Stats & Testimonials */}
        <Testimonials />

        {/* Contact Form Details */}
        <Contact />
      </main>

      {/* Simple Footer Links */}
      <Footer onScrollTo={handleScrollTo} />

      {/* Gemini AI Powered Chats */}
      <IdolCoachChat isOpen={isIdolChatOpen} onClose={() => setIsIdolChatOpen(false)} />
      <MeAIChat />
    </div>
  );
}
