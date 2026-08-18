import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FiImage, FiPhone, FiUpload, FiTrash2 } from "react-icons/fi";

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
    images: [] as string[],
    whatsapp: "",
  });
  const [urlInput, setUrlInput] = useState("");
  const navigate = useNavigate();

  if (!user || !user.vendorId) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages: string[] = [];
    let processed = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          newImages.push(reader.result);
        }
        processed++;
        if (processed === files.length) {
          setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, urlInput.trim()] }));
      setUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Agrega al menos una foto del producto");
      return;
    }
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
        images: form.images,
        vendorId: user.vendorId!,
        categoryId: form.categoryId ? (form.categoryId as any) : undefined,
        whatsapp: form.whatsapp || undefined,
      });
      toast.success("Producto creado");
      navigate("/vendor/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Producto</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        {/* FOTO DEL PRODUCTO */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FiImage size={14} /> Foto del Producto *
          </label>

          {/* Subir archivos */}
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-aqui-blue hover:bg-blue-50 transition mb-3">
            <FiUpload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">
              Clic para subir fotos desde tu computadora
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG o GIF (puedes elegir varias)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* O pegar URL */}
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrlImage();
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              placeholder="O pega una URL de imagen https://..."
            />
            <button
              type="button"
              onClick={addUrlImage}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg"
            >
              Agregar
            </button>
          </div>

          {/* Preview de imágenes */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            placeholder="Ej: Audífonos Bluetooth Pro"
            required
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            rows={4}
            placeholder="Describe tu producto: características, materiales, beneficios..."
          />
        </div>

        {/* PRECIO */}
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
              placeholder="Ej: 2500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Antes (para oferta)
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
              placeholder="Ej: 3200 (opcional)"
            />
          </div>
        </div>

        {/* CATEGORÍA Y STOCK */}
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
              Cantidad en Inventario *
            </label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
              min="0"
              required
            />
          </div>
        </div>

        {/* WHATSAPP */}
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