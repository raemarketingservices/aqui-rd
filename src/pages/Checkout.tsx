import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Checkout() {
  const { user } = useAuth();
  const cart = useQuery(api.cart.getCart, user ? { userId: user._id } : "skip");
  const checkout = useMutation(api.orders.create);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ street: "", city: "", state: "", phone: "", notes: "" });
  const navigate = useNavigate();

  if (!user || !cart || cart.items.length === 0) { navigate("/carrito"); return null; }

  const subtotal = cart.total / 100;
  const tax = subtotal * 0.18;
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await checkout({
        userId: user._id,
        shippingAddress: `${form.street}, ${form.city}, ${form.state}. Tel: ${form.phone}`,
        paymentMethod: "contra_entrega",
        notes: form.notes || undefined,
      });
      toast.success("¡Orden creada!");
      navigate("/mis-ordenes");
    } catch (error: any) { toast.error(error.message || "Error"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Dirección de Envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Calle</label><input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label><select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" required><option value="">Seleccionar</option><option value="Distrito Nacional">Distrito Nacional</option><option value="Santo Domingo">Santo Domingo</option><option value="Santiago">Santiago</option><option value="San Cristóbal">San Cristóbal</option><option value="La Altagracia">La Altagracia</option><option value="Otra">Otra</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notas</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Tu Orden</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>RD${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Impuestos</span><span>RD${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Envío</span><span>{shipping === 0 ? "Gratis" : `RD$${shipping}`}</span></div>
            <hr />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>RD${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary mt-6 disabled:opacity-50">{loading ? "Procesando..." : "Confirmar Orden"}</button>
          <p className="text-xs text-gray-500 text-center mt-3">Pago contra entrega</p>
        </div>
      </form>
    </div>
  );
}
