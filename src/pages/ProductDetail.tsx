import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { FiShoppingCart, FiStar, FiTruck, FiShield, FiMinus, FiPlus, FiMessageCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const formatWhatsAppNumber = (num: string) => {
  const cleaned = num.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("1") && cleaned.length >= 11) return cleaned;
  if (cleaned.length === 10) return `1${cleaned}`;
  return cleaned;
};

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const product = useQuery(api.products.getById, id ? { productId: id as any } : "skip");
  const addItem = useMutation(api.cart.addItem);
  const [quantity, setQuantity] = useState(1);

  if (product === undefined) return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-96 bg-gray-200 rounded-xl" /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold">Producto no encontrado</h2></div>;

  const price = product.price / 100;
  const comparePrice = product.compareAtPrice ? product.compareAtPrice / 100 : null;

  const handleAdd = async () => {
    if (!isAuthenticated || !user) { toast.error("Inicia sesión"); return; }
    await addItem({ userId: user._id, productId: product._id, quantity });
    toast.success("Agregado al carrito");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img src={product.images[0] || "https://via.placeholder.com/600"} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          {product.vendor && <Link to={`/tienda/${product.vendor.slug}`} className="text-aqui-blue hover:underline text-sm">{product.vendor.businessName}</Link>}
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <FiStar key={i} className={i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} size={18} />)}</div>
            <span className="text-gray-600">{product.rating?.toFixed(1)} ({product.reviewCount} reseñas)</span>
          </div>
          <div className="flex items-baseline gap-3 mt-6 flex-wrap">
            <span className="text-3xl md:text-4xl font-extrabold text-aqui-dark">RD${price.toLocaleString()}</span>
            {comparePrice && <span className="text-base md:text-xl text-gray-400 line-through">RD${comparePrice.toLocaleString()}</span>}
          </div>
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mt-6">
            <span className={`badge ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</span>
            {product.category && <span className="badge bg-gray-100 text-gray-700">{product.category.name}</span>}
          </div>
          {product.stock > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cantidad</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 rounded-lg border flex items-center justify-center hover:bg-gray-100"><FiMinus size={16} /></button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-11 h-11 rounded-lg border flex items-center justify-center hover:bg-gray-100"><FiPlus size={16} /></button>
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
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><FiTruck className="text-aqui-blue" size={20} /><div><p className="text-sm font-medium">Envío</p><p className="text-xs text-gray-500">A todo RD</p></div></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><FiShield className="text-aqui-green" size={20} /><div><p className="text-sm font-medium">Garantía</p><p className="text-xs text-gray-500">30 días</p></div></div>
          </div>
        </div>
      </div>
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reseñas</h2>
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <div key={review._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-aqui-blue rounded-full flex items-center justify-center text-white text-sm font-bold">{review.user?.name?.charAt(0)}</div>
                  <div><p className="font-medium text-sm">{review.user?.name}</p><div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <FiStar key={i} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} size={12} />)}</div></div>
                </div>
                {review.title && <p className="font-medium text-sm">{review.title}</p>}
                <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
