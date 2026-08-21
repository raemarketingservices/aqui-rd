import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import AquiLogo from "../components/ui/AquiLogo";

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
    text: "AQUÍ me cambió la forma de comprar. Todo lo que necesito está en un solo lugar y el envío es súper rápido.",
    rating: 5,
    avatar: "M",
  },
  {
    name: "Carlos Rodríguez",
    role: "Vendedor en AQUÍ",
    text: "Como vendedor, AQUÍ me dio la oportunidad de llegar a clientes de todo el país. Mis ventas aumentaron un 300%.",
    rating: 5,
    avatar: "C",
  },
  {
    name: "Ana Martínez",
    role: "Emprendedora",
    text: "La plataforma es fácil de usar y el soporte es increíble. Recomiendo AQUÍ a todos mis amigos.",
    rating: 5,
    avatar: "A",
  },
];

const faqs = [
  {
    q: "¿Cómo creo mi tienda en AQUÍ?",
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
    q: "¿Es seguro comprar en AQUÍ?",
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
    color: "text-aqui-orange",
  },
  {
    icon: <FiMapPin size={36} />,
    title: "Somos RD",
    desc: "Hecho para los dominicanos, por dominicanos.",
    color: "text-aqui-blue",
  },
  {
    icon: <FiTrendingUp size={36} />,
    title: "Crecemos Contigo",
    desc: "Más vendedores, más productos, más oportunidades.",
    color: "text-aqui-green",
  },
  {
    icon: <FiAward size={36} />,
    title: "Tu Mejor Opción",
    desc: "Calidad, precio y confianza en un solo lugar.",
    color: "text-aqui-orange",
  },
];

