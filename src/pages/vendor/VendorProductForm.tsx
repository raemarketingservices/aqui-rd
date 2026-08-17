import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FiImage, FiPhone } from "react-icons/fi";

export default function VendorProductForm() {
  const { user } = useAuth();
  const categories = useQuery(api.categories.getAll);
  const createProduct = useMutation(api.products.create);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    stock: "10",
    images: [""],
    whatsapp: "",
  });
  const navigate = useNavigate();

  if (!user || !user.vendorId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug =
        form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36);
      await createProduct({
        name: form.name,
        slug,
        description: form.description || undefined,
        price: Math.round(parseFloat(form.price) * 100),
        compareAtPrice: form.compareAtPrice
          ? Math.round(parseFloat(form.compareAtPrice) * 100)
          : undefined,
        stock: parseInt(form.stock) || 0,
        images: form.images.filter((i) => i.trim()),
        vendorId: user.vendorId,
        categoryId: form.categoryId ? (form.categoryId as any) : undefined,
        whatsapp: form.whatsapp || undefined,
      });
      toast.success("Producto creado");
      navigate("/vendor/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Producto</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (RD$) *
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Comparación
            </label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) =>
                setForm({ ...form, compareAtPrice: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {(categories as any[])?.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FiPhone size={14} /> WhatsApp (para contacto sobre este producto)
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            placeholder="809-555-0000"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FiImage size={14} /> Imágenes (URLs)
          </label>
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-2 focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-aqui-orange hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Producto"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/vendor/dashboard")}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
