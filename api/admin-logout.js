import { clearAdminCookie, sameOrigin } from "./_lib/auth.js";
import { json } from "./_lib/db.js";
export default function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "Origin not allowed" });
  clearAdminCookie(res);
  return json(res, 200, { success: true });
}
