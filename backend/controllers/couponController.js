const Coupon = require("../models/Coupon");

const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

const validateCoupon = async (req, res) => {
  const { code, subTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
  if (coupon.expiresAt < new Date()) return res.status(400).json({ message: "Coupon has expired" });
  if (subTotal < coupon.minPurchase) {
    return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} required` });
  }
  let discount = Math.round((subTotal * coupon.discountPercent) / 100);
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  res.json({ code: coupon.code, discountPercent: coupon.discountPercent, discount });
};

const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
};

const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  res.json(coupon);
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  res.json({ message: "Coupon deleted" });
};

module.exports = { getCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon };
