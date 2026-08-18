import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "CUSTOMER" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(form);
      // Wait a moment for Convex to sync the user data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (result.role === "VENDOR") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tech background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#0A1929]/80 backdrop-blur-sm"></div>
      </div>

      {/* Volver button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver a la web</span>
      </Link>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-aqui-blanco.png" alt="AQUÍ" className="h-16 mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-gray-400 mt-1">Únete a AQUÍ RD</p>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" minLength={6} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Creando..." : "Crear Cuenta"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400">¿Ya tienes cuenta? <Link to="/login" className="text-[#FF6B35] hover:underline font-medium">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
