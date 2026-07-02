"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const CATEGORIES = [
  "Living Room", "Bedroom", "Dining Room", "Kitchen", "Office",
  "Outdoor", "Wall Decor", "Lighting", "Rugs", "Curtains", "Furniture", "Plants",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, firebaseUser, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-display text-2xl tracking-tight text-charcoal">
            Decorix<span className="text-clay">&</span>Studio
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search decor, lighting, rugs..."
                className="w-full bg-white/70 border border-charcoal/10 rounded-full py-2.5 pl-10 pr-4 text-sm
                  focus:outline-none focus:ring-1 focus:ring-clay"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
            </div>
          </form>

          <div className="flex items-center gap-5">
            <Link href="/wishlist" className="hidden sm:block text-charcoal hover:text-clay transition-colors" aria-label="Wishlist">
              <FiHeart size={20} />
            </Link>
            <Link href="/cart" className="relative text-charcoal hover:text-clay transition-colors" aria-label="Cart">
              <FiShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {firebaseUser ? (
              <Link href={isAdmin ? "/admin" : "/profile"} className="text-charcoal hover:text-clay transition-colors" aria-label="Account">
                <FiUser size={20} />
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:block btn-outline !py-2 !px-4 text-xs">
                Sign In
              </Link>
            )}
            <button className="md:hidden text-charcoal" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 pb-3 overflow-x-auto text-sm text-charcoal/80">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="whitespace-nowrap hover:text-clay transition-colors">
              {c}
            </Link>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-charcoal/10 px-4 py-4 space-y-3 bg-cream">
          <form onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white border border-charcoal/10 rounded-full py-2 px-4 text-sm"
            />
          </form>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-sm py-1" onClick={() => setMenuOpen(false)}>
              {c}
            </Link>
          ))}
          {firebaseUser ? (
            <>
              <Link href={isAdmin ? "/admin" : "/profile"} className="block text-sm font-semibold" onClick={() => setMenuOpen(false)}>
                {isAdmin ? "Admin Dashboard" : "My Profile"}
              </Link>
              <button onClick={() => logout()} className="text-sm text-clay">Logout</button>
            </>
          ) : (
            <Link href="/login" className="block text-sm font-semibold">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
