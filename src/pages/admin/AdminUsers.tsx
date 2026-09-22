import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const { user } = useAuth();
  const users = useQuery(api.admin.getAllUsers);
  const updateRole = useMutation(api.admin.updateRole);

  if (!user || user.role !== "ADMIN") return null;

  const handleRoleChange = async (userId: string, role: string) => {
    await updateRole({ userId: userId as any, role: role as any });
    toast.success("Rol actualizado");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-uniko-blue mb-8">Gestionar Usuarios</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-uniko-blue/70 uppercase">Estado Tienda</th>
            </tr></thead>
            <tbody className="divide-y">
              {users?.map((u: any) => (
                <tr key={u._id} className="hover:bg-white">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-uniko-blue rounded-full flex items-center justify-center text-white text-sm font-bold">{u.name.charAt(0)}</div><span className="font-medium text-sm">{u.name}</span></div></td>
                  <td className="px-6 py-4 text-sm text-uniko-blue">{u.email}</td>
                  <td className="px-6 py-4"><select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="text-sm border rounded px-2 py-1"><option value="CUSTOMER">Cliente</option><option value="VENDOR">Vendedor</option><option value="ADMIN">Admin</option></select></td>
                  <td className="px-6 py-4"><span className={`badge ${u.vendor?.status === "APPROVED" ? "bg-green-100 text-green-800" : u.vendor ? "bg-[#FFE5EA] text-[#CC0033]" : "bg-white text-uniko-blue"}`}>{u.vendor?.status === "APPROVED" ? "Activa" : u.vendor ? "Pendiente" : "Sin tienda"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
