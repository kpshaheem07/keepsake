export function friendly(e) {
  const c = e?.code || "";
  if (c.includes("permission-denied")) return "Permission denied. The database rules are not published yet, or this login is not allowed.";
  if (c.includes("unavailable")) return "No connection to the cloud. Your changes will upload when the internet comes back.";
  if (c.includes("resource-exhausted")) return "The free daily limit was reached. Try again tomorrow.";
  if (c.includes("invalid-argument") || /size|too large/i.test(e?.message || "")) return "This item is too large to save. Use a smaller image.";
  return "Cloud error: " + (e?.message || c || "unknown");
}
export function authMessage(e) {
  const c = e?.code || "";
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return "Wrong email or password.";
  if (c.includes("invalid-email")) return "Please enter a valid email.";
  if (c.includes("too-many-requests")) return "Too many tries. Please wait a few minutes.";
  if (c.includes("network")) return "No internet connection.";
  if (c.includes("unauthorized-domain")) return "This website address is not allowed in Firebase yet. Tell your helper.";
  if (c.includes("operation-not-allowed")) return "Email login is not turned on in Firebase.";
  return "Could not sign in: " + (c || e?.message || "unknown error");
}
