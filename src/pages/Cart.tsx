import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";

export default function Cart() {
  const { user } = useAuth();
  const cart = useQuery(api.cart.getCart, user ? { userId: user._id } : "skip");
  const taxSettings = useQuery(api.settings.getTaxSettings);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);

  if (!user) return null;

  if (cart === undefined) return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Cargando...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <Link to="/productos" className="btn-primary mt-4 inline-block">Ver Productos</Link>
      </div>
    );
  }

  const taxes = (taxSettings || []) as { name: string; rate: number; enabled: boolean }[];
  const activeTaxes = taxes.filter((t) => t.enabled !== false && t.rate > 0);
  const subtotal = cart.total / 100;
  const taxLines = activeTaxes.map((t) => ({ name: t.name, rate: t.rate, amount: subtotal * (t.rate / 100) }));
  const tax = taxLines.reduce((sum, t) => sum + t.amount, 0);
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
              <Link to={`/producto/${item.productId}`} className="flex-shrink-0">
                <img src={item.product?.images[0] || "https://via.placeholder.com/100"} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/producto/${item.productId}`} className="font-semibold text-gray-900 hover:text-aqui-blue line-clamp-1">{item.product?.name}</Link>
                <p className="text-sm text-gray-500">{item.product?.vendor?.businessName}</p>
                <p className="text-lg font-bold text-aqui-dark mt-1">RD${(item.product ? item.product.price / 100 : 0).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity - 1 })} className="w-10 h-10 rounded border flex items-center justify-center hover:bg-gray-100"><FiMinus size={14} /></button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity({ cartItemId: item._id, quantity: item.quantity + 1 })} className="w-10 h-10 rounded border flex items-center justify-center hover:bg-gray-100"><FiPlus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem({ cartItemId: item._id })} className="text-red-500 hover:text-red-700 p-2.5"><FiTrash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Resumen</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">RD${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            {taxLines.length > 0 ? taxLines.map((t, i) => (
              <div key={i} className="flex justify-between"><span className="text-gray-600">{t.name} ({t.rate}%)</span><span className="font-medium">RD$${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            )) : <div className="flex justify-between"><span className="text-gray-600">Impuestos</span><span className="font-medium">No aplica</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Envío</span><span className="font-medium">{shipping === 0 ? "Gratis" : `RD$${shipping}`}</span></div>
            <hr />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>RD${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
          <Link to="/checkout" className="w-full btn-primary mt-6 block text-center">Proceder al Pago</Link>
        </div>
      </div>
    </div>
  );
}
