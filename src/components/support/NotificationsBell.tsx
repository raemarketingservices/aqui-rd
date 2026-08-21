import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FiBell, FiCheck, FiMessageSquare, FiLifeBuoy, FiX } from "react-icons/fi";
import { Id } from "../../../convex/_generated/dataModel";

const TYPE_ICON: Record<string, any> = {
  chat: { icon: <FiMessageSquare size={16} />, color: "bg-blue-100 text-blue-600" },
  ticket: { icon: <FiLifeBuoy size={16} />, color: "bg-orange-100 text-orange-600" },
};

export default function NotificationsBell({
  userId,
  variant = "floating",
}: {
  userId?: Id<"users"> | string | null;
  variant?: "floating" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useQuery(
    api.support.getNotifications,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );
  const markRead = useMutation(api.support.markNotificationsRead);

  const unread = notifications?.filter((n: any) => !n.read)?.length || 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unread > 0 && userId) {
      markRead({ userId: userId as Id<"users"> }).catch(() => {});
    }
  };

  const containerClass =
    variant === "floating"
      ? "fixed top-20 right-4 z-50"
      : "relative";

  return (
    <div className={containerClass} ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
        title="Notificaciones"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
            {unread > 0 && (
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {unread} nuevas
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!userId ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <FiBell size={28} className="mx-auto text-gray-300 mb-2" />
                Inicia sesión como administrador en la página principal para
                recibir notificaciones.
              </div>
            ) : notifications === undefined ? (
              <div className="p-6 text-center text-sm text-gray-400">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <FiBell size={28} className="mx-auto text-gray-300 mb-2" />
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((n: any) => {
                const style = TYPE_ICON[n.type] || TYPE_ICON.ticket;
                return (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition ${
                      !n.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.color}`}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("es-DO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          {notifications && notifications.length > 0 && (
            <button
              onClick={() => userId && markRead({ userId: userId as Id<"users"> }).catch(() => {})}
              className="w-full py-2.5 text-xs font-semibold text-aqui-blue hover:bg-blue-50 flex items-center justify-center gap-1.5 transition"
            >
              <FiCheck size={14} /> Marcar todas como leídas
            </button>
          )}
        </div>
      )}
    </div>
  );
}