export default function Landing() {
  const landingData = useQuery(api.landing.getAll);
  const landing = landingData || [];
  const realProducts = useQuery(api.products.getAll, { sort: "popular", limit: 8 });
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
            <img src="/logo-aqui.png" alt="AQUÍ Marketplace Dominicano" className="w-full max-w-md" />
          </div>
          <p className="text-aqui-dark text-xl md:text-2xl font-bold mb-10">{getVal("hero", "subtitle", "Todo lo que buscas, en un solo lugar.")}</p>
          <div className="flex flex-wrap gap-6 md:gap-10 mb-10">
            {categories.map((cat, i) => (
              <Link to={`/productos?category=${cat.slug}`} key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-aqui-blue group-hover:border-aqui-orange group-hover:text-aqui-orange transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide group-hover:text-aqui-orange transition">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/productos" className="bg-aqui-orange hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition shadow-lg">Explorar Productos</Link>
            <Link to="/registro" className="border-2 border-aqui-dark text-aqui-dark hover:bg-aqui-dark hover:text-white font-bold px-8 py-3.5 rounded-lg text-sm transition">Vender en AQUÍ</Link>
            <Link to="/login" className="bg-aqui-blue hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition shadow-lg">Iniciar Sesión</Link>
          </div>
        </div>
        <div
          className={`text-white px-8 py-16 md:px-12 md:py-16 flex flex-col justify-center relative overflow-hidden ${!getVal("hero", "rightImage", "") ? "bg-aqui-dark" : ""}`}
          style={getVal("hero", "rightImage", "") ? {
            backgroundImage: `url(${getVal("hero", "rightImage", "")})`,
            backgroundSize: getVal("hero", "rightImageFit", "cover"),
            backgroundPosition: getVal("hero", "rightImagePosition", "center"),
          } : undefined}
        >
          {!getVal("hero", "rightImage", "") ? null : (
            <div className="absolute inset-0 bg-aqui-dark/80 backdrop-blur-sm z-0"></div>
          )}
          <div className={!getVal("hero", "rightImage", "") ? "" : "relative z-10"}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Una Plataforma,</h2>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10"><span className="text-aqui-orange">Infinitas</span> Posibilidades</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {platformFeatures.map((feat, i) => (
                <div key={i} className="text-center">
                  <div className="text-aqui-orange mb-3 flex justify-center">{feat.icon}</div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {benefits.map((b, i) => (
                  <div key={i} className="text-center">
                    <div className="text-aqui-orange mb-2 flex justify-center">{b.icon}</div>
                    <p className="text-xs font-semibold leading-tight">{b.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="bg-aqui-blue py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center text-white">
                <p className="text-4xl md:text-5xl font-extrabold mb-2">
                  <AnimatedCounter target={s.number} suffix={s.suffix} />
                </p>
                <p className="text-blue-200 font-medium uppercase tracking-wider text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES SHOWCASE ────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">Explora por Categoría</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">Todo lo que necesitas, aquí está</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {categories.map((cat, i) => (
              <Link to={`/productos?category=${cat.slug}`} key={i} className="group bg-gray-50 hover:bg-aqui-dark rounded-2xl p-8 text-center transition duration-300 cursor-pointer">
                <div className="w-20 h-20 mx-auto mb-4 bg-white group-hover:bg-aqui-orange/10 rounded-2xl flex items-center justify-center text-aqui-blue group-hover:text-aqui-orange transition-colors shadow-sm">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-aqui-dark group-hover:text-white transition">{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">Ofertas del Día</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">Lo más vendido</h2>
            </div>
            <Link to="/productos" className="text-aqui-blue hover:text-aqui-orange font-bold text-sm flex items-center gap-1 transition">
              Ver todos <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(realProducts || []).map((p: any, i: number) => (
              <Link to={`/producto/${p._id}`} key={p._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                <div className="relative overflow-hidden">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/logo-aqui.png"; }} />
                  ) : (
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                      <img src="/logo-aqui.png" alt="AQUÍ" className="w-24 h-24 object-contain opacity-30" />
                    </div>
                  )}
                  {p.compareAtPrice > p.price && (
                    <span className="absolute top-3 left-3 bg-aqui-red text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      -{Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {p.vendor && (
                    <p className="text-xs text-aqui-blue mb-1">{p.vendor.businessName}</p>
                  )}
                  <h3 className="font-bold text-aqui-dark mb-2 group-hover:text-aqui-orange transition line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-aqui-orange font-extrabold text-lg">RD${(p.price / 100).toLocaleString()}</span>
                    {p.compareAtPrice > p.price && (
                      <span className="text-gray-400 line-through text-sm">RD${(p.compareAtPrice / 100).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="text-sm text-gray-500">{p.rating?.toFixed(1) || "0.0"} ({p.reviewCount || 0})</span>
                  </div>
                </div>
              </Link>
            ))}
            {(!realProducts || realProducts.length === 0) && (
              <p className="col-span-full text-center text-gray-500 py-8">
                No hay productos disponibles todavía.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">{getVal("howItWorks", "title", "¿Cómo Funciona?")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">Comprar en AQUÍ es fácil</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-aqui-orange/20 -translate-x-1/2 z-0"></div>}
                <div className="relative bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition h-full">
                  <span className="text-6xl font-extrabold text-aqui-orange/10 absolute top-4 right-6">{step.step}</span>
                  <div className="w-16 h-16 mx-auto mb-6 bg-aqui-orange/10 rounded-2xl flex items-center justify-center text-aqui-orange">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-aqui-dark mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">{getVal("testimonials", "title", "Lo Que Dicen Nuestros Usuarios")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">Miles de clientes satisfechos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-aqui-blue rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-aqui-dark">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND VALUES ──────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">{getVal("brandValues", "title", "Nuestros Valores")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">¿Por qué AQUÍ?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandValues.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition">
                <div className={`${v.color} mb-4 flex justify-center`}>{v.icon}</div>
                <h3 className="text-xl font-bold text-aqui-dark mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-aqui-dark rounded-3xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{getVal("features", "title", "Todo Lo Que Necesitas")}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Una plataforma completa para comprar y vender con confianza</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <FiTruck size={24} />, title: "Envío Gratis", desc: "En compras mayores a RD$2,000" },
                { icon: <FiShield size={24} />, title: "Compra Protegida", desc: "Tu dinero está seguro hasta que recibas" },
                { icon: <FiCreditCard size={24} />, title: "Pagos Flexibles", desc: "Acepta todas las tarjetas y transferencias" },
                { icon: <FiPercent size={24} />, title: "Ofertas Diarias", desc: "Descuentos exclusivos todos los días" },
                { icon: <FiClock size={24} />, title: "Soporte 24/7", desc: "Estamos aquí para ayudarte siempre" },
                { icon: <FiRefreshCw size={24} />, title: "Devoluciones", desc: "30 días para devolver sin preguntas" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-5">
                  <div className="text-aqui-orange mt-1">{f.icon}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-aqui-orange font-bold text-sm uppercase tracking-widest mb-2">{getVal("faq", "title", "Preguntas Frecuentes")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-aqui-dark">¿Tienes dudas?</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm group">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-aqui-dark hover:text-aqui-orange transition">
                  {faq.q}
                  <FiChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.a}</div>
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
        <div className={`absolute inset-0 ${getVal("cta", "bgImage", "") ? "bg-gradient-to-r from-aqui-dark/90 via-aqui-blue/80 to-aqui-dark/90" : "bg-gradient-to-r from-aqui-dark via-aqui-blue to-aqui-dark"}`}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo-aqui-white.png" alt="AQUÍ" className="h-20" />
          </div>
          <p className="text-white text-xl mb-3">{getVal("cta", "title", "AQUÍ, mucho más que una tienda.")}</p>
          <p className="text-aqui-orange text-3xl font-extrabold mb-4">{getVal("cta", "subtitle", "Es tu marketplace.")}</p>
          <p className="text-gray-300 mb-10 max-w-xl mx-auto">{getVal("cta", "description", "Únete a miles de dominicanos que ya compran y venden en AQUÍ. Empieza hoy mismo.")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/productos" className="bg-aqui-orange hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-lg text-base transition shadow-lg flex items-center gap-2">
              Comprar Ahora <FiArrowRight />
            </Link>
            <Link to="/registro" className="border-2 border-white text-white hover:bg-white hover:text-aqui-dark font-bold px-10 py-4 rounded-lg text-base transition">
              Vender en AQUÍ
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-aqui-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="mb-4">
                <img src="/logo-aqui-white.png" alt="AQUÍ" className="h-16" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{getVal("footer", "description", "Marketplace dominicano. Todo lo que buscas, en un solo lugar.")}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Comprar</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/productos" className="hover:text-aqui-orange transition">Productos</Link></li>
                <li><Link to="/tiendas" className="hover:text-aqui-orange transition">Tiendas</Link></li>
                <li><Link to="/productos?sort=popular" className="hover:text-aqui-orange transition">Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Vender</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/registro" className="hover:text-aqui-orange transition">Crear Tienda</Link></li>
                <li><Link to="/vendor/dashboard" className="hover:text-aqui-orange transition">Panel de Vendor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Soporte 24/7</li>
                <li>info@aquird.com</li>
                <li>Santo Domingo, RD</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 AQUÍ. Todos los derechos reservados.</p>
            <p className="text-gray-500 text-sm">www.aquird.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
