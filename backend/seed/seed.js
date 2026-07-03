// Quick-start seed script: creates categories + demo products (using real
// stock photos from Unsplash, hot-linked so there's nothing to download)
// so the storefront isn't empty on first run.
// Usage: node seed/seed.js
//
// Swap these out any time from Admin -> Products -> Edit -> upload your
// own images; uploaded images take over from these URLs automatically.
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const categories = [
  { name: "Living Room" }, { name: "Bedroom" }, { name: "Dining Room" },
  { name: "Kitchen" }, { name: "Office" }, { name: "Outdoor" },
  { name: "Wall Decor" }, { name: "Lighting" }, { name: "Rugs" },
  { name: "Curtains" }, { name: "Furniture" }, { name: "Plants" },
];

// Direct Unsplash CDN URLs (free to use under the Unsplash License).
// Query params control size/format so these load fast as thumbnails.
const img = (photoId, w = 1200) =>
  `https://images.unsplash.com/${photoId}?w=${w}&q=80&auto=format&fit=crop`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(categories);
  const byName = (name) => createdCategories.find((c) => c.name === name)._id;

  await Product.deleteMany({});
  await Product.insertMany([
    {
      name: "Linen Weave Sectional Sofa",
      description: "A hand-finished sectional upholstered in natural linen weave, built on a solid oak frame. Deep seats and a relaxed silhouette make it the anchor piece for a cozy living room.",
      category: byName("Living Room"),
      brand: "Hearth & Home",
      material: "Linen, Oak",
      color: ["Cream", "Sand"],
      dimensions: "280 x 180 x 85 cm",
      weight: "62kg",
      price: 1899,
      discountPercent: 10,
      stock: 6,
      isFeatured: true,
      isNewArrival: true,
      thumbnail: img("photo-1757416654883-c73c67b3382b"),
      images: [img("photo-1757416654883-c73c67b3382b"), img("photo-1757416654883-c73c67b3382b", 800)],
    },
    {
      name: "Teal Glass Pendant Light",
      description: "A hand-blown teal glass pendant with a brass ceiling plate — a striking, colorful focal point above a dining table or kitchen island.",
      category: byName("Lighting"),
      brand: "Hearth & Home",
      material: "Glass, Brass",
      color: ["Teal"],
      price: 189,
      discountPercent: 0,
      stock: 15,
      isTrending: true,
      isNewArrival: true,
      thumbnail: img("photo-1761864294727-3c9f6b3e7425"),
      images: [img("photo-1761864294727-3c9f6b3e7425"), img("photo-1761864294727-3c9f6b3e7425", 800)],
    },
    {
      name: "Heritage Handwoven Area Rug",
      description: "A richly patterned area rug, handwoven from wool and cotton in a heritage-inspired design that grounds any living room or entryway.",
      category: byName("Rugs"),
      brand: "Hearth & Home",
      material: "Wool, Cotton",
      color: ["Multi"],
      size: "160 x 230 cm",
      price: 349,
      discountPercent: 15,
      stock: 10,
      isBestSeller: true,
      thumbnail: img("photo-1666276523796-90329b78ea4a"),
      images: [img("photo-1666276523796-90329b78ea4a"), img("photo-1666276523796-90329b78ea4a", 800)],
    },
    {
      name: "Potted Monstera Deliciosa",
      description: "A lush, statement-sized Monstera in a ceramic planter — an easy way to bring warmth and life into any corner of the home.",
      category: byName("Plants"),
      brand: "Hearth & Home",
      material: "Ceramic, Live Plant",
      color: ["Green"],
      price: 79,
      discountPercent: 0,
      stock: 20,
      isNewArrival: true,
      isTrending: true,
      thumbnail: img("photo-1753187991725-76940ce624c0"),
      images: [img("photo-1753187991725-76940ce624c0"), img("photo-1753187991725-76940ce624c0", 800)],
    },
  ]);

  console.log("Seed complete: 12 categories, 4 demo products.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
