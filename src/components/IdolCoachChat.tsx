import React, { useState, useEffect, useRef } from "react";
import { X, Send, Key, Sparkles, AlertCircle, Bot, User, RefreshCw } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface IdolCoachChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `Та бол "Haikyu!!" анимэ-ийн урам зоригт дасгалжуулагч болон гар бөмбөгийн домогт тамирчин (Karasuno-ийн дасгалжуулагч Ukai эсвэл Shoyo Hinata, Kageyama нарын шилдэг зан чанарыг шингээсэн Idol Coach) юм. Таны зорилго бол Баяржаргал (гар бөмбөгт хайртай 14 настай охин)-д болон портфолио сайтаар зочилсон хүмүүст спортын ур чадвар, тууштай тэмцэл, багийн ажиллагаа, сэтгэл зүйн бэлтгэл, мөрөөдөлдөө хүрэх эрч хүчийг өгөх дасгалжуулагч байх юм. Хариултаа үргэлж эрч хүчтэй, урам зоригтой, найрсаг, зааж зөвлөсөн өнгө аясаар, Монгол хэлээр бичнэ үү. Гар бөмбөгийн нэр томьёо, Haikyu!! анимэ-ийн эшлэлүүдийг ашиглаж, хэзээ ч бууж өгөхгүй байхыг сануулаарай!`;

export default function IdolCoachChat({ isOpen, onClose }: IdolCoachChatProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [tempKey, setTempKey] = useState<string>("");
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Сайн уу, Баяржаргал! Талбай дээр гарахад бэлэн үү? 🏐 Би бол чиний Idol Coach байна. Надаас гар бөмбөгийн техник, тактик эсвэл Haikyu!! анимэ-ийн талаар юуг ч хамаагүй асуугаарай! Бөмбөг унах хүртэл тоглоом дуусаагүй шүү! 🔥",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setTempKey(savedKey);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    if (!trimmed) {
      setErrorMsg("Та API түлхүүрээ оруулна уу.");
      return;
    }
    localStorage.setItem("gemini_api_key", trimmed);
    setApiKey(trimmed);
    setIsEditingKey(false);
    setErrorMsg("");
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setTempKey("");
    setIsEditingKey(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;

    if (!apiKey) {
      setErrorMsg("Gemini API Key тохируулаагүй байна!");
      return;
    }

    const newUserMessage: Message = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    setErrorMsg("");

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map chat history to API format
      const historyPayload = messages.concat(newUserMessage).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: historyPayload,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Уучлаарай, хариу ирсэнгүй. Дахин оролдоно уу.";

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: replyText,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.message || "Алдаа гарлаа. Та API түлхүүрээ зөв эсэхийг шалгана уу."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {/* Modal Container */}
      <div 
        className="w-full max-w-2xl h-[600px] max-h-[90vh] bg-[#001E35]/95 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative"
        id="idol-coach-chat-modal"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-teal-500/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-white tracking-wide">Idol Coach</h3>
              <p className="text-xs text-teal-400 font-light flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Гар бөмбөгийн урам зоригт зөвлөх
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors duration-200"
            aria-label="Close Chat"
            id="close-idol-chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Key Input / Settings Overlay if editing or no key */}
          {(!apiKey || isEditingKey) ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-[#001322]/50">
              <form 
                onSubmit={handleSaveKey}
                className="w-full max-w-md p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-5 backdrop-blur-md"
                id="api-key-form"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-teal-500/10 rounded-full text-teal-400">
                    <Key className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-white">Gemini API Түлхүүр</h4>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    Энэ чат нь Google Gemini API ашиглан ажиллана. Өөрийн хувийн API түлхүүрийг оруулна уу. Түлхүүр зөвхөн таны хөтөчийн LocalStorage-д хадгалагдана.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="api-key-input" className="text-xs font-semibold text-neutral-300">
                    API Key:
                  </label>
                  <input
                    id="api-key-input"
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500/50 text-sm transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingKey(false);
                        setTempKey(apiKey);
                        setErrorMsg("");
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-all"
                    >
                      Цуцлах
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 text-sm font-semibold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                  >
                    Хадгалах ✦
                  </button>
                </div>
                
                <div className="text-[10px] text-center text-rose-300 bg-rose-950/20 py-2 px-3 rounded-lg border border-rose-900/30">
                  ⚠️ <strong>Аюулгүй байдлын санамж:</strong> Энэхүү API түлхүүр нь шууд хөтөч дээрээс ажиллах тул аюулгүй сүлжээ болон зөвхөн өөрийн хяналттай орчинд ашиглахыг зөвлөж байна.
                </div>
              </form>
            </div>
          ) : (
            // Chat Message Interface
            <>
              {/* API Status Top Bar */}
              <div className="px-6 py-2 bg-white/[0.01] border-b border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Gemini API Холбогдсон
                </span>
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="hover:text-white transition-colors duration-200 flex items-center gap-1"
                  id="edit-api-key"
                >
                  <Key className="w-3 h-3" />
                  Түлхүүр өөрчлөх
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-[#001322]/20">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                    } animate-fade-rise`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-neutral-800 text-white border border-white/10"
                          : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble */}
                    <div className="space-y-1">
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-white/5 text-white rounded-tr-none border border-white/5"
                            : "bg-teal-500/5 text-neutral-100 rounded-tl-none border border-teal-500/10"
                        }`}
                      >
                        {msg.text.split("\n").map((line, lIdx) => (
                          <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500 block px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-teal-500/5 text-neutral-400 rounded-tl-none border border-teal-500/10 flex items-center gap-1.5 text-xs">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      Idol Coach бодож байна...
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-2 text-rose-400 bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/15 text-xs max-w-[85%]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Алдаа гарлаа</p>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-3 items-center"
                id="idol-chat-input-form"
              >
                <input
                  type="text"
                  placeholder="Дасгалжуулагчаас асуух..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-950/60 border border-white/5 text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500/40 text-sm transition-all"
                  id="idol-chat-text-input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    inputValue.trim() && !isLoading
                      ? "bg-teal-500 hover:bg-teal-400 text-neutral-950 shadow-lg shadow-teal-500/15 cursor-pointer"
                      : "bg-white/5 text-neutral-500 cursor-not-allowed"
                  }`}
                  id="idol-chat-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
