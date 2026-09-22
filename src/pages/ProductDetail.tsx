import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import { FiShoppingCart, FiStar, FiTruck, FiShield, FiMinus, FiPlus, FiMessageCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";

const FALLBACK_IMAGE = "/logo-uniko.png";

const formatWhatsAppNumber = (num: string) => {
  const cleaned = num.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("1") && cleaned.length >= 11) return cleaned;
  if (cleaned.length === 10) return `1${cleaned}`;
  return cleaned;
};

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { data: product, loading } = useApiQuery(
    () => api.products.get(id || ""),
    [id]
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-96 bg-white rounded-xl" /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold">Producto no encontrado</h2></div>;

  const price = product.price;
  const comparePrice = product.originalPrice || null;
  const allImages: string[] = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const imageSrc = allImages[selectedImg] || FALLBACK_IMAGE;
  const reviewCount = product.reviewsCount || 0;

  const handleAdd = async () => {
    if (!isAuthenticated || !user) { toast.error("Inicia sesión"); return; }
    toast.success("Agregado al carrito");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-white relative">
            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setSelectedImg(i => i > 0 ? i - 1 : allImages.length - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"><FiChevronLeft size={18} /></button>
                <button onClick={() => setSelectedImg(i => i < allImages.length - 1 ? i + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"><FiChevronRight size={18} /></button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === selectedImg ? 'border-uniko-blue' : 'border-uniko-blue/20 hover:border-gray-400'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {product.storeName && <Link to={`/tienda/${product.storeId}`} className="text-uniko-blue hover:underline text-sm">{product.storeName}</Link>}
          <h1 className="text-3xl font-bold text-uniko-blue mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <FiStar key={i} className={i < Math.round(product.rating) ? "text-uniko-red fill-uniko-red" : "text-gray-300"} size={18} />)}</div>
            <span className="text-uniko-blue">{product.rating?.toFixed(1)} ({reviewCount} reseñas)</span>
          </div>
          <div className="flex items-baseline gap-3 mt-6 flex-wrap">
            <span className="text-3xl md:text-4xl font-extrabold text-uniko-dark">RD${price.toLocaleString()}</span>
            {comparePrice && comparePrice > price && <span className="text-base md:text-xl text-white/80 line-through">RD${comparePrice.toLocaleString()}</span>}
          </div>
          <p className="text-uniko-blue mt-6 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mt-6">
            <span className={`badge ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</span>
            {product.category && <span className="badge bg-white text-uniko-blue">{product.category}</span>}
          </div>
          {product.stock > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-uniko-blue mb-2 block">Cantidad</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 rounded-lg border flex items-center justify-center hover:bg-white"><FiMinus size={16} /></button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-11 h-11 rounded-lg border flex items-center justify-center hover:bg-white"><FiPlus size={16} /></button>
              </div>
            </div>
          )}
          {isAuthenticated && product.stock > 0 && (
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="flex-1 btn-primary flex items-center justify-center gap-2 text-lg !py-3"><FiShoppingCart size={20} /> Agregar al Carrito</button>
              {product.whatsapp && (
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(product.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition text-lg"
                >
                  <FiMessageCircle size={20} /> WhatsApp
                </a>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg"><FiTruck className="text-uniko-blue" size={20} /><div><p className="text-sm font-medium">Envío</p><p className="text-xs text-uniko-blue/70">A todo RD</p></div></div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg"><FiShield className="text-uniko-green" size={20} /><div><p className="text-sm font-medium">Garantía</p><p className="text-xs text-uniko-blue/70">6 meses</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
