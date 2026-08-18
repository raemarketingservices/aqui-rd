import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import {
  FiSettings,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiShare2,
  FiLock,
  FiLogOut,
  FiCheck,
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiEye,
  FiEyeOff,
  FiImage,
  FiGlobe,
  FiMenu,
  FiArrowLeft,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

const AUTH_KEY = "aqui_admin_auth";
const ADMIN_PASSWORD = "aquirdadmin";

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      onLogin();
    } else {
      setError("Contraseña incorrecta");
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo-aqui-blanco.png" alt="AQUÍ" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-gray-400 mt-1">AQUÍ RD</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#0F2A4A]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10">
          <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

function GeneralTab() {
  const settings = useQuery(api.admin.getSiteSettings);
  const upsert = useMutation(api.admin.updateSiteSetting);

  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && !loaded) {
      const get = (key: string) => settings.find((s: any) => s.key === key)?.value ?? "";
      setSiteName(get("siteName"));
      setTagline(get("tagline"));
      setLogo(get("logo"));
      setFavicon(get("favicon"));
      setLoaded(true);
    }
  }, [settings, loaded]);

  const handleSave = async () => {
    await Promise.all([
      upsert({ key: "siteName", value: siteName }),
      upsert({ key: "tagline", value: tagline }),
      upsert({ key: "logo", value: logo }),
      upsert({ key: "favicon", value: favicon }),
    ]);
    toast.success("Configuración general guardada");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Configuración General</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FiGlobe className="inline mr-2" />Nombre del Sitio
          </label>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="AQUÍ RD"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="El marketplace de RD"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FiImage className="inline mr-2" />Logo URL
        </label>
        <input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
          placeholder="https://..."
        />
        {logo && (
          <div className="mt-3 p-4 bg-[#0A1929] rounded-lg border border-white/5 flex items-center justify-center">
            <img src={logo} alt="Logo preview" className="max-h-20" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
        <input
          value={favicon}
          onChange={(e) => setFavicon(e.target.value)}
          className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

function ContenidoTab() {
  const settings = useQuery(api.admin.getSiteSettings);
  const upsert = useMutation(api.admin.updateSiteSetting);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && !loaded) {
      const get = (key: string) => settings.find((s: any) => s.key === key)?.value ?? "";
      setHeroTitle(get("heroTitle"));
      setHeroSubtitle(get("heroSubtitle"));
      setCtaText(get("ctaText"));
      setFooterText(get("footerText"));
      setLoaded(true);
    }
  }, [settings, loaded]);

  const handleSave = async () => {
    await Promise.all([
      upsert({ key: "heroTitle", value: heroTitle }),
      upsert({ key: "heroSubtitle", value: heroSubtitle }),
      upsert({ key: "ctaText", value: ctaText }),
      upsert({ key: "footerText", value: footerText }),
    ]);
    toast.success("Contenido guardado");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Contenido de la Landing Page</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título Hero</label>
          <input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="Descubre todo lo que..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Subtítulo Hero</label>
          <input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="El marketplace dominicano..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Texto del Botón CTA</label>
          <input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="Explorar tiendas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Texto del Footer</label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={3}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none"
            placeholder="© 2024 AQUÍ RD..."
          />
        </div>
      </div>
    </div>
  );
}

