import { useState, useEffect, useRef } from "react";
import { supabaseApi } from "../services/supabaseApi";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

function matchFaq(userMessage: string, faqs: { question: string; answer: string }[]): string | null {
  const msg = userMessage.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const faq of faqs) {
    const q = faq.question.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const matches = words.filter((w) => msg.includes(w));
    if (matches.length >= Math.ceil(words.length * 0.5)) {
      return faq.answer;
    }
  }
  return null;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatbotConfig, setChatbotConfig] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Load chatbot config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await supabaseApi.chat.send("init", "init");
        setChatbotConfig(config);
      } catch (error) {
        console.error("Error loading chatbot config:", error);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (chatbotConfig && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          text: chatbotConfig.welcomeMessage || "¡Hola! Soy UNIKO, tu asistente virtual. ¿En qué puedo ayudarte?",
          isBot: true,
        },
      ]);
    }
  }, [chatbotConfig]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: nextId.current++, text: input.trim(), isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    const userText = input.trim();
    setInput("");

    setTimeout(async () => {
      let botReply: string;
      try {
        const response = await supabaseApi.chat.send(userText);
        botReply = response.reply || "No tengo esa información, pero puedes contactarnos por WhatsApp para más ayuda.";
      } catch (error) {
        botReply = "No tengo esa información, pero puedes contactarnos por WhatsApp para más ayuda.";
      }
      setMessages((prev) => [...prev, { id: nextId.current++, text: botReply, isBot: true }]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white hover:bg-white rounded-full shadow-lg shadow-gray-300/40 flex items-center justify-center transition-all duration-200 hover:scale-105 overflow-hidden border border-uniko-blue/20"
        aria-label="Abrir chat"
      >
        {isOpen ? <FiX size={24} className="text-[#0033A0]" /> : <img src="/logo-uniko.png" alt="Chat" className="w-10 h-10 object-contain" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-uniko-blue/20 flex flex-col overflow-hidden" style={{ height: "min(500px, 75vh)" }}>
          {/* Header */}
          <div className="bg-[#0033A0] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <img src="/logo-uniko-white.png" alt="UNIKO" className="h-8 w-auto object-contain" />
            <div>
              <h3 className="text-white font-semibold text-sm">UNIKO RD</h3>
              <p className="text-gray-300 text-xs">Asistente virtual</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isBot
                      ? "bg-[#0033A0] text-white rounded-bl-sm"
                      : "bg-[#CC0033] text-white rounded-br-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-uniko-blue/20 flex items-center gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm text-uniko-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/30"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#CC0033] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}