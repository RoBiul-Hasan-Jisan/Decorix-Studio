"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";

function ProductsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("minRating") || "";
  const featured = searchParams.get("featured") || "";
  const newArrival = searchParams.get("newArrival") || "";

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });

  const activeCategory = categories?.find((c) => c.name === category);

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, activeCategory?._id, sort, minPrice, maxPrice, minRating, featured, newArrival, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (activeCategory) params.set("category", activeCategory._id);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minRating) params.set("minRating", minRating);
      if (featured) params.set("featured", featured);
      if (newArrival) params.set("newArrival", newArrival);
      params.set("page", String(page));
      params.set("limit", "12");
      return (await api.get<{ products: Product[]; total: number; pages: number }>(`/products?${params}`)).data;
    },
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    setPage(1);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">{category || (q ? `Results for "${q}"` : "All Products")}</p>
          <h1 className="font-display text-3xl text-charcoal">{category || "Shop All"}</h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden btn-outline !py-2 !px-4 flex items-center gap-2 text-xs">
          <FiFilter size={14} /> Filters
        </button>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className={`${showFilters ? "block" : "hidden"} md:block space-y-6`}>
          <div className="flex items-center justify-between md:hidden">
            <span className="font-semibold">Filters</span>
            <button onClick={() => setShowFilters(false)}><FiX /></button>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Category</h4>
            <div className="space-y-2 text-sm">
              <button onClick={() => updateParam("category", "")} className={!category ? "text-clay font-medium" : "text-charcoal/70"}>
                All Categories
              </button>
              {categories?.map((c) => (
                <div key={c._id}>
                  <button
                    onClick={() => updateParam("category", c.name)}
                    className={`block ${category === c.name ? "text-clay font-medium" : "text-charcoal/70"}`}
                  >
                    {c.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Price Range</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam("minPrice", e.target.value)}
                className="w-full text-sm border border-charcoal/15 rounded-lg px-2 py-1.5"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam("maxPrice", e.target.value)}
                className="w-full text-sm border border-charcoal/15 rounded-lg px-2 py-1.5"
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Minimum Rating</h4>
            <div className="space-y-1 text-sm">
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => updateParam("minRating", String(r))}
                  className={`block ${minRating === String(r) ? "text-clay font-medium" : "text-charcoal/70"}`}
                >
                  {r}+ stars
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="text-sm border border-charcoal/15 rounded-lg px-3 py-2 bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="bestselling">Best Selling</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-center py-20 text-stone">Loading products...</p>
          ) : data && data.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-sm ${page === p ? "bg-charcoal text-cream" : "bg-white text-charcoal"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-20 text-stone">No products found. Try adjusting your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading...</p>}>
      <ProductsInner />
    </Suspense>
  );
}
