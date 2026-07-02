// Reads the ADMIN_EMAILS (preferred, comma-separated) or legacy single
// ADMIN_EMAIL env var and tells you whether a given email should be
// auto-promoted to "admin" the first time it signs in.
//
// Example .env:
//   ADMIN_EMAILS=robiulhasanjisan88@gmail.com,second.admin@example.com
//
// This only controls automatic bootstrap on first sign-in. Once an account
// exists, an existing admin can also promote any other user from
// Admin -> Customers -> Make Admin, without touching .env at all.
function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

module.exports = { getAdminEmails, isAdminEmail };
