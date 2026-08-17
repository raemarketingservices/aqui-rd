import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProductCard from "../components/shared/ProductCard";
import CategoryCard from "../components/shared/CategoryCard";
import { Link } from "react-router-dom";
import { FiTruck, FiShield, FiHeadphones, FiTag } from "react-icons/fi";

export default function Home() {
  const products = useQuery(api.products.getAll, { sort: "popular", limit: 8 });
  const categories = useQuery(api.categories.getAll);
  const vendors = useQuery(api.vendors.getAll);

  return (
    <div>
      <section className="bg-gradient-to-r from-aqui-dark via-aqui-blue to-aqui-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">TODO LO QUE BUSCAS,<br /><span className="text-aqui-orange">AQUÍ.</span></h1>
            <p className="text-gray-300 text-lg mt-4 mb-8">Descubre miles de productos de vendedores confiables. Envíos a todo RD, pagos seguros y calidad garantizada.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/productos" className="btn-primary text-lg !px-8">Comprar Ahora</Link>
              <Link to="/registro" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-aqui-dark text-lg !px-8">Vender en AQUÍ</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ icon: <FiTruck />, text: "Envíos a Todo RD" }, { icon: <FiShield />, text: "Compra con Confianza" }, { icon: <FiHeadphones />, text: "Atención 24/7" }, { icon: <FiTag />, text: "Ofertas Exclusivas" }].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 justify-center"><span className="text-aqui-orange text-xl">{item.icon}</span><span className="text-sm font-medium text-gray-700">{item.text}</span></div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-aqui-dark text-center mb-8">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories?.map((cat: any) => <CategoryCard key={cat._id} category={cat} />)}
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-aqui-dark">Lo Más Vendido</h2>
            <Link to="/productos?sort=popular" className="text-aqui-blue hover:underline font-medium">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products?.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {vendors && vendors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-aqui-dark text-center mb-8">Tiendas Destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {vendors.map((v: any) => (
              <Link to={`/tienda/${v.slug}`} key={v._id} className="card p-6 text-center hover:shadow-xl transition">
                <div className="w-16 h-16 mx-auto mb-3 bg-aqui-blue rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover rounded-full" /> : v.businessName.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">{v.businessName}</h3>
                <p className="text-sm text-gray-500 mt-1">{v.productCount} productos</p>
                <div className="flex items-center justify-center gap-1 mt-2"><span className="text-yellow-400">★</span><span className="text-sm font-medium">{v.rating?.toFixed(1)}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-aqui-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ title: "Pagos Seguros", desc: "Múltiples métodos de pago" }, { title: "Devoluciones Fáciles", desc: "30 días de garantía" }, { title: "Calidad Garantizada", desc: "Solo productos verificados" }, { title: "Envío Rápido", desc: "A todo el país" }].map((item, i) => (
            <div key={i} className="text-center"><h3 className="font-semibold">{item.title}</h3><p className="text-gray-400 text-sm mt-1">{item.desc}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
