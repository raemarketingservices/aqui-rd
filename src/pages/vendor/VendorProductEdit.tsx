import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabaseApi } from "../../services/supabaseApi";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FiSave,
  FiArrowLeft,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiBarChart2,
  FiImage,
  FiUpload,
  FiTrash2,
  FiTag,
  FiMapPin,
  FiVideo,
} from "react-icons/fi";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "USED_LIKE_NEW", label: "Usado - Como nuevo" },
  { value: "USED_GOOD", label: "Usado - Buen estado" },
  { value: "USED_ACCEPTABLE", label: "Usado - Aceptable" },
];

const CATEGORIES_TREE: Record<string, Record<string, string[]>> = {
  "Casa y Jardín": { Herramientas: [], Muebles: [], Hogar: [], Jardinería: [], Electrodomésticos: [] },
  Electrónica: { Celulares: ["Accesorios", "Fundas", "Cargadores"], Computadoras: ["Laptops", "Desktops", "Tablets"], Audio: ["Audífonos", "Bocinas", "Micrófonos"], Video: ["TVs", "Monitores", "Cámaras"] },
  Vehículos: { Carros: [], Motos: [], Repuestos: [], Accesorios: [] },
  Ropa: { Hombres: [], Mujeres: [], Niños: [], Accesorios: ["Bolsos", "Relojes", "Gafas"] },
  Deportes: { Fitness: [], Bicicletas: [], Outdoor: [], Equipamiento: [] },
  "Belleza y Salud": { CuidadoPersonal: [], Maquillaje: [], Perfumes: [], Suplementos: [] },
  Juguetes: {},
  Mascotas: {},
  Libros: {},
  Otros: {},
};

