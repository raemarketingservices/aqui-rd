import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FiImage,
  FiPhone,
  FiUpload,
  FiTrash2,
  FiEye,
  FiX,
  FiCheck,
  FiTag,
  FiMapPin,
  FiPackage,
  FiChevronDown,
  FiChevronRight,
  FiVideo,
} from "react-icons/fi";

const CATEGORIES_TREE: Record<string, Record<string, string[]>> = {
  "Casa y Jardín": {
    Herramientas: [],
    Muebles: [],
    Hogar: [],
    Jardinería: [],
    Electrodomésticos: [],
  },
  Electrónica: {
    Celulares: ["Accesorios", "Fundas", "Cargadores"],
    Computadoras: ["Laptops", "Desktops", "Tablets"],
    Audio: ["Audífonos", "Bocinas", "Micrófonos"],
    Video: ["TVs", "Monitores", "Cámaras"],
  },
  Vehículos: {
    Carros: [],
    Motos: [],
    Repuestos: [],
    Accesorios: [],
  },
  Ropa: {
    Hombres: [],
    Mujeres: [],
    Niños: [],
    Accesorios: ["Bolsos", "Relojes", "Gafas"],
  },
  Deportes: {
    Fitness: [],
    Bicicletas: [],
    Outdoor: [],
    Equipamiento: [],
  },
  "Belleza y Salud": {
    CuidadoPersonal: [],
    Maquillaje: [],
    Perfumes: [],
    Suplementos: [],
  },
  Juguetes: {},
  Mascotas: {},
  Libros: {},
  Otros: {},
};

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "USED_LIKE_NEW", label: "Usado - Como nuevo" },
  { value: "USED_GOOD", label: "Usado - Buen estado" },
  { value: "USED_ACCEPTABLE", label: "Usado - Aceptable" },
];

