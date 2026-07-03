const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { notifyAdmin, notifyUser } = require("../utils/notify");
const { nanoid } = require("nanoid");

const DELIVERY_CHARGE = 60; // flat rate, adjust as needed

// POST /api/orders  -- customer places an order (Cash on Delivery)
const createOrder = async (req, res) => {
  const { items, shipping, orderNotes, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Re-fetch products server-side so prices/stock can't be tampered with
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const orderItems = [];
  let subTotal = 0;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `${product.name} only has ${product.stock} left in stock` });
    }
    const unitPrice = Math.round((product.price - (product.price * product.discountPercent) / 100) * 100) / 100;
    const totalPrice = unitPrice * item.quantity;
    subTotal += totalPrice;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.thumbnail,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  let discount = 0;
  let couponInfo = undefined;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.expiresAt > new Date() && subTotal >= coupon.minPurchase) {
      discount = Math.round((subTotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      couponInfo = { code: coupon.code, discountAmount: discount };
      coupon.usageCount += 1;
      await coupon.save();
    }
  }

  const totalAmount = subTotal + DELIVERY_CHARGE - discount;

  const order = await Order.create({
    orderNumber: "ORD-" + nanoid(8).toUpperCase(),
    user: req.user._id,
    items: orderItems,
    shipping,
    orderNotes,
    coupon: couponInfo,
    subTotal,
    deliveryCharge: DELIVERY_CHARGE,
    discount,
    totalAmount,
    status: "Pending",
    statusHistory: [{ status: "Pending", updatedBy: req.user.name, date: new Date() }],
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Update user's lifetime spend
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalSpending: totalAmount } });

  await notifyAdmin(
    "new_order",
    "New order received",
    `${req.user.name} placed order ${order.orderNumber} for ${orderItems.length} item(s), total ৳${Math.round(totalAmount)}.`,
    `/admin/orders/${order._id}`
  );

  res.status(201).json(order);
};

// GET /api/orders/mine
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to view this order" });
  }
  res.json(order);
};

// GET /api/orders (admin) - all orders, filterable by status
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  // If cancelling, restore stock
  if (status === "Cancelled" && order.status !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.status = status;
  order.statusHistory.push({ status, updatedBy: req.user.name, date: new Date(), note });
  await order.save();

  await notifyUser(
    order.user,
    "order_status",
    `Order ${order.orderNumber} is now "${status}"`,
    note || `Your order status was updated to ${status}.`,
    `/orders/${order._id}`
  );

  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
