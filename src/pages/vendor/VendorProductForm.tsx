import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseApi } from "../../services/supabaseApi";
import { useApiQuery } from "../../hooks/useApiQuery";
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
  FiVideo,
} from "react-icons/fi";

const CATEGORIES_TREE: Record<string, Record<string, string[]>> = {
  "Casa y Jardín": { Herramientas: [], Muebles: [], Hogar: [], Jardinería: [], Electrodomésticos: [] },
  Electrónica: { Celulares: ["Accesorios"], Computadoras: ["Laptops"], Audio: ["Audífonos"], Video: ["TVs"] },
  Vehículos: { Carros: [], Motos: [], Repuestos: [], Accesorios: [] },
  Ropa: { Hombres: [], Mujeres: [], Niños: [], Accesorios: ["Bolsos"] },
  Deportes: { Fitness: [], Bicicletas: [], Outdoor: [], Equipamiento: [] },
  "Belleza y Salud": { CuidadoPersonal: [], Maquillaje: [], Perfumes: [], Suplementos: [] },
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
  const { data: catRes } = useApiQuery(() => supabaseApi.categories.getAll());
  const { data: configRes } = useApiQuery(() => supabaseApi.settings.getProductFormConfig());
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const categories = catRes?.categories || [];
  const adminFields = (Array.isArray(configRes) ? configRes : []) as { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string; category?: string }[];

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
    if (user && user.phone) {
      setForm((prev) => ({ ...prev, whatsapp: user.phone || "" }));
    }
  }, [user]);

  const vendorId = user?.vendorId || user?.vendor?.id;
  if (!user || !vendorId) return null;

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
      await supabaseApi.products.create({
        vendorId,
        name: form.name,
        slug,
        description: form.description || undefined,
        price: Math.round(parseFloat(form.price) * 100),
        compareAtPrice: form.compareAtPrice
          ? Math.round(parseFloat(form.compareAtPrice) * 100)
          : undefined,
        stock: parseInt(form.stock) || 1,
        images: form.images,
        categoryId: form.categoryId || undefined,
        whatsapp: form.whatsapp || undefined,
        condition: form.condition,
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
      const dbParentCats = categories.filter((c: any) => !c.parentId && !c.parent_id);
      const dbSubCats = categories.filter((c: any) => c.parentId || c.parent_id);

      dbParentCats.forEach((cat: any) => {
        const cid = cat.id || cat._id;
        const subs = dbSubCats.filter((s: any) => (s.parentId || s.parent_id) === cid);
        options.push(
          <option key={cid} value={cid}>
            {cat.name}
          </option>
        );
        subs.forEach((sub: any) => {
          const sid = sub.id || sub._id;
          options.push(
            <option key={sid} value={sid}>
              &nbsp;&nbsp;{sub.name}
            </option>
          );
        });
      });
    }

    Object.entries(CATEGORIES_TREE).forEach(([parent]) => {
      options.push(
        <option key={`tree-${parent}`} value={`tree:${parent}`}>
          {parent}
        </option>
      );
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
        <h1 className="text-3xl font-bold text-uniko-blue">Nuevo Producto</h1>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={form.images.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-uniko-blue text-white rounded-lg hover:bg-[#002280] transition disabled:opacity-50 text-sm font-medium"
        >
          <FiEye size={16} /> Vista Previa
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="border-b border-uniko-blue/20 pb-6">
          <h2 className="text-lg font-semibold text-uniko-blue mb-4 flex items-center gap-2">
            <FiImage size={18} /> Multimedia
          </h2>
          <p className="text-sm text-uniko-blue/70 mb-3">Fotos del producto (mínimo 1, máximo 10)</p>

          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-uniko-blue/30 rounded-xl cursor-pointer hover:border-uniko-blue hover:bg-blue-50 transition mb-3">
            <FiUpload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-uniko-blue/70 font-medium">Clic para subir fotos</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG o GIF — {form.images.length}/10 fotos</span>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrlImage(); } }}
              className="flex-1 border border-uniko-blue/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uniko-blue"
              placeholder="O pega una URL de imagen"
            />
            <button type="button" onClick={addUrlImage} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg">Agregar</button>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full h-24 object-cover rounded-lg border" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-uniko-blue text-white text-[10px] px-1.5 py-0.5 rounded">Principal</span>}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    {i > 0 && <button type="button" onClick={() => moveImage(i, i - 1)} className="w-5 h-5 bg-uniko-blue text-white rounded-full text-[10px]">←</button>}
                    {i < form.images.length - 1 && <button type="button" onClick={() => moveImage(i, i + 1)} className="w-5 h-5 bg-uniko-blue text-white rounded-full text-[10px]">→</button>}
                    <button type="button" onClick={() => removeImage(i)} className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><FiTrash2 size={10} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-uniko-blue/20 pb-6">
          <h2 className="text-lg font-semibold text-uniko-blue mb-4 flex items-center gap-2"><FiPackage size={18} /> Información Principal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Título del Producto *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" required maxLength={120} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">Precio (RD$) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-uniko-blue mb-1">Precio Anterior</label>
                <input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Categoría</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue">
                <option value="">Seleccionar categoría</option>
                {renderCategoryOptions()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-2">Condición *</label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITION_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, condition: opt.value })} className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${form.condition === opt.value ? "bg-uniko-blue text-white border-uniko-blue" : "bg-white text-uniko-blue border-uniko-blue/30 hover:border-uniko-blue"}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-uniko-blue/20 pb-6">
          <h2 className="text-lg font-semibold text-uniko-blue mb-4">Descripción</h2>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" rows={5} maxLength={2000} />
        </div>

        <div className="border-b border-uniko-blue/20 pb-6">
          <h2 className="text-lg font-semibold text-uniko-blue mb-4 flex items-center gap-2"><FiTag size={18} /> Más Detalles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Marca</label>
              <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Color</label>
              <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-uniko-blue mb-1">SKU</label>
            <input type="text" value={autoSku} readOnly className="w-full border border-uniko-blue/20 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-uniko-blue/70" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-uniko-blue mb-1">Etiquetas</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} className="flex-1 border border-uniko-blue/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-uniko-blue" placeholder="Escribe y presiona Enter" />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg">+ Agregar</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-uniko-blue/10 text-uniko-blue rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><FiX size={14} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-uniko-blue/20 pb-6">
          <h2 className="text-lg font-semibold text-uniko-blue mb-4 flex items-center gap-2"><FiMapPin size={18} /> Ubicación y Disponibilidad</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Ubicación</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-uniko-blue mb-1">Cantidad en Inventario *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue" min="0" required />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="bg-uniko-red hover:bg-uniko-red text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <FiCheck size={18} /> {loading ? "Publicando..." : "Publicar Producto"}
          </button>
          <button type="button" onClick={() => navigate("/vendor/dashboard")} className="border border-uniko-blue/30 text-uniko-blue hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-colors">Cancelar</button>
        </div>
      </form>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Vista Previa</h3>
              <button onClick={() => setShowPreview(false)}><FiX size={18} /></button>
            </div>
            <img src={previewProduct.images[0]} alt="" className="w-full h-64 object-cover rounded-xl mb-4" />
            <h2 className="text-xl font-bold text-uniko-blue">{previewProduct.name}</h2>
            <p className="text-2xl font-bold text-uniko-red mt-2">RD${(previewProduct.price / 100).toLocaleString()}</p>
            <p className="text-sm text-uniko-blue/70 mt-2">{previewProduct.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
