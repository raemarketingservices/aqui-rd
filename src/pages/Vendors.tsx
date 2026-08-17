import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { FiStar, FiPackage } from "react-icons/fi";

export default function Vendors() {
  const vendors = useQuery(api.vendors.getAll);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tiendas</h1>
      {vendors === undefined ? <p className="text-gray-500">Cargando...</p> : vendors.length === 0 ? <p className="text-gray-500 text-center py-12">No hay tiendas</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vendors.map((v: any) => (
            <Link to={`/tienda/${v.slug}`} key={v._id} className="card p-6 text-center hover:shadow-xl transition group">
              <div className="w-20 h-20 mx-auto mb-4 bg-aqui-blue rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {v.logo ? <img src={v.logo} alt="" className="w-full h-full object-cover" /> : v.businessName.charAt(0)}
              </div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-aqui-orange transition">{v.businessName}</h3>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1"><FiStar className="text-yellow-400 fill-yellow-400" size={14} /><span>{v.rating?.toFixed(1)}</span></div>
                <div className="flex items-center gap-1"><FiPackage size={14} /><span>{v.productCount} productos</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
