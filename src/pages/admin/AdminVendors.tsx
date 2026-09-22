import { useAuth } from "../../hooks/useAuth";
import { supabaseApi } from "../../services/supabaseApi";
import { useApiQuery } from "../../hooks/useApiQuery";
import toast from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";

export default function AdminVendors() {
  const { user } = useAuth();
  const { data: res, refetch } = useApiQuery(() => supabaseApi.admin.getAllVendors());
  const vendors = res?.vendors || [];

  if (!user || user.role !== "ADMIN") return null;

  const handleStatus = async (vendorId: string, status: string) => {
    await supabaseApi.admin.updateVendorStatus(vendorId, status);
    toast.success(status === "APPROVED" ? "Aprobado" : "Rechazado");
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-uniko-blue mb-8">Gestionar Vendedores</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Tienda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Propietario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Productos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-uniko-blue/70 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {vendors?.map((v: any) => (
                <tr key={v.id || v._id} className="hover:bg-white">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-uniko-red rounded-full flex items-center justify-center text-white font-bold overflow-hidden">{v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : v.businessName?.charAt(0)}</div><div><p className="font-medium text-sm">{v.businessName}</p><p className="text-xs text-uniko-blue/70">/{v.slug}</p></div></div></td>
                  <td className="px-6 py-4 text-sm text-uniko-blue">{v.user?.name}</td>
                  <td className="px-6 py-4 text-sm">{v.productCount || 0}</td>
                  <td className="px-6 py-4"><span className={`badge ${v.status === "APPROVED" ? "bg-green-100 text-green-800" : v.status === "PENDING" ? "bg-[#FFE5EA] text-[#CC0033]" : "bg-red-100 text-red-800"}`}>{v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}</span></td>
                  <td className="px-6 py-4 text-right">{v.status === "PENDING" && (<div className="flex items-center justify-end gap-2"><button onClick={() => handleStatus(v.id || v._id, "APPROVED")} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><FiCheck size={16} /></button><button onClick={() => handleStatus(v.id || v._id, "REJECTED")} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiX size={16} /></button></div>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}