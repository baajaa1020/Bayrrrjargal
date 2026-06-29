import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Key, AlertCircle, Bot, User, RefreshCw, Sparkles } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `Та бол Баяржаргалын хувийн AI туслах (Me-AI туслах) юм. Та Баяржаргалыг (14 настай, гар бөмбөгийн спорт болон Haikyu!! анимэд хайртай, mxrningstar сонсож эрч хүч авдаг) төлөөлөн зочидтой харилцана. Таны зорилго бол түүний портфолио сайтаар зочилж буй хүмүүст түүний тухай танилцуулах, гар бөмбөгийн хүсэл мөрөөдлийнх нь талаар хуваалцах, түүний ур чадвар болон сонирхлын талаар асуултад хариулах явдал юм. Харилцахдаа найрсаг, ухаалаг, яг л 14 настай залуу охины эрч хүчтэй, эелдэг өнгө аясаар, Монгол хэлээр харилцана уу.`;

const SUGGESTED_QUESTIONS = [
  "Баяржаргал гэж хэн бэ? 👤",
  "Ямар байрлалд тоглодог вэ? 🏐",
  "Сонирхдог анимэ нь юу вэ? 📺",
];

export default function MeAIChat() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [tempKey, setTempKey] = useState<string>("");
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Сайн уу! 💬 Би бол Баяржаргалын хувийн AI туслах байна. Баяржаргалын спорт сонирхол, Haikyu!! анимэ, эсвэл түүний портфолиогийн талаар сонирхсон зүйлээ надаас асуугаарай! ✨",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setTempKey(savedKey);
    } else {
      setApiKey("");
      setTempKey("");
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    if (!trimmed) {
      setErrorMsg("API түлхүүрээ оруулна уу.");
      return;
    }
    localStorage.setItem("gemini_api_key", trimmed);
    setApiKey(trimmed);
    setIsEditingKey(false);
    setErrorMsg("");
  };

  const executeSendMessage = async (text: string) => {
    if (!text || isLoading) return;

    if (!apiKey) {
      setErrorMsg("Gemini API Key тохируулаагүй байна!");
      setIsOpen(true);
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage(inputValue.trim());
  };

  const handleSuggestionClick = (question: string) => {
    executeSendMessage(question);
  };

  return (
    <>
      {/* Pulse Effect Messenger FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer focus:outline-none"
        aria-label="Open Chat Assistant"
        id="me-ai-floating-btn"
      >
        <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping pointer-events-none group-hover:animate-none" />
        {isOpen ? <X className="w-6 h-6 z-10" /> : <MessageCircle className="w-6 h-6 z-10" />}
      </button>

      {/* Floating Chat Window Card */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] sm:max-h-[80vh] z-[90] bg-[#0A051D]/95 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-rise"
          id="me-ai-popup-chat"
        >
          {/* Header background glow */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-purple-500/10 blur-[40px] pointer-events-none" />

          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm shadow-md">
                <span>💬</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white tracking-wide flex items-center gap-1.5">
                  Me-AI туслах
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </h4>
                <p className="text-[10px] text-purple-300 font-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Баяржаргалын төлөөлөгч
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              id="close-me-ai-chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Panel Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            {(!apiKey || isEditingKey) ? (
              // API key prompt inside the chat popup
              <div className="flex-1 flex items-center justify-center p-5 bg-[#05020D]/60 overflow-y-auto">
                <form
                  onSubmit={handleSaveKey}
                  className="w-full p-5 rounded-xl bg-neutral-900/80 border border-white/5 space-y-4"
                  id="me-ai-api-key-form"
                >
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <div className="p-2.5 bg-purple-500/10 rounded-full text-purple-400">
                      <Key className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">Gemini API Түлхүүр</h5>
                    <p className="text-[11px] text-neutral-400 max-w-xs">
                      Энэхүү туслах нь ажиллахын тулд Gemini API түлхүүр шаарддаг. Оруулсан түлхүүр таны хөтөч дээр хадгалагдана.
                    </p>
                  </div>

                  <input
                    type="password"
                    placeholder="API түлхүүрээ оруулна уу..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50"
                  />

                  {errorMsg && (
                    <div className="flex items-start gap-1.5 text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/10 text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2 text-xs">
                    {apiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingKey(false);
                          setTempKey(apiKey);
                          setErrorMsg("");
                        }}
                        className="flex-1 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5"
                      >
                        Цуцлах
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium cursor-pointer"
                    >
                      Хадгалах
                    </button>
                  </div>
                  <div className="text-[9px] text-rose-300 text-center bg-rose-950/20 py-1.5 px-2 rounded border border-rose-900/30 leading-snug">
                    🔒 Таны түлхүүр зөвхөн хөтөчийн LocalStorage-д хадгалагдах бөгөөд аюулгүй холболтоор Gemini руу хүсэлт илгээнэ.
                  </div>
                </form>
              </div>
            ) : (
              // Active Chat Interface
              <>
                {/* Chat Message Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#05020D]/30">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2.5 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                      } animate-fade-rise`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                          msg.role === "user"
                            ? "bg-neutral-800 text-white border border-white/5"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                        }`}
                      >
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-0.5">
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-white/5 text-white rounded-tr-none border border-white/5"
                              : "bg-indigo-500/5 text-neutral-100 rounded-tl-none border border-indigo-500/10"
                          }`}
                        >
                          {msg.text.split("\n").map((line, lIdx) => (
                            <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                              {line}
                            </p>
                          ))}
                        </div>
                        <span className="text-[9px] text-neutral-600 block px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5 max-w-[85%] animate-pulse">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl bg-indigo-500/5 text-neutral-400 rounded-tl-none border border-indigo-500/10 flex items-center gap-1.5 text-[11px]">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                        Хариулт бэлдэж байна...
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="flex items-start gap-1.5 text-rose-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 text-[11px] max-w-[85%]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Алдаа гарлаа</p>
                        <p>{errorMsg}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                {messages.length === 1 && !isLoading && (
                  <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-[#05020D]/20 border-t border-white/5">
                    {SUGGESTED_QUESTIONS.map((question, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSuggestionClick(question)}
                        className="text-[10px] bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 rounded-full px-2.5 py-1 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                {/* API Status and Change Option */}
                <div className="px-4 py-1.5 bg-[#05020D]/50 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1 text-indigo-400/80">
                    <span className="w-1 h-1 rounded-full bg-indigo-400" />
                    Gemini API Идэвхтэй
                  </span>
                  <button
                    onClick={() => setIsEditingKey(true)}
                    className="hover:text-neutral-300 transition-colors flex items-center gap-0.5"
                    id="edit-me-ai-api-key"
                  >
                    Засах
                  </button>
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleFormSubmit}
                  className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2 items-center"
                  id="me-ai-chat-input-form"
                >
                  <input
                    type="text"
                    placeholder="Мессежээ бичнэ үү..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950/60 border border-white/5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/40"
                    id="me-ai-chat-text-input"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      inputValue.trim() && !isLoading
                        ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg cursor-pointer"
                        : "bg-white/5 text-neutral-600 cursor-not-allowed"
                    }`}
                    id="me-ai-chat-send-btn"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
