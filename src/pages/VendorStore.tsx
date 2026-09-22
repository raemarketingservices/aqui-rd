import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api as convexApi } from "../../convex/_generated/api";
import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import ProductCard from "../components/shared/ProductCard";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FiStar,
  FiPackage,
  FiMessageCircle,
  FiSend,
  FiExternalLink,
} from "react-icons/fi";

export default function VendorStore() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { data: vendor, loading } = useApiQuery(
    () => api.stores.get(slug || ""),
    [slug]
  );
  const reviews = useQuery(
    convexApi.vendorReviews.getVendorReviews,
    vendor ? { vendorId: vendor.id } : "skip"
  );
  const createReview = useMutation(convexApi.vendorReviews.create);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-48 bg-white rounded-xl" />
      </div>
    );
  if (!vendor)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Tienda no encontrada</h2>
      </div>
    );

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : vendor.rating || 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error("Inicia sesión para dejar una reseña");
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        vendorId: vendor.id,
        userId: user._id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      toast.success("Reseña publicada");
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      toast.error(error.message || "Error al publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 16) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={
            i < Math.round(rating)
              ? "text-uniko-red fill-uniko-red"
              : "text-gray-300"
          }
          size={size}
        />
      ))}
    </div>
  );

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count =
      reviews?.filter((r: any) => r.rating === stars).length || 0;
    const total = reviews?.length || 1;
    return { stars, count, percent: (count / total) * 100 };
  });

  return (
    <div>
      {/* Banner */}
      <div className="bg-gradient-to-r from-uniko-dark to-uniko-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {vendor.imageUrl ? (
                <img
                  src={vendor.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-uniko-dark">
                  {vendor.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {vendor.name}
              </h1>
              {vendor.description && (
                <p className="text-gray-300 mt-1">{vendor.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                <div className="flex items-center gap-1">
                  {renderStars(avgRating, 18)}
                  <span className="font-medium ml-1">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-300 text-sm">
                    ({reviews?.length || 0} reseñas)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <FiPackage />
                  <span>{vendor.products?.length || 0} productos</span>
                </div>
              </div>
              {vendor.whatsapp && (
                <a
                  href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, "").startsWith("1") ? "" : "1"}${vendor.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                >
                  <FiMessageCircle size={16} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Resumen de calificaciones */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Calificación de la tienda</h3>
            <div className="text-center mb-4">
              <div className="text-5xl font-extrabold text-uniko-dark">
                {avgRating.toFixed(1)}
              </div>
              {renderStars(avgRating, 22)}
              <p className="text-uniko-blue/70 text-sm mt-1">
                {reviews?.length || 0} reseñas
              </p>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-right">{d.stars}</span>
                  <FiStar className="text-uniko-red fill-uniko-red" size={12} />
                  <div className="flex-1 bg-white rounded-full h-2">
                    <div
                      className="bg-uniko-red h-2 rounded-full"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-uniko-blue/70 text-xs">{d.count}</span>
                </div>
              ))}
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full mt-4 px-4 py-2 bg-uniko-blue text-white rounded-lg hover:bg-[#002280] transition text-sm font-medium"
              >
                {showReviewForm ? "Cancelar" : "Escribir una reseña"}
              </button>
            )}
          </div>

          {/* Formulario de reseña */}
          {showReviewForm && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Tu reseña</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-2">
                    Calificación
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
                      >
                        <FiStar
                          size={28}
                          className={
                            star <= (hoverRating || reviewRating)
                              ? "text-uniko-red fill-uniko-red"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-uniko-blue/70">
                      {reviewRating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-uniko-blue mb-1">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full border border-uniko-blue/30 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-uniko-blue focus:border-transparent"
                    rows={3}
                    placeholder="Comparte tu experiencia con esta tienda..."
                    maxLength={500}
                  />
                  <p className="text-xs text-white/80 mt-1">
                    {reviewComment.length}/500
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-uniko-red text-white rounded-lg hover:bg-uniko-red transition text-sm font-medium disabled:opacity-50"
                >
                  <FiSend size={14} />{" "}
                  {submitting ? "Publicando..." : "Publicar reseña"}
                </button>
              </form>
            </div>
          )}

          {/* Lista de reseñas */}
          {!showReviewForm && reviews && reviews.length > 0 && (
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold">Reseñas de compradores</h3>
              {reviews.map((review: any) => (
                <div
                  key={review._id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-uniko-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {review.user?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {review.user?.name || "Anónimo"}
                      </p>
                      {renderStars(review.rating, 14)}
                    </div>
                    <span className="ml-auto text-xs text-white/80">
                      {new Date(review.createdAt).toLocaleDateString("es-DO")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-uniko-blue text-sm mt-1">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos */}
        <h2 className="text-2xl font-bold mb-6">
          Productos de {vendor.name}
        </h2>
        {!vendor.products || vendor.products.length === 0 ? (
          <p className="text-uniko-blue/70 text-center py-12">
            Esta tienda aún no tiene productos
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {vendor.products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
