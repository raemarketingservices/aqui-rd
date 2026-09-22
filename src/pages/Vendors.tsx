import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import { Link } from "react-router-dom";
import { FiStar, FiPackage } from "react-icons/fi";

export default function Vendors() {
  const { data: vendors, loading } = useApiQuery(() => api.stores.getAll());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-uniko-blue mb-8">Tiendas</h1>
      {loading ? <p className="text-uniko-blue/70">Cargando...</p> : !vendors || vendors.length === 0 ? <p className="text-uniko-blue/70 text-center py-12">No hay tiendas</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <Link to={`/tienda/${v.slug}`} key={v.id} className="card p-6 text-center hover:shadow-xl transition group">
              <div className="w-20 h-20 mx-auto mb-4 bg-uniko-blue rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {v.imageUrl ? <img src={v.imageUrl} alt="" className="w-full h-full object-cover" /> : v.name.charAt(0)}
              </div>
              <h3 className="font-bold text-lg text-uniko-blue group-hover:text-uniko-red transition">{v.name}</h3>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-uniko-blue/70">
                <div className="flex items-center gap-1"><FiStar className="text-uniko-red fill-uniko-red" size={14} /><span>{v.rating?.toFixed(1)}</span></div>
                <div className="flex items-center gap-1"><FiPackage size={14} /><span>{v.productCount} productos</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
