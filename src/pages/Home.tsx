import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import ProductCard from "../components/shared/ProductCard";
import CategoryCard from "../components/shared/CategoryCard";
import { Link } from "react-router-dom";
import { FiTruck, FiShield, FiHeadphones, FiTag } from "react-icons/fi";

export default function Home() {
  const { data: products } = useApiQuery(() => api.products.getAll({ sort: "popular" }));
  const { data: categories } = useApiQuery(() => api.categories.getAll());
  const { data: vendors } = useApiQuery(() => api.stores.getAll());

  const displayProducts = products?.slice(0, 8) || [];

  return (
    <div>
      <section className="bg-gradient-to-r from-uniko-dark via-uniko-blue to-uniko-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">TODO LO QUE BUSCAS,<br /><span className="text-uniko-red">UNIKO.</span></h1>
            <p className="text-gray-300 text-lg mt-4 mb-8">Descubre miles de productos de vendedores confiables. Envíos a todo RD, pagos seguros y calidad garantizada.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/productos" className="btn-primary text-lg !px-8">Comprar Ahora</Link>
              <Link to="/registro" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-uniko-dark text-lg !px-8">Vender en UNIKO</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ icon: <FiTruck />, text: "Envíos a Todo RD" }, { icon: <FiShield />, text: "Compra con Confianza" }, { icon: <FiHeadphones />, text: "Atención 24/7" }, { icon: <FiTag />, text: "Ofertas Exclusivas" }].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 justify-center"><span className="text-uniko-red text-xl">{item.icon}</span><span className="text-sm font-medium text-uniko-blue">{item.text}</span></div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-uniko-dark text-center mb-8">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories?.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-uniko-dark">Lo Más Vendido</h2>
            <Link to="/productos?sort=popular" className="text-uniko-blue hover:underline font-medium">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {vendors && vendors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-uniko-dark text-center mb-8">Tiendas Destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {vendors.map((v) => (
              <Link to={`/tienda/${v.slug}`} key={v.id} className="card p-6 text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto mb-3 bg-uniko-blue rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {v.imageUrl ? <img src={v.imageUrl} alt="" className="w-full h-full object-cover rounded-full" /> : v.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-uniko-blue">{v.name}</h3>
                <p className="text-sm text-uniko-blue/70 mt-1">{v.productCount} productos</p>
                <div className="flex items-center justify-center gap-1 mt-2"><span className="text-uniko-red">★</span><span className="text-sm font-medium">{v.rating?.toFixed(1)}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-uniko-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ title: "Pagos Seguros", desc: "Múltiples métodos de pago" }, { title: "Devoluciones Fáciles", desc: "30 días de garantía" }, { title: "Calidad Garantizada", desc: "Solo productos verificados" }, { title: "Envío Rápido", desc: "A todo el país" }].map((item, i) => (
            <div key={i} className="text-center"><h3 className="font-semibold">{item.title}</h3><p className="text-white/80 text-sm mt-1">{item.desc}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
