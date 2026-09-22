import { useState } from "react";
import { supabaseApi } from "../../services/supabaseApi";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiDollarSign,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiExternalLink,
  FiCreditCard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import SupportChat from "../../components/support/SupportChat";
import TicketsSection from "../../components/support/TicketsSection";
import NotificationsBell from "../../components/support/NotificationsBell";
import VendorFacebookImport from "../../components/vendor/VendorFacebookImport";

export default function VendorDashboard() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || user?.vendor?.id;

  const { data: vendor, refetch: refetchVendor } = useApiQuery(
    () => supabaseApi.stores.get(vendorId || ""),
    [vendorId]
  );
  const { data: productsRes, refetch: refetchProducts } = useApiQuery(
    () => supabaseApi.vendor.getProducts(vendorId || ""),
    [vendorId]
  );

  const productList = productsRes?.products || [];
  const [stockLoadingId, setStockLoadingId] = useState<string | null>(null);

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    banco: "",
    cuenta: "",
    tipoCuenta: "Ahorro",
    telefonoPagos: "",
    paypalEmail: "",
    linkPago: "",
  });
  const [infoForm, setInfoForm] = useState({
    businessName: "",
    description: "",
    logo: "",
  });
  const [socialsForm, setSocialsForm] = useState({
    whatsapp: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    youtube: "",
  });

  if (!user || user.role !== "VENDOR") return null;

  const vendorData = vendor as any;
  const totalSales =
    vendorData?.totalSales ||
    productList.reduce((sum: number, p: any) => sum + (p.sales_count || p.salesCount || 0), 0);

  const startEditInfo = () => {
    setInfoForm({
      businessName: vendorData?.businessName || "",
      description: vendorData?.description || "",
      logo: vendorData?.logo || "",
    });
    setEditingInfo(true);
  };

  const saveInfo = async () => {
    if (!vendorId) return;
    try {
      await supabaseApi.vendor.update({
        vendorId,
        businessName: infoForm.businessName || undefined,
        description: infoForm.description || undefined,
        logo: infoForm.logo || undefined,
      });
      toast.success("Información actualizada");
      setEditingInfo(false);
      refetchVendor();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const startEditSocials = () => {
    setSocialsForm({
      whatsapp: vendorData?.whatsapp || "",
      instagram: vendorData?.socials?.instagram || "",
      facebook: vendorData?.socials?.facebook || "",
      twitter: vendorData?.socials?.twitter || "",
      tiktok: vendorData?.socials?.tiktok || "",
      youtube: vendorData?.socials?.youtube || "",
    });
    setEditingSocials(true);
  };

  const saveSocials = async () => {
    if (!vendorId) return;
    try {
      await supabaseApi.vendor.update({
        vendorId,
        whatsapp: socialsForm.whatsapp || undefined,
        socials: {
          instagram: socialsForm.instagram || undefined,
          facebook: socialsForm.facebook || undefined,
          twitter: socialsForm.twitter || undefined,
          tiktok: socialsForm.tiktok || undefined,
          youtube: socialsForm.youtube || undefined,
        },
      } as any);
      toast.success("Redes sociales actualizadas");
      setEditingSocials(false);
      refetchVendor();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const startEditPayment = () => {
    setPaymentForm({
      banco: vendorData?.paymentMethods?.banco || "",
      cuenta: vendorData?.paymentMethods?.cuenta || "",
      tipoCuenta: vendorData?.paymentMethods?.tipoCuenta || "Ahorro",
      telefonoPagos: vendorData?.paymentMethods?.telefonoPagos || "",
      paypalEmail: vendorData?.paymentMethods?.paypalEmail || "",
      linkPago: vendorData?.paymentMethods?.linkPago || "",
    });
    setEditingPayment(true);
  };

  const savePayment = async () => {
    if (!vendorId) return;
    try {
      await supabaseApi.vendor.update({
        vendorId,
        paymentMethods: { ...paymentForm },
      });
      toast.success("Métodos de pago guardados");
      setEditingPayment(false);
      refetchVendor();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await supabaseApi.products.delete(productId);
      toast.success("Producto eliminado");
      refetchProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStockChange = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setStockLoadingId(productId);
    try {
      await supabaseApi.products.update(productId, { stock: newStock });
      toast.success(`Stock actualizado a ${newStock}`);
      refetchProducts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStockLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NotificationsBell userId={user.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-uniko-blue">Dashboard</h1>
          <p className="text-uniko-blue/70">
            Bienvenido, {vendorData?.businessName || user.name}
          </p>
        </div>
        <Link
          to="/vendor/nuevo-producto"
          className="bg-uniko-red hover:bg-uniko-red text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-center"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: <FiPackage size={22} />,
            label: "Productos",
            value: productList.length,
            color: "bg-uniko-blue",
          },
          {
            icon: <FiDollarSign size={22} />,
            label: "Ventas Totales",
            value: `$${(totalSales / 100).toLocaleString()}`,
            color: "bg-green-600",
          },
          {
            icon: <FiStar size={22} />,
            label: "Rating",
            value: vendorData?.rating?.toFixed(1) || "0.0",
            color: "bg-purple-500",
          },
        ].map((stat, i) => (
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
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Mi Negocio</h2>
            {!editingInfo && (
              <button
                onClick={startEditInfo}
                className="text-uniko-blue hover:text-[#002280] text-sm font-medium"
              >
                Editar
              </button>
            )}
          </div>

          {editingInfo ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={infoForm.businessName}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, businessName: e.target.value })
                  }
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  Descripción
                </label>
                <textarea
                  value={infoForm.description}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  Logo (URL)
                </label>
                <input
                  type="url"
                  value={infoForm.logo}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, logo: e.target.value })
                  }
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveInfo}
                  className="bg-uniko-blue hover:bg-[#002280] text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingInfo(false)}
                  className="text-uniko-blue/70 hover:text-uniko-blue text-sm font-medium px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {vendorData?.logo && (
                <img
                  src={vendorData.logo}
                  alt={vendorData.businessName}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              )}
              <div>
                <p className="text-xs text-uniko-blue/70 uppercase tracking-wide">
                  Nombre
                </p>
                <p className="font-medium">{vendorData?.businessName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-uniko-blue/70 uppercase tracking-wide">
                  Descripción
                </p>
                <p className="text-sm text-uniko-blue">
                  {vendorData?.description || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Redes Sociales</h2>
            {!editingSocials && (
              <button
                onClick={startEditSocials}
                className="text-uniko-blue hover:text-[#002280] text-sm font-medium"
              >
                Editar
              </button>
            )}
          </div>

          {editingSocials ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={socialsForm.whatsapp}
                  onChange={(e) =>
                    setSocialsForm({ ...socialsForm, whatsapp: e.target.value })
                  }
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                  placeholder="809-555-0000"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={socialsForm.instagram}
                    onChange={(e) =>
                      setSocialsForm({
                        ...socialsForm,
                        instagram: e.target.value,
                      })
                    }
                    className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                    placeholder="https://instagram.com/tu-tienda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={socialsForm.facebook}
                    onChange={(e) =>
                      setSocialsForm({
                        ...socialsForm,
                        facebook: e.target.value,
                      })
                    }
                    className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                    placeholder="https://facebook.com/tu-pagina"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveSocials}
                  className="bg-uniko-blue hover:bg-[#002280] text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingSocials(false)}
                  className="text-uniko-blue/70 hover:text-uniko-blue text-sm font-medium px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {vendorData?.whatsapp && (
                <div className="flex items-center gap-2 text-uniko-blue">
                  <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                    W
                  </span>
                  <span className="text-sm">{vendorData.whatsapp}</span>
                </div>
              )}
              {vendorData?.socials?.instagram && (
                <a
                  href={vendorData.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-uniko-blue hover:text-pink-600 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                    <FiInstagram size={16} />
                  </span>
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {vendorData?.socials?.facebook && (
                <a
                  href={vendorData.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-uniko-blue hover:text-[#002280] transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiFacebook size={16} />
                  </span>
                  <span className="text-sm">Facebook</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiCreditCard size={20} /> Métodos de Pago y Cuentas Bancarias
          </h2>
          {!editingPayment && (
            <button
              onClick={startEditPayment}
              className="text-uniko-blue hover:text-[#002280] text-sm font-medium"
            >
              Editar
            </button>
          )}
        </div>

        {editingPayment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  Banco principal
                </label>
                <input
                  type="text"
                  value={paymentForm.banco}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, banco: e.target.value })
                  }
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                  placeholder="BanReservas, BHD, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">
                  Número de cuenta bancaria
                </label>
                <input
                  type="text"
                  value={paymentForm.cuenta}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, cuenta: e.target.value })
                  }
                  className="w-full border border-uniko-blue/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                  placeholder="000-000000-00"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={savePayment}
                className="bg-uniko-blue hover:bg-[#002280] text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Guardar Métodos de Pago
              </button>
              <button
                onClick={() => setEditingPayment(false)}
                className="text-uniko-blue/70 hover:text-uniko-blue text-sm font-medium px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorData?.paymentMethods?.banco && (
              <div>
                <p className="text-xs text-uniko-blue/70 uppercase tracking-wide">Banco</p>
                <p className="font-medium">{vendorData.paymentMethods.banco}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.cuenta && (
              <div>
                <p className="text-xs text-uniko-blue/70 uppercase tracking-wide">Cuenta</p>
                <p className="font-medium">{vendorData.paymentMethods.cuenta}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uniko-red/10 rounded-lg flex items-center justify-center">
              <FiPackage size={20} className="text-uniko-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Inventario</h2>
              <p className="text-sm text-uniko-blue/70">
                Controla el stock de tus productos
              </p>
            </div>
          </div>
          <Link
            to="/vendor/nuevo-producto"
            className="bg-uniko-blue hover:bg-[#002280] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo Producto
          </Link>
        </div>

        {productList.length === 0 ? (
          <div className="text-center py-10">
            <FiPackage size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-uniko-blue/70 mb-3">No tienes productos en inventario</p>
            <Link
              to="/vendor/nuevo-producto"
              className="text-uniko-red hover:underline text-sm font-medium"
            >
              Crear tu primer producto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-uniko-blue/70 uppercase tracking-wide border-b border-uniko-blue/10">
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Vendidos</th>
                  <th className="px-3 py-2 text-right">Ajustar</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((p: any) => {
                  const pid = p.id || p._id;
                  return (
                  <tr key={pid} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.images && p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <FiPackage size={16} />
                          </div>
                        )}
                        <Link
                          to={`/vendor/editar-producto/${pid}`}
                          className="font-medium text-uniko-blue hover:underline truncate"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-uniko-blue">
                      RD${((p.price || 0) / 100).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.stock <= 0
                            ? "bg-red-50 text-red-600"
                            : p.stock < 10
                            ? "bg-[#FFE5EA] text-[#CC0033]"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {p.stock <= 0
                          ? "Agotado"
                          : p.stock < 10
                          ? `Bajo: ${p.stock}`
                          : `${p.stock} disponibles`}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-uniko-blue/70">
                      {p.sales_count || p.salesCount || 0}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStockChange(pid, p.stock, -1)}
                          disabled={stockLoadingId === pid || p.stock <= 0}
                          className="w-8 h-8 rounded-lg border border-uniko-blue/20 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold">
                          {stockLoadingId === pid ? "..." : p.stock}
                        </span>
                        <button
                          onClick={() => handleStockChange(pid, p.stock, 1)}
                          disabled={stockLoadingId === pid}
                          className="w-8 h-8 rounded-lg border border-uniko-blue/20 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8">
        <VendorFacebookImport onSaved={() => refetchProducts()} />
      </div>

      <div className="mb-8">
        <TicketsSection
          userId={user.id}
          role="VENDOR"
          vendorId={vendorId}
          vendorName={vendorData?.businessName || user.name}
        />
      </div>

      <div>
        <SupportChat userId={user.id} role="VENDOR" vendorId={vendorId} />
      </div>
    </div>
  );
}
