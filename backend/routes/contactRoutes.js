const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const { submitContact, getContacts, resolveContact } = require("../controllers/contactController");

router.post("/", submitContact);
router.get("/", protect, adminOnly, getContacts);
router.put("/:id/resolve", protect, adminOnly, resolveContact);

module.exports = router;
