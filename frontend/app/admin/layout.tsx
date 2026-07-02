"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FiGrid, FiBox, FiList, FiShoppingCart, FiUsers, FiStar,
  FiTag, FiImage, FiMail, FiArrowLeft,
} from "react-icons/fi";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/products", label: "Products", icon: FiBox },
  { href: "/admin/categories", label: "Categories", icon: FiList },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: FiUsers },
  { href: "/admin/reviews", label: "Reviews", icon: FiStar },
  { href: "/admin/coupons", label: "Coupons", icon: FiTag },
  { href: "/admin/banners", label: "Banners", icon: FiImage },
  { href: "/admin/contacts", label: "Contact Messages", icon: FiMail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-[60vh] flex items-center justify-center text-stone">Checking access...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto grid md:grid-cols-[240px_1fr] min-h-[80vh]">
      <aside className="bg-charcoal text-cream p-6 md:sticky md:top-20 md:h-[calc(100vh-5rem)]">
        <Link href="/" className="flex items-center gap-2 text-sm text-cream/60 mb-8 hover:text-cream">
          <FiArrowLeft size={14} /> Back to Store
        </Link>
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${pathname === href ? "bg-clay text-white" : "text-cream/70 hover:bg-cream/10"}`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}
