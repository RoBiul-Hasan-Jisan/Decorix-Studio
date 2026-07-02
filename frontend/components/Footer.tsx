import Link from "next/link";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <h3 className="font-display text-2xl text-cream mb-3">Decorix & Studio</h3>
          <p className="text-sm max-w-xs">Thoughtfully sourced decor for rooms that feel like you. Slow-made, well-built, made to live in.</p>
          <div className="flex gap-4 mt-6 text-cream">
            <FiInstagram /> <FiFacebook /> <FiTwitter />
          </div>
        </div>
        <div>
          <h4 className="text-cream text-sm font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products?category=Living Room">Living Room</Link></li>
            <li><Link href="/products?category=Bedroom">Bedroom</Link></li>
            <li><Link href="/products?featured=true">Featured</Link></li>
            <li><Link href="/products?newArrival=true">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-cream text-sm font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/orders">Track Order</Link></li>
            <li><Link href="/profile">My Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Decorix & Studio. All rights reserved.
      </div>
    </footer>
  );
}
