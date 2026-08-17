import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

function matchFaq(userMessage: string, faqs: { question: string; answer: string }[]): string | null {
  const msg = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const faq of faqs) {
    const q = faq.question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  const chatbotConfig = useQuery(api.chatbot.getConfig);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (chatbotConfig && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          text: chatbotConfig.welcomeMessage || "¡Hola! Soy AQUÍ, tu asistente virtual. ¿En qué puedo ayudarte?",
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

    setTimeout(() => {
      let botReply: string;
      if (chatbotConfig?.faqs && chatbotConfig.faqs.length > 0) {
        const matched = matchFaq(userText, chatbotConfig.faqs);
        if (matched) {
          botReply = matched;
        } else {
          botReply = "No tengo esa información, pero puedes contactarnos por WhatsApp para más ayuda.";
        }
      } else {
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white hover:bg-gray-100 rounded-full shadow-lg shadow-gray-300/40 flex items-center justify-center transition-all duration-200 hover:scale-105 overflow-hidden border border-gray-200"
        aria-label="Abrir chat"
      >
        {isOpen ? <FiX size={24} className="text-[#0F2A4A]" /> : <img src="/chatbot-icon.png" alt="Chat" className="w-10 h-10 object-contain" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: "min(500px, 75vh)" }}>
          {/* Header */}
          <div className="bg-[#0F2A4A] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <img src="/logo-aqui-blanco.png" alt="AQUÍ" className="h-8 w-auto" />
            <div>
              <h3 className="text-white font-semibold text-sm">AQUÍ RD</h3>
              <p className="text-gray-400 text-xs">Asistente virtual</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isBot
                      ? "bg-[#0F2A4A] text-white rounded-bl-sm"
                      : "bg-[#FF6B35] text-white rounded-br-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-200 flex items-center gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/30"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#FF6B35] hover:bg-[#E85A28] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
