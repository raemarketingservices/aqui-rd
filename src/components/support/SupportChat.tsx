import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { FiSend, FiMessageCircle, FiHeadphones } from "react-icons/fi";
import toast from "react-hot-toast";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportChat({
  userId,
  role,
  vendorId,
}: {
  userId: Id<"users">;
  role: "ADMIN" | "VENDOR";
  vendorId?: Id<"vendors"> | null;
}) {
  const [activeConvoId, setActiveConvoId] = useState<Id<"conversations"> | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(
    api.support.getConversationsAdmin,
    role === "ADMIN" ? { adminUserId: userId } : "skip"
  );
  const myConversation = useQuery(
    api.support.getConversation,
    role === "VENDOR" && vendorId ? { vendorId } : "skip"
  );
  const selectedMessages = useQuery(
    api.support.getConversationMessages,
    role === "ADMIN" && activeConvoId ? { conversationId: activeConvoId } : "skip"
  );
  const sendMessage = useMutation(api.support.sendMessage);

  const activeConversation =
    role === "VENDOR"
      ? (myConversation as any)
      : conversations?.find((c: any) => c._id === activeConvoId) || null;

  const messages = role === "ADMIN"
    ? ((selectedMessages as any[]) || [])
    : ((activeConversation?.messages as any[]) || []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res: any = await sendMessage({
        senderId: userId,
        conversationId:
          role === "ADMIN" && activeConvoId ? activeConvoId : undefined,
        vendorId:
          role === "VENDOR" ? (vendorId as Id<"vendors">) : undefined,
        text: text.trim(),
      });
      if (role === "ADMIN" && res?.conversationId && !activeConvoId) {
        setActiveConvoId(res.conversationId);
      }
      setText("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessages = (msgs: any[]) => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 rounded-lg max-h-80 min-h-64">
      {msgs.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <FiMessageCircle size={32} className="mb-2" />
          <p className="text-sm">Sin mensajes aún. Escribe para empezar la conversación.</p>
        </div>
      )}
      {msgs.map((m: any) => {
        const mine = m.senderId === userId;
        return (
          <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                mine
                  ? "bg-aqui-blue text-white rounded-br-md"
                  : "bg-white border border-gray-200 rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{m.text}</p>
              <p className={`text-[10px] mt-1 ${mine ? "text-blue-200" : "text-gray-400"}`}>
                {m.senderRole === "ADMIN" ? "Soporte" : "Vendedor"} · {formatTime(m.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );

  const renderComposer = () => (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Escribe un mensaje..."
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="bg-aqui-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
      >
        <FiSend size={14} /> Enviar
      </button>
    </div>
  );

  if (role === "VENDOR") {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-aqui-blue/10 rounded-lg flex items-center justify-center">
            <FiHeadphones size={20} className="text-aqui-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mensajes con Soporte</h2>
            <p className="text-sm text-gray-500">
              Comunicación directa con el equipo de AQUÍ
            </p>
          </div>
        </div>
        {!vendorId ? (
          <p className="text-sm text-gray-500">No tienes una tienda asociada.</p>
        ) : myConversation === undefined ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : (
          <>
            {renderMessages(messages)}
            {renderComposer()}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <FiMessageCircle size={20} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Mensajes con Vendedores</h2>
          <p className="text-xs text-gray-500">Soporte interno vía chat</p>
        </div>
      </div>
      <div className="grid md:grid-cols-[280px_1fr]">
        <div className="border-r border-gray-100 max-h-[420px] overflow-y-auto">
          {conversations === undefined ? (
            <div className="p-4 text-sm text-gray-400">Cargando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              No hay conversaciones aún.
            </div>
          ) : (
            conversations.map((c: any) => (
              <button
                key={c._id}
                onClick={() => setActiveConvoId(c._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition ${
                  activeConvoId === c._id ? "bg-blue-50 border-l-4 border-aqui-blue" : "border-l-4 border-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-aqui-blue text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                  {c.vendor?.logo ? (
                    <img src={c.vendor.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    c.vendor?.businessName?.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {c.vendor?.businessName || "Vendedor"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-4">
          {activeConvoId ? (
            <>
              {renderMessages(messages)}
              {renderComposer()}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <FiMessageCircle size={36} className="mb-2" />
              <p className="text-sm">Selecciona una conversación de la izquierda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}