export default function VendorProductForm() {
  const { user } = useAuth();
  const categories = useQuery(api.categories.getAll);
  const productFormConfig = useQuery(api.settings.getProductFormConfig);
  const createProduct = useMutation(api.products.create);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const adminFields = (Array.isArray(productFormConfig) ? productFormConfig : []) as { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string; category?: string }[];

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    stock: "1",
    images: [] as string[],
    whatsapp: "",
    condition: "NEW",
    brand: "",
    color: "",
    tags: [] as string[],
    location: "",
    availability: "SINGLE" as "SINGLE" | "MULTIPLE",
    videoUrl: "",
  });

  const [urlInput, setUrlInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.vendorId) {
      setForm((prev) => ({ ...prev, whatsapp: user.phone || "" }));
    }
  }, [user]);

  if (!user || !user.vendorId) return null;

  const toggleExpandCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 10 - form.images.length;
    if (remaining <= 0) {
      toast.error("Máximo 10 fotos permitidas");
      return;
    }
    const filesToProcess = Array.from(files).slice(0, remaining);
    const newImages: string[] = [];
    let processed = 0;
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          newImages.push(reader.result);
        }
        processed++;
        if (processed === filesToProcess.length) {
          setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Solo se permiten archivos de video");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, videoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      if (form.images.length >= 10) {
        toast.error("Máximo 10 fotos permitidas");
        return;
      }
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

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const newImages = [...form.images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      if (form.tags.length >= 10) {
        toast.error("Máximo 10 etiquetas");
        return;
      }
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const autoSku = useMemo(() => {
    if (!form.name) return "";
    const prefix = form.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
    return `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  }, [form.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Agrega al menos una foto del producto");
      return;
    }
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("Ingresa un precio válido");
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
        stock: parseInt(form.stock) || 1,
        images: form.images,
        vendorId: user.vendorId!,
        categoryId: form.categoryId ? (form.categoryId as any) : undefined,
        whatsapp: form.whatsapp || undefined,
        condition: form.condition as any,
        brand: form.brand || undefined,
        color: form.color || undefined,
        sku: autoSku,
        tags: form.tags.length > 0 ? form.tags : undefined,
        location: form.location || undefined,
        availability: form.availability,
        videoUrl: form.videoUrl || undefined,
      });
      toast.success("Producto publicado correctamente");
      navigate("/vendor/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = () => {
    const options: JSX.Element[] = [];

    if (categories && Array.isArray(categories)) {
      const dbParentCats = categories.filter((c: any) => !c.parentId);
      const dbSubCats = categories.filter((c: any) => c.parentId);

      dbParentCats.forEach((cat: any) => {
        const subs = dbSubCats.filter((s: any) => s.parentId === cat._id);
        options.push(
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        );
        subs.forEach((sub: any) => {
          options.push(
            <option key={sub._id} value={sub._id}>
              &nbsp;&nbsp;{sub.name}
            </option>
          );
        });
      });
    }

    Object.entries(CATEGORIES_TREE).forEach(([parent, children]) => {
      const childNames = Object.keys(children);
      if (childNames.length === 0) {
        options.push(
          <option key={`tree-${parent}`} value={`tree:${parent}`}>
            {parent}
          </option>
        );
      }
    });

    return options;
  };

  const previewProduct = {
    name: form.name || "Nombre del producto",
    description: form.description || "Sin descripción",
    price: form.price ? Math.round(parseFloat(form.price) * 100) : 0,
    compareAtPrice: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : undefined,
    images: form.images,
    stock: parseInt(form.stock) || 0,
    condition: form.condition,
    brand: form.brand,
    color: form.color,
    sku: autoSku,
    tags: form.tags,
    location: form.location,
    availability: form.availability,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={form.images.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-aqui-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FiEye size={16} /> Vista Previa
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        {/* MULTIMEDIA */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiImage size={18} /> Multimedia
          </h2>
          <p className="text-sm text-gray-500 mb-3">Fotos del producto (mínimo 1, máximo 10)</p>

          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-aqui-blue hover:bg-blue-50 transition mb-3">
            <FiUpload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">
              Clic para subir fotos
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG o GIF — {form.images.length}/10 fotos
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <div className="flex gap-2 mb-4">
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
              placeholder="O pega una URL de imagen"
            />
            <button
              type="button"
              onClick={addUrlImage}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg"
            >
              Agregar
            </button>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-aqui-blue text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      Principal
                    </span>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ←
                      </button>
                    )}
                    {i < form.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <FiVideo size={14} /> Video del producto (opcional)
            </p>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-aqui-blue hover:bg-blue-50 transition">
              <FiUpload size={18} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">
                {form.videoUrl ? "Video cargado ✓" : "Subir video (MP4, WebM)"}
              </span>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </label>
            {form.videoUrl && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, videoUrl: "" }))}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Eliminar video
              </button>
            )}
          </div>
        </div>

        {/* INFORMACIÓN PRINCIPAL */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiPackage size={18} /> Información Principal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Producto *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                placeholder="Ej: Audífonos Bluetooth Pro Max"
                required
                maxLength={120}
              />
              <p className="text-xs text-gray-400 mt-1">{form.name.length}/120 caracteres</p>
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
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Anterior (oferta)
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
                  placeholder="Opcional"
                />
              </div>
            </div>

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
                <option value="">Seleccionar categoría</option>
                {renderCategoryOptions()}
                <optgroup label="── Categorías predefinidas ──">
                  {Object.entries(CATEGORIES_TREE).map(([parent, children]) => {
                    const childNames = Object.keys(children);
                    if (childNames.length === 0) {
                      return (
                        <option key={`tree-${parent}`} value={`tree:${parent}`}>
                          {parent}
                        </option>
                      );
                    }
                    return null;
                  })}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condición / Estado *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, condition: opt.value })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      form.condition === opt.value
                        ? "bg-aqui-blue text-white border-aqui-blue"
                        : "bg-white text-gray-700 border-gray-300 hover:border-aqui-blue"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            rows={5}
            placeholder="Describe tu producto: características, materiales, condiciones de entrega..."
            maxLength={2000}
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
        </div>

        {/* MÁS DETALLES */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTag size={18} /> Más Detalles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                placeholder="Ej: Samsung, Apple..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                placeholder="Ej: Negro, Azul..."
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU / Código de Inventario
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={autoSku}
                readOnly
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
              />
              <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                Auto-generado ✓
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas (Tags)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                placeholder="Escribe y presiona Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg"
              >
                + Agregar
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-aqui-blue/10 text-aqui-blue rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* UBICACIÓN Y DISPONIBILIDAD */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiMapPin size={18} /> Ubicación y Disponibilidad
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                placeholder="Ej: Santo Domingo, Distrito Nacional"
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, availability: "SINGLE" })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition text-left ${
                    form.availability === "SINGLE"
                      ? "border-aqui-blue bg-aqui-blue/5 text-aqui-blue"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Artículo único</div>
                  <div className="text-xs text-gray-500 mt-1">Solo 1 unidad disponible</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, availability: "MULTIPLE" })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition text-left ${
                    form.availability === "MULTIPLE"
                      ? "border-aqui-blue bg-aqui-blue/5 text-aqui-blue"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Varias unidades</div>
                  <div className="text-xs text-gray-500 mt-1">Stock múltiple disponible</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WHATSAPP */}
        <div className="pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FiPhone size={14} /> WhatsApp (contacto)
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
            placeholder="809-555-0000"
          />
        </div>

        {/* CAMPOS PERSONALIZADOS DEL ADMIN */}
        {adminFields.length > 0 && (
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campos Adicionales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminFields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={customFields[field.name] || ""}
                      onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                      placeholder={field.placeholder || ""}
                    />
                  )}
                  {field.type === "textarea" && (
                    <textarea
                      value={customFields[field.name] || ""}
                      onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                      rows={3}
                    />
                  )}
                  {field.type === "number" && (
                    <input
                      type="number"
                      value={customFields[field.name] || ""}
                      onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                      min="0"
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      value={customFields[field.name] || ""}
                      onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
                      {(field.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {field.type === "toggle" && (
                    <button
                      type="button"
                      onClick={() => setCustomFields({ ...customFields, [field.name]: customFields[field.name] ? "" : "yes" })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${customFields[field.name] ? "bg-aqui-blue" : "bg-gray-300"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${customFields[field.name] ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-aqui-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiCheck size={18} />
            {loading ? "Publicando..." : "Publicar Producto"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/vendor/dashboard")}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* MODAL VISTA PREVIA */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Vista Previa del Producto</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-4">
              {previewProduct.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={previewProduct.images[0]}
                    alt={previewProduct.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  {previewProduct.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      1/{previewProduct.images.length} fotos
                    </span>
                  )}
                  {previewProduct.condition === "NEW" && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Nuevo
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}

              <div className="mt-4 space-y-3">
                <h2 className="text-xl font-bold text-gray-900">{previewProduct.name}</h2>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-aqui-orange">
                    RD${(previewProduct.price / 100).toLocaleString()}
                  </span>
                  {previewProduct.compareAtPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      RD${(previewProduct.compareAtPrice / 100).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {previewProduct.condition && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {CONDITION_OPTIONS.find((c) => c.value === previewProduct.condition)?.label}
                    </span>
                  )}
                  {previewProduct.brand && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      Marca: {previewProduct.brand}
                    </span>
                  )}
                  {previewProduct.color && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      Color: {previewProduct.color}
                    </span>
                  )}
                  {previewProduct.sku && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full font-mono">
                      SKU: {previewProduct.sku}
                    </span>
                  )}
                </div>

                {previewProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-aqui-blue/10 text-aqui-blue rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {previewProduct.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMapPin size={14} /> {previewProduct.location}
                  </p>
                )}

                <p className="text-sm text-gray-600 leading-relaxed">
                  {previewProduct.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiPackage size={14} />
                  {previewProduct.stock > 0
                    ? `${previewProduct.stock} unidades disponibles`
                    : "Agotado"}
                  <span className="text-gray-300">•</span>
                  {previewProduct.availability === "SINGLE"
                    ? "Artículo único"
                    : "Varias unidades"}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 bg-aqui-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Cerrar Vista Previa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
