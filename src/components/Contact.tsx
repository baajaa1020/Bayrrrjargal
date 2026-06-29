import React, { useState } from "react";
import { Mail, Phone, Instagram, Send, CheckCircle, ArrowRight } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 relative z-10 px-6 sm:px-8 border-t border-white/5 bg-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Side: Contact Information */}
          <div className="lg:col-span-5 space-y-10 animate-fade-rise">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
                Холбоо барих хэсэг
              </span>
              <h2 
                className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
                id="contact-title"
              >
                Талбайн гадна ч холбоотой <br />
                <em className="not-italic text-neutral-400">байцгаая.</em>
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed font-light">
                Танд шинэ санаа, хамтарч ажиллах санал, эсвэл зүгээр л гар бөмбөгийн талаар ярилцах хүсэл байвал над руу хэзээд бичиж болно.
              </p>
            </div>

            {/* Contact details */}
            <div className="space-y-6" id="contact-info-list">
              
              <a 
                href="mailto:bayrjargal1020@gmail.com" 
                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/10 hover:bg-neutral-900/60 transition-all duration-300 group"
                id="contact-email-link"
              >
                <div className="p-3 bg-neutral-900 rounded-xl border border-white/5 text-neutral-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400 font-light">Имэйл хаяг</h4>
                  <p className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">bayrjargal1020@gmail.com</p>
                </div>
              </a>

              <div 
                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5"
                id="contact-phone-block"
              >
                <div className="p-3 bg-neutral-900 rounded-xl border border-white/5 text-neutral-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400 font-light">Утасны дугаар</h4>
                  <p className="text-sm font-medium text-white">+976 9911-XXXX</p>
                </div>
              </div>

              <div className="flex gap-4 pt-2" id="contact-socials">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-neutral-900/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all duration-300"
                  aria-label="Instagram"
                  id="contact-instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7 animate-fade-rise-delay">
            <div className="liquid-glass p-8 sm:p-10 rounded-3xl border border-white/5 bg-neutral-900/10 relative" id="contact-form-wrapper">
              
              {/* Success Screen Overlay */}
              {isSuccess && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-rise z-20">
                  <CheckCircle className="w-16 h-16 text-neutral-300" />
                  <div className="space-y-1">
                    <h3 className="text-xl font-medium text-white">Илгээгдлээ!</h3>
                    <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">
                      Мэдээлэл хүлээн авлаа. Тантай тун удахгүй имэйлээр холбогдох болно. Баярлалаа!
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
                
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Таны Нэр
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Жишээ: Тэмүүлэн"
                    className="w-full px-5 py-4 rounded-xl bg-neutral-950/60 border border-white/5 text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 transition-all text-sm font-light"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Имэйл Хаяг
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Жишээ: email@example.com"
                    className="w-full px-5 py-4 rounded-xl bg-neutral-950/60 border border-white/5 text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 transition-all text-sm font-light"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Таны Хүсэлт / Зурвас
                  </label>
                  <textarea 
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Санал хүсэлтээ энд бичнэ үү..."
                    className="w-full px-5 py-4 rounded-xl bg-neutral-950/60 border border-white/5 text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 transition-all text-sm font-light resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-glass w-full rounded-full py-4 text-sm font-medium text-white flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  id="contact-submit-btn"
                >
                  {isSubmitting ? "Илгээж байна..." : (
                    <>
                      Зурвас илгээх <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
