interface HeroProps {
  onScrollTo: (elementId: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />

      {/* Content Container */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] max-w-7xl mx-auto"
        id="hero-content"
      >
        {/* Cinematic Header */}
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl font-normal leading-[0.95] tracking-[-2.46px] max-w-5xl text-white animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          id="hero-title"
        >
          Where <em className="not-italic text-neutral-400">dreams</em> rise <br />
          <em className="not-italic text-neutral-400">through the silence.</em>
        </h1>

        {/* Subtext */}
        <p 
          className="text-neutral-400 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay"
          id="hero-subtext"
        >
          We're designing tools for deep thinkers, bold creators, and quiet rebels. 
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        {/* Action Button */}
        <div className="animate-fade-rise-delay-2" id="hero-action-container">
          <button
            onClick={() => onScrollTo("about")}
            className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white mt-12 hover:scale-[1.03] transition-all duration-300 cursor-pointer focus:outline-none"
            id="hero-cta-btn"
          >
            Миний ертөнцөөр аялах ✦
          </button>
        </div>
      </div>
    </section>
  );
}
