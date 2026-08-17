import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const data = useQuery(api.admin.getDashboard);
  const updateVendorStatus = useMutation(api.admin.updateVendorStatus);

  if (!user || user.role !== "ADMIN") return null;

  const handleVendorAction = async (vendorId: string, status: string) => {
    await updateVendorStatus({ vendorId: vendorId as any, status: status as any });
    toast.success(status === "APPROVED" ? "Vendedor aprobado" : "Vendedor rechazado");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Usuarios", value: data.stats.totalUsers, color: "bg-blue-500" },
              { label: "Vendedores", value: data.stats.totalVendors, color: "bg-green-500" },
              { label: "Productos", value: data.stats.totalProducts, color: "bg-purple-500" },
              { label: "Ingresos", value: `RD$${(data.stats.totalRevenue / 100).toLocaleString()}`, color: "bg-aqui-orange" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6"><p className="text-sm text-gray-500">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Vendedores Pendientes</h2>
              {data.stats.pendingVendors === 0 ? <p className="text-gray-500 text-center py-4">No hay pendientes</p> : <p className="text-center py-4">{data.stats.pendingVendors} pendientes de revisión</p>}
              <div className="mt-4">
                <a href="/admin/vendedores" className="text-aqui-blue hover:underline">Ver todos los vendedores →</a>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Últimas Órdenes</h2>
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><p className="font-medium text-sm">{order.orderNumber}</p></div>
                    <div className="text-right"><p className="font-medium text-sm">RD${(order.totalAmount / 100).toLocaleString()}</p><span className={`badge text-xs ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{order.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <a href="/admin/usuarios" className="btn-primary">Gestionar Usuarios</a>
            <a href="/admin/vendedores" className="btn-secondary">Gestionar Vendedores</a>
          </div>
        </>
      )}
    </div>
  );
}
