import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";

export default function AdminVendors() {
  const { user } = useAuth();
  const vendors = useQuery(api.admin.getAllVendors);
  const updateStatus = useMutation(api.admin.updateVendorStatus);

  if (!user || user.role !== "ADMIN") return null;

  const handleStatus = async (vendorId: string, status: string) => {
    await updateStatus({ vendorId: vendorId as any, status: status as any });
    toast.success(status === "APPROVED" ? "Aprobado" : "Rechazado");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestionar Vendedores</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tienda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {vendors?.map((v: any) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-aqui-orange rounded-full flex items-center justify-center text-white font-bold overflow-hidden">{v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : v.businessName.charAt(0)}</div><div><p className="font-medium text-sm">{v.businessName}</p><p className="text-xs text-gray-500">/{v.slug}</p></div></div></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.user?.name}</td>
                  <td className="px-6 py-4 text-sm">{v.productCount}</td>
                  <td className="px-6 py-4"><span className={`badge ${v.status === "APPROVED" ? "bg-green-100 text-green-800" : v.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}</span></td>
                  <td className="px-6 py-4 text-right">{v.status === "PENDING" && (<div className="flex items-center justify-end gap-2"><button onClick={() => handleStatus(v._id, "APPROVED")} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><FiCheck size={16} /></button><button onClick={() => handleStatus(v._id, "REJECTED")} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiX size={16} /></button></div>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
