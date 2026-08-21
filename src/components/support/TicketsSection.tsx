import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  FiLifeBuoy,
  FiPlus,
  FiSend,
  FiChevronLeft,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  PENDING: {
    label: "Pendiente",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-400",
  },
  IN_PROGRESS: {
    label: "En Proceso",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completado",
    badge: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsSection({
  userId,
  role,
  vendorId,
  vendorName,
}: {
  userId: Id<"users">;
  role: "ADMIN" | "VENDOR";
  vendorId?: Id<"vendors"> | null;
  vendorName?: string;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"tickets"> | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const tickets = useQuery(api.support.getTickets, { userId });
  const createTicket = useMutation(api.support.createTicket);
  const updateStatus = useMutation(api.support.updateTicketStatus);
  const addComment = useMutation(api.support.addTicketComment);

  const list = (tickets as any[]) || [];
  const filtered = statusFilter === "ALL" ? list : list.filter((t) => t.status === statusFilter);
  const selected = list.find((t) => t._id === selectedId) || null;

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error("Completa el asunto y la descripción");
      return;
    }
    try {
      await createTicket({ userId, subject: subject.trim(), description: description.trim() });
      toast.success("Ticket creado. El soporte te responderá pronto.");
      setCreating(false);
      setSubject("");
      setDescription("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    try {
      await updateStatus({ ticketId: selected._id, userId, status: status as any });
      toast.success("Estado actualizado");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleComment = async () => {
    if (!selected || !comment.trim()) return;
    try {
      await addComment({ ticketId: selected._id, senderId: userId, text: comment.trim() });
      setComment("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  if (selected) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-9 h-9 rounded-lg flex items-center justify-center transition"
            >
              <FiChevronLeft size={18} />
            </button>
            <div>
              <h2 className="font-bold text-gray-900">{selected.subject}</h2>
              <p className="text-xs text-gray-500">
                Ticket #{selected._id.slice(-6).toUpperCase()} · {selected.vendorName} ·{" "}
                {formatDate(selected.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge(selected.status)}
            {role === "ADMIN" && (
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              >
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En Proceso</option>
                <option value="COMPLETED">Completado</option>
              </select>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900">
              Comentarios ({selected.comments?.length || 0})
            </h3>
            {selected.comments?.length === 0 && (
              <p className="text-sm text-gray-400">Sin comentarios aún.</p>
            )}
            {selected.comments?.map((c: any) => (
              <div
                key={c._id}
                className={`rounded-xl p-3.5 ${
                  c.senderRole === "ADMIN"
                    ? "bg-blue-50 border border-blue-100"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-gray-800">
                    {c.senderRole === "ADMIN" ? "🛠️ Soporte Técnico" : c.senderName}
                  </p>
                  <span className="text-[10px] text-gray-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Escribe un comentario..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim()}
              className="bg-aqui-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <FiSend size={14} /> Comentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <FiLifeBuoy size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">
              {role === "ADMIN" ? "Soporte Técnico" : "Tickets de Soporte"}
            </h2>
            <p className="text-xs text-gray-500">
              {role === "ADMIN"
                ? "Gestiona los problemas reportados por los vendedores"
                : "Reporta problemas y recibe ayuda del equipo de AQUÍ"}
            </p>
          </div>
        </div>
        {role === "VENDOR" && (
          <button
            onClick={() => setCreating(!creating)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPlus size={15} /> Nuevo Ticket
          </button>
        )}
      </div>

      {creating && (
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Crear nuevo ticket</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto: ej. No puedo subir fotos a mis productos"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu problema con detalle..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-aqui-blue hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Enviar Ticket
              </button>
              <button
                onClick={() => setCreating(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-3 flex gap-2 border-b border-gray-100 overflow-x-auto">
        {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              statusFilter === s
                ? "bg-aqui-dark text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "ALL"
              ? `Todos (${list.length})`
              : `${STATUS_CONFIG[s].label} (${list.filter((t) => t.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {tickets === undefined ? (
          <div className="p-8 text-center text-sm text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FiLifeBuoy size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {role === "VENDOR"
                ? "No tienes tickets. Si tienes un problema, crea uno y el soporte te ayudará."
                : "No hay tickets con este estado."}
            </p>
            {role === "VENDOR" && (
              <button
                onClick={() => setCreating(true)}
                className="mt-4 text-orange-500 hover:underline text-sm font-medium"
              >
                Crear tu primer ticket
              </button>
            )}
          </div>
        ) : (
          filtered.map((t: any) => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className="w-full px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition text-left flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-gray-400">
                    #{t._id.slice(-6).toUpperCase()}
                  </span>
                  {role === "ADMIN" && (
                    <span className="text-xs font-semibold text-aqui-blue">{t.vendorName}</span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{t.subject}</p>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{t.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <FiClock size={11} /> {formatDate(t.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <FiCheckCircle size={11} /> {t.comments?.length || 0} comentarios
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {statusBadge(t.status)}
                {t.status === "PENDING" && (
                  <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium">
                    <FiAlertCircle size={11} /> Sin atender
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}