export default function VendorProductEdit() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: productRes, refetch: refetchProduct } = useApiQuery(() => supabaseApi.products.get(id || ""), [id]);
  const { data: categoriesRes } = useApiQuery(() => supabaseApi.categories.getAll());
  const { data: configRes } = useApiQuery(() => supabaseApi.settings.getProductFormConfig());

  const product = productRes?.product;
  const categories = categoriesRes?.categories || [];
  const adminFields = (Array.isArray(configRes) ? configRes : []) as { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string; category?: string }[];

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "inventory">("info");
  const [tagInput, setTagInput] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    categoryId: "",
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

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || "",
        price: (product.price / 100).toString(),
        compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toString() : "",
        stock: product.stock.toString(),
        categoryId: product.categoryId || "",
        images: product.images.length > 0 ? product.images : [],
        whatsapp: product.whatsapp || "",
        condition: product.condition || "NEW",
        brand: product.brand || "",
        color: product.color || "",
        tags: product.tags || [],
        location: product.location || "",
        availability: product.availability || "SINGLE",
        videoUrl: product.videoUrl || "",
      });
    }
  }, [product]);

  const autoSku = useMemo(() => {
    if (!form.name) return product?.sku || "";
    const prefix = form.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
    return product?.sku || `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  }, [form.name, product?.sku]);

  if (!user || user.role !== "VENDOR") return null;
  if (product === undefined) return <div className="text-center py-12">Cargando...</div>;
  if (!product) return <div className="text-center py-12">Producto no encontrado</div>;

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
        if (typeof reader.result === "string") newImages.push(reader.result);
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
    if (!file.type.startsWith("video/")) { toast.error("Solo videos"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setForm((prev) => ({ ...prev, videoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const newImages = [...form.images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabaseApi.products.update(id as string, {
        name: form.name,
        description: form.description || undefined,
        price: Math.round(parseFloat(form.price) * 100),
        compareAtPrice: form.compareAtPrice ? Math.round(parseFloat(form.compareAtPrice) * 100) : undefined,
        stock: parseInt(form.stock) || 0,
        images: form.images,
        whatsapp: form.whatsapp || undefined,
        condition: form.condition as any,
        brand: form.brand || undefined,
        color: form.color || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        location: form.location || undefined,
        availability: form.availability,
        videoUrl: form.videoUrl || undefined,
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
      await supabaseApi.products.update(id as string, { stock: newStock });
      toast.success("Stock actualizado");
    } catch (e: any) {
      toast.error(e.message);
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
        options.push(<option key={cid} value={cid}>{cat.name}</option>);
        subs.forEach((sub: any) => {
          const sid = sub.id || sub._id;
          options.push(<option key={sid} value={sid}>&nbsp;&nbsp;{sub.name}</option>);
        });
      });
    }
    return options;
  };

  const stockPercent = (product as any).sales_count > 0
    ? Math.min(100, (product.stock / (product.stock + (product as any).sales_count)) * 100)
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/vendor/dashboard")}
          className="flex items-center gap-2 text-uniko-blue hover:text-[#002280]"
        >
          <FiArrowLeft /> Volver
        </button>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "info" ? "bg-uniko-blue text-white" : "bg-white text-uniko-blue hover:bg-white"
          }`}
        >
          <FiPackage size={16} /> Información
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "inventory" ? "bg-uniko-blue text-white" : "bg-white text-uniko-blue hover:bg-white"
          }`}
        >
          <FiBarChart2 size={16} /> Inventario
        </button>
      </div>

      {activeTab === "info" && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-uniko-blue/20 pb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiImage size={18} /> Multimedia ({form.images.length}/10)
              </h2>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-uniko-blue/30 rounded-xl cursor-pointer hover:border-uniko-blue hover:bg-blue-50 transition mb-3">
                <FiUpload size={22} className="text-gray-400 mb-1" />
                <span className="text-sm text-uniko-blue/70">Clic para subir fotos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                      {i === 0 && <span className="absolute top-1 left-1 bg-uniko-blue text-white text-[10px] px-1.5 py-0.5 rounded">Principal</span>}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        {i > 0 && <button type="button" onClick={() => moveImage(i, i - 1)} className="w-5 h-5 bg-uniko-blue text-white rounded-full text-[10px]">←</button>}
                        {i < form.images.length - 1 && <button type="button" onClick={() => moveImage(i, i + 1)} className="w-5 h-5 bg-uniko-blue text-white rounded-full text-[10px]">→</button>}
                        <button type="button" onClick={() => removeImage(i)} className="w-5 h-5 bg-red-500 text-white rounded-full"><FiTrash2 size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <label className="flex items-center gap-2 text-sm text-uniko-blue/70 mb-1"><FiVideo size={14} /> Video (opcional)</label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-uniko-blue/20 rounded-lg cursor-pointer hover:border-uniko-blue transition">
                  <span className="text-xs text-uniko-blue/70">{form.videoUrl ? "Video cargado ✓" : "Subir video"}</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </label>
                {form.videoUrl && <button type="button" onClick={() => setForm((p) => ({ ...p, videoUrl: "" }))} className="mt-1 text-xs text-red-500 hover:underline">Eliminar video</button>}
              </div>
            </div>

            <div className="border-b border-uniko-blue/20 pb-6">
              <h2 className="text-lg font-semibold mb-4">Información Principal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">Título *</label>
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
                  <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value } as any)} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue">
                    <option value="">Seleccionar</option>
                    {renderCategoryOptions()}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-2">Condición</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITION_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setForm({ ...form, condition: opt.value })} className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${form.condition === opt.value ? "bg-uniko-blue text-white border-uniko-blue" : "bg-white text-uniko-blue border-uniko-blue/30 hover:border-uniko-blue"}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-uniko-blue/20 pb-6">
              <h2 className="text-lg font-semibold mb-4">Descripción</h2>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" rows={4} maxLength={2000} />
            </div>

            <div className="border-b border-uniko-blue/20 pb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTag size={18} /> Más Detalles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">Marca</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder="Samsung, Apple..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">Color</label>
                  <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder="Negro, Azul..." />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-uniko-blue mb-1">SKU</label>
                <input type="text" value={autoSku} readOnly className="w-full border border-uniko-blue/20 rounded-lg px-4 py-2.5 text-sm bg-white text-uniko-blue/70" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-uniko-blue mb-1">Etiquetas</label>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} className="flex-1 border border-uniko-blue/30 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder="Escribe y presiona Enter" />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-white hover:bg-white text-sm font-medium rounded-lg">+ Agregar</button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-uniko-blue/10 text-uniko-blue rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-uniko-blue/20 pb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiMapPin size={18} /> Ubicación</h2>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder="Santo Domingo, Distrito Nacional" />
            </div>

            <div className="pb-2">
              <label className="block text-sm font-medium text-uniko-blue mb-1">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder="809-555-0000" />
            </div>

            {adminFields.length > 0 && (
              <div className="border-b border-uniko-blue/20 pb-6">
                <h2 className="text-lg font-semibold mb-4">Campos Adicionales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {adminFields.map((field) => (
                    <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="block text-sm font-medium text-uniko-blue mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "text" && (
                        <input type="text" value={customFields[field.name] || ""} onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" placeholder={field.placeholder || ""} />
                      )}
                      {field.type === "textarea" && (
                        <textarea value={customFields[field.name] || ""} onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" rows={3} />
                      )}
                      {field.type === "number" && (
                        <input type="number" value={customFields[field.name] || ""} onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue" min="0" />
                      )}
                      {field.type === "select" && (
                        <select value={customFields[field.name] || ""} onChange={(e) => setCustomFields({ ...customFields, [field.name]: e.target.value })} className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-unipo-blue">
                          <option value="">Seleccionar</option>
                          {(field.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                      {field.type === "toggle" && (
                        <button type="button" onClick={() => setCustomFields({ ...customFields, [field.name]: customFields[field.name] ? "" : "yes" })} className={`w-12 h-6 rounded-full transition-colors relative ${customFields[field.name] ? "bg-uniko-blue" : "bg-gray-300"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${customFields[field.name] ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-uniko-red hover:bg-uniko-red text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : <><FiSave className="inline mr-2" /> Guardar Cambios</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-uniko-red/10 rounded-full flex items-center justify-center">
              <FiShoppingBag size={24} className="text-uniko-red" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gestión de Inventario</h2>
              <p className="text-sm text-uniko-blue/70">Actualiza el stock de este producto</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-uniko-blue/70 mb-1">Stock Actual</p>
                <p className="text-3xl font-bold text-uniko-dark">{product.stock.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-uniko-blue/70 mb-1">Ventas Totales</p>
                <p className="text-lg font-semibold text-uniko-blue">{product.sales_count || 0}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-uniko-blue/70 mb-1">
                <span>Disponibilidad</span>
                <span>{stockPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${stockPercent > 50 ? "bg-green-400" : stockPercent > 20 ? "bg-uniko-red" : "bg-red-400"}`} style={{ width: `${stockPercent}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => { const s = parseInt(form.stock) - 1; if (s >= 0) { setForm({ ...form, stock: s.toString() }); handleStockChange(s); } }} disabled={loading || parseInt(form.stock) <= 0} className="w-10 h-10 rounded-full border border-uniko-blue/30 flex items-center justify-center hover:bg-white disabled:opacity-50">−</button>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-20 text-center border border-uniko-blue/30 rounded-lg px-2 py-1 text-lg font-bold focus:ring-2 focus:ring-unipo-blue" min="0" />
              <button onClick={() => { const s = parseInt(form.stock) + 1; setForm({ ...form, stock: s.toString() }); handleStockChange(s); }} disabled={loading} className="w-10 h-10 rounded-full border border-uniko-blue/30 flex items-center justify-center hover:bg-white disabled:opacity-50">+</button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => handleStockChange(0)} disabled={loading || product.stock === 0} className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition text-sm">Agotar</button>
              <button onClick={() => handleStockChange(100)} disabled={loading} className="px-4 py-2 rounded-lg border border-green-300 text-green-600 hover:bg-green-50 transition text-sm">Establecer 100</button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-uniko-blue/70">SKU:</span><span className="font-mono">{autoSku || "Sin SKU"}</span></div>
            <div className="flex justify-between"><span className="text-uniko-blue/70">Condición:</span><span>{CONDITION_OPTIONS.find((c) => c.value === form.condition)?.label || "No definida"}</span></div>
            <div className="flex justify-between"><span className="text-uniko-blue/70">Disponibilidad:</span><span>{form.availability === "SINGLE" ? "Artículo único" : "Múltiples unidades"}</span></div>
            <div className="flex justify-between"><span className="text-uniko-blue/70">Fotos:</span><span>{form.images.length}/10</span></div>
          </div>
        </div>
      )}
    </div>
  );
}