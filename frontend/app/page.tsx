"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { imageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Sofa,
  BedDouble,
  UtensilsCrossed,
  Bath,
  Lamp,
  Armchair,
  DoorOpen,
  Trees,
  Baby,
  LayoutGrid,
  
  BookOpen,
  Briefcase,
  Flower2,
  Warehouse,
  Home,
  Table2,
  Palette,
  ShowerHead,
  Wind,
  PawPrint,
  Gamepad2,
  Refrigerator,
  Utensils,
  
  Clapperboard,
  Music,
  Dumbbell,
  WashingMachine,
  Microwave,
  Coffee,
  Wine,
  Martini,
  GlassWater,
  Fish,
  Bird,
  Dog,
  Cat,
  
  Building,

  Package,
  
  Leaf,
  Droplet,

  Flame,
  
} from "lucide-react";

// Comprehensive category icon mapping with multiple variations
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Living & Seating
  "living room": Sofa,
  "living": Sofa,
  "sofa": Sofa,
  "couch": Sofa,
  "sectional": Sofa,
  "lounge": Sofa,
  "seating": Armchair,
  "chair": Armchair,
  "armchair": Armchair,
  "recliner": Armchair,
  "ottoman": Sofa,
  "bench": Sofa,

  // Bedroom
  "bedroom": BedDouble,
  "bed": BedDouble,
  "mattress": BedDouble,
  "headboard": BedDouble,
  "nightstand": BedDouble,
  "dresser": BedDouble,
  "wardrobe": Warehouse,
  "closet": Warehouse,

  // Kitchen & Dining
  "kitchen": UtensilsCrossed,
  "dining": Utensils,
  "dining room": Utensils,
  "table": Table2,
  "dining table": Table2,
  "coffee table": Table2,
  "side table": Table2,
  "counter": Table2,
  "stove": UtensilsCrossed,
  "oven": Microwave,
  "microwave": Microwave,
  "refrigerator": Refrigerator,
  "fridge": Refrigerator,
  "dishwasher": WashingMachine,
  "sink": Bath,
  "faucet": Bath,
  "cookware": UtensilsCrossed,
  "cutlery": Utensils,
  "glassware": GlassWater,
  "wine": Wine,
  "bar": Martini,
  "coffee maker": Coffee,
  "kettle": Coffee,

  // Bathroom
  "bathroom": Bath,
  "bath": Bath,
  "shower": ShowerHead,
  "toilet": Bath,
  "vanity": Bath,
  "mirror": Bath,
  "towel": Bath,
  "soap": Bath,

  // Lighting
  "lighting": Lamp,
  "lamp": Lamp,
  "light": Lamp,
  "chandelier": Lamp,
  "pendant": Lamp,
  "sconce": Lamp,
  "floor lamp": Lamp,
  "table lamp": Lamp,
  "ceiling": Lamp,

  // Office & Study
  "office": Briefcase,
  "study": BookOpen,
  "desk": Table2,
  "computer": Briefcase,
  "laptop": Briefcase,
  "bookshelf": BookOpen,
  "bookcase": BookOpen,
  "stationery": BookOpen,

  // Outdoor & Garden
  "outdoor": Trees,
  "garden": Flower2,
  "patio": Trees,
  "deck": Trees,
  "balcony": Trees,
  "plant": Leaf,
  "flower": Flower2,
  "tree": Trees,
  "grass": Leaf,
  "pool": Droplet,

  // Kids & Nursery
  "kids": Baby,
  "nursery": Baby,
  "children": Baby,
  "toy": Gamepad2,
  "game": Gamepad2,
  "play": Gamepad2,
  "crib": Baby,
  "stroller": Baby,

  // Entry & Hallway
  "hall": DoorOpen,
  "entry": DoorOpen,
  "foyer": DoorOpen,
  "corridor": DoorOpen,
  "door": DoorOpen,

  // Storage
  "storage": Warehouse,
  "shelf": Warehouse,
  "cabinet": Warehouse,
  "chest": Warehouse,
  "box": Package,
  "basket": Package,

  // Decor & Accessories (Removed Rug reference)
  "decor": Palette,
  "decoration": Palette,
  "art": Palette,
  "painting": Palette,
  "frame": Palette,
  "vase": Palette,
  "sculpture": Palette,
  "carpet": Palette, // Using Palette as fallback
  "mat": Palette,
  "curtain": DoorOpen,
  "drape": DoorOpen,
  "blind": DoorOpen,
  "pillow": Sofa,
  "cushion": Sofa,
  "throw": Sofa,
  "blanket": Sofa,

  // Appliances
  "appliance": Refrigerator,
  "fan": Wind,
  "cooling": Wind,
  "heating": Flame,
  "ac": Wind,
  "heater": Flame,
  "humidifier": Droplet,

  // Pets
  "pet": PawPrint,
  "dog": Dog,
  "cat": Cat,
  "bird": Bird,
  "fish": Fish,
  "aquarium": Fish,

  // Entertainment
  "entertainment": Clapperboard,
  "tv": Clapperboard,
  "television": Clapperboard,
  "music": Music,
  "speaker": Music,
  "stereo": Music,
  "gaming": Gamepad2,

  // Fitness
  "fitness": Dumbbell,
  "gym": Dumbbell,
  "exercise": Dumbbell,
  "yoga": Dumbbell,

  // Home & General
  "home": Home,
  "house": Home,
  "property": Building,
  "apartment": Building,
  "condo": Building,
};

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase().trim();
  
  // Direct match
  if (CATEGORY_ICON_MAP[lower]) {
    return CATEGORY_ICON_MAP[lower];
  }
  
  // Partial match - check if any keyword is contained in the name
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(keyword)) {
      return icon;
    }
  }
  
  // Default fallback
  return LayoutGrid;
}

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => (await api.get<{ products: Product[] }>("/products?featured=true&limit=8")).data.products,
  });

  const { data: newArrivals } = useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => (await api.get<{ products: Product[] }>("/products?newArrival=true&limit=8")).data.products,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sand">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label mb-4">New Season Collection</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-charcoal">
              Rooms that feel like <span className="italic text-clay">home</span>, not a showroom.
            </h1>
            <p className="mt-6 text-charcoal/70 max-w-md">
              Hand-finished furniture, warm textiles, and considered lighting — sourced from makers who care about craft as much as you do.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/products" className="btn-primary">Shop the Collection</Link>
              <Link href="/products?featured=true" className="btn-outline">Featured Pieces</Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-soft"
          >
            <Image src="/test.jpeg" alt="Styled living room" fill className="object-cover" priority />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">Shop by Room</p>
            <h2 className="font-display text-3xl text-charcoal">Categories</h2>
          </div>
          <Link href="/categories" className="text-sm text-clay hover:underline">View all →</Link>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
          {categories?.map((c) => {
            const Icon = getCategoryIcon(c.name);
            return (
              <Link
                key={c._id}
                href={`/products?category=${encodeURIComponent(c.name)}`}
                className="flex-shrink-0 w-40 text-center group"
              >
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-sand mb-3 flex items-center justify-center border-2 border-transparent group-hover:border-clay transition-colors shadow-sm group-hover:shadow-md">
                  {c.icon ? (
                    <Image
                      src={imageUrl(c.icon)}
                      alt={c.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Icon className="w-12 h-12 text-clay group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-sm text-charcoal font-medium group-hover:text-clay transition-colors">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Editors' Picks</p>
              <h2 className="font-display text-3xl text-charcoal">Featured Pieces</h2>
            </div>
            <Link href="/products?featured=true" className="text-sm text-clay hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Just In</p>
              <h2 className="font-display text-3xl text-charcoal">New Arrivals</h2>
            </div>
            <Link href="/products?newArrival=true" className="text-sm text-clay hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="bg-sage/10 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: "Hand-finished quality", desc: "Every piece checked before it leaves the workshop." },
            { title: "Cash on Delivery", desc: "Pay when your order arrives at your door." },
            { title: "Easy Tracking", desc: "Follow your order from packed to delivered, in real time." },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="font-display text-xl text-charcoal mb-2">{v.title}</h3>
              <p className="text-sm text-charcoal/60">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}