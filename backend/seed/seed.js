// Quick-start seed script: creates a few categories and products so the
// storefront isn't empty on first run.
// Usage: node seed/seed.js
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

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(categories);
  const livingRoom = createdCategories.find((c) => c.name === "Living Room");
  const lighting = createdCategories.find((c) => c.name === "Lighting");

  await Product.deleteMany({});
  await Product.insertMany([
    {
      name: "Linen Weave Sofa",
      description: "A hand-finished three-seater sofa upholstered in natural linen weave, built on a solid oak frame.",
      category: livingRoom._id,
      brand: "Hearth & Home",
      material: "Linen, Oak",
      color: ["Cream", "Sage"],
      dimensions: "210 x 90 x 85 cm",
      weight: "45kg",
      price: 19,
      discountPercent: 10,
      stock: 8,
      isFeatured: true,
      isNewArrival: true,
      thumbnail: "/uploads/placeholder-sofa.jpeg",
      images: ["/uploads/placeholder-sofa.jpeg"],
    },
    {
      name: "Amber Glass Pendant Light",
      description: "Hand-blown amber glass pendant light with brass fittings, perfect above a dining table or kitchen island.",
      category: lighting._id,
      brand: "Hearth & Home",
      material: "Glass, Brass",
      price: 189,
      discountPercent: 0,
      stock: 15,
      isTrending: true,
      isNewArrival: true,
      thumbnail: "/uploads/placeholder-light.jpeg",
      images: ["/uploads/placeholder-light.jpeg"],
    },

      {
      name: "Amber Glass Pendant Light-1",
      description: "Hand-blown amber glass pendant light with brass fittings, perfect above a dining table or kitchen island.",
      category: lighting._id,
      brand: "Hearth & Home",
      material: "Glass, Brass",
      price: 189,
      discountPercent: 0,
      stock: 15,
      isTrending: true,
      isNewArrival: true,
      thumbnail: "/uploads/placeholder-light.jpeg",
      images: ["/uploads/placeholder-light.jpeg"],
    },


      {
      name: "Amber Glass Pendant Light-2",
      description: "Hand-blown amber glass pendant light with brass fittings, perfect above a dining table or kitchen island.",
      category: lighting._id,
      brand: "Hearth & Home",
      material: "Glass, Brass",
      price: 189,
      discountPercent: 0,
      stock: 15,
      isTrending: true,
      isNewArrival: true,
      thumbnail: "/uploads/placeholder-light.jpeg",
      images: ["/uploads/placeholder-light.jpeg"],
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
