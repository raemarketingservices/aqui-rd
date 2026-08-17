import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, userId } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useMutation(api.users.changePassword);
  const vendorUpdate = useMutation(api.vendors.update);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [bizName, setBizName] = useState(user?.vendor?.businessName || "");
  const [bizDesc, setBizDesc] = useState(user?.vendor?.description || "");
  const [bizLogo, setBizLogo] = useState(user?.vendor?.logo || "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await updateProfile({ userId: user._id, name, phone, avatar }); toast.success("Perfil actualizado"); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await changePassword({ userId: user._id, currentPassword: currentPass, newPassword: newPass }); toast.success("Contraseña actualizada"); setCurrentPass(""); setNewPass(""); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleVendor = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await vendorUpdate({ userId: user._id, businessName: bizName, description: bizDesc, logo: bizLogo }); toast.success("Tienda actualizada"); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[{ id: "profile", label: "Perfil" }, { id: "password", label: "Contraseña" }, ...(user.role === "VENDOR" ? [{ id: "vendor", label: "Mi Tienda" }] : [])].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === tab.id ? "bg-aqui-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tab.label}</button>
        ))}
      </div>
      {activeTab === "profile" && (
        <form onSubmit={handleProfile} className="bg-white rounded-xl shadow-md p-6 space-y-4 max-w-lg">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">URL Avatar</label><input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="input-field" placeholder="https://..." /></div>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Guardando..." : "Guardar"}</button>
        </form>
      )}
      {activeTab === "password" && (
        <form onSubmit={handlePassword} className="bg-white rounded-xl shadow-md p-6 space-y-4 max-w-lg">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label><input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="input-field" minLength={6} required /></div>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Cambiando..." : "Cambiar Contraseña"}</button>
        </form>
      )}
      {activeTab === "vendor" && user.role === "VENDOR" && (
        <form onSubmit={handleVendor} className="bg-white rounded-xl shadow-md p-6 space-y-4 max-w-lg">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label><input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} className="input-field" rows={3} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label><input type="url" value={bizLogo} onChange={(e) => setBizLogo(e.target.value)} className="input-field" placeholder="https://..." /></div>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Guardando..." : "Guardar Tienda"}</button>
        </form>
      )}
    </div>
  );
}
