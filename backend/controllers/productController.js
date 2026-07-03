const Product = require("../models/Product");
const { notifyAdmin } = require("../utils/notify");

// GET /api/products
// Supports: search (q), category, brand, material, color, size,
// minPrice, maxPrice, minRating, inStock, sort, page, limit, flags
const getProducts = async (req, res) => {
  const {
    q,
    category,
    brand,
    material,
    color,
    size,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort,
    page = 1,
    limit = 12,
    featured,
    trending,
    bestSeller,
    newArrival,
  } = req.query;

  const filter = { isActive: true };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (material) filter.material = material;
  if (color) filter.color = color;
  if (size) filter.size = size;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (featured === "true") filter.isFeatured = true;
  if (trending === "true") filter.isTrending = true;
  if (bestSeller === "true") filter.isBestSeller = true;
  if (newArrival === "true") filter.isNewArrival = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };
  else if (sort === "rating") sortOption = { rating: -1 };
  else if (sort === "bestselling") sortOption = { numReviews: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
};

const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8);

  res.json({ product, related });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

const createProduct = async (req, res) => {
  // multer-storage-cloudinary sets file.path to the uploaded image's full
  // Cloudinary URL (and file.filename to its public_id) - we just store
  // the URL directly, same as we'd store any other image URL.
  const images = (req.files || []).map((f) => f.path);
  const body = { ...req.body };
  if (body.color && typeof body.color === "string") body.color = body.color.split(",").map((c) => c.trim());

  const product = await Product.create({
    ...body,
    images,
    thumbnail: images[0] || body.thumbnail,
  });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const body = { ...req.body };
  if (body.color && typeof body.color === "string") body.color = body.color.split(",").map((c) => c.trim());

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => f.path);
    body.images = newImages;
    body.thumbnail = newImages[0];
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const wasInStock = product.stock > 0;
  Object.assign(product, body);
  await product.save();

  if (wasInStock && product.stock <= product.lowStockThreshold && product.stock > 0) {
    await notifyAdmin(
      "low_stock",
      "Low stock warning",
      `${product.name} is running low (${product.stock} left).`,
      `/admin/inventory`
    );
  }

  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};

// Admin inventory helpers
const getInventory = async (req, res) => {
  const lowStock = await Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] }, stock: { $gt: 0 } });
  const outOfStock = await Product.find({ stock: 0 });
  res.json({ lowStock, outOfStock });
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
};
