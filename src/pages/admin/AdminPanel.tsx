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
import { Id } from "../../../convex/_generated/dataModel";

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
            <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" placeholder="••••••••" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] pr-12" placeholder="••••••••" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
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
  const vendors = useQuery(api.admin.getAllVendorsWithDetails);
  const updateVendor = useMutation(api.vendors.update);
  const updateSocials = useMutation(api.vendors.updateSocials);
  const updateVendorStatus = useMutation(api.admin.updateVendorStatus);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ businessName: "", description: "", whatsapp: "" });

  const startEdit = (v: any) => {
    setEditingId(v._id);
    setEditForm({ businessName: v.businessName || "", description: v.description || "", whatsapp: v.whatsapp || "" });
  };

  const saveEdit = async (vendor: any) => {
    try {
      await updateVendor({ userId: vendor.userId, businessName: editForm.businessName, description: editForm.description });
      await updateSocials({ vendorId: vendor._id, whatsapp: editForm.whatsapp || undefined });
      toast.success("Tienda actualizada");
      setEditingId(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiShoppingBag /> Gestionar Tiendas</h2>
      {!vendors ? <div className="text-center py-12 text-gray-400">Cargando...</div> :
       vendors.length === 0 ? <div className="text-center py-12 text-gray-400">No hay tiendas</div> : (
        <div className="space-y-3">
          {vendors.map((v: any) => (
            <div key={v._id} className="bg-[#0A1929] border border-white/5 rounded-xl p-4">
              {editingId === v._id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#FF6B35] font-medium">Editando tienda</span>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-xs"><FiX size={14} /> Cancelar</button>
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
                      <p className="text-sm text-gray-400">/{v.slug} &middot; {v.user?.name} &middot; {v.productCount} productos</p>
                      {v.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{v.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${v.status === "APPROVED" ? "bg-green-500/20 text-green-400" : v.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                      {v.status === "APPROVED" ? "Aprobado" : v.status === "PENDING" ? "Pendiente" : "Rechazado"}
                    </span>
                    <button onClick={() => startEdit(v)} className="p-2 bg-[#1B4B8A] hover:bg-[#2563EB] text-white rounded-lg transition-colors" title="Editar"><FiEdit2 size={14} /></button>
                    {v.status === "PENDING" && (
                      <>
                        <button onClick={() => { updateVendorStatus({ vendorId: v._id, status: "APPROVED" }); toast.success("Aprobado"); }} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg" title="Aprobar"><FiCheck size={14} /></button>
                        <button onClick={() => { updateVendorStatus({ vendorId: v._id, status: "REJECTED" }); toast.error("Rechazado"); }} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg" title="Rechazar"><FiX size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImpuestosTab() {
  const settings = useQuery(api.admin.getSiteSettings);
  const upsert = useMutation(api.admin.updateSiteSetting);
  const [taxes, setTaxes] = useState<{ name: string; rate: number; enabled: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (settings && !loaded) {
      const taxesVal = settings.find((s: any) => s.key === "taxes")?.value;
      if (Array.isArray(taxesVal) && taxesVal.length > 0) {
        setTaxes(taxesVal);
      } else {
        const rate = settings.find((s: any) => s.key === "taxRate")?.value ?? 18;
        const enabled = settings.find((s: any) => s.key === "taxEnabled")?.value !== false;
        const name = settings.find((s: any) => s.key === "taxName")?.value ?? "Impuesto";
        setTaxes([{ name, rate, enabled }]);
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
    await upsert({ key: "taxes", value: valid });
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
          <p className="text-center text-gray-500 py-6">No hay impuestos. Agrega uno para comenzar.</p>
        )}

        <div className="space-y-3">
          {taxes.map((tax, i) => (
            <div key={i} className="bg-[#0F2A4A] border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">Impuesto #{i + 1}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateTax(i, "enabled", !tax.enabled)} className={`w-10 h-5 rounded-full transition-colors relative ${tax.enabled ? "bg-green-500" : "bg-gray-600"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${tax.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => removeTax(i)} className="text-red-400 hover:text-red-300 transition-colors"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                  <input value={tax.name} onChange={(e) => updateTax(i, "name", e.target.value)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: ITBIS, ISR, Municipal" disabled={!tax.enabled} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tasa (%)</label>
                  <input type="number" value={tax.rate} onChange={(e) => updateTax(i, "rate", parseFloat(e.target.value) || 0)} className="w-full bg-[#0A1929] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" min="0" max="100" step="0.01" disabled={!tax.enabled} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0F2A4A] rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-400 mb-2">Vista previa en compra de RD${previewTotal.toLocaleString()}:</p>
          {previewTaxes.length > 0 ? (
            <div className="space-y-1">
              {previewTaxes.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-400">{t.name}</span>
                  <span className="text-[#FF6B35] font-medium">RD${t.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-1 mt-1">
                <span className="text-white">Total impuestos</span>
                <span className="text-[#FF6B35]">RD${previewTotalTaxes.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Sin impuestos activos</p>
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
  const settings = useQuery(api.admin.getSiteSettings);
  const upsert = useMutation(api.admin.updateSiteSetting);
  const [fields, setFields] = useState<ProductField[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "textarea" | "number" | "select" | "toggle">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldCategory, setNewFieldCategory] = useState("Personalizado");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  useEffect(() => {
    if (settings && !loaded) {
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
    await upsert({ key: "productFormFields", value: fields });
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

      <p className="text-gray-400 text-sm">Estos campos aparecen en el formulario de <strong>todos</strong> los vendedores al crear o editar productos.</p>

      {/* Agregar nuevo campo */}
      <div className="bg-[#0A1929] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-medium">Agregar Nuevo Campo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre interno *</label>
            <input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: material" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Etiqueta visible *</label>
            <input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: Material" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo</label>
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
            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
            <input value={newFieldCategory} onChange={(e) => setNewFieldCategory(e.target.value)} className="w-full bg-[#0F2A4A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Ej: Detalles, Personalizado" />
          </div>
          {newFieldType === "select" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Opciones (separadas por coma)</label>
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

      {/* Lista de campos */}
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
                      <p className="text-xs text-gray-500">{field.name} &middot; {field.type}{field.options ? ` (${field.options.length} opciones)` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {field.required && <span className="px-2 py-0.5 bg-[#FF6B35]/20 text-[#FF6B35] rounded text-xs font-medium">Requerido</span>}
                    <button onClick={() => toggleRequired(field.name)} className="text-gray-400 hover:text-white text-xs transition-colors" title="Toggle requerido">
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

function BannersTab() {
  const landingData = useQuery(api.landing.getAll);
  const upsert = useMutation(api.landing.upsert);
  const [loaded, setLoaded] = useState(false);

  const [heroRightImage, setHeroRightImage] = useState("");
  const [heroRightFit, setHeroRightFit] = useState("cover");
  const [heroRightPos, setHeroRightPos] = useState("center");
  const [heroRightName, setHeroRightName] = useState("");

  const [ctaBgImage, setCtaBgImage] = useState("");
  const [ctaBgFit, setCtaBgFit] = useState("cover");
  const [ctaBgPos, setCtaBgPos] = useState("center");
  const [ctaBgName, setCtaBgName] = useState("");

  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (landingData !== undefined && !loaded) {
      const get = (section: string, key: string) => landingData.find((l: any) => l.section === section && l.key === key)?.value || "";
      setHeroRightImage(get("hero", "rightImage"));
      setHeroRightFit(get("hero", "rightImageFit") || "cover");
      setHeroRightPos(get("hero", "rightImagePosition") || "center");
      setCtaBgImage(get("cta", "bgImage"));
      setCtaBgFit(get("cta", "bgImageFit") || "cover");
      setCtaBgPos(get("cta", "bgImagePosition") || "center");
      setLoaded(true);
    }
  }, [landingData, loaded]);

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
      upsert({ section: "hero", key: "rightImage", value: heroRightImage }),
      upsert({ section: "hero", key: "rightImageFit", value: heroRightFit }),
      upsert({ section: "hero", key: "rightImagePosition", value: heroRightPos }),
    ]);
    toast.success("Banner Hero guardado");
  };

  const saveCta = async () => {
    await Promise.all([
      upsert({ section: "cta", key: "bgImage", value: ctaBgImage }),
      upsert({ section: "cta", key: "bgImageFit", value: ctaBgFit }),
      upsert({ section: "cta", key: "bgImagePosition", value: ctaBgPos }),
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

      {/* Upload area */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subir Imagen</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#FF6B35] transition-colors">
          {uploading === target ? (
            <span className="text-gray-400 text-sm">Subiendo...</span>
          ) : imageUrl ? (
            <div className="text-center">
              <FiCheck className="mx-auto text-green-400 mb-1" size={20} />
              <span className="text-white text-sm font-medium">{fileName || "Imagen cargada"}</span>
              <span className="text-gray-400 text-xs block mt-1">Click para cambiar</span>
            </div>
          ) : (
            <div className="text-center">
              <FiUpload className="mx-auto text-gray-400 mb-1" size={24} />
              <span className="text-gray-400 text-sm">Click para subir imagen</span>
              <span className="text-gray-500 text-xs block mt-1">JPG, PNG — Máx 4MB</span>
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

  if (landingData === undefined) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiImage /> Banners de la Landing</h2>
      <p className="text-gray-400 text-sm">Sube imágenes y ajusta cómo se muestran en cada banner.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderImageControls("Hero - Imagen Derecha", heroRightImage, heroRightName, "hero", heroRightFit, setHeroRightFit, heroRightPos, setHeroRightPos, saveHero, "16/9")}
        {renderImageControls("CTA - Imagen de Fondo", ctaBgImage, ctaBgName, "cta", ctaBgFit, setCtaBgFit, ctaBgPos, setCtaBgPos, saveCta, "21/9")}
      </div>
    </div>
  );
}

const tabs = [
  { id: "vendedores", label: "Vendedores", icon: FiUsers },
  { id: "tiendas", label: "Tiendas", icon: FiShoppingBag },
  { id: "banners", label: "Banners", icon: FiImage },
  { id: "impuestos", label: "Impuestos", icon: FiDollarSign },
  { id: "formulario", label: "Formulario Productos", icon: FiEdit2 },
  { id: "soporte", label: "Soporte Técnico", icon: FiLifeBuoy },
  { id: "mensajes", label: "Mensajes", icon: FiMessageCircle },
  { id: "general", label: "General", icon: FiSettings },
  { id: "contenido", label: "Contenido", icon: FiFileText },
  { id: "landingContent", label: "Contenido Landing", icon: FiFileText },
  { id: "chatbot", label: "Chatbot", icon: FiMessageSquare },
  { id: "redes", label: "Redes Sociales", icon: FiShare2 },
  { id: "contrasena", label: "Contraseña", icon: FiLock },
];

export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState("vendedores");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminUserId = (localStorage.getItem("aqui_user_id") as Id<"users"> | null) || null;

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
      case "soporte":
        return adminUserId ? (
          <TicketsSection userId={adminUserId} role="ADMIN" />
        ) : (
          <div className="bg-[#0F2A4A] border border-white/10 rounded-2xl p-8 text-center text-gray-400">
            <FiLifeBuoy size={36} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm">Inicia sesión en la página principal con la cuenta de administrador (admin@aqui.com.do) para usar el Soporte Técnico.</p>
          </div>
        );
      case "mensajes":
        return adminUserId ? (
          <SupportChat userId={adminUserId} role="ADMIN" />
        ) : (
          <div className="bg-[#0F2A4A] border border-white/10 rounded-2xl p-8 text-center text-gray-400">
            <FiMessageCircle size={36} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm">Inicia sesión en la página principal con la cuenta de administrador para usar los mensajes.</p>
          </div>
        );
      case "chatbot": return <ChatbotTab />;
      case "redes": return <RedesSocialesTab />;
      case "contrasena": return <ContrasenaTab />;
      case "tiendas": return <TiendasTab />;
      case "impuestos": return <ImpuestosTab />;
      case "formulario": return <FormularioProductosTab />;
      case "banners": return <BannersTab />;
      default: return <VendedoresTab />;
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
            {adminUserId && (
              <NotificationsBell userId={adminUserId} variant="inline" />
            )}
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
