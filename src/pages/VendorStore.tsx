import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProductCard from "../components/shared/ProductCard";
import { useParams } from "react-router-dom";
import { FiStar, FiPackage } from "react-icons/fi";

export default function VendorStore() {
  const { slug } = useParams();
  const vendor = useQuery(api.vendors.getBySlug, slug ? { slug } : "skip");

  if (vendor === undefined) return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-48 bg-gray-200 rounded-xl" /></div>;
  if (!vendor) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold">Tienda no encontrada</h2></div>;

  return (
    <div>
      <div className="bg-gradient-to-r from-aqui-dark to-aqui-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {vendor.logo ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-aqui-dark">{vendor.businessName.charAt(0)}</span>}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-center sm:text-left">{vendor.businessName}</h1>
              {vendor.description && <p className="text-gray-300 mt-1">{vendor.description}</p>}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1"><FiStar className="text-yellow-400 fill-yellow-400" /><span className="font-medium">{vendor.rating?.toFixed(1)}</span></div>
                <div className="flex items-center gap-1 text-gray-300"><FiPackage /><span>{vendor.products?.length || 0} productos</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Productos de {vendor.businessName}</h2>
        {!vendor.products || vendor.products.length === 0 ? <p className="text-gray-500 text-center py-12">Esta tienda aún no tiene productos</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {vendor.products.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
