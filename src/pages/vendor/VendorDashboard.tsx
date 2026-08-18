import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
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

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const vendor = useQuery(
    api.vendors.getBySlug,
    user?.vendor?.slug ? { slug: user.vendor.slug } : "skip"
  );
  const products = useQuery(
    api.products.getVendorProducts,
    user?.vendorId ? { vendorId: user.vendorId } : "skip"
  );

  const updateVendor = useMutation(api.vendors.update);
  const updateSocials = useMutation(api.vendors.updateSocials);
  const deleteProduct = useMutation(api.products.remove);
  const updateProduct = useMutation(api.products.update);
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
  const productList = (products as any[]) || [];
  const totalSales =
    vendorData?.totalSales ||
    productList.reduce((sum: number, p: any) => sum + (p.salesCount || 0), 0);

  const startEditInfo = () => {
    setInfoForm({
      businessName: vendorData?.businessName || "",
      description: vendorData?.description || "",
      logo: vendorData?.logo || "",
    });
    setEditingInfo(true);
  };

  const saveInfo = async () => {
    if (!user.vendorId) return;
    try {
      await updateVendor({
        userId: user._id,
        businessName: infoForm.businessName || undefined,
        description: infoForm.description || undefined,
        logo: infoForm.logo || undefined,
      });
      toast.success("Información actualizada");
      setEditingInfo(false);
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
    if (!user.vendorId) return;
    try {
      await updateSocials({
        vendorId: user.vendorId,
        whatsapp: socialsForm.whatsapp || undefined,
        socials: {
          instagram: socialsForm.instagram || undefined,
          facebook: socialsForm.facebook || undefined,
          twitter: socialsForm.twitter || undefined,
          tiktok: socialsForm.tiktok || undefined,
          youtube: socialsForm.youtube || undefined,
        },
      });
      toast.success("Redes sociales actualizadas");
      setEditingSocials(false);
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
    if (!user.vendorId) return;
    try {
      await updateVendor({
        userId: user._id,
        paymentMethods: { ...paymentForm },
      });
      toast.success("Métodos de pago guardados");
      setEditingPayment(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct({ productId: productId as any });
      toast.success("Producto eliminado");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStockChange = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setStockLoadingId(productId);
    try {
      await updateProduct({ productId: productId as any, stock: newStock });
      toast.success(`Stock actualizado a ${newStock}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStockLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Bienvenido, {vendorData?.businessName || user.name}
          </p>
        </div>
        <Link
          to="/vendor/nuevo-producto"
          className="bg-aqui-orange hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: <FiPackage size={22} />,
            label: "Productos",
            value: productList.length,
            color: "bg-aqui-blue",
          },
          {
            icon: <FiDollarSign size={22} />,
            label: "Ventas Totales",
            value: `$${(totalSales / 100).toLocaleString()}`,
            color: "bg-aqui-green",
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
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Business Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Mi Negocio</h2>
            {!editingInfo && (
              <button
                onClick={startEditInfo}
                className="text-aqui-blue hover:text-blue-700 text-sm font-medium"
              >
                Editar
              </button>
            )}
          </div>

          {editingInfo ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={infoForm.businessName}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, businessName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={infoForm.description}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo (URL)
                </label>
                <input
                  type="url"
                  value={infoForm.logo}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, logo: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveInfo}
                  className="bg-aqui-blue hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingInfo(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
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
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Nombre
                </p>
                <p className="font-medium">{vendorData?.businessName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Descripción
                </p>
                <p className="text-sm text-gray-600">
                  {vendorData?.description || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Redes Sociales</h2>
            {!editingSocials && (
              <button
                onClick={startEditSocials}
                className="text-aqui-blue hover:text-blue-700 text-sm font-medium"
              >
                Editar
              </button>
            )}
          </div>

          {editingSocials ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={socialsForm.whatsapp}
                  onChange={(e) =>
                    setSocialsForm({ ...socialsForm, whatsapp: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="809-555-0000"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    placeholder="https://instagram.com/tu-tienda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    placeholder="https://facebook.com/tu-pagina"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X / Twitter
                  </label>
                  <input
                    type="url"
                    value={socialsForm.twitter}
                    onChange={(e) =>
                      setSocialsForm({
                        ...socialsForm,
                        twitter: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    placeholder="https://x.com/tu-cuenta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={socialsForm.tiktok}
                    onChange={(e) =>
                      setSocialsForm({
                        ...socialsForm,
                        tiktok: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    placeholder="https://tiktok.com/@tu-cuenta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={socialsForm.youtube}
                    onChange={(e) =>
                      setSocialsForm({
                        ...socialsForm,
                        youtube: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    placeholder="https://youtube.com/@tu-canal"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveSocials}
                  className="bg-aqui-blue hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingSocials(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {vendorData?.whatsapp && (
                <div className="flex items-center gap-2 text-gray-700">
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
                  className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
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
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiFacebook size={16} />
                  </span>
                  <span className="text-sm">Facebook</span>
                </a>
              )}
              {vendorData?.socials?.twitter && (
                <a
                  href={vendorData.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-400 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <FiTwitter size={16} />
                  </span>
                  <span className="text-sm">X / Twitter</span>
                </a>
              )}
              {vendorData?.socials?.tiktok && (
                <a
                  href={vendorData.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiExternalLink size={16} />
                  </span>
                  <span className="text-sm">TikTok</span>
                </a>
              )}
              {vendorData?.socials?.youtube && (
                <a
                  href={vendorData.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                    <FiYoutube size={16} />
                  </span>
                  <span className="text-sm">YouTube</span>
                </a>
              )}
              {!vendorData?.whatsapp &&
                !vendorData?.socials?.instagram &&
                !vendorData?.socials?.facebook &&
                !vendorData?.socials?.twitter &&
                !vendorData?.socials?.tiktok &&
                !vendorData?.socials?.youtube && (
                  <p className="text-gray-400 text-sm">
                    No hay redes sociales configuradas
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiCreditCard size={20} /> Métodos de Pago y Cuentas Bancarias
          </h2>
          {!editingPayment && (
            <button
              onClick={startEditPayment}
              className="text-aqui-blue hover:text-blue-700 text-sm font-medium"
            >
              Editar
            </button>
          )}
        </div>

        {editingPayment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco principal
                </label>
                <input
                  type="text"
                  value={paymentForm.banco}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, banco: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="BanReservas, BHD, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de cuenta bancaria
                </label>
                <input
                  type="text"
                  value={paymentForm.cuenta}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, cuenta: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="000-000000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cuenta
                </label>
                <select
                  value={paymentForm.tipoCuenta}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, tipoCuenta: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                >
                  <option value="Ahorro">Ahorro</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono para pagos móviles
                </label>
                <input
                  type="tel"
                  value={paymentForm.telefonoPagos}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      telefonoPagos: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="809-555-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal email <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={paymentForm.paypalEmail}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paypalEmail: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="correo@paypal.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de pago
                </label>
                <input
                  type="url"
                  value={paymentForm.linkPago}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, linkPago: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={savePayment}
                className="bg-aqui-blue hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Guardar Métodos de Pago
              </button>
              <button
                onClick={() => setEditingPayment(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorData?.paymentMethods?.banco && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Banco</p>
                <p className="font-medium">{vendorData.paymentMethods.banco}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.cuenta && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Cuenta
                </p>
                <p className="font-medium">{vendorData.paymentMethods.cuenta}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.tipoCuenta && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Tipo
                </p>
                <p className="font-medium">{vendorData.paymentMethods.tipoCuenta}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.telefonoPagos && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Pagos móviles
                </p>
                <p className="font-medium">{vendorData.paymentMethods.telefonoPagos}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.paypalEmail && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  PayPal
                </p>
                <p className="font-medium">{vendorData.paymentMethods.paypalEmail}</p>
              </div>
            )}
            {vendorData?.paymentMethods?.linkPago && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Link de pago
                </p>
                <a
                  href={vendorData.paymentMethods.linkPago}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-aqui-blue hover:underline text-sm"
                >
                  {vendorData.paymentMethods.linkPago}
                </a>
              </div>
            )}
            {!vendorData?.paymentMethods?.banco &&
              !vendorData?.paymentMethods?.cuenta &&
              !vendorData?.paymentMethods?.telefonoPagos &&
              !vendorData?.paymentMethods?.paypalEmail &&
              !vendorData?.paymentMethods?.linkPago && (
                <p className="text-gray-400 text-sm">
                  No hay métodos de pago configurados
                </p>
              )}
          </div>
        )}
      </div>

      {/* Inventario */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-aqui-orange/10 rounded-lg flex items-center justify-center">
              <FiPackage size={20} className="text-aqui-orange" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Inventario</h2>
              <p className="text-sm text-gray-500">
                Controla el stock de tus productos
              </p>
            </div>
          </div>
          <Link
            to="/vendor/nuevo-producto"
            className="bg-aqui-blue hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo Producto
          </Link>
        </div>

        {productList.length === 0 ? (
          <div className="text-center py-10">
            <FiPackage size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-3">No tienes productos en inventario</p>
            <Link
              to="/vendor/nuevo-producto"
              className="text-aqui-orange hover:underline text-sm font-medium"
            >
              Crear tu primer producto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Vendidos</th>
                  <th className="px-3 py-2 text-right">Ajustar</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((p: any) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
                          to={`/vendor/editar-producto/${p._id}`}
                          className="font-medium text-gray-900 hover:text-aqui-blue truncate"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      RD${(p.price / 100).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.stock <= 0
                            ? "bg-red-50 text-red-600"
                            : p.stock < 10
                            ? "bg-yellow-50 text-yellow-700"
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
                    <td className="px-3 py-3 text-gray-500">
                      {p.salesCount || 0}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStockChange(p._id, p.stock, -1)}
                          disabled={stockLoadingId === p._id || p.stock <= 0}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold">
                          {stockLoadingId === p._id ? "..." : p.stock}
                        </span>
                        <button
                          onClick={() => handleStockChange(p._id, p.stock, 1)}
                          disabled={stockLoadingId === p._id}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Mis Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productList.map((p: any) => (
            <div
              key={p._id}
              className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                {vendorData?.logo ? (
                  <img
                    src={vendorData.logo}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-aqui-blue text-white flex items-center justify-center font-bold text-sm">
                    {(vendorData?.businessName || "V").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    RD${(p.price / 100).toLocaleString()} · Stock: {p.stock}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/vendor/editar-producto/${p._id}`}
                  className="flex items-center gap-1 text-xs text-aqui-blue hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg flex-1 justify-center"
                >
                  <FiEdit2 size={12} /> Editar
                </Link>
                <button
                  onClick={() => handleDeleteProduct(p._id, p.name)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  <FiTrash2 size={12} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        {productList.length === 0 && (
          <div className="text-center py-12">
            <FiPackage size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No tienes productos aún</p>
            <Link
              to="/vendor/nuevo-producto"
              className="text-aqui-orange hover:underline text-sm font-medium"
            >
              Crear tu primer producto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
