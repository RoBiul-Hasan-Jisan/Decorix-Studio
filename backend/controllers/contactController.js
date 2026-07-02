const Contact = require("../models/Contact");
const { notifyAdmin } = require("../utils/notify");

const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const contact = await Contact.create({ name, email, subject, message });
  await notifyAdmin("contact_message", "New contact message", `${name}: ${subject}`, `/admin/contacts`);
  res.status(201).json({ message: "Thanks! We'll get back to you soon.", contact });
};

const getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
};

const resolveContact = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
  if (!contact) return res.status(404).json({ message: "Message not found" });
  res.json(contact);
};

module.exports = { submitContact, getContacts, resolveContact };
