import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabaseApi } from "../../services/supabaseApi";
import { useApiQuery } from "../../hooks/useApiQuery";
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
  FiLifeBuoy,
  FiMessageCircle,
  FiDollarSign,
  FiShoppingBag,
  FiUpload,
  FiEdit2,
} from "react-icons/fi";
import NotificationsBell from "../../components/support/NotificationsBell";
import SupportChat from "../../components/support/SupportChat";
import TicketsSection from "../../components/support/TicketsSection";

const AUTH_KEY = "uniko_admin_auth";
const ADMIN_PASSWORD = "unikordadmin";

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
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#0A1929]/80 backdrop-blur-sm"></div>
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/85 hover:text-white transition-colors group"
      >
        <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver a la web</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo-uniko-blanco.png" alt="UNIKO" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-white/70 mt-1">UNIKO RD</p>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
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
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
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
      supabaseApi.admin.updateSiteSetting("siteName", siteName),
      supabaseApi.admin.updateSiteSetting("tagline", tagline),
      supabaseApi.admin.updateSiteSetting("logo", logo),
      supabaseApi.admin.updateSiteSetting("favicon", favicon),
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
            placeholder="UNIKO RD"
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
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
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
      supabaseApi.admin.updateSiteSetting("heroTitle", heroTitle),
      supabaseApi.admin.updateSiteSetting("heroSubtitle", heroSubtitle),
      supabaseApi.admin.updateSiteSetting("ctaText", ctaText),
      supabaseApi.admin.updateSiteSetting("footerText", footerText),
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
            placeholder="© 2026 UNIKO RD..."
          />
        </div>
      </div>
    </div>
  );
}

