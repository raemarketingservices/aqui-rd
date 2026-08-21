import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../hooks/useAuth";
import { FiFacebook, FiPlus, FiCheck, FiX, FiLoader, FiExternalLink } from "react-icons/fi";
import toast from "react-hot-toast";

export default function VendorFacebookImport({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [linksText, setLinksText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const scrapeAndImport = useAction(api.facebook.scrapeAndImport);

  const parseLinks = () =>
    linksText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10);

  const handleImport = async () => {
    const urls = parseLinks();
    if (urls.length === 0) {
      toast.error("Pega al menos un enlace de Facebook");
      return;
    }
    if (!user?.vendorId) {
      toast.error("Debes ser vendedor para importar");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await scrapeAndImport({ vendorId: user.vendorId, urls });
      setResults(res.results || []);
      if (res.created > 0) {
        toast.success(`${res.created} producto${res.created > 1 ? "s" : ""} importado${res.created > 1 ? "s" : ""}!`);
        setLinksText("");
        onSaved();
      } else {
        toast.error("No se pudieron extraer productos. Verifica los enlaces.");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const okCount = results?.filter((r) => r.ok && r.name !== "Producto de Facebook")?.length || 0;
  const failCount = results?.filter((r) => !r.ok || r.name === "Producto de Facebook")?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
          <FiFacebook size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Importar de Facebook</h2>
          <p className="text-sm text-gray-500">
            Pega los enlaces de tus publicaciones y se crean automáticamente
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enlaces de Facebook (uno por línea, máx. 20)
        </label>
        <textarea
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-aqui-blue focus:border-transparent font-mono"
          placeholder={"https://www.facebook.com/marketplace/item/123456789/\nhttps://www.facebook.com/marketplace/item/987654321/"}
          disabled={loading}
        />
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 mt-2 text-xs leading-relaxed">
          <FiExternalLink size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            <strong>Cómo obtener los enlaces:</strong> abre tu perfil de
            Marketplace en la app de Facebook, entra a cada publicación y
            toca <strong>⋯ → Copiar enlace</strong>. Pega todos los enlaces
            aquí y pulsa "Importar". Se extraerá la foto, nombre y precio
            de cada publicación.
          </span>
        </div>
      </div>

      <button
        onClick={handleImport}
        disabled={loading || parseLinks().length === 0}
        className="mt-4 bg-aqui-orange hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin" size={16} /> Importando...
          </>
        ) : (
          <>
            <FiPlus size={16} /> Importar {parseLinks().length}{" "}
            {parseLinks().length === 1 ? "enlace" : "enlaces"}
          </>
        )}
      </button>

      {results && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-4 text-sm">
            {okCount > 0 && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <FiCheck size={14} /> {okCount} importado{okCount > 1 ? "s" : ""}
              </span>
            )}
            {failCount > 0 && (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <FiX size={14} /> {failCount} no{" "}
                {failCount > 1 ? "funcionaron" : "funcionó"}
              </span>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs p-2 rounded ${
                  r.ok && r.name !== "Producto de Facebook"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {r.ok && r.name !== "Producto de Facebook" ? (
                  <FiCheck size={12} className="flex-shrink-0" />
                ) : (
                  <FiX size={12} className="flex-shrink-0" />
                )}
                <span className="truncate">{r.url}</span>
                <span className="ml-auto flex-shrink-0 font-medium">
                  {r.ok && r.name !== "Producto de Facebook"
                    ? r.name.slice(0, 30)
                    : r.error || "Sin datos"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}