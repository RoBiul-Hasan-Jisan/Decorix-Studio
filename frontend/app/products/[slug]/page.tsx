"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product } from "@/lib/types";
import { imageUrl, formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { FiStar, FiMinus, FiPlus, FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await api.get<{ product: Product; related: Product[] }>(`/products/${slug}`)).data,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", data?.product._id],
    queryFn: async () => (await api.get(`/reviews/product/${data?.product._id}`)).data,
    enabled: !!data?.product._id,
  });

  const submitReview = useMutation({
    mutationFn: async () => api.post("/reviews", { productId: data?.product._id, ...reviewForm }),
    onSuccess: () => {
      toast.success("Review submitted");
      queryClient.invalidateQueries({ queryKey: ["reviews", data?.product._id] });
      setReviewForm({ rating: 5, comment: "" });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to submit review"),
  });

  if (isLoading) return <p className="text-center py-24 text-stone">Loading...</p>;
  if (!data) return <p className="text-center py-24 text-stone">Product not found.</p>;

  const { product, related } = data;
  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-sand mb-4">
            <Image src={imageUrl(images[activeImage])} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === i ? "border-clay" : "border-transparent"}`}
              >
                <Image src={imageUrl(img)} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wide text-stone">
            {typeof product.category === "object" ? product.category.name : ""}
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-charcoal mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3 text-sm text-stone">
            <div className="flex text-clay">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} className={i < Math.round(product.rating) ? "fill-clay" : ""} size={14} />
              ))}
            </div>
            {product.rating.toFixed(1)} ({product.numReviews} reviews)
          </div>

          <div className="flex items-center gap-3 mt-5">
            <span className="font-display text-3xl text-charcoal">{formatPrice(product.finalPrice)}</span>
            {product.discountPercent > 0 && (
              <span className="text-stone line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-charcoal/70 mt-5 leading-relaxed">{product.description}</p>

          <dl className="grid grid-cols-2 gap-3 mt-6 text-sm">
            {product.brand && <><dt className="text-stone">Brand</dt><dd>{product.brand}</dd></>}
            {product.material && <><dt className="text-stone">Material</dt><dd>{product.material}</dd></>}
            {product.dimensions && <><dt className="text-stone">Dimensions</dt><dd>{product.dimensions}</dd></>}
            {product.weight && <><dt className="text-stone">Weight</dt><dd>{product.weight}</dd></>}
            <dt className="text-stone">SKU</dt><dd>{product.sku}</dd>
            <dt className="text-stone">Stock</dt><dd>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</dd>
          </dl>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-charcoal/15 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3"><FiMinus size={14} /></button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="p-3"><FiPlus size={14} /></button>
            </div>
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              onClick={async () => {
                if (!user) return toast.error("Sign in to save items");
                await api.post(`/users/wishlist/${product._id}`);
                toast.success("Saved to wishlist");
              }}
              className="p-3.5 border border-charcoal/15 rounded-full"
              aria-label="Add to wishlist"
            >
              <FiHeart size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-2xl text-charcoal mb-6">Reviews</h2>
        {user && (
          <div className="bg-white/60 rounded-xl p-5 mb-8">
            <p className="text-sm font-semibold mb-2">Leave a review</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}>
                  <FiStar className={r <= reviewForm.rating ? "fill-clay text-clay" : "text-stone"} size={18} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your thoughts about this product..."
              className="w-full border border-charcoal/15 rounded-lg p-3 text-sm mb-3"
              rows={3}
            />
            <button
              onClick={() => reviewForm.comment.trim() && submitReview.mutate()}
              className="btn-primary !py-2 !px-5 text-xs"
            >
              Submit Review
            </button>
          </div>
        )}
        <div className="space-y-5">
          {reviews?.length ? reviews.map((r: any) => (
            <div key={r._id} className="border-b border-charcoal/10 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{r.user?.name}</span>
                <div className="flex text-clay">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className={i < r.rating ? "fill-clay" : ""} size={12} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-charcoal/70">{r.comment}</p>
              {r.adminReply && (
                <div className="mt-2 bg-sand/50 rounded-lg p-3 text-xs text-charcoal/70">
                  <span className="font-semibold">Store reply: </span>{r.adminReply}
                </div>
              )}
            </div>
          )) : <p className="text-sm text-stone">No reviews yet. Be the first!</p>}
        </div>
      </section>

      {/* Related */}
      {related?.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-charcoal mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
