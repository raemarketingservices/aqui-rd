import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiCreditCard,
  FiUser,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
  PENDING: { bg: "bg-[#FFE5EA]", text: "text-[#CC0033]", label: "Pendiente", icon: <FiClock size={14} /> },
  PAID: { bg: "bg-blue-100", text: "text-blue-800", label: "Pagada", icon: <FiCheckCircle size={14} /> },
  PROCESSING: { bg: "bg-[#FFE5EA]", text: "text-[#CC0033]", label: "Procesando", icon: <FiLoader size={14} /> },
  SHIPPED: { bg: "bg-purple-100", text: "text-purple-800", label: "Enviada", icon: <FiTruck size={14} /> },
  DELIVERED: { bg: "bg-green-100", text: "text-green-800", label: "Entregada", icon: <FiCheckCircle size={14} /> },
  CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada", icon: <FiXCircle size={14} /> },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const orders = useQuery(
    api.orders.getUserOrders,
    user ? { userId: user._id } : "skip"
  );

  if (!user || user.role !== "CUSTOMER") return null;

  const orderList = (orders as any[]) || [];
  const totalOrders = orderList.length;
  const totalSpent = orderList.reduce(
    (sum: number, o: any) => sum + (o.status !== "CANCELLED" ? o.totalAmount : 0),
    0
  );
  const recentOrders = orderList.slice(0, 5);

  const statCards = [
    {
      icon: <FiShoppingBag size={22} />,
      label: "Mis Órdenes",
      value: totalOrders,
      color: "bg-[#1B4B8A]",
    },
    {
      icon: <FiDollarSign size={22} />,
      label: "Total Gastado",
      value: `RD$${(totalSpent / 100).toLocaleString()}`,
      color: "bg-[#FF6B35]",
    },
    {
      icon: <FiShoppingCart size={22} />,
      label: "En el Carrito",
      value: "—",
      color: "bg-[#28A745]",
    },
  ];

  const quickActions = [
    { label: "Seguir comprando", to: "/productos", icon: <FiShoppingBag size={18} />, color: "bg-[#FF6B35] hover:bg-uniko-red" },
    { label: "Ver carrito", to: "/carrito", icon: <FiShoppingCart size={18} />, color: "bg-[#1B4B8A] hover:bg-[#002280]" },
    { label: "Ver todas mis órdenes", to: "/mis-ordenes", icon: <FiPackage size={18} />, color: "bg-[#0F2A4A] hover:bg-[#0A1929]" },
    { label: "Mi perfil", to: "/perfil", icon: <FiUser size={18} />, color: "bg-[#28A745] hover:bg-green-700" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="bg-[#0F2A4A] rounded-2xl p-6 sm:p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FF6B35] flex items-center justify-center text-xl font-bold shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Bienvenido, {user.name}</h1>
            <p className="text-blue-200 text-sm mt-1">{user.email}</p>
            {user.phone && <p className="text-blue-200 text-sm">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-uniko-blue/70">{stat.label}</p>
              <p className="text-2xl font-bold text-uniko-blue">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-uniko-blue">Órdenes Recientes</h2>
            <Link
              to="/mis-ordenes"
              className="text-sm text-[#1B4B8A] hover:underline font-medium flex items-center gap-1"
            >
              Ver todas <FiArrowRight size={14} />
            </Link>
          </div>

          {orderList.length === 0 ? (
            <div className="text-center py-10">
              <FiPackage size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-uniko-blue/70 mb-3">Aún no tienes órdenes</p>
              <Link
                to="/productos"
                className="inline-block bg-[#FF6B35] hover:bg-uniko-red text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                Comprar Ahora
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => {
                const st = statusConfig[order.status] || statusConfig.PENDING;
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-white transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-uniko-blue">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-uniko-blue/70 mt-0.5">
                        {new Date(order._creationTime).toLocaleDateString("es-DO")} ·{" "}
                        {order.items?.length || 0} artículo(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}
                      >
                        {st.icon}
                        {st.label}
                      </span>
                      <p className="font-bold text-sm text-uniko-blue whitespace-nowrap">
                        RD${(order.totalAmount / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Payment Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-uniko-blue mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className={`flex items-center gap-3 w-full text-white font-medium px-4 py-3 rounded-lg transition-colors ${action.color}`}
                >
                  {action.icon}
                  {action.label}
                  <FiArrowRight size={14} className="ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiCreditCard size={18} className="text-[#FF6B35]" />
              <h2 className="text-lg font-bold text-uniko-blue">Métodos de Pago</h2>
            </div>
            <div className="border-2 border-dashed border-uniko-blue/20 rounded-lg p-6 text-center">
              <FiCreditCard size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-uniko-blue/70">
                No hay métodos de pago guardados
              </p>
              <p className="text-xs text-white/80 mt-1">
                Los métodos de pago se agregan al realizar una compra
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
