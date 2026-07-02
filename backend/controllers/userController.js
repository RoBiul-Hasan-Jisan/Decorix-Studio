const User = require("../models/User");
const Order = require("../models/Order");

// ---- Customer self-service ----
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();
  res.json(user);
};

const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
};

const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ message: "Address not found" });
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.json(user.addresses);
};

const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.id(req.params.addressId)?.deleteOne();
  await user.save();
  res.json(user.addresses);
};

const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json(user.wishlist);
};

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

// ---- Admin ----
const getUsers = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: "customer" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);
  res.json({ users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.json({ user, orders });
};

const setUserDisabled = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDisabled: req.body.isDisabled },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};

// Promote another user to admin. Only an existing admin can call this,
// satisfying "admin can add more admins later" from the spec, while the
// very first admin account is always determined by ADMIN_EMAIL.
const makeAdmin = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: "admin" }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

module.exports = {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getUsers,
  getUserDetail,
  setUserDisabled,
  deleteUser,
  makeAdmin,
};
