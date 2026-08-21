import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Navigate after user data is loaded
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "VENDOR") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      toast.error(error.message || "Credenciales inválidas");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[#0A1929]/80 backdrop-blur-sm"></div>
      </div>

      <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
        <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver a la web</span>
      </Link>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-aqui-blanco.png" alt="AQUÍ" className="h-16 mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-gray-400 mt-1">Bienvenido de vuelta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#0F2A4A]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || isLoading} className="w-full bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading || isLoading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400">¿No tienes cuenta? <Link to="/registro" className="text-[#FF6B35] hover:underline font-medium">Regístrate aquí</Link></p>
      </div>
    </div>
  );
}
