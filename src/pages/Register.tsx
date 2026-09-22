import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { FiArrowLeft, FiEye, FiEyeOff, FiUpload, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

const PAYMENT_OPTIONS = [
  { value: "contra_entrega", label: "💵 Contra Entrega" },
  { value: "cuenta_bancaria", label: "🏦 Transferencia Bancaria" },
  { value: "tarjeta_credito", label: "💳 Tarjeta de Crédito" },
  { value: "tarjeta_debito", label: "💳 Tarjeta de Débito" },
  { value: "paypal", label: "🌐 PayPal" },
];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", role: "CUSTOMER",
  });
  const [vendorForm, setVendorForm] = useState({
    businessName: "", description: "", whatsapp: "", storeEmail: "",
    address: "", rnc: "", paymentMethods: [] as string[], logo: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === "VENDOR") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const togglePayment = (val: string) => {
    setVendorForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(val)
        ? prev.paymentMethods.filter(v => v !== val)
        : [...prev.paymentMethods, val],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(form);

      if (form.role === "VENDOR" && result?.id) {
        try {
          const vendorResult = await api.vendor.register({
            userId: result.id,
            businessName: vendorForm.businessName || form.name + " Store",
            description: vendorForm.description,
            whatsapp: vendorForm.whatsapp || form.phone,
            email: vendorForm.storeEmail || form.email,
            address: vendorForm.address,
            rnc: vendorForm.rnc,
            paymentMethods: vendorForm.paymentMethods.join(","),
            logo: vendorForm.logo,
          });
          if (vendorResult.vendor?.status === "PENDING") {
            toast.success("Tienda creada. Pendiente de aprobación por admin.");
          }
        } catch (vendorError: any) {
          toast.error(vendorError.message || "Error creando tienda");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error al crear cuenta");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[#0A1929]/80 backdrop-blur-sm"></div>
      </div>

      <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
        <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver a la web</span>
      </Link>

      <div className="max-w-md w-full relative z-10 max-h-screen overflow-y-auto py-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-uniko-blanco.png" alt="UNIKO" className="h-16 mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-white/80 mt-1">Únete a UNIKO RD</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#0F2A4A]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">¿Qué quieres hacer?</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, role: "CUSTOMER" })} className={`p-4 rounded-lg border-2 text-center transition ${form.role === "CUSTOMER" ? "border-[#1B4B8A] bg-[#1B4B8A]/10" : "border-white/10 hover:border-white/20"}`}>
                <span className="block text-2xl mb-1">🛒</span><span className="text-sm font-medium text-white">Comprar</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: "VENDOR" })} className={`p-4 rounded-lg border-2 text-center transition ${form.role === "VENDOR" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}`}>
                <span className="block text-2xl mb-1">🏪</span><span className="text-sm font-medium text-white">Vender</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (809) 000-0000" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" minLength={6} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {form.role === "VENDOR" && (
            <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
              <h3 className="text-[#FF6B35] font-semibold text-sm flex items-center gap-2">
                🏪 Información de la Tienda
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de la tienda *</label>
                <input type="text" value={vendorForm.businessName} onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })} placeholder="Ej: Mi Electrónica RD" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción de la tienda</label>
                <textarea value={vendorForm.description} onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })} placeholder="Describe tu tienda y productos..." rows={2} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                  <input type="tel" value={vendorForm.whatsapp} onChange={(e) => setVendorForm({ ...vendorForm, whatsapp: e.target.value })} placeholder="8290000000" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email de la tienda</label>
                  <input type="email" value={vendorForm.storeEmail} onChange={(e) => setVendorForm({ ...vendorForm, storeEmail: e.target.value })} placeholder="tienda@ejemplo.com" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                <input type="text" value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} placeholder="Santo Domingo, RD" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">RNC <span className="text-uniko-blue/70">(opcional)</span></label>
                <input type="text" value={vendorForm.rnc} onChange={(e) => setVendorForm({ ...vendorForm, rnc: e.target.value })} placeholder="Solo si tienes registro fiscal" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Logo de la tienda (URL)</label>
                <input type="url" value={vendorForm.logo} onChange={(e) => setVendorForm({ ...vendorForm, logo: e.target.value })} placeholder="https://ejemplo.com/logo.png" className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Métodos de pago aceptados</label>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => togglePayment(opt.value)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left text-sm transition ${vendorForm.paymentMethods.includes(opt.value) ? "border-[#FF6B35] bg-[#FF6B35]/10 text-white" : "border-white/10 text-white/80 hover:border-white/20"}`}>
                      <span className={`w-5 h-5 rounded flex items-center justify-center border ${vendorForm.paymentMethods.includes(opt.value) ? "border-[#FF6B35] bg-[#FF6B35]" : "border-gray-500"}`}>
                        {vendorForm.paymentMethods.includes(opt.value) && <FiCheck size={12} className="text-white" />}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || isLoading} className="w-full bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading || isLoading ? "Creando..." : form.role === "VENDOR" ? "Crear Tienda" : "Crear Cuenta"}
          </button>
        </form>
        <p className="text-center mt-6 text-white/80">¿Ya tienes cuenta? <Link to="/login" className="text-[#FF6B35] hover:underline font-medium">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
