import { Shield, Sparkles, Trophy } from "lucide-react";

export default function About() {
  const imagePath = "/src/assets/images/bayarjargal_avatar_female_1782643315359.jpg";

  return (
    <section id="about" className="py-24 sm:py-32 relative z-10 px-6 sm:px-8 border-t border-white/5 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 animate-fade-rise">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block mb-3">
                Хувийн түүх ба Эрч хүч
              </span>
              <h2 
                className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
                id="about-title"
              >
                Талбайд ч, амьдралд ч <br />
                <em className="not-italic text-neutral-400">дүүлэн нисэх мөрөөдөл.</em>
              </h2>
            </div>

            <div className="space-y-6 text-neutral-300 text-base sm:text-lg leading-relaxed font-light" id="about-description">
              <p>
                Намайг <strong>Баяржаргал</strong> гэдэг. Би 14 настай, гар бөмбөгийн спорт болон 
                <em> Haikyu!!</em> анимед чин сэтгэлээсээ дурлагч нэгэн. Чимээгүй дунд мөрөөдлөө дээш хөөргөж, 
                хурдтай, шийдэмгий бөгөөд ухаалаг тоглолтоор талбайд өөрийгөө илэрхийлдэг.
              </p>
              <p>
                Миний өдөр тутмын эрч хүч, төвлөрлийн ард <strong>mxrningstar</strong>-ын гүн урсгалтай аялгуунууд эгшиглэж байдаг. 
                Бидний бүтээж буй дижитал болон бодит орон зай бүр гүн сэтгэгчид, тууштай тэмцэгчдэд зориулагдсан юм.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4" id="about-stats-grid">
              <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2">
                <Trophy className="w-5 h-5 text-neutral-400" />
                <h4 className="text-sm font-medium text-white">Талбайн довтолгоо</h4>
                <p className="text-xs text-neutral-400 font-light">Сэжүүр бүрийг оноо болгох хүчтэй цохилт.</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2">
                <Shield className="w-5 h-5 text-neutral-400" />
                <h4 className="text-sm font-medium text-white">Хамгаалалт ба Сэтгэл зүй</h4>
                <p className="text-xs text-neutral-400 font-light">Ямар ч бөмбөгийг унагахгүй тууштай сэтгэл.</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2">
                <Sparkles className="w-5 h-5 text-neutral-400" />
                <h4 className="text-sm font-medium text-white">Урлаг & Хөгжим</h4>
                <p className="text-xs text-neutral-400 font-light">mxrningstar-аар хөглөгдөх гүн төвлөрөл.</p>
              </div>
            </div>
          </div>

          {/* Portrait Image Column */}
          <div className="lg:col-span-5 flex justify-center animate-fade-rise-delay">
            <div className="relative group max-w-sm sm:max-w-md lg:max-w-full w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10" id="about-portrait-wrapper">
              <img 
                src={imagePath} 
                alt="Bayarjargal Portrait" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                id="about-portrait-img"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs tracking-wider text-neutral-400 uppercase font-semibold">Баяржаргал • 14 Настай</p>
                <p className="text-lg text-white font-medium mt-1">"Мөрөөдлөө өөд нь шид, чимээгүй дунд дуулиан тарь."</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
