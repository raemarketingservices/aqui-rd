import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import { FiShoppingCart, FiStar, FiMessageCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const FALLBACK_IMAGE = "/logo-aqui.png";

export default function ProductCard({ product }: { product: any }) {
  const { user, isAuthenticated } = useAuth();
  const addItem = useMutation(api.cart.addItem);
  const price = product.price / 100;
  const comparePrice = product.compareAtPrice ? product.compareAtPrice / 100 : null;

  const handleAdd = async () => {
    if (!isAuthenticated || !user) { toast.error("Inicia sesión para agregar al carrito"); return; }
    await addItem({ userId: user._id, productId: product._id, quantity: 1 });
    toast.success("Agregado al carrito");
  };

  const hasImage = product.images && product.images.length > 0 && product.images[0];

  const formatWhatsAppNumber = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("1") && cleaned.length >= 11) return cleaned;
    if (cleaned.length === 10) return `1${cleaned}`;
    return cleaned;
  };

  return (
    <div className="card group">
      <Link to={`/producto/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {hasImage ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
              <img src={FALLBACK_IMAGE} alt="AQUÍ" className="w-32 h-32 object-contain opacity-30" />
            </div>
          )}
          {comparePrice && <span className="absolute top-2 left-2 bg-aqui-red text-white text-xs font-bold px-2 py-1 rounded">-{Math.round(((comparePrice - price) / comparePrice) * 100)}%</span>}
          {product.whatsapp && (
            <a
              href={`https://wa.me/${formatWhatsAppNumber(product.whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition z-10"
              title="Contactar por WhatsApp"
            >
              <FiMessageCircle size={16} />
            </a>
          )}
        </div>
      </Link>
      <div className="p-4">
        {product.vendor && <Link to={`/tienda/${product.vendor.slug}`} className="text-xs text-aqui-blue hover:underline">{product.vendor.businessName}</Link>}
        <Link to={`/producto/${product._id}`}><h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-aqui-blue transition">{product.name}</h3></Link>
        <div className="flex items-center gap-1 mt-2"><FiStar className="text-yellow-400 fill-yellow-400" size={14} /><span className="text-sm text-gray-600">{product.rating?.toFixed(1)} ({product.reviewCount})</span></div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-bold text-aqui-dark">RD${price.toLocaleString()}</span>
          {comparePrice && <span className="text-sm text-gray-400 line-through">RD${comparePrice.toLocaleString()}</span>}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleAdd} className="flex-1 btn-primary !py-2.5 flex items-center justify-center gap-2 text-sm"><FiShoppingCart size={16} /> Agregar</button>
          {product.whatsapp && (
            <a
              href={`https://wa.me/${formatWhatsAppNumber(product.whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition flex-shrink-0"
              title="WhatsApp"
            >
              <FiMessageCircle size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
