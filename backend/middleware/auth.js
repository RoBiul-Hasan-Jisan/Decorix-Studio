const admin = require("../utils/firebaseAdmin");
const User = require("../models/User");
const { isAdminEmail } = require("../utils/adminEmails");

// Verifies the Firebase ID token sent in the Authorization header
// (Authorization: Bearer <idToken>) and attaches the matching Mongo user
// document to req.user. Also lazily creates the Mongo user record the
// first time we see a brand-new Firebase account (belt-and-braces on top
// of the explicit /api/auth/sync call the frontend makes after login).
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
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
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "Your account has been disabled. Contact support." });
    }

    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };
