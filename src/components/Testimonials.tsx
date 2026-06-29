import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const stats = [
    { value: "540+", label: "Бэлтгэлийн цаг" },
    { value: "1,200+", label: "mxrningstar сонссон" },
    { value: "85+", label: "Haikyu!! үзсэн анги" },
    { value: "98%", label: "Довтолгооны нарийвчлал" },
  ];

  const testimonials = [
    {
      id: 1,
      quote: "Баяржаргал бол гайхалтай суралцагч бөгөөд талбай дээр урьдчилан тааварлашгүй хурд, ухаалаг тактикийг үзүүлж чаддаг. Түүний гар бөмбөгт зориулсан зүтгэл үнэхээр бахархмаар.",
      author: "А. Тэмүүлэн",
      role: "Гар бөмбөгийн Дасгалжуулагч",
      rating: 5,
    },
    {
      id: 2,
      quote: "Хөгжмийн маш өвөрмөц мэдрэмжтэй, хийж буй зүйлдээ 100% төвлөрч чаддаг. Минималист загвар, дууны плэйлистүүд нь миний ажиллах эрч хүчийг үргэлж нэмэгдүүлдэг.",
      author: "М. Намуун",
      role: "Найз & Бүтээлч хамтрагч",
      rating: 5,
    }
  ];

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative z-10 px-6 sm:px-8 border-t border-white/5 bg-background">
      <div className="max-w-7xl mx-auto">
        
        {/* Layout: Stats & Testimonials side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Introduction & Stats */}
          <div className="lg:col-span-5 space-y-10 animate-fade-rise">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
                Амжилтын хуудас
              </span>
              <h2 
                className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
                id="testimonials-title"
              >
                Тоо баримт <br />
                <em className="not-italic text-neutral-400">болон миний амжилт.</em>
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-light">
                Талбай дээр өнгөрүүлсэн хором бүр, төвлөрч суусан аялгуу бүхэн миний хувийн хөгжлийн тод баримтууд юм.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6" id="stats-container">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 space-y-1">
                  <div className="text-3xl sm:text-4xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-neutral-400 font-light tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Testimonials slider/cards */}
          <div className="lg:col-span-7 space-y-8 animate-fade-rise-delay" id="testimonials-cards-container">
            {testimonials.map((t) => (
              <div 
                key={t.id}
                className="liquid-glass p-8 rounded-2xl border border-white/5 bg-neutral-900/10 space-y-6 relative"
                id={`testimonial-card-${t.id}`}
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 pointer-events-none" />
                
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-white text-white" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-neutral-300 text-base leading-relaxed italic font-light">
                  "{t.quote}"
                </p>

                {/* Author Info */}
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-white">{t.author}</h4>
                    <p className="text-xs text-neutral-400 font-light mt-0.5">{t.role}</p>
                  </div>
                  <span className="text-[10px] tracking-wider text-neutral-400 font-semibold uppercase px-2.5 py-1 rounded-full border border-white/5 bg-neutral-900/50">
                    БАТАЛГААЖСАН
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
