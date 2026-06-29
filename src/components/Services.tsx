import { Music, Eye, Dumbbell, ArrowUpRight } from "lucide-react";

export default function Services() {
  const items = [
    {
      id: 1,
      icon: <Dumbbell className="w-8 h-8 text-neutral-300" />,
      title: "Гар бөмбөгийн тактик & Анализ",
      description: "Haikyu!! аниме-аас сэдэвлэсэн, хурдтай бөгөөд ухаалаг довтолгоо, хамгаалалтын тактикуудыг бодит талбай дээр сурч, дүн шинжилгээ хийх хөтөлбөр.",
      tag: "СПОРТ"
    },
    {
      id: 2,
      icon: <Eye className="w-8 h-8 text-neutral-300" />,
      title: "Визуал Арт & Аниме концепт",
      description: "Минималист, кинематик болон гүн мэдрэмжтэй аниме урсгалыг тусгасан дижитал постер, хувийн брэндинг болон арт дизайн бүтээх үйлчилгээ.",
      tag: "ДИЗАЙН"
    },
    {
      id: 3,
      icon: <Music className="w-8 h-8 text-neutral-300" />,
      title: "Төвлөрлийн плэйлист & Куратор",
      description: "Mxrningstar урсгалын гүн эгшиг, чимээгүй уур амьсгалыг хослуулсан, хичээл хийх болон ажиллахад зориулсан тусгай дууны багцууд.",
      tag: "ХӨГЖИМ"
    }
  ];

  return (
    <section id="services" className="py-24 sm:py-32 relative z-10 px-6 sm:px-8 border-t border-white/5 bg-background/50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
              Миний ур чадварын чиглэлүүд
            </span>
            <h2 
              className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              id="services-title"
            >
              Миний санал болгох <br />
              <em className="not-italic text-neutral-400">онцлох үйлчилгээнүүд.</em>
            </h2>
          </div>
          <p className="text-neutral-400 text-sm max-w-sm font-light">
            Бүтээлч сэтгэлгээ болон спортын эрч хүчийг хослуулан орчин үеийн, минимал шийдлүүдийг санал болгож байна.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="services-grid">
          {items.map((item) => (
            <div 
              key={item.id}
              className="liquid-glass group rounded-2xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 border border-white/5 bg-neutral-900/10 min-h-[320px]"
              id={`service-card-${item.id}`}
            >
              <div className="space-y-6">
                {/* Header of Card */}
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
                    {item.icon}
                  </div>
                  <span className="text-[10px] tracking-wider text-neutral-400 font-semibold uppercase px-2.5 py-1 rounded-full border border-white/5 bg-neutral-900/30">
                    {item.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white group-hover:text-neutral-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom arrow CTA */}
              <div className="pt-6 flex justify-end">
                <div className="flex items-center text-xs text-neutral-400 group-hover:text-white transition-colors duration-200">
                  <span className="mr-1 font-light">Дэлгэрэнгүй</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