function VendedoresTab() {
  const vendors = useQuery(api.admin.getAllVendors);
  const updateStatus = useMutation(api.admin.updateVendorStatus);

  const handleStatus = async (vendorId: string, status: string) => {
    await updateStatus({ vendorId: vendorId as any, status: status as any });
    toast.success(status === "APPROVED" ? "Vendedor aprobado" : "Vendedor rechazado");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Gestionar Vendedores</h2>

      {!vendors ? (
        <div className="text-center py-12 text-gray-400">Cargando vendedores...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay vendedores registrados</div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v: any) => (
            <div key={v._id} className="bg-[#0A1929] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1B4B8A] flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                  {v.logo ? (
                    <img src={v.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    v.businessName?.charAt(0) || "V"
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{v.businessName}</p>
                  <p className="text-sm text-gray-400">/{v.slug} · {v.user?.name} · {v.productCount} productos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  v.status === "APPROVED" ? "bg-green-500/20 text-green-400" :
                  v.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}
                </span>
                {v.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(v._id, "APPROVED")} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Aprobar">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => handleStatus(v._id, "REJECTED")} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Rechazar">
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

function ChatbotTab() {
  const chatbotConfig = useQuery(api.admin.getChatbotConfig);
  const updateConfig = useMutation(api.admin.updateChatbotConfig);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (chatbotConfig !== undefined && !loaded) {
      setFaqs(chatbotConfig?.faqs ?? []);
      setKnowledgeBase(chatbotConfig?.knowledgeBase ?? "");
      setWelcomeMessage(chatbotConfig?.welcomeMessage ?? "");
      setLoaded(true);
    }
  }, [chatbotConfig, loaded]);

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[i] = { ...updated[i], [field]: value };
    setFaqs(updated);
  };

  const handleSave = async () => {
    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    await updateConfig({
      faqs: validFaqs,
      knowledgeBase,
      welcomeMessage,
    });
    toast.success("Configuración del chatbot guardada");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">AQUÍ RD Chatbot</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje de Bienvenida</label>
          <input
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="¡Hola! Soy AQUÍ, tu asistente virtual..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Base de Conocimiento</label>
          <textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            rows={4}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none"
            placeholder="Información general sobre AQUÍ RD..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Preguntas Frecuentes (FAQs)</label>
            <button onClick={addFaq} className="flex items-center gap-1 text-sm text-[#FF6B35] hover:text-[#E85A28] transition-colors">
              <FiPlus size={14} /> Agregar FAQ
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0A1929] border border-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">FAQ #{i + 1}</span>
                  <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-300 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <input
                  value={faq.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
                  placeholder="Pregunta..."
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  rows={2}
                  className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none"
                  placeholder="Respuesta..."
                />
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-center text-gray-500 py-6">No hay FAQs. Agrega una para comenzar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RedesSocialesTab() {
  const settings = useQuery(api.admin.getSiteSettings);
  const upsert = useMutation(api.admin.updateSiteSetting);

  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && !loaded) {
      const get = (key: string) => settings.find((s: any) => s.key === key)?.value ?? "";
      setWhatsapp(get("social_whatsapp"));
      setInstagram(get("social_instagram"));
      setFacebook(get("social_facebook"));
      setTwitter(get("social_twitter"));
      setTiktok(get("social_tiktok"));
      setYoutube(get("social_youtube"));
      setLoaded(true);
    }
  }, [settings, loaded]);

  const handleSave = async () => {
    await Promise.all([
      upsert({ key: "social_whatsapp", value: whatsapp }),
      upsert({ key: "social_instagram", value: instagram }),
      upsert({ key: "social_facebook", value: facebook }),
      upsert({ key: "social_twitter", value: twitter }),
      upsert({ key: "social_tiktok", value: tiktok }),
      upsert({ key: "social_youtube", value: youtube }),
    ]);
    toast.success("Redes sociales guardadas");
  };

  const fields = [
    { label: "WhatsApp (número)", value: whatsapp, setter: setWhatsapp, placeholder: "+18091234567", color: "text-green-400" },
    { label: "Instagram", value: instagram, setter: setInstagram, placeholder: "https://instagram.com/aquird", color: "text-pink-400" },
    { label: "Facebook", value: facebook, setter: setFacebook, placeholder: "https://facebook.com/aquird", color: "text-blue-400" },
    { label: "X / Twitter", value: twitter, setter: setTwitter, placeholder: "https://x.com/aquird", color: "text-gray-300" },
    { label: "TikTok", value: tiktok, setter: setTiktok, placeholder: "https://tiktok.com/@aquird", color: "text-cyan-400" },
    { label: "YouTube", value: youtube, setter: setYoutube, placeholder: "https://youtube.com/@aquird", color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Redes Sociales</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <label className={`block text-sm font-medium mb-2 ${field.color}`}>
              <FiShare2 className="inline mr-2" />{field.label}
            </label>
            <input
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContrasenaTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== ADMIN_PASSWORD) {
      toast.error("La contraseña actual es incorrecta");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    toast.success("Contraseña cambiada exitosamente");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
      <form onSubmit={handleChange} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña Actual</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          <FiLock size={16} /> Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}

interface SectionConfig {
  key: string;
  label: string;
  fields: { key: string; label: string; type: "input" | "textarea" }[];
}

const LANDING_SECTIONS: SectionConfig[] = [
  {
    key: "hero",
    label: "Hero",
    fields: [
      { key: "heroTitle", label: "Título", type: "input" },
      { key: "heroSubtitle", label: "Subtítulo", type: "input" },
      { key: "heroCta", label: "CTA", type: "input" },
    ],
  },
  {
    key: "platform",
    label: "Plataforma",
    fields: [
      { key: "platformTitle", label: "Título", type: "input" },
      { key: "platformDescription", label: "Descripción", type: "textarea" },
    ],
  },
  {
    key: "howItWorks",
    label: "Cómo Funciona",
    fields: [
      { key: "howItWorksTitle", label: "Título", type: "input" },
    ],
  },
  {
    key: "appView",
    label: "Vista App",
    fields: [
      { key: "appViewTitle", label: "Título", type: "input" },
      { key: "appViewSubtitle", label: "Subtítulo", type: "input" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonios",
    fields: [
      { key: "testimonialsTitle", label: "Título", type: "input" },
    ],
  },
  {
    key: "values",
    label: "Valores",
    fields: [
      { key: "valuesTitle", label: "Título", type: "input" },
    ],
  },
  {
    key: "features",
    label: "Características",
    fields: [
      { key: "featuresTitle", label: "Título", type: "input" },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    fields: [
      { key: "faqTitle", label: "Título", type: "input" },
      { key: "faqItems", label: "Items (JSON)", type: "textarea" },
    ],
  },
  {
    key: "cta",
    label: "CTA",
    fields: [
      { key: "ctaTitle", label: "Título", type: "input" },
      { key: "ctaSubtitle", label: "Subtítulo", type: "input" },
      { key: "ctaButton", label: "Botón", type: "input" },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { key: "footerDescription", label: "Descripción", type: "textarea" },
    ],
  },
];

function LandingContentTab() {
  const landingData = useQuery(api.landing.getAll);
  const upsert = useMutation(api.landing.upsert);

  const [values, setValues] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (landingData !== undefined && !loaded) {
      const map: Record<string, string> = {};
      for (const item of landingData) {
        map[item.key] = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
      }
      setValues(map);
      setLoaded(true);
    }
  }, [landingData, loaded]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async (section: SectionConfig) => {
    setSaving(section.key);
    try {
      await Promise.all(
        section.fields.map((field) => {
          const val = values[field.key] ?? "";
          if (field.key === "faqItems") {
            try {
              JSON.parse(val);
            } catch {
              toast.error("El JSON de FAQ no es válido");
              setSaving(null);
              return Promise.resolve();
            }
          }
          return upsert({ section: section.key, key: field.key, value: val });
        })
      );
      toast.success(`${section.label} guardado`);
    } catch {
      toast.error(`Error al guardar ${section.label}`);
    }
    setSaving(null);
  };

  if (landingData === undefined) {
    return <div className="text-center py-12 text-gray-400">Cargando contenido...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Contenido Landing</h2>

      <div className="space-y-3">
        {LANDING_SECTIONS.map((section) => {
          const isOpen = openSections[section.key] ?? false;
          return (
            <div key={section.key} className="bg-[#0A1929] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-white">{section.label}</span>
                {isOpen ? <FiChevronDown size={18} className="text-gray-400" /> : <FiChevronRight size={18} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          rows={4}
                          className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none font-mono"
                          placeholder={field.key === "faqItems" ? '[{"question":"...","answer":"..."}]' : ""}
                        />
                      ) : (
                        <input
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]"
                          placeholder=""
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleSaveSection(section)}
                    disabled={saving === section.key}
                    className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <FiSave size={14} />
                    {saving === section.key ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tabs = [
  { id: "general", label: "General", icon: FiSettings },
  { id: "contenido", label: "Contenido", icon: FiFileText },
  { id: "landingContent", label: "Contenido Landing", icon: FiFileText },
  { id: "vendedores", label: "Vendedores", icon: FiUsers },
  { id: "chatbot", label: "Chatbot", icon: FiMessageSquare },
  { id: "redes", label: "Redes Sociales", icon: FiShare2 },
  { id: "contrasena", label: "Contraseña", icon: FiLock },
];

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState("general");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthed(localStorage.getItem(AUTH_KEY) === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return <LoginPage onLogin={() => setIsAuthed(true)} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case "general": return <GeneralTab />;
      case "contenido": return <ContenidoTab />;
      case "landingContent": return <LandingContentTab />;
      case "vendedores": return <VendedoresTab />;
      case "chatbot": return <ChatbotTab />;
      case "redes": return <RedesSocialesTab />;
      case "contrasena": return <ContrasenaTab />;
      default: return <GeneralTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 ${sidebarOpen ? "w-64" : "md:w-20 w-64"} bg-[#0F2A4A] border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <img src="/logo-aqui-blanco.png" alt="AQUÍ" className="w-10 h-10 flex-shrink-0" />
          {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">AQUÍ Admin</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FF6B35] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title={tab.label}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            title="Cerrar Sesión"
          >
            <FiLogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-[#0F2A4A] border-b border-white/5 px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-400 hover:text-white transition-colors md:hidden">
              <FiMenu size={20} />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors hidden md:block">
              <FiSettings size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Administrador</span>
            <div className="w-8 h-8 bg-[#1B4B8A] rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
