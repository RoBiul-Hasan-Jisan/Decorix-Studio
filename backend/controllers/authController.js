const User = require("../models/User");
const { notifyAdmin } = require("../utils/notify");
const { isAdminEmail } = require("../utils/adminEmails");

// Called by the frontend right after Firebase sign-up/sign-in to make sure
// a corresponding Mongo user document exists and is kept up to date with
// the latest Firebase profile info (name/photo/email verification).
const syncUser = async (req, res) => {
  const decoded = req.firebaseUser;
  let user = req.user;

  let isNew = false;
  if (!user) {
    isNew = true;
    const isAdminAccount = isAdminEmail(decoded.email);
    user = await User.create({
      firebaseUid: decoded.uid,
      name: decoded.name || decoded.email.split("@")[0],
      email: decoded.email,
      photoURL: decoded.picture,
      provider: decoded.firebase?.sign_in_provider || "password",
      emailVerified: decoded.email_verified || false,
      role: isAdminAccount ? "admin" : "customer",
    });
  } else {
    user.name = decoded.name || user.name;
    user.photoURL = decoded.picture || user.photoURL;
    user.emailVerified = decoded.email_verified ?? user.emailVerified;
    await user.save();
  }

  if (isNew) {
    await notifyAdmin(
      "new_user",
      "New user registered",
      `${user.name} (${user.email}) just created an account.`,
      `/admin/customers`
    );
  }

  res.json(user);
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { syncUser, getMe };
