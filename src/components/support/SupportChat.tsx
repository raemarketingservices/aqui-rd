import { useState } from "react";
import { FiSend, FiMessageCircle, FiHeadphones } from "react-icons/fi";
import toast from "react-hot-toast";

export default function SupportChat({
  userId,
  role,
  vendorId,
}: {
  userId: string;
  role: "ADMIN" | "VENDOR";
  vendorId?: string | null;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      // TODO: Implement actual chat API call
      toast.success("Mensaje enviado (funcionalidad pendiente)");
      setText("");
    } catch (e: any) {
      toast.error(e.message || "Error enviando mensaje");
    } finally {
      setSending(false);
    }
  };

  if (role === "VENDOR") {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-uniko-blue/10 rounded-lg flex items-center justify-center">
            <FiHeadphones size={20} className="text-uniko-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mensajes con Soporte</h2>
            <p className="text-sm text-uniko-blue/70">
              Comunicación directa con el equipo de UNIKO
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <FiMessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-uniko-blue/70 mb-4">
            Esta funcionalidad está en desarrollo. Próximamente podrás chatear directamente
            con el equipo de soporte de UNIKO.
          </p>
          <div className="flex gap-2 mt-3 justify-center">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent max-w-md"
              disabled
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="bg-uniko-blue hover:bg-[#002280] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
              disabled
            >
              <FiSend size={14} /> Enviar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-uniko-blue/10 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-uniko-blue/10">
        <div className="w-10 h-10 bg-uniko-blue rounded-lg flex items-center justify-center text-white">
          <FiMessageCircle size={20} />
        </div>
        <div>
          <h2 className="font-bold text-uniko-blue">Mensajes con Vendedores</h2>
          <p className="text-xs text-uniko-blue/70">Soporte interno vía chat</p>
        </div>
      </div>
      <div className="p-4 text-center">
        <FiMessageCircle size={36} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-uniko-blue/70">
          Esta funcionalidad está en desarrollo.
        </p>
      </div>
    </div>
  );
}