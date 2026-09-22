import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiShoppingCart, FiStar, FiMessageCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FALLBACK_IMAGE = "/logo-uniko.png";

export default function ProductCard({ product }: { product: any }) {
  const { isAuthenticated } = useAuth();
  const [currentImg, setCurrentImg] = useState(0);

  const price = product.price;
  const comparePrice = product.originalPrice || product.compareAtPrice || null;

  const allImages: string[] = product.images?.length
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const hasImages = allImages.length > 0;
  const imageSrc = hasImages ? allImages[currentImg] : FALLBACK_IMAGE;

  const productId = product.id || product._id;
  const storeSlug = product.vendor?.slug || product.storeId || "";
  const storeName = product.vendor?.businessName || product.storeName || "";
  const reviewCount = product.reviewsCount || product.reviewCount || 0;

  const formatWhatsAppNumber = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("1") && cleaned.length >= 11) return cleaned;
    if (cleaned.length === 10) return `1${cleaned}`;
    return cleaned;
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    alert("Agregado al carrito (próximamente integrado)");
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg(i => (i > 0 ? i - 1 : allImages.length - 1));
  };

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg(i => (i < allImages.length - 1 ? i + 1 : 0));
  };

  return (
    <div className="card group">
      <Link to={`/producto/${productId}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white">
          {hasImages ? (
            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white p-8">
              <img src={FALLBACK_IMAGE} alt="UNIKO" className="w-32 h-32 object-contain opacity-30" />
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"><FiChevronLeft size={14} /></button>
              <button onClick={nextImg} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"><FiChevronRight size={14} /></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_: string, i: number) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === currentImg ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          {comparePrice && comparePrice > price && <span className="absolute top-2 left-2 bg-uniko-red text-white text-xs font-bold px-2 py-1 rounded">-{Math.round(((comparePrice - price) / comparePrice) * 100)}%</span>}
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
        {storeName && <Link to={`/tienda/${storeSlug}`} className="text-xs text-uniko-blue hover:underline">{storeName}</Link>}
        <Link to={`/producto/${productId}`}><h3 className="font-semibold text-uniko-blue mt-1 line-clamp-2 hover:text-uniko-blue transition">{product.name}</h3></Link>
        <div className="flex items-center gap-1 mt-2"><FiStar className="text-uniko-red fill-uniko-red" size={14} /><span className="text-sm text-uniko-blue">{product.rating?.toFixed(1)} ({reviewCount})</span></div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-bold text-uniko-dark">RD${price.toLocaleString()}</span>
          {comparePrice && comparePrice > price && <span className="text-sm text-white/80 line-through">RD${comparePrice.toLocaleString()}</span>}
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