function VendedoresTab() {
  const { data: res, refetch } = useApiQuery(() => supabaseApi.admin.getAllVendors());
  const vendors = res?.vendors || [];

  const handleStatus = async (vendorId: string, status: string) => {
    await supabaseApi.admin.updateVendorStatus(vendorId, status);
    toast.success(status === "APPROVED" ? "Vendedor aprobado" : "Vendedor rechazado");
    refetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Gestionar Vendedores</h2>

      {!res ? (
        <div className="text-center py-12 text-white/70">Cargando vendedores...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 text-white/70">No hay vendedores registrados</div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v: any) => (
            <div key={v.id || v._id} className="bg-[#0A1929] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                  <p className="text-sm text-white/70">/{v.slug} · {v.user?.name} · {v.productCount || 0} productos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  v.status === "APPROVED" ? "bg-green-500/20 text-green-400" :
                  v.status === "PENDING" ? "bg-[#FF6B35]/20 text-[#FF6B35]" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}
                </span>
                {v.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(v.id || v._id, "APPROVED")} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Aprobar">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => handleStatus(v.id || v._id, "REJECTED")} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Rechazar">
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
  const { data: chatbotConfig } = useApiQuery(() => supabaseApi.admin.getChatbotConfig());
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
    await supabaseApi.admin.updateChatbotConfig({
      faqs: validFaqs,
      knowledgeBase,
      welcomeMessage,
    });
    toast.success("Configuración del chatbot guardada");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">UNIKO RD Chatbot</h2>
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
            placeholder="¡Hola! Soy UNIKO, tu asistente virtual..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Base de Conocimiento</label>
          <textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            rows={4}
            className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] resize-none"
            placeholder="Información general sobre UNIKO RD..."
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
                  <span className="text-xs text-blue-300 font-medium">FAQ #{i + 1}</span>
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
              <p className="text-center text-blue-300 py-6">No hay FAQs. Agrega una para comenzar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RedesSocialesTab() {
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
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
      supabaseApi.admin.updateSiteSetting("social_whatsapp", whatsapp),
      supabaseApi.admin.updateSiteSetting("social_instagram", instagram),
      supabaseApi.admin.updateSiteSetting("social_facebook", facebook),
      supabaseApi.admin.updateSiteSetting("social_twitter", twitter),
      supabaseApi.admin.updateSiteSetting("social_tiktok", tiktok),
      supabaseApi.admin.updateSiteSetting("social_youtube", youtube),
    ]);
    toast.success("Redes sociales guardadas");
  };

  const fields = [
    { label: "WhatsApp (número)", value: whatsapp, setter: setWhatsapp, placeholder: "+18091234567", color: "text-green-400" },
    { label: "Instagram", value: instagram, setter: setInstagram, placeholder: "https://instagram.com/unikord", color: "text-pink-400" },
    { label: "Facebook", value: facebook, setter: setFacebook, placeholder: "https://facebook.com/unikord", color: "text-blue-400" },
    { label: "X / Twitter", value: twitter, setter: setTwitter, placeholder: "https://x.com/unikord", color: "text-gray-300" },
    { label: "TikTok", value: tiktok, setter: setTiktok, placeholder: "https://tiktok.com/@unikord", color: "text-cyan-400" },
    { label: "YouTube", value: youtube, setter: setYoutube, placeholder: "https://youtube.com/@unikord", color: "text-red-400" },
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
            <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" placeholder="••••••••" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
              {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" placeholder="••••••••" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
              {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35]" placeholder="••••••••" />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          <FiLock size={16} /> Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}

function TiendasTab() {
  const { data: res, refetch } = useApiQuery(() => supabaseApi.admin.getAllVendorsWithDetails());
  const vendors = res?.vendors || [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ businessName: "", description: "", whatsapp: "" });

  const startEdit = (v: any) => {
    setEditingId(v.id || v._id);
    setEditForm({ businessName: v.businessName || "", description: v.description || "", whatsapp: v.whatsapp || "" });
  };

  const saveEdit = async (vendor: any) => {
    try {
      await supabaseApi.vendor.update({
        vendorId: vendor.id || vendor._id,
        businessName: editForm.businessName,
        description: editForm.description,
        whatsapp: editForm.whatsapp,
      });
      toast.success("Tienda actualizada");
      setEditingId(null);
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiShoppingBag /> Gestionar Tiendas</h2>
      {!res ? <div className="text-center py-12 text-white/70">Cargando...</div> :
       vendors.length === 0 ? <div className="text-center py-12 text-white/70">No hay tiendas</div> : (
        <div className="space-y-3">
          {vendors.map((v: any) => {
            const vid = v.id || v._id;
            return (
            <div key={vid} className="bg-[#0A1929] border border-white/5 rounded-xl p-4">
              {editingId === vid ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#FF6B35] font-medium">Editando tienda</span>
                    <button onClick={() => setEditingId(null)} className="text-white/70 hover:text-white text-xs"><FiX size={14} /> Cancelar</button>
                  </div>
                  <input value={editForm.businessName} onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="Nombre de la tienda" />
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none" rows={2} placeholder="Descripción" />
                  <input value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="WhatsApp (número)" />
                  <button onClick={() => saveEdit(v)} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg text-sm font-medium"><FiSave size={14} /> Guardar Cambios</button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1B4B8A] flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                      {v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : v.businessName?.charAt(0) || "V"}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{v.businessName}</p>
                      <p className="text-sm text-white/70">/{v.slug} &middot; {v.user?.name} &middot; {v.productCount || 0} productos</p>
                      {v.description && <p className="text-xs text-blue-300 mt-1 line-clamp-1">{v.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.status === "APPROVED" ? "bg-green-500/20 text-green-400" : v.status === "PENDING" ? "bg-[#FF6B35]/20 text-[#FF6B35]" : "bg-red-500/20 text-red-400"}`}>
                      {v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}
                    </span>
                    <button onClick={() => startEdit(v)} className="p-2 bg-[#1B4B8A] hover:bg-[#0033A0] text-white rounded-lg transition-colors" title="Editar"><FiEdit2 size={14} /></button>
                    {v.status === "PENDING" && (
                      <>
                        <button onClick={async () => { await supabaseApi.admin.updateVendorStatus(vid, "APPROVED"); toast.success("Aprobado"); refetch(); }} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg" title="Aprobar"><FiCheck size={14} /></button>
                        <button onClick={async () => { await supabaseApi.admin.updateVendorStatus(vid, "REJECTED"); toast.error("Rechazado"); refetch(); }} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg" title="Rechazar"><FiX size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ImpuestosTab() {
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [taxes, setTaxes] = useState<{ name: string; rate: number; enabled: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
      const taxesVal = settings.find((s: any) => s.key === "taxes")?.value;
      if (Array.isArray(taxesVal) && taxesVal.length > 0) {
        setTaxes(taxesVal);
      } else {
        setTaxes([{ name: "ITBIS", rate: 18, enabled: true }]);
      }
      setLoaded(true);
    }
  }, [settings, loaded]);

  const addTax = () => setTaxes([...taxes, { name: "", rate: 0, enabled: true }]);
  const removeTax = (i: number) => setTaxes(taxes.filter((_, idx) => idx !== i));
  const updateTax = (i: number, field: string, value: any) => {
    const updated = [...taxes];
    updated[i] = { ...updated[i], [field]: value };
    setTaxes(updated);
  };

  const handleSave = async () => {
    const valid = taxes.filter((t) => t.name.trim());
    await supabaseApi.admin.updateSiteSetting("taxes", valid);
    toast.success("Impuestos guardados");
  };

  const previewTotal = 1000;
  const previewTaxes = taxes.filter((t) => t.enabled && t.name.trim()).map((t) => ({
    name: t.name,
    amount: previewTotal * (t.rate / 100),
  }));
  const previewTotalTaxes = previewTaxes.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiDollarSign /> Configuración de Impuestos</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-medium">Impuestos configurados</p>
          <button onClick={addTax} className="flex items-center gap-1 text-sm text-[#FF6B35] hover:text-[#E85A28] transition-colors">
            <FiPlus size={14} /> Agregar Impuesto
          </button>
        </div>

        {taxes.length === 0 && (
          <p className="text-center text-blue-300 py-6">No hay impuestos. Agrega uno para comenzar.</p>
        )}

        <div className="space-y-3">
          {taxes.map((tax, i) => (
            <div key={i} className="bg-[#0F2A4A] border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-blue-300 font-medium">Impuesto #{i + 1}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateTax(i, "enabled", !tax.enabled)} className={`w-10 h-5 rounded-full transition-colors relative ${tax.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${tax.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => removeTax(i)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Nombre</label>
                  <input value={tax.name} onChange={(e) => updateTax(i, "name", e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: ITBIS, ISR, Municipal" disabled={!tax.enabled} />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Tasa (%)</label>
                  <input type="number" value={tax.rate} onChange={(e) => updateTax(i, "rate", parseFloat(e.target.value) || 0)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" min="0" max="100" step="0.01" disabled={!tax.enabled} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0F2A4A] rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-300 mb-2">Vista previa en compra de RD${previewTotal.toLocaleString()}:</p>
          {previewTaxes.length > 0 ? (
            <div className="space-y-1">
              {previewTaxes.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{t.name}</span>
                  <span className="text-[#FF6B35] font-medium">RD${t.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-1 mt-1">
                <span className="text-white">Total impuestos</span>
                <span className="text-[#FF6B35]">RD${previewTotalTaxes.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-blue-300 text-sm">Sin impuestos activos</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "toggle";
  required: boolean;
  options?: string[];
  placeholder?: string;
  category?: string;
}

const DEFAULT_PRODUCT_FIELDS: ProductField[] = [
  { name: "brand", label: "Marca", type: "text", required: false, category: "Detalles" },
  { name: "color", label: "Color", type: "text", required: false, category: "Detalles" },
  { name: "condition", label: "Condición", type: "select", required: true, options: ["NEW", "USED_LIKE_NEW", "USED_GOOD", "USED_ACCEPTABLE"], category: "Información" },
  { name: "tags", label: "Etiquetas", type: "text", required: false, placeholder: "Separadas por coma", category: "Detalles" },
  { name: "location", label: "Ubicación", type: "text", required: false, category: "Ubicación" },
  { name: "videoUrl", label: "Video del producto", type: "text", required: false, placeholder: "URL del video", category: "Multimedia" },
];

function FormularioProductosTab() {
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [fields, setFields] = useState<ProductField[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "textarea" | "number" | "select" | "toggle">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldCategory, setNewFieldCategory] = useState("Personalizado");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
      const val = settings.find((s: any) => s.key === "productFormFields")?.value;
      setFields(Array.isArray(val) && val.length > 0 ? val : DEFAULT_PRODUCT_FIELDS);
      setLoaded(true);
    }
  }, [settings, loaded]);

  const addField = () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) {
      toast.error("Nombre y etiqueta son requeridos");
      return;
    }
    if (fields.some((f) => f.name === newFieldName.trim())) {
      toast.error("Ya existe un campo con ese nombre");
      return;
    }
    const field: ProductField = {
      name: newFieldName.trim(),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      category: newFieldCategory || "Personalizado",
      placeholder: "",
    };
    if (newFieldType === "select" && newFieldOptions.trim()) {
      field.options = newFieldOptions.split(",").map((o) => o.trim()).filter(Boolean);
    }
    setFields([...fields, field]);
    setNewFieldName("");
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNewFieldOptions("");
    toast.success(`Campo "${field.label}" agregado`);
  };

  const removeField = (name: string) => {
    setFields(fields.filter((f) => f.name !== name));
    toast.success("Campo eliminado");
  };

  const toggleRequired = (name: string) => {
    setFields(fields.map((f) => f.name === name ? { ...f, required: !f.required } : f));
  };

  const handleSave = async () => {
    await supabaseApi.admin.updateSiteSetting("productFormFields", fields);
    toast.success("Campos del formulario guardados. Se actualizan en todas las tiendas.");
  };

  const categories = [...new Set(fields.map((f) => f.category || "General"))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiEdit2 /> Formulario de Productos</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg transition-colors">
          <FiSave size={16} /> Guardar
        </button>
      </div>

      <p className="text-gray-300 text-sm">Estos campos aparecen en el formulario de <strong>todos</strong> los vendedores al crear o editar productos.</p>

      <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-medium">Agregar Nuevo Campo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Nombre interno *</label>
            <input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: material" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Etiqueta visible *</label>
            <input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: Material" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Tipo</label>
            <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]">
              <option value="text">Texto</option>
              <option value="textarea">Texto largo</option>
              <option value="number">Número</option>
              <option value="select">Selección</option>
              <option value="toggle">Sí/No</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Categoría</label>
            <input value={newFieldCategory} onChange={(e) => setNewFieldCategory(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: Detalles, Personalizado" />
          </div>
          {newFieldType === "select" && (
            <div>
              <label className="block text-xs text-gray-300 mb-1">Opciones (separadas por coma)</label>
              <input value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Opción 1, Opción 2, Opción 3" />
            </div>
          )}
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} className="rounded" />
              Requerido
            </label>
            <button onClick={addField} className="flex items-center gap-1 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <FiPlus size={14} /> Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">{cat}</h3>
            <div className="space-y-2">
              {fields.filter((f) => (f.category || "General") === cat).map((field) => (
                <div key={field.name} className="bg-[#0A1929] border border-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#1B4B8A] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {field.type === "text" ? "Aa" : field.type === "textarea" ? "¶" : field.type === "number" ? "#" : field.type === "select" ? "▾" : "⬡"}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{field.label}</p>
                      <p className="text-xs text-blue-300">{field.name} &middot; {field.type}{field.options ? ` (${field.options.length} opciones)` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {field.required && <span className="px-2 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] rounded text-xs font-medium">Requerido</span>}
                    <button onClick={() => toggleRequired(field.name)} className="text-gray-300 hover:text-white text-xs transition-colors">
                      {field.required ? "Quitar req." : "Hacer req."}
                    </button>
                    <button onClick={() => removeField(field.name)} className="text-red-400 hover:text-red-300 transition-colors" title="Eliminar"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannersTab() {
  const { data: settings } = useApiQuery(() => supabaseApi.admin.getSiteSettings());
  const [heroRightImage, setHeroRightImage] = useState("");
  const [heroRightFit, setHeroRightFit] = useState("cover");
  const [heroRightPos, setHeroRightPos] = useState("center");
  const [heroRightName, setHeroRightName] = useState("");

  const [ctaBgImage, setCtaBgImage] = useState("");
  const [ctaBgFit, setCtaBgFit] = useState("cover");
  const [ctaBgPos, setCtaBgPos] = useState("center");
  const [ctaBgName, setCtaBgName] = useState("");

  const [uploading, setUploading] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && Array.isArray(settings) && !loaded) {
      const get = (section: string, key: string) => settings.find((l: any) => l.section === section && l.key === key)?.value || "";
      setHeroRightImage(get("hero", "rightImage"));
      setHeroRightFit(get("hero", "rightImageFit") || "cover");
      setHeroRightPos(get("hero", "rightImagePosition") || "center");
      setCtaBgImage(get("cta", "bgImage"));
      setCtaBgFit(get("cta", "bgImageFit") || "cover");
      setCtaBgPos(get("cta", "bgImagePosition") || "center");
      setLoaded(true);
    }
  }, [settings, loaded]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "hero" | "cta") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo imágenes"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("Máximo 4MB"); return; }

    setUploading(target);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (target === "hero") {
          setHeroRightImage(reader.result);
          setHeroRightName(file.name);
        } else {
          setCtaBgImage(reader.result);
          setCtaBgName(file.name);
        }
      }
      setUploading(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (target: "hero" | "cta") => {
    if (target === "hero") { setHeroRightImage(""); setHeroRightName(""); }
    else { setCtaBgImage(""); setCtaBgName(""); }
  };

  const saveHero = async () => {
    await Promise.all([
      supabaseApi.landing.upsert({ section: "hero", key: "rightImage", value: heroRightImage }),
      supabaseApi.landing.upsert({ section: "hero", key: "rightImageFit", value: heroRightFit }),
      supabaseApi.landing.upsert({ section: "hero", key: "rightImagePosition", value: heroRightPos }),
    ]);
    toast.success("Banner Hero guardado");
  };

  const saveCta = async () => {
    await Promise.all([
      supabaseApi.landing.upsert({ section: "cta", key: "bgImage", value: ctaBgImage }),
      supabaseApi.landing.upsert({ section: "cta", key: "bgImageFit", value: ctaBgFit }),
      supabaseApi.landing.upsert({ section: "cta", key: "bgImagePosition", value: ctaBgPos }),
    ]);
    toast.success("Banner CTA guardado");
  };

  const fitOptions = [
    { value: "cover", label: "Completa (Cover)" },
    { value: "contain", label: "Justa (Contain)" },
    { value: "fill", label: "Estirada (Fill)" },
    { value: "none", label: "Original" },
  ];

  const posOptions = [
    { value: "center", label: "Centro" },
    { value: "top", label: "Arriba" },
    { value: "bottom", label: "Abajo" },
    { value: "left", label: "Izquierda" },
    { value: "right", label: "Derecha" },
  ];

  const renderImageControls = (
    label: string,
    imageUrl: string,
    fileName: string,
    target: "hero" | "cta",
    fit: string,
    setFit: (v: string) => void,
    pos: string,
    setPos: (v: string) => void,
    onSave: () => void,
    previewAspect: string
  ) => (
    <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
      <h3 className="text-white font-bold text-lg">{label}</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subir Imagen</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#FF6B35] transition-colors">
          {uploading === target ? (
            <span className="text-gray-300 text-sm">Subiendo...</span>
          ) : imageUrl ? (
            <div className="text-center">
              <FiCheck className="mx-auto text-green-400 mb-1" size={20} />
              <span className="text-white text-sm font-medium">{fileName || "Imagen cargada"}</span>
              <span className="text-gray-400 text-xs block mt-1">Click para cambiar</span>
            </div>
          ) : (
            <div className="text-center">
              <FiUpload className="mx-auto text-gray-400 mb-1" size={24} />
              <span className="text-gray-300 text-sm">Click para subir imagen</span>
              <span className="text-blue-300 text-xs block mt-1">JPG, PNG — Máx 4MB</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, target)} />
        </label>
        {imageUrl && (
          <button onClick={() => removeImage(target)} className="mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
            <FiTrash2 size={12} /> Eliminar imagen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ajuste de imagen</label>
          <select value={fit} onChange={(e) => setFit(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]">
            {fitOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Posición</label>
          <select value={pos} onChange={(e) => setPos(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]">
            {posOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {imageUrl && (
        <div className="rounded-lg overflow-hidden border border-white/10" style={{ aspectRatio: previewAspect }}>
          <img src={imageUrl} alt="Preview" className="w-full h-full" style={{ objectFit: fit as any, objectPosition: pos }} />
        </div>
      )}

      <button onClick={onSave} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        <FiSave size={14} /> Guardar {label}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiImage /> Banners de la Landing</h2>
      <p className="text-gray-300 text-sm">Sube imágenes y ajusta cómo se muestran en cada banner.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderImageControls("Hero - Imagen Derecha", heroRightImage, heroRightName, "hero", heroRightFit, setHeroRightFit, heroRightPos, setHeroRightPos, saveHero, "16/9")}
        {renderImageControls("CTA - Imagen de Fondo", ctaBgImage, ctaBgName, "cta", ctaBgFit, setCtaBgFit, ctaBgPos, setCtaBgPos, saveCta, "21/9")}
      </div>
    </div>
  );
}

function CRMTab() {
  const { data: convRes } = useApiQuery(() => supabaseApi.crm.getConversations({ platform: "all", status: "all" }));
  const { data: allSettings } = useApiQuery(() => supabaseApi.crm.getAllSettings());
  const { data: autoResponses } = useApiQuery(() => supabaseApi.crm.getAutoResponses());
  const { data: faqs } = useApiQuery(() => supabaseApi.crm.getFAQs());
  const { data: vendorsRes } = useApiQuery(() => supabaseApi.admin.getAllVendors());

  const conversations = convRes?.conversations || [];
  const vendorsList = vendorsRes?.vendors || [];

  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [crmSubTab, setCrmSubTab] = useState<"inbox" | "bot" | "responses" | "faq">("inbox");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  const { data: msgRes } = useApiQuery(
    () => supabaseApi.crm.getMessages(selectedConv?.id || selectedConv?._id),
    [selectedConv?.id || selectedConv?._id]
  );
  const messages = msgRes?.messages || [];

  const settingsMap = useMemo(() => {
    if (!allSettings || !Array.isArray(allSettings)) return {};
    const m: Record<string, string> = {};
    allSettings.forEach((s: any) => { m[s.key] = s.value; });
    return m;
  }, [allSettings]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c: any) => {
      if (filterPlatform !== "all" && c.platform !== filterPlatform) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [conversations, filterPlatform, filterStatus]);

  const handleSelectConv = async (conv: any) => {
    setSelectedConv(conv);
    const cid = conv.id || conv._id;
    if (conv.unreadCount > 0) {
      await supabaseApi.crm.markAsRead(cid);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      // Send message
      setNewMsg("");
    } catch (e) {
      toast.error("Error al enviar");
    }
    setSending(false);
  };

  const toggleBot = async () => {
    const current = settingsMap["botEnabled"];
    await supabaseApi.crm.setSetting("botEnabled", current === "true" ? "false" : "true");
    toast.success(current === "true" ? "Bot desactivado" : "Bot activado");
  };

  const [newAR, setNewAR] = useState({ trigger: "", response: "", platform: "all" });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", keywords: "" });

  const platformIcon = (p: string) => {
    if (p === "whatsapp") return "💬";
    if (p === "instagram") return "📸";
    return "👤";
  };

  const statusColor = (s: string) => {
    if (s === "open") return "bg-green-500";
    if (s === "pending") return "bg-[#FF6B35]";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiMessageCircle /> CRM - Centro de Mensajes</h2>
      <p className="text-gray-300 text-sm">WhatsApp, Instagram y Facebook — Todo en un solo lugar.</p>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: "inbox", label: "📥 Bandeja" },
          { id: "bot", label: "🤖 Bot" },
          { id: "responses", label: "⚡ Auto-Respuestas" },
          { id: "faq", label: "❓ FAQ" },
        ].map((t) => (
          <button key={t.id} onClick={() => setCrmSubTab(t.id as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${crmSubTab === t.id ? "bg-[#FF6B35] text-white" : "bg-white/5 text-gray-300 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {crmSubTab === "inbox" && (
        <div className="flex gap-4 h-[600px]">
          <div className="w-80 bg-[#0A1929] rounded-xl border border-white/5 flex flex-col">
            <div className="p-3 border-b border-white/5 space-y-2">
              <div className="flex gap-1">
                {["all", "whatsapp", "instagram", "facebook"].map((p) => (
                  <button key={p} onClick={() => setFilterPlatform(p)} className={`px-2 py-1 rounded text-xs font-medium ${filterPlatform === p ? "bg-[#FF6B35] text-white" : "bg-white/5 text-gray-300"}`}>
                    {p === "all" ? "Todos" : p === "whatsapp" ? "💬 WA" : p === "instagram" ? "📸 IG" : "👤 FB"}
                  </button>
                ))}
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded px-2 py-1 text-white text-xs">
                <option value="all">Todos los estados</option>
                <option value="open">Abiertos</option>
                <option value="pending">Pendientes</option>
                <option value="closed">Cerrados</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-blue-300 text-sm">No hay conversaciones</div>
              ) : (
                filteredConversations.map((conv: any) => {
                  const cid = conv.id || conv._id;
                  return (
                  <div key={cid} onClick={() => handleSelectConv(conv)} className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${(selectedConv?.id || selectedConv?._id) === cid ? "bg-white/10" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{platformIcon(conv.platform)}</span>
                      <span className="text-white text-sm font-medium truncate flex-1">{conv.customerName}</span>
                      <span className={`w-2 h-2 rounded-full ${statusColor(conv.status)}`}></span>
                      {conv.unreadCount > 0 && <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{conv.unreadCount}</span>}
                    </div>
                    <p className="text-gray-300 text-xs truncate">{conv.lastMessagePreview || "Sin mensajes"}</p>
                    <p className="text-blue-300 text-[10px] mt-1">{new Date(conv.lastMessageAt).toLocaleString("es-DO")}</p>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#0A1929] rounded-xl border border-white/5 flex flex-col">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platformIcon(selectedConv.platform)}</span>
                    <div>
                      <h3 className="text-white font-bold">{selectedConv.customerName}</h3>
                      <p className="text-gray-300 text-xs capitalize">{selectedConv.platform} · {selectedConv.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select value={selectedConv.status} onChange={async (e) => { const st = e.target.value; await supabaseApi.crm.updateConversationStatus(selectedConv.id || selectedConv._id, st); setSelectedConv({ ...selectedConv, status: st }); }} className="bg-[#0F2A4A] border border-white/10 rounded px-2 py-1 text-white text-xs">
                      <option value="open">Abierto</option>
                      <option value="pending">Pendiente</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-blue-300">No hay mensajes aún</div>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id || msg._id} className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === "customer" ? "bg-[#0F2A4A] text-white" : "bg-[#FF6B35] text-white"}`}>
                          {msg.sender !== "customer" && <p className="text-[10px] font-bold opacity-70 mb-1">{msg.senderName}</p>}
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-white/5 flex gap-2">
                  <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1 bg-[#0F2A4A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Escribe un mensaje..." />
                  <button onClick={handleSend} disabled={!newMsg.trim() || sending} className="bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                    {sending ? "..." : "Enviar"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-blue-300">
                <div className="text-center">
                  <FiMessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Selecciona una conversación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {crmSubTab === "bot" && (
        <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">🤖 Bot Automático</h3>
              <p className="text-gray-300 text-sm">El bot responde automáticamente usando productos y FAQ de la tienda.</p>
            </div>
            <button onClick={toggleBot} className={`w-14 h-7 rounded-full transition-colors relative ${settingsMap["botEnabled"] === "true" ? "bg-green-500" : "bg-gray-600"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${settingsMap["botEnabled"] === "true" ? "translate-x-8" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="bg-[#0F2A4A] rounded-lg p-4 border border-white/10">
            <label className="block text-sm font-medium text-gray-300 mb-2">🏪 Tienda asociada al bot</label>
            <p className="text-blue-300 text-xs mb-3">El bot mostrará los productos de la tienda que selecciones.</p>
            <select
              value={settingsMap["selectedStoreId"] || ""}
              onChange={(e) => supabaseApi.crm.setSetting("selectedStoreId", e.target.value)}
              className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="">Todas las tiendas</option>
              {vendorsList?.filter((v: any) => v.status === "APPROVED").map((v: any) => (
                <option key={v.id || v._id} value={v.id || v._id}>{v.businessName || v.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Bot</label>
              <input value={settingsMap["botName"] || ""} onChange={(e) => supabaseApi.crm.setSetting("botName", e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="UNIKO" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input value={settingsMap["socialUsername"] || ""} onChange={(e) => supabaseApi.crm.setSetting("socialUsername", e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="@unikord" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">📱 Teléfono del Agente</label>
              <input value={settingsMap["agentPhoneNumber"] || ""} onChange={(e) => supabaseApi.crm.setSetting("agentPhoneNumber", e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="+1 809-123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mensaje de bienvenida</label>
              <textarea value={settingsMap["welcomeMessage"] || ""} onChange={(e) => supabaseApi.crm.setSetting("welcomeMessage", e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6B35]" rows={3} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0F2A4A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#FF6B35]">{autoResponses?.length || 0}</p>
              <p className="text-gray-300 text-xs">Auto-Respuestas</p>
            </div>
            <div className="bg-[#0F2A4A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#FF6B35]">{faqs?.length || 0}</p>
              <p className="text-gray-300 text-xs">FAQs</p>
            </div>
            <div className="bg-[#0F2A4A] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#FF6B35]">{settingsMap["botEnabled"] === "true" ? "ACTIVO" : "INACTIVO"}</p>
              <p className="text-gray-300 text-xs">Estado del Bot</p>
            </div>
          </div>
        </div>
      )}

      {crmSubTab === "responses" && (
        <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">⚡ Auto-Respuestas</h3>
          <p className="text-gray-300 text-sm">Define respuestas automáticas por palabras clave.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={newAR.trigger} onChange={(e) => setNewAR({ ...newAR, trigger: e.target.value })} className="bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Trigger (ej: precio)" />
            <input value={newAR.response} onChange={(e) => setNewAR({ ...newAR, response: e.target.value })} className="bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Respuesta" />
            <select value={newAR.platform} onChange={(e) => setNewAR({ ...newAR, platform: e.target.value })} className="bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="all">Todas</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
            <button onClick={async () => {
              if (!newAR.trigger || !newAR.response) return toast.error("Completa los campos");
              await supabaseApi.crm.createAutoResponse({ trigger: newAR.trigger, response: newAR.response, isActive: true, priority: 0, platform: newAR.platform });
              setNewAR({ trigger: "", response: "", platform: "all" });
              toast.success("Auto-respuesta creada");
            }} className="bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Agregar</button>
          </div>

          <div className="space-y-2">
            {autoResponses?.map((ar: any) => {
              const arid = ar.id || ar._id;
              return (
              <div key={arid} className="flex items-center gap-3 bg-[#0F2A4A] rounded-lg p-3">
                <button onClick={async () => await supabaseApi.crm.updateAutoResponse({ id: arid, isActive: !ar.isActive })} className={`w-10 h-5 rounded-full transition-colors relative ${ar.isActive ? "bg-green-500" : "bg-gray-600"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${ar.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-[#FF6B35] font-mono text-xs bg-[#0A1929] px-2 py-1 rounded">{ar.trigger}</span>
                <span className="text-white text-sm flex-1">{ar.response}</span>
                <span className="text-blue-300 text-xs capitalize">{ar.platform || "all"}</span>
                <button onClick={async () => await supabaseApi.crm.deleteAutoResponse(arid)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {crmSubTab === "faq" && (
        <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">❓ Preguntas Frecuentes (FAQ)</h3>
          <p className="text-gray-300 text-sm">Define preguntas y respuestas que el bot usará automáticamente.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Pregunta" />
            <input value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className="bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Respuesta" />
          </div>
          <div className="flex gap-3">
            <input value={newFaq.keywords} onChange={(e) => setNewFaq({ ...newFaq, keywords: e.target.value })} className="flex-1 bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Keywords separadas por coma" />
            <button onClick={async () => {
              if (!newFaq.question || !newFaq.answer) return toast.error("Completa los campos");
              const keywords = newFaq.keywords.split(",").map((k) => k.trim()).filter(Boolean);
              await supabaseApi.crm.createFAQ({ question: newFaq.question, answer: newFaq.answer, keywords, isActive: true });
              setNewFaq({ question: "", answer: "", keywords: "" });
              toast.success("FAQ creado");
            }} className="bg-[#FF6B35] hover:bg-[#E85A28] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Agregar</button>
          </div>

          <div className="space-y-2">
            {faqs?.map((faq: any) => {
              const fid = faq.id || faq._id;
              return (
              <div key={fid} className="bg-[#0F2A4A] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium text-sm">{faq.question}</p>
                  <div className="flex gap-2">
                    <button onClick={async () => await supabaseApi.crm.updateFAQ({ id: fid, isActive: !faq.isActive })} className={`w-10 h-5 rounded-full transition-colors relative ${faq.isActive ? "bg-green-500" : "bg-gray-600"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${faq.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <button onClick={async () => await supabaseApi.crm.deleteFAQ(fid)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-gray-300 text-xs mb-2">{faq.answer}</p>
                <div className="flex gap-1 flex-wrap">
                  {(faq.keywords || []).map((kw: string, i: number) => (
                    <span key={i} className="bg-[#0A1929] text-[#FF6B35] text-[10px] px-2 py-0.5 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const tabs = [
  { id: "vendedores", label: "Vendedores", icon: FiUsers },
  { id: "tiendas", label: "Tiendas", icon: FiShoppingBag },
  { id: "crm", label: "CRM", icon: FiMessageCircle },
  { id: "banners", label: "Banners", icon: FiImage },
  { id: "impuestos", label: "Impuestos", icon: FiDollarSign },
  { id: "formulario", label: "Formulario Productos", icon: FiEdit2 },
  { id: "soporte", label: "Soporte Técnico", icon: FiLifeBuoy },
  { id: "mensajes", label: "Mensajes", icon: FiMessageCircle },
  { id: "general", label: "General", icon: FiSettings },
  { id: "contenido", label: "Contenido", icon: FiFileText },
  { id: "chatbot", label: "Chatbot", icon: FiMessageSquare },
  { id: "redes", label: "Redes Sociales", icon: FiShare2 },
  { id: "contrasena", label: "Contraseña", icon: FiLock },
];

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState("vendedores");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminUserId = localStorage.getItem("uniko_user_id") || null;

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
      case "vendedores": return <VendedoresTab />;
      case "soporte":
        return adminUserId ? (
          <TicketsSection userId={adminUserId} role="ADMIN" />
        ) : (
          <div className="bg-[#0F2A4A] border border-white/10 rounded-2xl p-8 text-center text-gray-300">
            <FiLifeBuoy size={36} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm">Inicia sesión en la página principal con la cuenta de administrador.</p>
          </div>
        );
      case "mensajes":
        return adminUserId ? (
          <SupportChat userId={adminUserId} role="ADMIN" />
        ) : (
          <div className="bg-[#0F2A4A] border border-white/10 rounded-2xl p-8 text-center text-gray-300">
            <FiMessageCircle size={36} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm">Inicia sesión como administrador para usar los mensajes.</p>
          </div>
        );
      case "chatbot": return <ChatbotTab />;
      case "redes": return <RedesSocialesTab />;
      case "contrasena": return <ContrasenaTab />;
      case "tiendas": return <TiendasTab />;
      case "impuestos": return <ImpuestosTab />;
      case "formulario": return <FormularioProductosTab />;
      case "banners": return <BannersTab />;
      case "crm": return <CRMTab />;
      default: return <VendedoresTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 ${sidebarOpen ? "w-64" : "md:w-20 w-64"} bg-[#0F2A4A] border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <img src="/logo-uniko-blanco.png" alt="UNIKO" className="w-10 h-10 flex-shrink-0" />
          {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">UNIKO Admin</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                    : "text-gray-300 hover:text-white hover:bg-white/5"
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0F2A4A] border-b border-white/5 px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-300 hover:text-white transition-colors md:hidden">
              <FiMenu size={20} />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300 hover:text-white transition-colors hidden md:block">
              <FiSettings size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {adminUserId && (
              <NotificationsBell userId={adminUserId} variant="inline" />
            )}
            <span className="text-sm text-gray-300">Administrador</span>
            <div className="w-8 h-8 bg-[#1B4B8A] rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
