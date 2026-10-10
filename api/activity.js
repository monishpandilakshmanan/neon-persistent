import { getSql, json, validDisplayName } from "./_lib/db.js";
import { sameOrigin } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "Origin not allowed" });
  const { displayName } = req.body || {};
  if (!validDisplayName(displayName)) return json(res, 400, { error: "Invalid display name" });
  try {
    const sql = getSql();
    await sql`INSERT INTO gamehub_activity (display_name, event_type) VALUES (${displayName}, 'demo_sign_in')`;
    return json(res, 201, { success: true });
  } catch (error) {
    console.error("Activity insert failed", error?.message);
    return json(res, 500, { error: "Unable to save demo activity. Check database setup." });
  }
}
