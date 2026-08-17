import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FiPackage } from "react-icons/fi";

const statusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-800", PAID: "bg-blue-100 text-blue-800", PROCESSING: "bg-purple-100 text-purple-800", SHIPPED: "bg-indigo-100 text-indigo-800", DELIVERED: "bg-green-100 text-green-800", CANCELLED: "bg-red-100 text-red-800" };
const statusLabels: Record<string, string> = { PENDING: "Pendiente", PAID: "Pagada", PROCESSING: "Procesando", SHIPPED: "Enviada", DELIVERED: "Entregada", CANCELLED: "Cancelada" };

export default function Orders() {
  const { user } = useAuth();
  const orders = useQuery(api.orders.getUserOrders, user ? { userId: user._id } : "skip");

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Órdenes</h1>
      {orders === undefined ? <p className="text-gray-500">Cargando...</p> : orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-bold mb-2">No tienes órdenes</h2>
          <Link to="/productos" className="btn-primary mt-4 inline-block">Comprar Ahora</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div><p className="font-semibold">{order.orderNumber}</p><p className="text-sm text-gray-500">{new Date(order._creationTime).toLocaleDateString("es-DO")}</p></div>
                <span className={`badge ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items?.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.product?.images?.[0] || "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">x{item.quantity}</p></div>
                    <p className="text-sm font-medium">RD${(item.subtotal / 100).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 border-t"><span className="font-bold">Total: RD${(order.totalAmount / 100).toLocaleString()}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
