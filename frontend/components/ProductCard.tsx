"use client";

import Link from "next/link";
import Image from "next/image";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { Product } from "@/lib/types";
import { imageUrl, formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to save items");
    try {
      await api.post(`/users/wishlist/${product._id}`);
      toast.success("Wishlist updated");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block card-hover rounded-2xl bg-white/60 p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand">
        <Image
          src={imageUrl(product.thumbnail)}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-clay text-white text-xs px-2 py-1 rounded-full">
            -{product.discountPercent}%
          </span>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add to wishlist"
        >
          <FiHeart size={15} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (product.stock > 0) addToCart(product);
            else toast.error("Out of stock");
          }}
          className="absolute bottom-3 left-3 right-3 bg-charcoal text-cream text-xs py-2.5 rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <FiShoppingBag size={13} /> {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
      <div className="pt-3 pb-1">
        <p className="text-xs text-stone uppercase tracking-wide">
          {typeof product.category === "object" ? product.category.name : ""}
        </p>
        <h3 className="font-display text-base text-charcoal mt-0.5 truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-stone">
          <FiStar className="fill-clay text-clay" size={12} />
          {product.rating.toFixed(1)} ({product.numReviews})
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-semibold text-charcoal">{formatPrice(product.finalPrice)}</span>
          {product.discountPercent > 0 && (
            <span className="text-xs text-stone line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}