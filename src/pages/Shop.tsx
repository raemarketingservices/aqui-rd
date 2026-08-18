import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProductCard from "../components/shared/ProductCard";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "";

  const categories = useQuery(api.categories.getAll);
  const products = useQuery(api.products.getAll, {
    sort: currentSort || undefined,
    search: currentSearch || undefined,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = products;
    if (currentCategory) {
      result = result.filter((p: any) => p.category?.slug === currentCategory);
    }
    return result;
  }, [products, currentCategory]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Filtros</h3>
            <div className="mb-6">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Categorías</h4>
              <div className="space-y-2">
                <button onClick={() => updateParam("category", "")} className={`block w-full text-left text-sm py-1.5 px-3 rounded transition ${!currentCategory ? "bg-aqui-blue text-white" : "hover:bg-gray-100"}`}>Todas</button>
                {categories?.map((cat: any) => (
                  <button key={cat._id} onClick={() => updateParam("category", cat.slug)} className={`block w-full text-left text-sm py-1.5 px-3 rounded transition ${currentCategory === cat.slug ? "bg-aqui-blue text-white" : "hover:bg-gray-100"}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Ordenar por</h4>
              <select value={currentSort} onChange={(e) => updateParam("sort", e.target.value)} className="w-full input-field text-sm">
                <option value="">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
                <option value="popular">Más vendidos</option>
              </select>
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{currentSearch ? `Resultados para "${currentSearch}"` : currentCategory ? categories?.find((c: any) => c.slug === currentCategory)?.name || "Productos" : "Todos los Productos"}</h1>
            <p className="text-gray-500 text-sm mt-1">{products === undefined ? "Cargando..." : `${filteredProducts.length} productos`}</p>
          </div>
          {products === undefined ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqui-blue"></div>
              <span className="ml-3 text-gray-500">Cargando productos...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => <ProductCard key={product._id} product={product} />)}
              </div>
              {filteredProducts.length === 0 && <p className="text-center text-gray-500 py-12">No se encontraron productos</p>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
