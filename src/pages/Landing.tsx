import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api as convexApi } from "../../convex/_generated/api";
import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import { useState, useEffect, useRef } from "react";
import {
  FiSmartphone,
  FiHeart,
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiCheckCircle,
  FiDollarSign,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiMapPin,
  FiTrendingUp,
  FiAward,
  FiSearch,
  FiCreditCard,
  FiPackage,
  FiClock,
  FiPercent,
  FiChevronDown,
  FiArrowRight,
} from "react-icons/fi";
import UnikoLogo from "../components/ui/UnikoLogo";

const categories = [
  { icon: <FiSmartphone size={28} />, label: "Tecnología", slug: "tecnologia" },
  { icon: <FiHeart size={28} />, label: "Bienestar", slug: "bienestar" },
  { icon: <FiHome size={28} />, label: "Hogar", slug: "hogar" },
  { icon: <FiGrid size={28} />, label: "Auto", slug: "auto" },
  { icon: <FiShoppingBag size={28} />, label: "Moda", slug: "moda" },
];

const stats = [
  { number: 10000, suffix: "+", label: "Productos" },
  { number: 500, suffix: "+", label: "Vendedores" },
  { number: 50000, suffix: "+", label: "Clientes" },
  { number: 32, suffix: "", label: "Provincias" },
];

const platformFeatures = [
  { icon: <FiUsers size={32} />, title: "Miles de Vendedores", desc: "Productos de todas las categorías" },
  { icon: <FiShield size={32} />, title: "Compra con Confianza", desc: "Pagos seguros y protección al cliente" },
  { icon: <FiTruck size={32} />, title: "Envíos a Todo RD", desc: "Rápidos y seguros a todo el país" },
  { icon: <FiHeadphones size={32} />, title: "Atención 24/7", desc: "Siempre estamos para ayudarte" },
];

const benefits = [
  { icon: <FiDollarSign size={24} />, title: "Ofertas Exclusivas" },
  { icon: <FiShield size={24} />, title: "Pagos Seguros y Flexibles" },
  { icon: <FiRefreshCw size={24} />, title: "Devoluciones Fáciles" },
  { icon: <FiCheckCircle size={24} />, title: "Calidad Garantizada" },
];

const howItWorks = [
  { step: "01", icon: <FiSearch size={32} />, title: "Busca", desc: "Encuentra lo que necesitas entre miles de productos de vendedores dominicanos." },
  { step: "02", icon: <FiCreditCard size={32} />, title: "Paga Seguro", desc: "Múltiples métodos de pago: tarjeta, transferencia, efectivo contra entrega." },
  { step: "03", icon: <FiPackage size={32} />, title: "Recibe", desc: "Paga al recibir tu pedido. Solo paga cuando tengas el artículo en tus manos." },
  { step: "04", icon: <FiCheckCircle size={32} />, title: "Disfruta", desc: "Calidad garantizada y soporte 24/7 para cualquier inconveniente." },
];

const testimonials = [
  {
    name: "María González",
    role: "Cliente frecuente",
    text: "UNIKO me cambió la forma de comprar. Todo lo que necesito está en un solo lugar y el envío es súper rápido.",
    rating: 5,
    avatar: "M",
  },
  {
    name: "Carlos Rodríguez",
    role: "Vendedor en UNIKO",
    text: "Como vendedor, UNIKO me dio la oportunidad de llegar a clientes de todo el país. Mis ventas aumentaron un 300%.",
    rating: 5,
    avatar: "C",
  },
  {
    name: "Ana Martínez",
    role: "Emprendedora",
    text: "La plataforma es fácil de usar y el soporte es increíble. Recomiendo UNIKO a todos mis amigos.",
    rating: 5,
    avatar: "A",
  },
];

const faqs = [
  {
    q: "¿Cómo creo mi tienda en UNIKO?",
    a: "Solo registrarte como vendedor, completa tu perfil y empieza a subir tus productos. El proceso es gratis y toma menos de 5 minutos.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito/débito, transferencias bancarias, pago en efectivo contra entrega y billeteras digitales.",
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "Los envíos en Santo Domingo tardan 1-2 días. Para otras provincias de 2-5 días hábiles.",
  },
  {
    q: "¿Puedo devolver un producto?",
    a: "Sí, tienes hasta 30 días para devolver cualquier producto sin preguntas. Nosotros nos encargamos del recojo.",
  },
  {
    q: "¿Es seguro comprar en UNIKO?",
    a: "Totalmente. Tenemos protección al comprador, pagos seguros y vendedores verificados por nuestro equipo.",
  },
];

