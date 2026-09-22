import { Link } from "react-router-dom";
import { supabaseApi } from "../services/supabaseApi";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";

export default function Cart() {
  const { user } = useAuth();
  const { data: res, refetch } = useApiQuery(
    () => user ? supabaseApi.cart.getCart(user.id || user._id) : "skip"
  );
  const cart = res || { items: [], total: 0 };

  if (!user) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-uniko-blue mb-2">Tu carrito está vacío</h2>
        <Link to="/productos" className="btn-primary mt-4 inline-block">Ver Productos</Link>
      </div>
    );
  }

  const subtotal = cart.total / 100;
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const currentItem = cart.items.find((i: any) => i.id === itemId || i._id === itemId);
    if (!currentItem) return;
    const newQty = currentItem.quantity + delta;
    if (newQty <= 0) {
      await supabaseApi.cart.removeItem(itemId);
    } else {
      await supabaseApi.cart.updateQuantity(itemId, newQty);
    }
    refetch();
  };

  const handleRemove = async (itemId: string) => {
    await supabaseApi.cart.removeItem(itemId);
    refetch();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-uniko-blue mb-8">Mi Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => {
            const pid = item.id || item._id;
            return (
            <div key={pid} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
              <Link to={`/producto/${item.productId || item.product?.id}`} className="flex-shrink-0">
                <img src={item.product?.images?.[0] || item.product?.imageUrl || "https://via.placeholder.com/100"} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/producto/${item.productId || item.product?.id}`} className="font-semibold text-uniko-blue hover:underline truncate">{item.product?.name || item.name}</Link>
                <p className="text-sm text-uniko-blue/70">{item.product?.vendor?.businessName || item.vendorName}</p>
                <p className="text-lg font-bold text-uniko-dark mt-1">RD${((item.subtotal || item.price * item.quantity) / 100).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(pid, -1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"><FiMinus size={14} /></button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(pid, 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"><FiPlus size={14} /></button>
                  </div>
                  <button onClick={() => handleRemove(pid)} className="text-red-500 hover:text-red-700 p-2.5"><FiTrash2 size={18} /></button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Resumen</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-uniko-blue">Subtotal</span><span className="font-medium">RD${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-uniko-blue">Envío</span><span className="font-medium">{shipping === 0 ? "Gratis" : `RD$${shipping}`}</span></div>
            <hr />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>RD${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
          <Link to="/checkout" className="w-full btn-primary mt-6 block text-center">Proceder al Pago</Link>
        </div>
      </div>
    </div>
  );
}