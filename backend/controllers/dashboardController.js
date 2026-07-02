const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getStats = async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: "Pending" }),
    Order.countDocuments({ status: "Delivered" }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
  ]);
  const revenue = revenueAgg[0]?.revenue || 0;

  // Monthly revenue for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const monthlyRevenue = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.totalPrice" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    revenue,
    pendingOrders,
    deliveredOrders,
    monthlyRevenue,
    topProducts,
  });
};

module.exports = { getStats };
