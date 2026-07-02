const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    images: [{ type: String }], // array of image URLs
    thumbnail: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String },
    material: { type: String },
    color: [{ type: String }],
    size: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    sku: { type: String, unique: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("finalPrice").get(function () {
  return Math.round((this.price - (this.price * this.discountPercent) / 100) * 100) / 100;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", description: "text", brand: "text" });

productSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + "-" + Date.now().toString(36);
  }
  if (!this.sku) {
    this.sku = "SKU-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
