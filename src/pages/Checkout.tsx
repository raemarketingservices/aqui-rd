import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseApi } from "../services/supabaseApi";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { FiMapPin } from "react-icons/fi";

const DR_PROVINCIAS = [
  "Distrito Nacional", "Santiago", "Santo Domingo", "San Cristóbal", "La Altagracia",
  "Puerto Plata", "La Vega", "Duarte", "Espaillat", "La Romana", "Barahona",
  "Samaná", "Sánchez Ramírez", "Valverde", "Monseñor Nouel", "Monte Plata",
  "Monte Cristi", "Peravia", "Hato Mayor", "San Pedro de Macorís", "Azua",
  "Pedernales", "Independencia", "San Juan", "Elías Piña", "San José de Ocoa",
  "Santiago Rodríguez", "Dajabón", "María Trinidad Sánchez", "Hermanas Mirabal",
  "El Seibo",
];

const DR_MUNICIPIOS: Record<string, string[]> = {
  "Distrito Nacional": ["Distrito Nacional", "Zona Colonial", "Villa Mella", "Los Mina", "Capotillo", "Ensanche Espaillat", "Villa Consuelo", "Piantini", "Naco", "Arroyo Hondo", "Mirador Norte", "Los Rieles", "Bella Vista", "Ciudad Nueva"],
  Santiago: ["Santiago de los Caballeros", "Bavaro", "Puerto Plata", "Villa González", "Moca", "San Francisco de Macorís", "Pimentel", "Villa Bastías", "Jamao al Norte", "Salsipuedes", "Licey al Medio", "Tamboril", "Villa Bisonó", "Pueblo Nuevo"],
  "Santo Domingo": ["Santo Domingo Este", "Santo Domingo Norte", "Santo Domingo Oeste", "Boca Chica", "San Antonio de Guerra", "Los Alcarrizos", "Pedro Brand", "San Luis", "San Isidro", "La Victoria", "Guerra", "Villa Altagracia", "Yamasá", "Sabana Grande de Boyá"],
  "San Cristóbal": ["San Cristóbal", "San Gregorio de Nigua", "Bajos de Haina", "San Gregorio", "Villa Altagracia", "Yamasá", "Palmilla", "San José de Ocoa", "Cambita Garabito", "San Antonio de Guerra"],
  "La Altagracia": ["Punta Cana", "Higüey", "San Rafael del Yuma", "Verón", "Bávaro", "Otra Banda", "Las Lagunas de Nizao", "Caballero"],
};

export default function Checkout() {
  const { user } = useAuth();
  const { data: cartRes, refetch: refetchCart } = useApiQuery(
    () => user ? supabaseApi.cart.getCart(user.id || user._id) : "skip"
  );
  const { data: taxRes } = useApiQuery(() => supabaseApi.settings.getTaxSettings());

  const cart = cartRes || { items: [], total: 0 };
  const taxSettings = taxRes || [];

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: "",
    number: "",
    apartment: "",
    sector: "",
    city: "",
    province: "",
    phone: "",
    notes: "",
  });

  if (!user || !cart || cart.items.length === 0) {
    navigate("/carrito");
    return null;
  }

  const taxes = (taxSettings || []) as { name: string; rate: number; enabled: boolean }[];
  const activeTaxes = taxes.filter((t) => t.enabled !== false && t.rate > 0);
  const subtotal = cart.total / 100;
  const taxLines = activeTaxes.map((t) => ({ name: t.name, rate: t.rate, amount: subtotal * (t.rate / 100) }));
  const tax = taxLines.reduce((sum, t) => sum + t.amount, 0);
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const availableMunicipios = DR_MUNICIPIOS[form.province] || [];

  const fullAddress = [
    form.street,
    form.number ? `#${form.number}` : "",
    form.apartment,
    form.sector,
    form.city,
    form.province,
    "República Dominicana",
  ]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabaseApi.orders.create({
        userId: user.id || user._id,
        shippingAddress: fullAddress,
        paymentMethod: "contra_entrega",
        notes: form.notes || undefined,
      });
      toast.success("¡Orden creada!");
      navigate("/mis-ordenes");
    } catch (error: any) {
      toast.error(error.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-uniko-blue mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiMapPin size={18} /> Dirección de Envío
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">
                Provincia *
              </label>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value, city: "" })}
                className="input-field"
                required
              >
                <option value="">Seleccionar provincia</option>
                {DR_PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">
                Ciudad / Municipio *
              </label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-field"
                required
                disabled={!form.province}
              >
                <option value="">
                  {form.province ? "Seleccionar ciudad" : "Primero selecciona provincia"}
                </option>
                {availableMunicipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="Otra">Otra ciudad</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-uniko-blue mb-1">
              Sector / Barrio
            </label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="input-field"
              placeholder="Ej: Los Mina, Villa Mella, Piantini..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-uniko-blue mb-1">
                Calle / Avenida *
              </label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="input-field"
                required
                placeholder="Ej: Calle 27 de Febrero"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">
                Número
              </label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="input-field"
                placeholder="Ej: #45"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-uniko-blue mb-1">
              Casa / Apartamento / Edificio
            </label>
            <input
              type="text"
              value={form.apartment}
              onChange={(e) => setForm({ ...form, apartment: e.target.value })}
              className="input-field"
              placeholder="Ej: Apto 3B, Casa #12, Edificio Central..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-uniko-blue mb-1">
              Teléfono de contacto *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              required
              placeholder="809-555-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-uniko-blue mb-1">
              Notas adicionales
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field"
              placeholder="Ej: Azul, talla M, entregar después de las 5pm..."
            />
          </div>

          {fullAddress.length > 10 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-uniko-blue font-medium mb-1">
                Dirección de envío:
              </p>
              <p className="text-sm text-blue-800">{fullAddress}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Tu Orden</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-uniko-blue">Subtotal</span>
              <span>
                RD${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {taxLines.length > 0 ? taxLines.map((t, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-uniko-blue">{t.name} ({t.rate}%)</span>
                <span>RD${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )) : (
              <div className="flex justify-between">
                <span className="text-uniko-blue">Impuestos</span>
                <span>No aplica</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-uniko-blue">Envío</span>
              <span>{shipping === 0 ? "Gratis" : `RD$${shipping}`}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                RD${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-6 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar Orden"}
          </button>
          <p className="text-xs text-uniko-blue/70 text-center mt-3">
            Pago contra entrega
          </p>
        </div>
      </form>
    </div>
  );
}