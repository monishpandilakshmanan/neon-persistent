import { timingSafeEqual } from "node:crypto";
import { createAdminToken, sameOrigin, setAdminCookie } from "./_lib/auth.js";
import { json } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "Origin not allowed" });
  const configured = process.env.ADMIN_PASSWORD;
  const supplied = req.body?.password;
  if (!configured || configured.length < 16 || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return json(res, 500, { error: "Admin authentication is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel." });
  }
  if (typeof supplied !== "string" || supplied.length > 256) return json(res, 401, { error: "Invalid admin credentials" });
  const a = Buffer.from(configured); const b = Buffer.from(supplied);
  const matches = a.length === b.length && timingSafeEqual(a, b);
  if (!matches) return json(res, 401, { error: "Invalid admin credentials" });
  try { setAdminCookie(res, createAdminToken()); } catch { return json(res, 500, { error: "Admin session could not be created. Check ADMIN_SESSION_SECRET." }); }
  return json(res, 200, { success: true });
}
