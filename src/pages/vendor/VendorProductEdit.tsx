import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import { FiSave, FiArrowLeft, FiPackage, FiShoppingBag, FiDollarSign, FiBarChart2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function VendorProductEdit() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = useQuery(api.products.getById, id ? { productId: id as any } : "skip");
  const updateProduct = useMutation(api.products.update);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "inventory">("info");
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    images: [""],
    whatsapp: "",
  });

  const category = useQuery(
    api.categories.getAll
  );

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || "",
        price: (product.price / 100).toString(),
        compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toString() : "",
        stock: product.stock.toString(),
        images: product.images.length > 0 ? product.images : [""],
        whatsapp: product.whatsapp || "",
      });
    }
  }, [product]);

  if (!user || user.role !== "VENDOR") return null;
  if (product === undefined) return <div className="text-center py-12">Cargando...</div>;
  if (!product) return <div className="text-center py-12">Producto no encontrado</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProduct({
        productId: id as any,
        name: form.name,
        description: form.description || undefined,
        price: Math.round(parseFloat(form.price) * 100),
        compareAtPrice: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : undefined,
        stock: parseInt(form.stock) || 0,
        images: form.images.filter((i) => i.trim()),
        whatsapp: form.whatsapp || undefined,
      });
      toast.success("Producto actualizado");
      navigate("/vendor/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (newStock: number) => {
    setLoading(true);
    try {
      await updateProduct({
        productId: id as any,
        stock: newStock,
      });
      toast.success("Stock actualizado");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockIncrease = () => {
    const newStock = parseInt(form.stock) + 1;
    setForm({ ...form, stock: newStock.toString() });
    handleStockChange(newStock);
  };

  const handleStockDecrease = () => {
    const currentStock = parseInt(form.stock);
    if (currentStock > 0) {
      const newStock = currentStock - 1;
      setForm({ ...form, stock: newStock.toString() });
      handleStockChange(newStock);
    }
  };

  const stockPercent = (product as any).salesCount > 0 
    ? Math.min(100, (product.stock / (product.stock + (product as any).salesCount)) * 100)
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/vendor/dashboard")}
          className="flex items-center gap-2 text-aqui-blue hover:text-blue-700"
        >
          <FiArrowLeft /> Volver
        </button>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "info"
              ? "bg-aqui-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiPackage size={16} /> Información
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "inventory"
              ? "bg-aqui-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiBarChart2 size={16} /> Inventario
        </button>
      </div>

      {/* Información del Producto */}
      {activeTab === "info" && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (RD$) *
                  <FiDollarSign className="inline ml-1" size={14} />
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Comparación (RD$)
                </label>
                <input
                  type="number"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue"
                placeholder="809-555-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (URLs separadas por coma)</label>
              {form.images.map((img, i) => (
                <input
                  key={i}
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const n = [...form.images];
                    n[i] = e.target.value;
                    setForm({ ...form, images: n });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-2 focus:ring-2 focus:ring-aqui-blue"
                  placeholder="https://..."
                />
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                className="text-aqui-blue text-sm font-medium hover:underline"
              >
                + Agregar imagen
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-aqui-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : <><FiSave className="inline mr-2" /> Guardar</>}
            </button>
          </form>
        </div>
      )}

      {/* Inventario */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-aqui-orange/10 rounded-full flex items-center justify-center">
              <FiShoppingBag size={24} className="text-aqui-orange" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gestión de Inventario</h2>
              <p className="text-gray-500">Actualiza el stock de este producto</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Stock Actual</p>
                <p className="text-3xl font-bold text-aqui-dark">{product.stock.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Ventas Totales</p>
                <p className="text-lg font-semibold text-aqui-blue">{product.salesCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Disponibilidad</span>
                <span>{stockPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    stockPercent > 50 
                      ? "bg-green-400" 
                      : stockPercent > 20 
                        ? "bg-yellow-400" 
                        : "bg-red-400"
                  }`}
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleStockDecrease}
                disabled={loading || product.stock <= 0}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              >
                −
              </button>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1 text-lg font-bold focus:ring-2 focus:ring-aqui-blue"
                min="0"
              />
              <button
                onClick={handleStockIncrease}
                disabled={loading}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={() => handleStockChange(0)}
                disabled={loading || product.stock === 0}
                className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
              >
                <FiShoppingBag size={16} /> Agotar inventario
              </button>
              <button
                onClick={() => handleStockChange(100)}
                disabled={loading}
                className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg border border-green-300 text-green-600 hover:bg-green-50 transition"
              >
                <FiShoppingBag size={16} /> Establecer en 100 unidades
              </button>
            </div>
          </div>

          <button
            onClick={() => setForm({ ...form, stock: product.stock.toString() })}
            className="text-aqui-blue text-sm font-medium hover:underline"
          >
            Restablecer valor actual
          </button>
        </div>
      )}
    </div>
  );
}