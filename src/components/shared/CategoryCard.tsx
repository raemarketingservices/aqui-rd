import { Link } from "react-router-dom";

export default function CategoryCard({ category }: { category: any }) {
  return (
    <Link to={`/productos?category=${category.slug}`} className="card p-6 text-center hover:border-uniko-red border-2 border-transparent transition-all group">
      <div className="w-16 h-16 mx-auto mb-3 bg-uniko-lightblue/10 rounded-full flex items-center justify-center group-hover:bg-uniko-red/10 transition">
        {category.image ? <img src={category.image} alt={category.name} className="w-10 h-10 object-contain" /> : <span className="text-2xl">📦</span>}
      </div>
      <h3 className="font-semibold text-uniko-blue group-hover:text-uniko-red transition">{category.name}</h3>
    </Link>
  );
}