const featuredProducts = [
  { name: "Audífonos Bluetooth Pro", price: 2499, oldPrice: 3299, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", badge: "-24%" },
  { name: "Smartwatch Deportivo", price: 3899, oldPrice: 5199, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", badge: "-25%" },
  { name: "Cámara Mirrorless 4K", price: 18999, oldPrice: 24999, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", badge: "-24%" },
  { name: "Parlante Portátil WiFi", price: 1899, oldPrice: 2599, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", badge: "-27%" },
  { name: "Laptop Ultradelgada 15\"", price: 32999, oldPrice: 39999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", badge: "-18%" },
  { name: "Auriculares Noise Cancel", price: 4299, oldPrice: 5999, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop", badge: "-28%" },
  { name: "Tablet 10\" HD", price: 8499, oldPrice: 10999, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop", badge: "-23%" },
  { name: "Teclado Mecánico RGB", price: 1599, oldPrice: 2199, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop", badge: "-27%" },
];

const formatPrice = (p: number) => `RD$${p.toLocaleString()}`;

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

const brandValues = [
  {
    icon: <FiUsers size={36} />,
    title: "Para Todos",
    desc: "Una experiencia de compra para cada estilo de vida.",
    color: "text-uniko-red",
  },
  {
    icon: <FiMapPin size={36} />,
    title: "Somos RD",
    desc: "Hecho para los dominicanos, por dominicanos.",
    color: "text-uniko-blue",
  },
  {
    icon: <FiTrendingUp size={36} />,
    title: "Crecemos Contigo",
    desc: "Más vendedores, más productos, más oportunidades.",
    color: "text-uniko-red",
  },
  {
    icon: <FiAward size={36} />,
    title: "Tu Mejor Opción",
    desc: "Calidad, precio y confianza en un solo lugar.",
    color: "text-uniko-red",
  },
];

export default function Landing() {
  const landingData = useQuery(convexApi.landing.getAll);
  const landing = landingData || [];
  const { data: realProducts } = useApiQuery(() => api.products.getAll({ sort: "popular" }));
  const { data: vendors } = useApiQuery(() => api.stores.getAll());
  const getVal = (section: string, key: string, fallback: string) => {
    const item = landing.find((l: any) => l.section === section && l.key === key);
    return item?.value || fallback;
  };

  return (
    <div className="bg-white">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-2 min-h-[600px]">
        <div className="bg-white px-8 py-16 md:px-16 md:py-20 flex flex-col justify-center">
          <div className="mb-6">
            <img src="/logo-uniko.png" alt="UNIKO Marketplace Dominicano" className="w-full max-w-md" />
          </div>
          <p className="text-uniko-dark text-xl md:text-2xl font-bold mb-10">{getVal("hero", "subtitle", "Todo lo que buscas, en un solo lugar.")}</p>
          <div className="flex flex-wrap gap-6 md:gap-10 mb-10">
            {categories.map((cat, i) => (
              <Link to={`/productos?category=${cat.slug}`} key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-full border-2 border-uniko-blue/20 flex items-center justify-center text-uniko-blue group-hover:border-uniko-red group-hover:text-uniko-red transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-uniko-blue uppercase tracking-wide group-hover:text-uniko-red transition">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/productos" className="bg-uniko-red hover:bg-uniko-red text-white font-bold px-8 py-3.5 rounded-lg text-sm transition shadow-lg">Explorar Productos</Link>
            <Link to="/registro" className="border-2 border-uniko-dark text-uniko-dark hover:bg-uniko-dark hover:text-white font-bold px-8 py-3.5 rounded-lg text-sm transition">Vender en UNIKO</Link>
            <Link to="/login" className="bg-uniko-blue hover:bg-[#002280] text-white font-bold px-8 py-3.5 rounded-lg text-sm transition shadow-lg">Iniciar Sesión</Link>
          </div>
        </div>
        <div
          className={`text-white px-8 py-16 md:px-12 md:py-16 flex flex-col justify-center relative overflow-hidden ${!getVal("hero", "rightImage", "") ? "bg-uniko-dark" : ""}`}
          style={getVal("hero", "rightImage", "") ? {
            backgroundImage: `url(${getVal("hero", "rightImage", "")})`,
            backgroundSize: getVal("hero", "rightImageFit", "cover"),
            backgroundPosition: getVal("hero", "rightImagePosition", "center"),
          } : undefined}
        >
          {!getVal("hero", "rightImage", "") ? null : (
            <div className="absolute inset-0 bg-uniko-dark/80 backdrop-blur-sm z-0"></div>
          )}
          <div className={!getVal("hero", "rightImage", "") ? "" : "relative z-10"}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Una Plataforma,</h2>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10"><span className="text-uniko-red">Infinitas</span> Posibilidades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {platformFeatures.map((feat, i) => (
                <div key={i} className="text-center">
                  <div className="text-uniko-red mb-3 flex justify-center">{feat.icon}</div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{feat.title}</h3>
                  <p className="text-white/80 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {benefits.map((b, i) => (
                  <div key={i} className="text-center">
                    <div className="text-uniko-red mb-2 flex justify-center">{b.icon}</div>
                    <p className="text-xs font-semibold leading-tight">{b.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="bg-uniko-blue py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center text-white">
                <p className="text-4xl md:text-5xl font-extrabold mb-2">
                  <AnimatedCounter target={s.number} suffix={s.suffix} />
                </p>
                <p className="text-white/80 font-medium uppercase tracking-wider text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES SHOWCASE ────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">Explora por Categoría</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">Todo lo que buscas, en un solo lugar</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {categories.map((cat, i) => (
              <Link to={`/productos?category=${cat.slug}`} key={i} className="group bg-white hover:bg-uniko-dark rounded-2xl p-8 text-center transition duration-300 cursor-pointer">
                <div className="w-20 h-20 mx-auto mb-4 bg-white group-hover:bg-uniko-red/10 rounded-2xl flex items-center justify-center text-uniko-blue group-hover:text-uniko-red transition-colors shadow-sm">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-uniko-dark group-hover:text-white transition">{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">Ofertas del Día</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">Lo más vendido</h2>
            </div>
            <Link to="/productos" className="text-uniko-blue hover:text-uniko-red font-bold text-sm flex items-center gap-1 transition">
              Ver todos <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(realProducts || []).slice(0, 8).map((p: any, i: number) => {
              const pid = p.id || p._id;
              const imgSrc = p.imageUrl || (p.images && p.images[0]) || "/logo-uniko.png";
              const price = p.price;
              const comparePrice = p.originalPrice || p.compareAtPrice || 0;
              const storeName = p.vendor?.businessName || p.storeName || "";
              return (
              <Link to={`/producto/${pid}`} key={pid} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                <div className="relative overflow-hidden">
                  <img src={imgSrc} alt={p.name} className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/logo-uniko.png"; }} />
                  {comparePrice > price && (
                    <span className="absolute top-3 left-3 bg-uniko-red text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      -{Math.round(((comparePrice - price) / comparePrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {storeName && <p className="text-xs text-uniko-blue mb-1">{storeName}</p>}
                  <h3 className="font-bold text-uniko-dark mb-2 group-hover:text-uniko-red transition line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-uniko-red font-extrabold text-lg">RD${price.toLocaleString()}</span>
                    {comparePrice > price && (
                      <span className="text-white/80 line-through text-sm">RD${comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiStar className="text-uniko-red fill-uniko-red" size={14} />
                    <span className="text-sm text-uniko-blue/70">{p.rating?.toFixed(1) || "0.0"} ({p.reviewsCount || p.reviewCount || 0})</span>
                  </div>
                </div>
              </Link>
              );
            })}
            {(!realProducts || realProducts.length === 0) && (
              <p className="col-span-full text-center text-uniko-blue/70 py-8">
                No hay productos disponibles todavía.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── TIENDAS / STORES ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">Nuestras Tiendas</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">Vendedores Verificados</h2>
            </div>
            <Link to="/tiendas" className="text-uniko-blue hover:text-uniko-red font-bold text-sm flex items-center gap-1 transition">
              Ver todas <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(vendors || []).slice(0, 8).map((v: any) => (
              <Link to={`/tienda/${v.slug}`} key={v.id} className="bg-white border border-uniko-blue/10 rounded-2xl p-6 hover:shadow-xl transition group text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-uniko-blue">{v.name?.charAt(0)}</span>
                  )}
                </div>
                <h3 className="font-bold text-uniko-dark group-hover:text-uniko-red transition mb-1 truncate">{v.name}</h3>
                {v.description && <p className="text-uniko-blue/70 text-xs mb-3 line-clamp-2">{v.description}</p>}
                <div className="flex items-center justify-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1"><FiStar className="text-uniko-red fill-uniko-red" size={12} />{v.rating?.toFixed(1) || "0.0"}</span>
                  <span>{v.productCount || 0} productos</span>
                </div>
              </Link>
            ))}
            {(!vendors || vendors.length === 0) && (
              <p className="col-span-full text-center text-uniko-blue/70 py-8">Próximamente tendrás tiendas Uniko.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">{getVal("howItWorks", "title", "¿Cómo Funciona?")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">Comprar en UNIKO es fácil</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-uniko-red/20 -translate-x-1/2 z-0"></div>}
                <div className="relative bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition h-full">
                  <span className="text-6xl font-extrabold text-uniko-red/10 absolute top-4 right-6">{step.step}</span>
                  <div className="w-16 h-16 mx-auto mb-6 bg-uniko-red/10 rounded-2xl flex items-center justify-center text-uniko-red">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-uniko-dark mb-3">{step.title}</h3>
                  <p className="text-uniko-blue/70 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">{getVal("testimonials", "title", "Lo Que Dicen Nuestros Usuarios")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">Miles de clientes satisfechos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} size={18} className="text-uniko-red fill-uniko-red" />
                  ))}
                </div>
                <p className="text-uniko-blue leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-uniko-blue rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-uniko-dark">{t.name}</p>
                    <p className="text-sm text-uniko-blue/70">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND VALUES ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">{getVal("brandValues", "title", "Nuestros Valores")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">¿Por qué UNIKO?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandValues.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
                <div className={`${v.color} mb-4 flex justify-center`}>{v.icon}</div>
                <h3 className="text-xl font-bold text-uniko-dark mb-2">{v.title}</h3>
                <p className="text-uniko-blue/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-uniko-dark rounded-3xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{getVal("features", "title", "Todo Lo Que Necesitas")}</h2>
              <p className="text-white/80 max-w-2xl mx-auto">Una plataforma completa para comprar y vender con confianza</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <FiTruck size={24} />, title: "Envío Gratis", desc: "En compras mayores a RD$2,000" },
                { icon: <FiShield size={24} />, title: "Compra Protegida", desc: "Tu dinero está seguro hasta que recibas" },
                { icon: <FiCreditCard size={24} />, title: "Pagos Flexibles", desc: "Acepta todas las tarjetas y transferencias" },
                { icon: <FiPercent size={24} />, title: "Ofertas Diarias", desc: "Descuentos exclusivos todos los días" },
                { icon: <FiClock size={24} />, title: "Soporte 24/7", desc: "Estamos Uniko para ayudarte siempre" },
                { icon: <FiRefreshCw size={24} />, title: "Devoluciones", desc: "30 días para devolver sin preguntas" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-5">
                  <div className="text-uniko-red mt-1">{f.icon}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-white/80 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-uniko-red font-bold text-sm uppercase tracking-widest mb-2">{getVal("faq", "title", "Preguntas Frecuentes")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-uniko-dark">¿Tienes dudas?</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-uniko-dark hover:text-uniko-red transition">
                  {faq.q}
                  <FiChevronDown className="text-white/80 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-uniko-blue leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={getVal("cta", "bgImage", "") ? {
          backgroundImage: `url(${getVal("cta", "bgImage", "")})`,
          backgroundSize: getVal("cta", "bgImageFit", "cover"),
          backgroundPosition: getVal("cta", "bgImagePosition", "center"),
        } : undefined}
      >
        <div className={`absolute inset-0 ${getVal("cta", "bgImage", "") ? "bg-gradient-to-r from-uniko-dark/90 via-uniko-blue/80 to-uniko-dark/90" : "bg-gradient-to-r from-uniko-dark via-uniko-blue to-uniko-dark"}`}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo-uniko-white.png" alt="UNIKO" className="h-20" />
          </div>
          <p className="text-white text-xl mb-3">{getVal("cta", "title", "UNIKO, mucho más que una tienda.")}</p>
          <p className="text-uniko-red text-3xl font-extrabold mb-4">{getVal("cta", "subtitle", "Es tu marketplace.")}</p>
          <p className="text-gray-300 mb-10 max-w-xl mx-auto">{getVal("cta", "description", "Únete a miles de dominicanos que ya compran y venden en UNIKO. Empieza hoy mismo.")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/productos" className="bg-uniko-red hover:bg-uniko-red text-white font-bold px-10 py-4 rounded-lg text-base transition shadow-lg flex items-center gap-2">
              Comprar Ahora <FiArrowRight />
            </Link>
            <Link to="/registro" className="border-2 border-white text-white hover:bg-white hover:text-uniko-dark font-bold px-10 py-4 rounded-lg text-base transition">
              Vender en UNIKO
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-uniko-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="mb-4">
                <img src="/logo-uniko-white.png" alt="UNIKO" className="h-16" />
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{getVal("footer", "description", "Marketplace dominicano. Todo lo que buscas, en un solo lugar.")}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Comprar</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li><Link to="/productos" className="hover:text-uniko-red transition">Productos</Link></li>
                <li><Link to="/tiendas" className="hover:text-uniko-red transition">Tiendas</Link></li>
                <li><Link to="/productos?sort=popular" className="hover:text-uniko-red transition">Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Vender</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li><Link to="/registro" className="hover:text-uniko-red transition">Crear Tienda</Link></li>
                <li><Link to="/vendor/dashboard" className="hover:text-uniko-red transition">Panel de Vendor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>Soporte 24/7</li>
                <li>info@uniko-rd.com</li>
                <li>Santo Domingo, RD</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-uniko-blue/70 text-sm">© 2026 UNIKO. Todos los derechos reservados.</p>
            <p className="text-uniko-blue/70 text-sm">www.uniko-rd.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
