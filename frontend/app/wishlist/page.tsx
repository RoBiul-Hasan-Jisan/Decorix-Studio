"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { firebaseUser } = useAuth();
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => (await api.get<Product[]>("/users/wishlist")).data,
    enabled: !!firebaseUser,
  });

  if (!firebaseUser) return <p className="text-center py-24 text-stone">Please sign in to view your wishlist.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display text-3xl text-charcoal mb-8">My Wishlist</h1>
      {isLoading ? (
        <p className="text-stone">Loading...</p>
      ) : wishlist && wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <p className="text-stone">Your wishlist is empty.</p>
      )}
    </div>
  );
}
